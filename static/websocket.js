export function websocket(callback) {
    let uri = "ws://127.0.0.1:5000/socket";
    let websocket = new WebSocket(uri);
    let queued_message_args = [];
    let ready = false;

    let send = function(tag, message) {
        if (ready) {
            websocket.send(`${tag}:${message}`);
        }
        else {
            console.log('Socket not ready, queuing for later.');
            queued_message_args.push(arguments);
        }
    };

    websocket.onmessage = function(event) {
        let [tag, message] = event.data.split(':', 1);
        callback(tag, message);
    };

    websocket.onopen = function(evt) {
        ready = true;
        while(queued_message_args.length > 0) {
            console.log(`Sending queued message; ${queued_message_args.length} remaining.`);
            let message_args = queued_message_args.shift();
            send(...message_args);
        }
    };

    websocket.onclose = function(evt) {
        ready = false;
        websocket = new WebSocket(uri);
    };

    websocket.onerror = function(evt) {
        console.log('Error: ', evt);
        ready = false;
        websocket = new WebSocket(uri);
    };

    this.send = send;
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