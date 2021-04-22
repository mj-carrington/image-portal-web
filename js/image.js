const _apiHostBase = 'http://imageportalservice-env.eba-nqjzvchk.us-east-1.elasticbeanstalk.com/mcarrington1/portal/1.0.0/'
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
    const uploadForm = document.getElementById("edit-image-form");
    uploadForm.addEventListener("submit", handleFormSubmitImageEdit);

    const shareImageForm = document.getElementById("share-image-form");
    shareImageForm.addEventListener("submit", handleFormSubmitShare);

    const deleteAlbumForm = document.getElementById("delete-image-form");
    deleteAlbumForm.addEventListener("submit", handleFormSubmitDelete);

}

/**
 * Populate main view of image and meta data for header from REST
 */
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
function returnToThumbnailsList() {
    window.location.replace("./thumbnails.html?album=" + albumId);
}

/**
 * Close all modals
 */
function closeModals() {
    $('#shareImageModal').modal('hide');
    $('#editImageModal').modal('hide');
    $('#deleteImageModal').modal('hide');
}

/**
 * Retrieve the S3 image location for a given object
 * @returns {Promise<[]>} Array of image locations but in this case, will be a single item in 1 array
 */
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

/**
 * Perform REST for share image functionality
 * @param formData extracts the e-mail address from the form
 * @returns {Promise<void>}
 */
async function shareImageOperation({ formData }) {
    let imageUrl = await retrieveImageLocation();
    let payload = {
        imageUrls: imageUrl,
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
}

/**
 * REST delete operation
 * @returns {Promise<void>}
 */
async function deleteImageOperation() {
    const fetchOptions = {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        }
    };

    const response = await fetch(_apiImageUrl, fetchOptions);

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
}

/**
 * Submit share event to REST api
 * @param event
 * @returns {Promise<void>}
 */
async function handleFormSubmitShare(event) {
    event.preventDefault();

    const form = event.currentTarget;

    try {
        const formData = new FormData(form);
        for (var pair of formData.entries()) {
            console.log(pair[0]+ ', ' + pair[1]);
        }
        const responseData = await shareImageOperation({ formData });
        console.log('Data Retrieved back from Share API: ' + responseData);

    } catch (error) {
        console.error(error);
    }
    closeModals();
}

/**
 * Handler for submitting images; calls to the actual REST operation
 * @param event
 * @returns {Promise<void>}
 */
async function handleFormSubmitImageEdit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    try {
        const formData = new FormData(form);
        for (var pair of formData.entries()) {
            console.log(pair[0]+ ', ' + pair[1]);
        }
        const responseData = await editImageOperation({ formData });
        // console.log(responseData.text());

        console.log(responseData);

    } catch (error) {
        console.error(error);
    }

    loadFullImageAndMetadata();
    closeModals();
}

/**
 * Perform REST call to update image metadata
 * @param formData
 * @returns {Promise<void>}
 */
async function editImageOperation({ formData }) {

    let payload = {};

    if (formData.get('name') !== "") {
        payload['name'] = formData.get('name');
    }

    if (formData.get('tag') !== "") {
        payload['tag'] = formData.get('tag');
    }
    const formDataJsonString = JSON.stringify(payload);

    const fetchOptions = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: formDataJsonString,
    };

    console.log("Submitting JSON ::");
    console.dir(formDataJsonString);
    const response = await fetch(_apiImageUrl, fetchOptions);

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
}

/**
 * Handler to pass along form data for REST call for deleting image
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
        const responseData = await deleteImageOperation();
        // console.log(responseData.text());

        console.log(responseData);

    } catch (error) {
        console.error(error);
    }

    // Go back to the image list
    returnToThumbnailsList();
}
