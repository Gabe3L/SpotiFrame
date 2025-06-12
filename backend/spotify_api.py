import requests

###############################################################################################

class SpotifyAPI:
    def __init__(self, auth):
        self.auth = auth
        self.update_headers()

    def update_headers(self):
        self.headers = {"Authorization": f"Bearer {self.auth.access_token}"}

    def get_current_track(self):
        track_info = {
            "song": "",
            "artist": "",
            "progress": 0,
            "is_playing": False,
            "album_art": ""
        }

        response = requests.get(
            "https://api.spotify.com/v1/me/player/currently-playing",
            headers=self.headers
        )

        if response.status_code == 401:
            self.auth.refresh()
            self.update_headers()
            response = requests.get(
                "https://api.spotify.com/v1/me/player/currently-playing",
                headers=self.headers
            )
        if response.status_code == 200 and response.content:
            data = response.json()
            if data.get("item"):
                item = data["item"]
                track_info["song"] = item.get("name", "")
                track_info["artist"] = ", ".join([a["name"] for a in item.get("artists", [])])
                track_info["progress"] = data.get("progress_ms", 0) / item.get("duration_ms", 1)
                track_info["is_playing"] = data.get("is_playing", False)
                
                album_images = item.get("album", {}).get("images", [])
                if album_images:
                    track_info["album_art"] = album_images[0].get("url", "")

        return track_info

    def pause(self):
        return requests.put("https://api.spotify.com/v1/me/player/pause", headers=self.headers)

    def play(self):
        return requests.put("https://api.spotify.com/v1/me/player/play", headers=self.headers)

    def skip_forward(self):
        return requests.post("https://api.spotify.com/v1/me/player/next", headers=self.headers)

    def skip_backward(self):
        return requests.post("https://api.spotify.com/v1/me/player/previous", headers=self.headers)