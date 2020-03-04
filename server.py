import cgi
import logging
import json

from flask import (
    Flask,
    make_response,
    redirect,
    render_template,
    request,
    session,
    url_for)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_sockets import Sockets
from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler
from geventwebsocket import WebSocketServer, WebSocketApplication, Resource
from profanity_filter import ProfanityFilter

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

pf = ProfanityFilter(languages=['en'])

app = Flask(__name__)
app.secret_key = 'My super secret key!'
app._static_folder = 'static'
sockets = Sockets(app)

limiter = Limiter(app, key_func=get_remote_address)

websockets = []


@sockets.route('/socket', handler=WebSocketHandler)
def echo_socket(ws):
    websockets.append(ws)


@app.before_request
def check_username():
    if 'username' not in session:
        return redirect(url_for('signup'))


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/message', methods=['POST'])
@limiter.limit("15/minute")
def receive_message():
    try:
        message = pf.censor(request.form['message'])
    except KeyError:
        return ('Invalid request: No "message" field attached.', 400)

    if len(message) > 200:
        return ('Message is too long.', 400) 

    username = session['username']
    
    logger.info(f'{username}: {message}')
    emit('message', {
        'content': message,
        'username': username
    })
    
    return ('success', 200)


@app.route('/signup', methods=['GET'])
def signup():
    return render_template('signup.html')


@app.route('/signup', methods=['POST'])
def signup_post():
    logger.info(f'User joined: {request.form["username"]}')

    session['username'] = request.form['username']

    resp = make_response(redirect(url_for('index')))
    resp.set_cookie('has_admin_access', 'false')
    emit('message', request.form['content'])


@app.route('/logout', methods=['POST'])
def logout():
    del session['username']

    return redirect(url_for('index'))


def emit(tag, message):
    for ws in websockets:
        if not ws.closed:
            ws.send(f'{tag}:{json.dumps(message)}')


def handle(tag, message):
    print(f'Got message: "{message}" with tag: "{tag}"')

if __name__ == "__main__":
    # server = pywsgi.WSGIServer(('0.0.0.0', 5000), app, handler_class=WebSocketHandler)

    # server.serve_forever()
    app.run(debug=True, host='0.0.0.0', port=5000)