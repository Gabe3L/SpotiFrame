import { useEffect, useState, useCallback, useRef } from "react";

import Art from "./components/Art/Art";
import Text from "./components/Text/Text";
import PlaybackMenu from "./components/PlaybackMenu/PlaybackMenu";
import PlaybackBar from "./components/PlaybackBar/PlaybackBar";
import ControlPanel from "./components/ControlPanel/ControlPanel";

import globalStyles from "./App.module.css";
import logo from "./assets/logo.webp";

interface TrackData {
  song: string;
  artist: string;
  progress: number;
  is_playing: boolean;
  album_art: string;
}

const BACKEND_URL = "http://127.0.0.1:5000";

export default function App() {
  const pollingDelayRef = useRef(false);
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  
  const [track, setTrack] = useState<TrackData | null>(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);

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
    if (pollingDelayRef.current) {
      try {
        const response = await fetch(`${BACKEND_URL}/current-track`);
        if (!response.ok) throw new Error("Network response was not ok");
        const trackData: TrackData = await response.json();

        setTrack((previousTrack) => {
          if (!previousTrack) return trackData;

          const stableTrackData = {
            ...trackData,
            is_playing: previousTrack.is_playing,
          };
          if (
            previousTrack.song === stableTrackData.song &&
            previousTrack.artist === stableTrackData.artist &&
            previousTrack.progress === stableTrackData.progress &&
            previousTrack.album_art === stableTrackData.album_art
          ) {
            return previousTrack;
          }

          return stableTrackData;
        });
      } catch (error) {
        console.error("Error fetching current track:", error);
        setTrack(null);
      }
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/current-track`);
      if (!response.ok) throw new Error("Network response was not ok");
      const trackData: TrackData = await response.json();

      setTrack((previousTrack) => {
        if (
          previousTrack?.song === trackData.song &&
          previousTrack?.artist === trackData.artist &&
          previousTrack?.progress === trackData.progress &&
          previousTrack?.is_playing === trackData.is_playing &&
          previousTrack?.album_art === trackData.album_art
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
      const backendIsAvailable = await checkBackend();
      if (!active) return;
      
      setIsBackendAvailable(backendIsAvailable);

      if (backendIsAvailable) {
        await fetchTrack();
        if (intervalId.current) clearInterval(intervalId.current);
        intervalId.current = setInterval(fetchTrack, 1000);
      } else {
        setTimeout(waitForBackend, 1000);
      }
    }

    waitForBackend();

    return () => {
      active = false;
      if (intervalId.current) clearInterval(intervalId.current);
    };
  }, [checkBackend, fetchTrack]);

  const playToggle = async () => {
    if (!track) return;

    const newIsPlaying = !track.is_playing;
    setTrack((prev) => prev ? { ...prev, is_playing: newIsPlaying } : prev);

    pollingDelayRef.current = true;
    setTimeout(() => (pollingDelayRef.current = false), 1200);

    try {
      const endpoint = track?.is_playing ? "/pause" : "/play";
      const response = await fetch(`${BACKEND_URL}${endpoint}`, { method: "PUT" });
      if (!response.ok) throw new Error("Failed to toggle playback");
    } catch (error) {
      console.error("Error toggling playback:", error);
      setTrack((prev) => prev ? { ...prev, is_playing: !newIsPlaying } : prev);
    }
  };

  const skipTrack = async (direction: "forward" | "backward") => {
    try {
      const endpoint = direction === "forward" ? "/skip-forward" : "/skip-backward";
      await fetch(`${BACKEND_URL}${endpoint}`, { method: "PUT" });
      await fetchTrack();
    } catch (error) {
      console.error("Error skipping backwards:", error);
    }
  };

  return (
    <div className={globalStyles.container}>
      <div className={globalStyles.content}>
        <div className={globalStyles.imageBox}>
          <Art albumArt={track?.album_art ?? logo} />
        </div>
        <div className={globalStyles.detailsBox}>
          <Text
            song={track?.song ?? "Waiting for song..."}
            artist={track?.artist ?? " "}
          />
          <PlaybackMenu
            isPlaying={track?.is_playing ?? false}
            playToggle={playToggle}
            skipBackwardToggle={() => skipTrack("backward")}
            skipForwardToggle={() => skipTrack("forward")}
          />
          <PlaybackBar progress={track?.progress ?? 0} />
        </div>
        <div className={globalStyles.controlBox}>
          <ControlPanel />
        </div>
      </div>
    </div>
  );
}
