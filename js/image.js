const _apiHostBase = 'http://localhost:8080/mcarrington1/portal/1.0.0/'
const _apiAlbum = _apiHostBase + 'album/';
const _apiUpload = _apiHostBase + 'upload/';
const _apiShare = _apiHostBase + 'share/';

const albumId = new URL(location.href).searchParams.get('album');
const imageId = new URL(location.href).searchParams.get('image');

const _apiImageUrl = _apiAlbum + albumId + '/image/' + imageId;

// On-Load Operations
window.onload = function loadView() {
    loadFullImageAndMetadata();

    // Load our handling for form submits
    const uploadForm = document.getElementById("upload-form");
    uploadForm.addEventListener("submit", handleFormSubmitFile);

    const shareImageForm = document.getElementById("share-album-form");
    shareImageForm.addEventListener("submit", handleFormSubmitShare);

    const deleteAlbumForm = document.getElementById("delete-album-form");
    deleteAlbumForm.addEventListener("submit", handleFormSubmitDelete);

}

// Loading Image and Meta Data
function loadFullImageAndMetadata() {
    console.log('Album Id :: ' + albumId + ' Image Id :: ' + imageId);

    fetch(_apiImageUrl)
        .then(response => response.json())
        .then((data) => {
            let imageHtml = `
                <img src="${data.location}" alt="${data.name}" style="max-width:600px; width:100%; margin: 30px 70px">
            `;

            let imageMetadataHtml = `
                    <h4>${data.name}</h4>
                    </li>
                    <li class="nav-item">
                    Tags: ${data.tag}<br>
                    Uploaded: ${data.created}
            `;

            console.dir(data);
            document.getElementById('imageDisplay').innerHTML = imageHtml;
            document.getElementById('imageMetadataDisplay').innerHTML = imageMetadataHtml;

        })
        .catch(err => {
            // console.log(err)
            document.getElementById('imageDisplay').innerHTML = '<h4>Something went wrong!.</h4>';
        });
}

/**
 * Extract the id from the url and set window location to traverse back to image list
 */
function returnToAlbumList() {
    window.location.replace("./albums.html?album=" + albumId);
}

/**
 * Close all of our modals
 */
function closeModals() {
    $('#shareAlbumModal').modal('hide');
}

async function retrieveImageLocation() {
    let imageArray = [];

    await fetch(_apiImageUrl)
        .then(response => response.json())
        .then((data) => {
            console.dir(data);
            imageArray.push(data.location);
        })
        .catch(err => {
            console.log(err)
        });
    console.dir(imageArray);

    return imageArray;
}

// Share Image to Album Functionality
async function shareImageOperation({ formData }) {
    let images = await retrieveImageLocation();
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
    closeModals();
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

async function handleFormSubmitShare(event) {
    console.log('entering handleFormSubmitShare');
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
    returnToAlbumList();
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
