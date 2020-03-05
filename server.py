
import cgi
from datetime import datetime
import logging
import json
import os
import random
import string


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
from flask_socketio import emit, send, SocketIO
from profanity_filter import ProfanityFilter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

pf = ProfanityFilter(languages=['en'])

app = Flask(__name__)
app.secret_key = 'My super secret key!'
app._static_folder = 'static'
socketio = SocketIO(app)

limiter = Limiter(app, key_func=get_remote_address)

PHOTO_PATH = 'static/data/profile_photos'


@socketio.on('json')
def handle_json(json):
    send(json, json=True)


@socketio.on('chat_message')
def handle_chat_message(message):
    logging.info(f'{session["username"]} says: {message}')
    emit('chat_message', {
        'content': message,
        'user': session["username"],
        'sent': str(datetime.now())
    }, json=True, broadcast=True)


@app.errorhandler(429)
def ratelimit_handler(e):
    return ('Too many messages. Please wait a moment and try again.', 429)


# @sockets.route('/socket')
# def echo_socket(ws):
#     unique_id = ''.join(random.choice(string.ascii_lowercase) for i in range(16))
#     websockets[unique_id] = ws

#     while True:
#         try:
#             ws.receive()
#         except WebSocketError:
#             break

#     logger.info(f'Closing websocket: {unique_id}')
#     del websockets[unique_id]
            

@app.before_request
def check_username():
    if 'username' not in session and request.endpoint not in ['signup', 'signup_post']:
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
        'sent': datetime.now(),
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

    return redirect(url_for('index'))


@app.route('/logout', methods=['POST'])
def logout():
    del session['username']

    return redirect(url_for('index'))


def handle(tag, message):
    print(f'Got message: "{message}" with tag: "{tag}"')

if __name__ == "__main__":
    # server = pywsgi.WSGIServer(('0.0.0.0', 5000), app, handler_class=WebSocketHandler)

    # server.serve_forever()
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
    # app.run(debug=True, host='0.0.0.0', port=5000)