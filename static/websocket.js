if (window.WebSocket === undefined) {
    document.innerHTML = 'This webpage requires a newer browser, sorry!';
}

export function websocket(callback) {
    let uri = 'ws://127.0.0.1:5000/socket';
    let websocket;
    init();
    
    function init() {
        console.log(`Creating new websocket to ${uri}`)
        websocket = new WebSocket(uri);

        websocket.onmessage = function(event) {
            let [tag, message] = event.data.split(':', 1);
            callback(tag, JSON.parse(message));
        };

        websocket.onclose = function(evt) {
            console.log('Websocket closed - reopening.')
            console.log(evt)
            // init();
        };

        websocket.onerror = function(evt) {
            console.error(evt);
            init();
        };
    }
}