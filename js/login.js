const _apiHostBase = 'http://localhost:8080/mcarrington1/portal/1.0.0/'
const _apiLogin = _apiHostBase + '/user/login';

// On-Load Operations
window.onload = function loadView() {
    // Load our handling for form submits
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", attemptLogin);
}

async function attemptLogin(event) {
    event.preventDefault();

    const form = event.currentTarget;

    try {
        const formData = new FormData(form);
        await loginOperation({ formData });
    } catch (error) {
        console.error(error);
    }
}

async function loginOperation({ formData }) {
    let userName = formData.get('username');
    let password = formData.get('password');

    await fetch(_apiLogin + '?username=' + userName + '&password=' + password)
        .then(response => {
            if (response.status === 200) {
                console.log('user creds validated!')
                window.location.replace("./albums.html");
            } else {
                console.log('user creds incorrect!')
                document.getElementById('invalid-alert-text').innerHTML = '<h4>Invalid Username or Password Provided!</h4>';
            }

        })
        .catch(err => {
            console.log(err)
        });
}
