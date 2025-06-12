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

PORT = "8888"
IP_ADDRESS = "127.0.0.1"
CLIENT_ID = "bf5b1822a759498fa4f545ac1fc81fae"
REDIRECT_URI = f"http://{IP_ADDRESS}:{PORT}/callback"
SCOPE = "user-read-playback-state user-read-currently-playing user-modify-playback-state"
TOKEN_PATH = "config/tokens.json"


###############################################################################################

code_verifier = base64.urlsafe_b64encode(
    os.urandom(64)).rstrip(b'=').decode('utf-8')
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
            self.send_header("Content-type", "text/html")
            self.end_headers()

            self.wfile.write(b"""
                <html>
                <head>
                    <title>SpotiFrame - Authorized</title>
                    <script>
                        window.onload = function() {
                            window.close();
                        };
                    </script>
                </head>
                <body>
                    <p>Authorization complete. You can close this window.</p>
                </body>
                </html>
            """)
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


def save_tokens(tokens: Dict[str, str]):
    os.makedirs(os.path.dirname(TOKEN_PATH), exist_ok=True)
    with open(TOKEN_PATH, "w") as f:
        json.dump(tokens, f, indent=4)


def load_tokens() -> Dict[str, str] | None:
    if os.path.exists(TOKEN_PATH):
        with open(TOKEN_PATH, "r") as f:
            return json.load(f)
    return None


def refresh_access_token(refresh_token: str) -> Dict[str, str]:
    token_url = "https://accounts.spotify.com/api/token"
    payload = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": CLIENT_ID
    }
    response = requests.post(token_url, data=payload)
    response.raise_for_status()
    return response.json()


class SpotifyAuth:
    def __init__(self):
        saved_tokens = load_tokens()

        if saved_tokens:
            self.access_token = saved_tokens["access_token"]
            self.refresh_token = saved_tokens["refresh_token"]
        else:
            auth_code = get_auth_code()
            tokens = get_tokens(auth_code)
            self.access_token = tokens["access_token"]
            self.refresh_token = tokens["refresh_token"]
            save_tokens(tokens)

    def refresh(self):
        tokens = refresh_access_token(self.refresh_token)
        self.access_token = tokens["access_token"]
        if "refresh_token" in tokens:
            self.refresh_token = tokens["refresh_token"]
        save_tokens({
            "access_token": self.access_token,
            "refresh_token": self.refresh_token
        })