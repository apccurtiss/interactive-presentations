from flask import Flask, render_template
from flask_sockets import Sockets
from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler
from geventwebsocket import WebSocketServer, WebSocketApplication, Resource

app = Flask(__name__)
app._static_folder = 'static'
sockets = Sockets(app)


websockets = []

@sockets.route('/socket')
def echo_socket(ws):
    websockets.append(ws)
    while not ws.closed:
        try:
            tag, message = ws.receive().split(':', 1)
        except Exception as e:
            print(f'Error receiving data: {e}')
            continue
        handle(tag, message)


@app.route('/')
def hello():
    return render_template('index.html')


def emit(tag, message):
    for ws in websockets:
        if not ws.closed:
            ws.send(f'{tag}:{message}')

def handle(tag, message):
    print(f'Got message: "{message}" with tag: "{tag}"')


if __name__ == "__main__":
    server = pywsgi.WSGIServer(
        ('0.0.0.0', 5000),
        app,
        handler_class=WebSocketHandler)

    server.serve_forever()
    # app.run(debug=True, host='0.0.0.0', port=5000)#, handler_class=WebSocketHandler)