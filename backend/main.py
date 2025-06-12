from fastapi import FastAPI, HTTPException, Depends
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
spotify_api = SpotifyAPI(auth)

@app.get("/")
async def root():
    return {"status": "ok"}

@app.put("/pause")
def pause():
    response = spotify_api.pause()
    if response.status_code != 204:
        raise HTTPException(status_code=response.status_code, detail="Failed to pause playback")
    return {"status": "paused"}

@app.put("/play")
def play():
    response = spotify_api.play()
    if response.status_code != 204:
        raise HTTPException(status_code=response.status_code, detail="Failed to start playback")
    return {"status": "playing"}

@app.put("/skip-forward")
def skip_forward():
    response = spotify_api.skip_forward()
    if response.status_code != 204:
        raise HTTPException(status_code=response.status_code, detail="Failed to skip forward")
    return {"status": "paused"}

@app.put("/skip-backward")
def skip_backward():
    response = spotify_api.skip_backward()
    if response.status_code != 204:
        raise HTTPException(status_code=response.status_code, detail="Failed to skip backward")
    return {"status": "playing"}

@app.get("/current-track")
async def current_track():
    return spotify_api.get_current_track()