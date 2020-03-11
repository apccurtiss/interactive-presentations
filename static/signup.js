let error_display = document.getElementById('error');
function displayError(err) {
    console.error(err);
    error_display.classList.add('visible');
    error_display.textContent = err;
}

let signup = document.getElementById('signup');
let username_input = document.getElementById('username');
signup.onsubmit = function() {
    let username = username_input.value;
    if (username.length < 1) {
        displayError('Username is required');
        return false;
    }
    fetch(`/username_taken/${username}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (user) {
            console.log(`Got user:`, user)
            if (user == null) {
                // User doesn't exist; submit form
                signup.submit();
            }
            else {
                // User does exist; raise error
                displayError('Username taken!');
            }
        })
        .catch(function (error) {
            displayError(error);
        });
    
    return false;
}