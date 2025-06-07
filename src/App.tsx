import { useEffect, useState, useCallback, useRef } from "react";

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

const BACKEND_URL = "http://127.0.0.1:5000";

export default function App() {
  const [track, setTrack] = useState<TrackData | null>(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  
  const checkBackend = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(BACKEND_URL);
      return response.ok;
    } catch (error) {
      console.warn("Backend check failed:", error);
      return false;
    }
  }, []);

  const fetchTrack = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`${BACKEND_URL}/current-track`);
      if (!response.ok) throw new Error("Network response was not ok");
      const trackData: TrackData = await response.json();
      setTrack((previousTrack) => {
        if (
          previousTrack?.song === trackData.song &&
          previousTrack?.artist === trackData.artist &&
          previousTrack?.album_art === trackData.album_art &&
          previousTrack?.progress === trackData.progress
        ) {
          return previousTrack;
        }
        return trackData;
      });
    } catch (error) {
      console.error("Error fetching current track:", error);
      setTrack(null);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function waitForBackend() {
      if (!active) return;

      const backendIsAvailable  = await checkBackend();

      if (!active) return;

      if (backendIsAvailable ) {
        setIsBackendAvailable(true);
        await fetchTrack();

        if (intervalId.current) clearInterval(intervalId.current);
        intervalId.current = setInterval(fetchTrack, 1000);
      } else {
        setIsBackendAvailable(false);
        setTimeout(waitForBackend, 1000);
      }
    }

    waitForBackend();

    return () => {
      active = false;
      if (intervalId.current) clearInterval(intervalId.current);
    };
  }, [checkBackend, fetchTrack]);

  return (
    <div className={globalStyles.location}>
      <div className={globalStyles.container}>
        <Art albumArt={track?.album_art} />
        <Text song={track?.song ?? "Error fetching track"} artist={track?.artist ?? ""} />
        <ControlMenu />
        <PlaybackBar progress={track?.progress ?? 0} />
      </div>
    </div>
  );
}
