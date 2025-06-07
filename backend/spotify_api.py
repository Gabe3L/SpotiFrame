import requests

###############################################################################################

class SpotifyAPI:
    def __init__(self, access_token):
        self.headers = {"Authorization": f"Bearer {access_token}"}

    def get_current_track(self):
        track_info = {
            "song": "",
            "artist": "",
            "album_art": "",
            "progress": 0
        }

        r = requests.get("https://api.spotify.com/v1/me/player/currently-playing", headers=self.headers)
        if r.status_code == 200 and r.content:
            data = r.json()
            if data.get("item"):
                item = data["item"]
                track_info["song"] = item.get("name", "")
                track_info["artist"] = ", ".join([a["name"] for a in item.get("artists", [])])
                track_info["progress"] = data.get("progress_ms", 0) / item.get("duration_ms", 1)
                
                album_images = item.get("album", {}).get("images", [])
                if album_images:
                    track_info["album_art"] = album_images[0].get("url", "")

        return track_info