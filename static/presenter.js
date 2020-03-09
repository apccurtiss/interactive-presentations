let socket = io();
socket.on('connect', function() {
    console.log('Connected to socket.')
});
socket.on('disconnect', function() {
    console.warn('Disconnected from socket.')
});
socket.on('chat_message', function(message) {
    if (message.content.indexOf('@presenter') != -1) {
        onPresenterMention(message);
    }
})

// Slide management
window.onmessage = function(slide) {
    socket.emit('slide_change', slide.data);
};