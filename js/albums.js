const _apiHostBase = 'http://localhost:8080/mcarrington1/portal/1.0.0/'
const _apiAlbum = _apiHostBase + 'album/';
const _createAlbum = 'http://localhost:8080/mcarrington1/portal/1.0.0/album/';

// On-load Operations
window.onload = function loadAlbumList() {
    // Load our handling for form submits
    const exampleForm = document.getElementById("example-form");
    exampleForm.addEventListener("submit", handleFormSubmit);

    // Load our album list
    loadAlbums();
}

function loadAlbumListDebug() {
    fetch(_apiHost)
        .then(response => response.json())
        .then((data) => {
            console.dir(data)
        })
        .catch(err => {
            console.log(err)
        });
}


function loadAlbums() {
    fetch(_apiHost)
        .then(response => response.json())
        .then((data) => {
            let output = '';
            data.forEach(function(album) {

                let imageLocation = generateAlbumThumbnail(album)
                output += `
                <figure class="gallery-frame">
                <a href="thumbnails.html?${album.id}"
                    <img class="gallery-img" src="${imageLocation}" alt="${album.description}" title="${album.description}">
                    </a>
                    <figcaption>${album.name}</figcaption>
                </figure>
                `;
            });
            document.getElementById('albums').innerHTML = output;

        })
        .catch(err => {
            console.log(err)
        });
}

function generateAlbumThumbnail(album) {
    // look and see if album has a single image
    if(album.images === null) {
        console.log('no image available to populate cover, defaulting to template image')
        return './images/album-default-cover.png'
    } else {
        return album.images[0].location
    }
}

/**
 * Helper function for POSTing data as JSON with fetch.
 *
 * @param {Object} options
 * @param {string} options.url - URL to POST data to
 * @param {FormData} options.formData - `FormData` instance
 * @return {Object} - Response body from URL that was POSTed to
 */
// TODO: Drop URL parameter here
async function postFormDataAsJson({ formData }) {
    const plainFormData = Object.fromEntries(formData.entries());
    const formDataJsonString = JSON.stringify(plainFormData);

    const fetchOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: formDataJsonString,
    };

    console.log('Submitting JSON payload :: ' + formDataJsonString);
    const response = await fetch(_apiAlbum, fetchOptions);

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }

    // Close Modal
    $('#myModal').modal('hide');

    // Refresh List
    loadAlbums();

    // return response.json();
}

/**
 * Event handler for a form submit event.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event
 *
 * @param {SubmitEvent} event
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    try {
        const formData = new FormData(form);
        const responseData = await postFormDataAsJson({ url, formData });

        console.log(responseData);
    } catch (error) {
        console.error(error);
    }
    // Close the Modal
    // Refresh the View

}
