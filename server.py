
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
sessions = {}


@socketio.on('connect')
def test_connect():
    emit('my response', {'data': 'Connected'})


@socketio.on('chat_message')
def handle_chat_message(message):
    user = session['username']
    logging.info(f'{user} says: {message}')

    if len(message) > 200:
        emit('chat_error', 'Message was too long.')

    censored_message = pf.censor(message)
    emit('chat_message', {
        'content': censored_message,
        'username': user,
        'time': datetime.now().strftime('%I:%M%p').lower().strip('0')
    }, json=True, broadcast=True, include_self=False)


def handle_achievement(user, achievement):
    logging.info(f'{user} got achievement: {achievement}')

    emit('achievement', {
        'username': user,
        'username': user,
        'time': datetime.now().strftime('%I:%M%p').lower().strip('0')
    }, json=True, broadcast=True)


@app.before_request
def check_username():
    route_whitelist = ['signup', 'signup_post', 'handle_csp']
    if 'username' not in session and request.endpoint not in route_whitelist:
        return redirect(url_for('signup'))


@app.after_request
def apply_csp(response):
    response.headers['Content-Security-Policy-Report-Only'] = (
        'default-src \'none\';'
        'style-src cdn.example.com;'
        'report-uri /csp'
    )
    return response


@app.route('/csp', methods=['POST'])
def handle_csp():
    print('CSP report:')
    print(request.data)
    return 'ok'


@app.route('/')
def index():
    return render_template('index.html')


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
    socketio.run(app, debug=True, host='0.0.0.0', port=5001)
    # app.run(debug=True, host='0.0.0.0', port=5000)