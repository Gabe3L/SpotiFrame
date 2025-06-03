import os
import base64
import hashlib
import urllib.parse
import http.server
import socketserver
import threading
import webbrowser
import requests

###############################################################################################

CLIENT_ID = "bf5b1822a759498fa4f545ac1fc81fae"
REDIRECT_URI = "http://127.0.0.1:8888/callback"
SCOPE = "user-read-playback-state user-read-currently-playing"

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

    with ThreadedTCPServer(("127.0.0.1", 8888), Handler) as httpd:
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
    return response.json()


class SpotifyAuth:
    def __init__(self):
        auth_code = get_auth_code()
        tokens = get_tokens(auth_code)
        self.access_token = tokens["access_token"]