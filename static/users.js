let search_form = document.getElementById('search-form');
let search_input = document.getElementById('search-input');
let result_message = document.getElementById('result-message');
let profiles = Array.from(document.getElementsByClassName('user-profile'));

search_form.onsubmit = () => {
    let search = search_input.value;
    let results = profiles.reduce(
        function (count, profile) {
            if (profile.textContent.indexOf(search) == -1) {
                profile.classList.add('hidden');
                return count;
            }
            else {
                profile.classList.remove('hidden');
                return count + 1;
            }
        }, 0);
    
    if (search.length > 0) {
        result_message.innerHTML = `Your search for "${search}" found ${results} result(s).`;
    }
    else {
        result_message.innerHTML = '';
    }

    return false;
}

// We'd love to know about any security issues, wouldn't we? ;)
document.addEventListener("securitypolicyviolation", function(e) {
    fetch('/csp-report', {
        method: 'POST',
        body: JSON.stringify({
            documentURI: e.documentURI,
            violatedDirective: e.violatedDirective,
            blockedURI: e.blockedURI,
        }),
    });
});