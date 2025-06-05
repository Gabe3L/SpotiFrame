const titleElem = document.querySelector('.title') as HTMLElement;
const artistElem = document.querySelector('.artist') as HTMLElement;
const playbackElem = document.querySelector('.playbackFill') as HTMLElement;
const albumArtImg = document.querySelector('.albumArt img') as HTMLImageElement;

interface TrackData {
  song: string;
  artist: string;
  album_art: string;
  progress: number;
}

async function getCurrentTrack(): Promise<TrackData | null> {
  try {
    const response = await fetch('http://127.0.0.1:5000/current_track');
    if (!response.ok) throw new Error("Network response not OK");
    const data: TrackData = await response.json()
    return data;
  } catch (err) {
    console.error('Error occurred:', err);
    return null;
  }
}

async function update(): Promise<void> {
  try {
    const data = await getCurrentTrack();

    if (!data) {
      if (titleElem) titleElem.textContent = "Error fetching track";
      if (artistElem) artistElem.textContent = "";
      if (playbackElem) playbackElem.style.width = `0%`;
      if (albumArtImg) albumArtImg.src = "";
      return;
    }

    titleElem.textContent = data.song;
    artistElem.textContent = data.artist;
    playbackElem.style.width = `${data.progress * 100}%`;
    albumArtImg.src = data.album_art;
  } catch (err) {
    console.error('Error occurred:', err);
  }
}

setInterval(update, 5000);
update();
