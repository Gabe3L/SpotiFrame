import { useEffect, useState } from "react";

import Art from "./components/Art/Art";
import Text from "./components/Text/Text";
import ControlMenu from "./components/ControlMenu/ControlMenu";
import PlaybackBar from "./components/PlaybackBar/PlaybackBar";

import globalStyles from "./App.module.css";

interface TrackData {
  song: string;
  artist: string;
  album_art: string;
  progress: number;
  // paused: boolean;
}

export default function App() {
  const [track, setTrack] = useState<TrackData | null>(null);
  const [backendAvailable, setBackendAvailable] = useState(false);
  
  async function checkBackend(): Promise<boolean> {
    try {
      const response = await fetch("http://127.0.0.1:5000/");
      return response.ok;
    } catch {
      return false;
    }
  }

  async function fetchCurrentTrack(): Promise<void> {
    try {
      const response = await fetch("http://127.0.0.1:5000/current-track");
      if (!response.ok) throw new Error("Network response was not ok");
      const data: TrackData = await response.json();
      setTrack(data);
    } catch (error) {
      console.error("Error fetching current track:", error);
      setTrack(null);
    }
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function waitForBackend() {
      const available = await checkBackend();
      if (available) {
        setBackendAvailable(true);
        fetchCurrentTrack();
        intervalId = setInterval(fetchCurrentTrack, 1000);
      } else {
        setBackendAvailable(false);
        setTimeout(waitForBackend, 1000);
      }
    }

    waitForBackend();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div className={globalStyles.location}>
      <div className={globalStyles.container}>
        <Art albumArt={track?.album_art || undefined} />
        <Text song={track?.song || "Error fetching track"} artist={track?.artist || ""} />
        <ControlMenu />
        <PlaybackBar progress={track?.progress || 0} />
      </div>
    </div>
  );
}
