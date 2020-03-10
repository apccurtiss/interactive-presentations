let socket = io();
socket.on('connect', function() {
    console.log('Connected to socket.')
});
socket.on('disconnect', function() {
    console.warn('Disconnected from socket.')
});
socket.on('chat_message', function(data) {
    addNewMessage(data.username, data.profile_photo, data.time, data.content);
})
socket.on('slide_change', function(new_slide) {
    onSlideChange(new_slide);
})
socket.on('achievement', function(data) {
    onAchievement(data);
})

// Utility functions
let user_photos = {}
async function get_user_photo(username) {
    // Cache photos so we don't need to keep fetching them
    if (username in user_photos) {
        return user_photos[username];
    }

    let response = await fetch(`/api/user/${username}`);
    let user_data = await response.json();
    let photo_link = '/static/data/profile_photos/default.jpeg';

    if (user_data != null) {
        photo_link = user_data.profile_photo;
    }

    user_photos[username] = photo_link;
    return photo_link;
}

// Chat handlers
let chat_form = document.getElementById('chat-form');
let chat_input = document.getElementById('chat-input');
chat_form.onsubmit = function() {
    let message = chat_input.value;
    if(message.length > 0) {
        chat_input.value = '';
        socket.emit('chat_message', message);
    }
    return false;
}

let chat_message_template = document.querySelector('template.chat-message-template');
let chat_message_container = document.getElementById('chat-message-container');
let scrolled = false;
chat_message_container.onscroll = () => {
    scrolled = chat_message_container.clientHeight + chat_message_container.scrollTop < chat_message_container.scrollHeight;
}
function addNewMessage(author_username, author_photo, time_str, message_content) {
    let new_message = chat_message_template.content.cloneNode(true);
    
    let new_picture = new_message.getElementById('profile-picture');
    // new_picture.setAttribute('src', `static/data/profile_photos/${author_username}`);
    new_picture.setAttribute('src', author_photo);
    new_picture.setAttribute('alt', `Profile picture for user ${author_username}`);
    new_message.getElementById('profile-link').setAttribute('href', `./users/${author_username}`);
    new_message.getElementById('username').textContent = `@${author_username}`;
    new_message.getElementById('timestamp').textContent = time_str;
    let new_body = new_message.getElementById('body');
    // Important!
    // Escapes HTML by setting textContent, and only then replaces on innerHTML to add mentions.
    new_body.textContent = message_content;
    new_body.innerHTML = new_body.innerHTML.replace(
        /@\w+/g, (s) => `<span class="mention">${s}</span>`);
    
    // We're not really expecting multiple chat containers, but who knows?
    chat_message_container.appendChild(new_message);
    if(!scrolled) {
        chat_message_container.scrollTop = chat_message_container.scrollHeight;
    }
}

// Achevement handlers
let achievement_container = document.getElementById('achievement');
let achievement_image = document.getElementById('achievement-image');
let achievement_text = document.getElementById('achievement-text');
let achievement_name = document.getElementById('achievement-name');
function displayAchievement(image, name, description) {
    achievement_image.setAttribute('src', image);
    achievement_name.textContent = name;
    achievement_text.textContent = description;
    achievement_container.classList.remove('hidden');

    window.setTimeout(() => {
        achievement_container.classList.add('hidden');
    }, 4000);
}

function onAchievement(data) {
    let achievement_image = '/static/data/gold.jpg'
    displayAchievement(achievement_image, data.name, data.description);
}

// Slide management
let follow_presenter = document.getElementById('follow-presenter');
follow_presenter.onclick = followPresenter;

let following_presenter = true;
let presenter_slide = '0/0';
function followPresenter() {
    console.log('Reconnected with presenter.');
    following_presenter = true;
    follow_presenter.classList.add('hidden');
    onSlideChange(presenter_slide);
}

function onSlideChange(slide) {
    presenter_slide = slide;
    if (following_presenter) {
        content_iframe.contentWindow.postMessage(slide, '*');
    }
}

window.onmessage = function(event) {
    if (!event.data.user_caused) {
        presenter_slide = event.data.slide;
        return;
    }
    if (event.data.slide != presenter_slide) {
        console.log('Disassociated from presenter.');
        follow_presenter.classList.remove('hidden');
        following_presenter = false;
    }
};

// Sidebar buttons
let chat_window = document.getElementById('chat-window');
let chat_button = document.getElementById('chat-button');
chat_button.onclick = () => {
    chat_window.classList.toggle('hidden');
    chat_button.classList.toggle('toggled');
}

let content_iframe = document.getElementById('content-iframe');
let challenges_button = document.getElementById('challenges-button');
challenges_button.onclick = () => {
    content_iframe.setAttribute('src', '/exercises');
}

let presentation_button = document.getElementById('presentation-button');
presentation_button.onclick = () => {
    content_iframe.setAttribute('src', '/presentation');
}