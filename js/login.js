const _apiHostBase = 'http://imageportalservice-env.eba-nqjzvchk.us-east-1.elasticbeanstalk.com/mcarrington1/portal/1.0.0/'
const _apiLogin = _apiHostBase + 'user/login';

/**
 * Load view for listener, to submit login operation
 */
window.onload = function loadView() {
    // Load our handling for form submits
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", attemptLogin);
}

/**
 * Handler for attempting login, passes along to underlying function for actual REST operation
 * @param event
 * @returns {Promise<void>}
 */
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

/**
 * Execute rest call to login, populates view if incorrect or redirected to album page
 * @param formData
 * @returns {Promise<void>}
 */
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
