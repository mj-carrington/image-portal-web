const _apiHost = 'http://localhost:8080/mcarrington1/portal/1.0.0/album/';


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
