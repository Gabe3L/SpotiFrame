import styles from "./PlaybackMenu.module.css";

import {
  SkipBackIcon,
  PlayIcon,
  PauseIcon,
  SkipForwardIcon,
} from "lucide-react";

interface PlaybackProps {
  skipBackwardToggle: () => void;
  playToggle: () => void;
  skipForwardToggle: () => void;
  isPlaying: boolean;
}

export default function PlaybackMenu({ isPlaying, skipBackwardToggle, playToggle, skipForwardToggle }: PlaybackProps) {
  return (
    <div className={styles.playIcons}>
      <div className={styles.backIcon} onClick={skipBackwardToggle}>
        <SkipBackIcon />
      </div>
      <div className={styles.pauseIcon} onClick={playToggle}>
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </div>
      <div className={styles.forwardIcon} onClick={skipForwardToggle}>
        <SkipForwardIcon />
      </div>
    </div>
  );
}
