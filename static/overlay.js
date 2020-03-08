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

let user_photos = {}
async function get_user_photo(username) {
    // Cache photos so we don't need to keep fetching them
    if (username in user_photos) {
        return user_photos;
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


let chat_message_template = document.querySelector('template.chat-message-template');
let chat_message_container = document.getElementById('chat-message-container');
let scrolled = false;
chat_message_container.onscroll = () => {
    scrolled = chat_message_container.clientHeight + chat_message_container.scrollTop < chat_message_container.scrollHeight;
    console.log(scrolled)
    console.log(chat_message_container)
    console.log(chat_message_container.clientHeight + chat_message_container.scrollTop)
    console.log(chat_message_container.scrollHeight)
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

function onSlideChange(slide_no) {
    if (following_presenter) {
        Reveal.slide(Number(content))
    }
    else {
        slide_no
    }
}

let achievement_container = document.querySelector('.achievement');
function displayAchievement(username, achievement_name, icon_path) {
    achievement_container.getElementById('achievement-image').setAttribute('src', icon_path);
    achievement_container.getElementById('achievement-text').textContent = 
            `@${username} got the achievement: ${achievement_name}!`;
    achievement_container.classList.remove('hidden');

    document.settimeout(() => {
        achievement_container.classList.add('hidden');
    }, 4000);
}

function onAchievement(achievement) {
    let icon_path = './foobar.png';
    
    displayAchievement(achievement.username, achievement.name, icon_path, callback);
}

let chat_window = document.getElementById('chat-window');
let chat_button = document.getElementById('chat-button');
chat_button.onclick = () => {
    chat_window.classList.toggle('hidden');
    chat_button.classList.toggle('toggled');
}