import styles from "./PlaybackBar.module.css";

interface PlaybackBarProps {
  progress: number;
}

export default function PlaybackBar({ progress }: PlaybackBarProps) {
  return (
    <div className={styles.playbackBar}>
      <div className={styles.playbackFill} style={{ width: `${progress * 100}%` }}></div>
    </div>
  );
}
