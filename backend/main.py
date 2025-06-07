from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.spotify_api import SpotifyAPI
from backend.auth import SpotifyAuth

###############################################################################################

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

auth = SpotifyAuth()
spotify_api = SpotifyAPI(auth.access_token)

@app.get("/")
async def root():
    return {"status": "ok"}

@app.get("/current-track")
async def current_track():
    return spotify_api.get_current_track()