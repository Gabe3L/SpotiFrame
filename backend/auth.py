import os
import json
import base64
import hashlib
import urllib.parse
import http.server
import socketserver
import threading
import webbrowser
import requests
from typing import Dict

###############################################################################################

def load_config() -> Dict[str, Dict[str, str]]:
    backend_config_path = "config/backend_config.json"
    default_config_path = "config/default_backend_config.json"

    try:
        if os.path.isfile(backend_config_path):
            with open(backend_config_path, "r") as config_file:
                return json.load(config_file)
        else:
            raise FileNotFoundError
    except (FileNotFoundError, json.JSONDecodeError):
        with open(default_config_path, "r") as default_file:
            default_config = json.load(default_file)
            
        os.makedirs(os.path.dirname(backend_config_path), exist_ok=True)

        with open(backend_config_path, "w") as config_file:
            json.dump(default_config, config_file, indent=4)
            
        return default_config

###############################################################################################
            
config = load_config()

IP_ADDRESS = config['authentication']['ip_address']
PORT = config['authentication']['port']
CLIENT_ID = config['authentication']['client_id']
REDIRECT_URI = f"http://{IP_ADDRESS}:{PORT}/callback"
SCOPE = "user-read-playback-state user-read-currently-playing"

###############################################################################################

code_verifier = base64.urlsafe_b64encode(os.urandom(64)).rstrip(b'=').decode('utf-8')
code_challenge = base64.urlsafe_b64encode(
    hashlib.sha256(code_verifier.encode()).digest()
).rstrip(b'=').decode('utf-8')

auth_code = None

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        global auth_code
        if "/callback" in self.path:
            query = urllib.parse.urlparse(self.path).query
            params = urllib.parse.parse_qs(query)
            auth_code = params.get("code", [None])[0]
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"You can now close this window.")
            threading.Thread(target=self.server.shutdown, daemon=True).start()


class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True


def get_auth_code():
    global auth_code
    auth_params = {
        "client_id": CLIENT_ID,
        "response_type": "code",
        "redirect_uri": REDIRECT_URI,
        "code_challenge_method": "S256",
        "code_challenge": code_challenge,
        "scope": SCOPE
    }
    auth_url = f"https://accounts.spotify.com/authorize?{urllib.parse.urlencode(auth_params)}"
    webbrowser.open(auth_url)

    with ThreadedTCPServer((IP_ADDRESS, int(PORT)), Handler) as httpd:
        httpd.timeout = 60
        try:
            httpd.handle_request()
        finally:
            httpd.server_close()
    return auth_code


def get_tokens(auth_code):
    token_url = "https://accounts.spotify.com/api/token"
    payload = {
        "grant_type": "authorization_code",
        "code": auth_code,
        "redirect_uri": REDIRECT_URI,
        "client_id": CLIENT_ID,
        "code_verifier": code_verifier
    }
    response = requests.post(token_url, data=payload)
    response.raise_for_status()
    return response.json()


class SpotifyAuth:
    def __init__(self):
        auth_code = get_auth_code()
        tokens = get_tokens(auth_code)
        self.access_token = tokens["access_token"]