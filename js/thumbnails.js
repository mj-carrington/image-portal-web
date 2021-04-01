const _apiHost = 'http://localhost:8080/mcarrington1/portal/1.0.0/album/';

let albumId = location.search.substring(1);

// On-Load Operations
window.onload = function loadAlbumList() {
    // Load our handling for form submits
/*    const exampleForm = document.getElementById("example-form");
    exampleForm.addEventListener("submit", handleFormSubmit);*/

    // load album data
    loadAlbumInfo();
    // Load our image list
    loadImages();
}

function loadAlbumInfo() {
    fetch(_apiHost + albumId)
        .then(response => response.json())
        .then((data) => {
            console.dir(data);

            let output = `
            <h4>${data.name} </h4>
            </li>
            <li class="nav-item">
            Description: ${data.description}<br>
            Created: ${data.created}
            `
            document.getElementById('album-info').innerHTML = output;

        })
        .catch(err => {
            console.log(err)
        });
}

function loadImages() {
    fetch(_apiHost + albumId + '/images/')
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

async function postFormDataAsJson({ url, fileInput }) {
    // const plainFormData = Object.fromEntries(formData.entries());

    // formData.append('file', fileInput.files[0]);


    // const formDataJsonString = JSON.stringify(plainFormData);

    const fetchOptions = {
        method: "POST",
        body: fileInput.files[0],
    };

    console.log('Uploading image!');
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }

/*    // Close Modal
    $('#myModal').modal('hide');

    // Refresh List
    loadAlbums();*/

    // return response.json();
}
/*
* Rest Client Steps to Upload / Add Photos
* 1. take the form data from the submit button
* 2. generate the request to the API
* 3. Consume the response, which has our actual file location in it...
* 4. make a 2nd rest call to add the image loc to our DB
* 5. refresh the view
* */


/*



function getImagesByAlbumId() {
    fetch(_apiHost + "asdf123/images/")
        .then(response => response.json())
        .then((data) => {
            console.dir(data)
        })
        .catch(err => {
            console.log(err)
        });
}

function loadImagesToView() {
    fetch(_apiHost + "asdf123/images/")
        .then(response => response.json())
        .then((data) => {
            let output = '';
            data.forEach(function(image) {
                output += `
                <a class="example-image-link" href="${image.location}" data-lightbox="example-set" data-title="Title: ${image.name}<br> Tag: ${image.tag}">
                <img class="example-image" src="${image.location}" alt=""/>
                </a>
                `;
            });
            output += '</table>'
            document.getElementById('gallery').innerHTML = output;

        })
        .catch(err => {
            console.log(err)
        });
}
*/



// This grabs the JSON data from rest and breaks it into a table
/*
window.onload = function getImagesByAlbumId(albumId) {
    fetch(_apiHost)
        .then(response => response.json())
        .then((data) => {
            let output = `
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>tag</th>
                        <th>id</th>
                    </tr>
            `;
            data.forEach(function(image) {
                output += `
                        <tr>
                            <td>${image.name}</td>
                            <td>${image.location}</td>
                            <td>${image.tag}</td>
                            <td>${image.id}</td>
                        </tr>
                `;
            });
            output += '</table>'
            document.getElementById('output').innerHTML = output;

        })
        .catch(err => {
            console.log(err)
        });
}
*/
