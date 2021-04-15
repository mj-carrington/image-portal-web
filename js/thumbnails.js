const _apiHostBase = 'http://localhost:8080/mcarrington1/portal/1.0.0/'
const _apiAlbum = _apiHostBase + 'album/';
const _apiUpload = _apiHostBase + 'upload/';
const _apiShare = _apiHostBase + 'share/';

const albumId = new URL(location.href).searchParams.get('album');

/**
 * Listener for the various modals, loads album metadata for header and gallery of images onLoad
 */
window.onload = function loadView() {
    // Load our handling for form submits
    const uploadForm = document.getElementById("upload-form");
    uploadForm.addEventListener("submit", handleFormSubmitFile);

    const shareAlbumForm = document.getElementById("share-album-form");
    shareAlbumForm.addEventListener("submit", handleFormSubmitJson);

    const deleteAlbumForm = document.getElementById("delete-album-form");
    deleteAlbumForm.addEventListener("submit", handleFormSubmitDelete);

    // load album data
    loadAlbumInfo();
    // Load our image list
    loadImageGallery(true);
}

/**
 * Loads album data from REST call
 */
function loadAlbumInfo() {
    fetch(_apiAlbum + albumId)
        .then(response => response.json())
        .then((data) => {
            console.dir(data);

            let albumInfo = `
            <h4>${data.name} </h4>
            </li>
            <li class="nav-item">
            Description: ${data.description}<br>
            Created: ${data.created}
            `
            document.getElementById('album-info').innerHTML = albumInfo;

        })
        .catch(err => {
            console.log(err)
        });
}

/**
 * Populates image gallery. Default is DESC order but can be triggered for ASC order of images
 * @param willSortDescending boolean value
 */
function loadImageGallery(willSortDescending) {
    fetch(_apiAlbum + albumId + '/images/')
        .then(response => response.json())
        .then((data) => {
            let output = '';
            console.dir(data);

            let sortedData = sortImageGallery(data, willSortDescending);
            sortedData.forEach(function(image) {
                output += `
                    <figure class="gallery-frame">
                        <a href="image.html?album=${albumId}&image=${image.id}">
                            <img class="gallery-img" src="${image.location}" alt="${image.tag}" title="${image.tag}">
                        </a>
                        <figcaption>${image.name}</figcaption>
                    </figure>
            `;
            });
            document.getElementById('images').innerHTML = output;

        })
        .catch(err => {
            // console.log(err)
            document.getElementById('images').innerHTML = '<h4>No Images Found.</h4>';
        });
}

/**
 * This takes a list of images to sort them asc or desc by date attribute. Default of null will return desc.
 * @param dataToSort data to sort
 * @param willSortDescending default behavior of 'true' is descending here, also catches null
 * @returns our sorted array in place
 */
function sortImageGallery(dataToSort, willSortDescending) {
    if (willSortDescending || willSortDescending === null) {
        console.log('Sorting Desc')
        dataToSort.sort(function (a, b) {
            return new Date(b.created) - new Date(a.created);
        });
    } else {
        console.log('Sorting Asc')
        dataToSort.sort(function (a, b) {
            return new Date(a.created) - new Date(b.created);
        });
    }
    return dataToSort;
}

/**
 * REST to retrieve image locations that are actually stored in S3 for sharing functionality
 * @returns {Promise<[]>} returns an array of all the image locations
 */
async function retrieveImagesLocations() {
    let imageArray = [];

    await fetch(_apiAlbum + albumId + '/images/')
        .then(response => response.json())
        .then((data) => {
            console.dir(data);
            data.forEach(function(imageEntry) {
                imageArray.push(imageEntry.location);
            });
        })
        .catch(err => {
            console.log(err)
        });
    console.dir(imageArray);

    return imageArray;
}

/**
 * Perform REST to share image. Makes an embedded REST call to fetch image locations initially
 * @param formData - Extracts email from form submission
 * @returns {Promise<void>}
 */
// Share Image to Album Functionality
async function shareImageOperation({ formData }) {
    let images = await retrieveImagesLocations();
    let payload = {
        imageUrls: images,
        email: formData.get('email')
    }

    const formDataJsonString = JSON.stringify(payload);

    const fetchOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: formDataJsonString,
    };

    console.log("Submitting JSON ::");
    console.dir(formDataJsonString);

    const response = await fetch(_apiShare, fetchOptions);
    console.log('Data Retrieved back from Share API: ' + response);

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }

    // Close Modal
    $('#shareAlbumModal').modal('hide');

    // Refresh List
    loadImageGallery();
}

/**
 * Perform delete REST call to remove the album. Internally service will also delete images from S3.
 * @returns {Promise<void>}
 */
async function deleteAlbumOperation() {
    const fetchOptions = {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        }
    };

    const response = await fetch(_apiAlbum + albumId, fetchOptions);

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
}


/**
 * REST call to add a new image. This is the call that uploads the image to S3.
 * @param formData
 * @returns {Promise<string>}
 */
async function addImageToAlbumOperation({ formData }) {
    const fetchOptions = {
        method: "POST",
        body: formData,
    };

    console.log('Uploading image!');
    const response = await fetch(_apiUpload, fetchOptions);

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }

    return response.text();
}

/**
 * This handles the addition of new images. Makes a call to upload to s3 then a call to add that metadata to MongoDB service
 * @param event
 * @returns {Promise<void>}
 */
async function handleFormSubmitFile(event) {
    event.preventDefault();

    const form = event.currentTarget;

    // Grab the file name before uploading
    let fileInput = document.getElementById('image');
    let filename = fileInput.files[0].name;

    try {
        const formData = new FormData(form);
        for (var pair of formData.entries()) {
            console.log(pair[0]+ ', ' + pair[1]);
        }
        const responseData = await addImageToAlbumOperation({ formData });
        // console.log(responseData.text());

        console.log(responseData);

        // now post to the API
        await addNewImageMetaData(filename, responseData)

    } catch (error) {
        console.error(error);
    }
    // Close Modal
    $('#addImageModal').modal('hide');

    // Refresh List
    loadImageGallery();
}

/**
 * Submit JSON, makes an underlying call to share imaes.
 * @param event
 * @returns {Promise<void>}
 */
async function handleFormSubmitJson(event) {
    event.preventDefault();

    const form = event.currentTarget;

    try {
        const formData = new FormData(form);
        for (var pair of formData.entries()) {
            console.log(pair[0]+ ', ' + pair[1]);
        }
        const responseData = await shareImageOperation({ formData });

        console.log(responseData);

    } catch (error) {
        console.error(error);
    }
    // Close Modal
    $('#shareAlbumModal').modal('hide');

    // Refresh List
    loadImageGallery();
}

/**
 * Handler to deal with deleting the album.
 * @param event
 * @returns {Promise<void>}
 */
async function handleFormSubmitDelete(event) {
    event.preventDefault();

    const form = event.currentTarget;

    try {
        const formData = new FormData(form);
        for (var pair of formData.entries()) {
            console.log(pair[0]+ ', ' + pair[1]);
        }
        const responseData = await deleteAlbumOperation();
        console.log(responseData);

    } catch (error) {
        console.error(error);
    }
    // Close Modal
    $('#deleteAlbumModal').modal('hide');

    // Go back to the albums list
    window.location.replace("./albums.html");
}

/**
 * Makes a rest call to add the underlying meta data *after* an image is added to S3.
 * @param imageName this is taken from the form data that the user uploaded with
 * @param imageUrl this url is taken from what the UPLOAD api request gives us, since the filename will be different every time.
 * @returns {Promise<void>}
 */
async function addNewImageMetaData(imageName, imageUrl) {
    const fetchOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({name: imageName, location: imageUrl, tag: ""}),
    };

    console.dir(fetchOptions);
    const response = await fetch(_apiAlbum + albumId + "/image/", fetchOptions);

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
}
