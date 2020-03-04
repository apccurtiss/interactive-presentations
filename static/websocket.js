import { inherits } from "util";

export function websocket(callback) {
    let uri = "ws://127.0.0.1:5000/socket";
    let websocket;
    init();

    function init() {
        websocket = new WebSocket(uri);
        websocket.onmessage = function(event) {
            let [tag, message] = event.data.split(':', 1);
            callback(tag, JSON.parse(message));
        };

        websocket.onclose = function(evt) {
            init();
        };

        websocket.onerror = function(evt) {
            console.error(evt);
            init();
        };
    }
}
    
function onOpen(evt) {
    state.className = "success";
    state.innerHTML = "Connected to server";
}
    
function onClose(evt) {
    state.className = "fail";
    state.innerHTML = "Not connected";
    connected.innerHTML = "0";
}
    
function onError(evt) {
    state.className = "fail";
    state.innerHTML = "Communication error";
}
    
function addMessage() {
    var message = chat.value;
    chat.value = "";
    websocket.send(message);
}

function onMessage(event) {
    // There are two types of messages:
    // 1. a chat participant message itself
    // 2. a message with a number of connected chat participants
    var message = event.data;
            
    if (message.startsWith("log:")) {
        message = message.slice("log:".length);
        log.innerHTML = '<li class = "message">' + 
            message + "</li>" + log.innerHTML;
    }
    else if (message.startsWith("connected:")) {
        message = message.slice("connected:".length);
        connected.innerHTML = message;
    }
}