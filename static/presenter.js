let socket = io();
socket.on('connect', function() {
    console.log('Connected to socket.')
});
socket.on('disconnect', function() {
    console.warn('Disconnected from socket.')
});
socket.on('achievement', function(data) {
    onAchievement(data);
});

// Slide management
window.onmessage = function(slide) {
    socket.emit('slide_change', slide.data);
};

// Achievement management
// Achevement handlers
let achievement_container = document.getElementById('achievement');
let achievement_image = document.getElementById('achievement-image');
let achievement_text = document.getElementById('achievement-text');
let achievement_username = document.getElementById('achievement-username');
let achievement_name = document.getElementById('achievement-name');
function displayAchievement(image, username, name, description) {
    achievement_image.setAttribute('src', image);
    achievement_name.textContent = name;
    achievement_username.textContent = username;
    achievement_text.textContent = description;
    achievement_container.classList.remove('hidden');

    window.setTimeout(() => {
        achievement_container.classList.add('hidden');
    }, 6000);
}

function onAchievement(data) {
    let achievement_image;
    if (data.rank == 1) {
        achievement_image = '/static/data/gold.jpg';
    }
    else if(data.rank == 2) {
        achievement_image = '/static/data/silver.jpg';
    }
    else {
        achievement_image = '/static/data/bronze.jpg';
    }
    displayAchievement(achievement_image, data.username, data.name, data.description);
}