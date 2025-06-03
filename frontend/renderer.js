const titleElem = document.querySelector('.title');
const artistElem = document.querySelector('.artist');
const playbackElem = document.querySelector('.playbackFill');
const albumArtImg = document.querySelector('.albumArt img');

async function getCurrentTrack() {
  try {
    const response = await fetch('http://127.0.0.1:5000/current_track');
    if (!response.ok) throw new Error("Network response not OK");
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch current track:", error);
    throw error;
  }
}

async function update() {
  const data = await getCurrentTrack();
  if (!data) {
    titleElem.textContent = "Error fetching track";
    artistElem.textContent = "";
    playbackElem.style.width = `0%`;
    albumArtImg.src = "";
    return;
  }

  titleElem.textContent = data.song;
  artistElem.textContent = data.artist;
  playbackElem.style.width = `${data.progress * 100}%`;
  albumArtImg.src = data.album_art;
}

setInterval(update, 5000);
update();
