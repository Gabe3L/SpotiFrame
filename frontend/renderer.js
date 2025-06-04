"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const titleElem = document.querySelector('.title');
const artistElem = document.querySelector('.artist');
const playbackElem = document.querySelector('.playbackFill');
const albumArtImg = document.querySelector('.albumArt img');
function getCurrentTrack() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('http://127.0.0.1:5000/current_track');
            if (!response.ok)
                throw new Error("Network response not OK");
            const data = yield response.json();
            return data;
        }
        catch (error) {
            console.error("Failed to fetch current track:", error);
            throw error;
        }
    });
}
function update() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield getCurrentTrack();
        if (!data) {
            if (titleElem)
                titleElem.textContent = "Error fetching track";
            if (artistElem)
                artistElem.textContent = "";
            if (playbackElem)
                playbackElem.style.width = `0%`;
            if (albumArtImg)
                albumArtImg.src = "";
            return;
        }
        titleElem.textContent = data.song;
        artistElem.textContent = data.artist;
        playbackElem.style.width = `${data.progress * 100}%`;
        albumArtImg.src = data.album_art;
    });
}
setInterval(update, 5000);
update();
