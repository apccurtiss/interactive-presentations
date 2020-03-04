import { websocket } from './websocket.js';

let ws = new websocket((tag, content) => {
    switch (tag) {
        case 'message':
            onmessage(content)
        case 'slide_change':
            onSlideChange(Number(content))
        case 'achievement':
            onAchievement(content)
        default:
            console.error(`Unknown tag: ${tag}`)
    }
})

// https://stackoverflow.com/a/6234804
function escapeHTML(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

if (window.WebSocket === undefined) {
    document.innerHTML = "This webpage requires a newer browser, sorry!";
}

let chat_message_template = document.querySelector('template.chat-message');
let chat_message_containers = Array.from(document.querySelectorAll('.chat-message-container'));
function addMessage(author_username, time_str, message_content) {
    let new_message = chat_message_template.content.cloneNode(true);
    
    let new_picture = new_message.getElementById('profile-picture');
    new_picture.setAttribute('src', `./profile_photos/${author_username}`);
    new_picture.setAttribute('alt', `Profile picture for user ${author_username}`);
    new_message.getElementById('profile-link').setAttribute('href', `./users/${author_username}`);
    new_message.getElementById('username').textContent = author_username;
    new_message.getElementById('timestamp').textContent = time_str;
    new_message.getElementById('body').textContent = message_content;
    
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

function onNewMessage(message) {
    let message_html = escapeHTML(message.contents).replace(
        /@\w+/g,
        (match) => `<span class="mention">${match}</span>`);
        
    addMessage(message.username, message.sent, message_html);
}