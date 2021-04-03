const _apiHostBase = 'http://localhost:8080/mcarrington1/portal/1.0.0/'
const _apiAlbum = _apiHostBase + 'album/';
const _apiUpload = _apiHostBase + 'upload/';
const _apiShare = _apiHostBase + 'share/';

const albumId = location.search.substring(1);

// On-Load Operations
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
    loadImageGallery();
}

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

// TODO: Handle an empty library by outputting a message instead
function loadImageGallery() {
    fetch(_apiAlbum + albumId + '/images/')
        .then(response => response.json())
        .then((data) => {
            let output = '';
            console.dir(data);
            data.forEach(function(image) {
                output += `
                <figure class="gallery-frame">
                    <a href="image.html?${image.id}">
                        <img class="gallery-img" src="${image.location}" alt="${image.tag}" title="${image.tag}">
                    </a>
                    <figcaption>${image.name}</figcaption>
                </figure>
                `;
            });
            document.getElementById('images').innerHTML = output;

        })
        .catch(err => {
            console.log(err)
        });
}


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

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }

    // Close Modal
    $('#shareAlbumModal').modal('hide');

    // Refresh List
    loadImageGallery();

    // return response.json();
}

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


// Add Image to Album Functionality
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

// TODO - Merge this with handleFormSubmitJson
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

async function handleFormSubmitJson(event) {
    event.preventDefault();

    const form = event.currentTarget;

    try {
        const formData = new FormData(form);
        for (var pair of formData.entries()) {
            console.log(pair[0]+ ', ' + pair[1]);
        }
        const responseData = await shareImageOperation({ formData });
        // console.log(responseData.text());

        console.log(responseData);

    } catch (error) {
        console.error(error);
    }
    // Close Modal
    $('#shareAlbumModal').modal('hide');

    // Refresh List
    loadImageGallery();
}

async function handleFormSubmitDelete(event) {
    event.preventDefault();

    const form = event.currentTarget;

    try {
        const formData = new FormData(form);
        for (var pair of formData.entries()) {
            console.log(pair[0]+ ', ' + pair[1]);
        }
        const responseData = await deleteAlbumOperation();
        // console.log(responseData.text());

        console.log(responseData);

    } catch (error) {
        console.error(error);
    }
    // Close Modal
    $('#deleteAlbumModal').modal('hide');

    // Go back to the albums list
    window.location.replace("./albums.html");
}

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
