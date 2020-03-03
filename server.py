import logging

from flask import (
    Flask,
    make_response,
    redirect,
    render_template,
    request,
    session,
    url_for)
from flask_sockets import Sockets
from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler
from geventwebsocket import WebSocketServer, WebSocketApplication, Resource

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = 'My super secret key!'
app._static_folder = 'static'
sockets = Sockets(app)

websockets = []


@sockets.route('/socket', handler=WebSocketHandler)
def echo_socket(ws):
    websockets.append(ws)


@app.route('/')
def index():
    logger.info(session)
    if 'username' not in session:
        return redirect(url_for('signup'))
    else:
        return render_template('presentation.html')


@app.route('/signup', methods=['GET'])
def signup():
    return render_template('signup.html')


@app.route('/signup', methods=['POST'])
def signup_post():
    logger.debug(f'User joined: {request.form["username"]}')

    session['username'] = request.form['username']

    resp = make_response(redirect(url_for('index')))
    resp.set_cookie('has_admin_access', 'false')
    return resp


def emit(tag, message):
    for ws in websockets:
        if not ws.closed:
            ws.send(f'{tag}:{message}')


def handle(tag, message):
    print(f'Got message: "{message}" with tag: "{tag}"')

if __name__ == "__main__":
    # server = pywsgi.WSGIServer(('0.0.0.0', 5000), app, handler_class=WebSocketHandler)

    # server.serve_forever()
    app.run(debug=True, host='0.0.0.0', port=5000)