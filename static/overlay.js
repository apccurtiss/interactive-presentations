let socket = io();
socket.on('connect', function() {
    console.log('Connected to socket.')
});
socket.on('disconnect', function() {
    console.warn('Disconnected from socket.')
});
socket.on('chat_message', function(data) {
    addNewMessage(data.username, data.time, data.content);
})
socket.on('slide_change', function(new_slide) {
    onSlideChange(new_slide);
})

let chat = document.getElementById('chat-form');
let chat_input = document.getElementById('chat-input');
chat.onsubmit = function() {
    let message = chat_input.value;
    chat_input.value = '';
    socket.emit('chat_message', message);
    return false;
}

let chat_message_template = document.querySelector('template.chat-message-template');
let chat_message_containers = Array.from(document.querySelectorAll('.chat-message-container'));
function addNewMessage(author_username, time_str, message_content) {
    let new_message = chat_message_template.content.cloneNode(true);
    
    let new_picture = new_message.getElementById('profile-picture');
    // new_picture.setAttribute('src', `static/data/profile_photos/${author_username}`);
    new_picture.setAttribute('src', `static/data/profile_photos/default.jpeg`);
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
    chat_message_containers.map((container) => container.appendChild(new_message))
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