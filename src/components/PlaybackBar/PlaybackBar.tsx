import styles from "./PlaybackBar.module.css";

export function PlaybackBar() {
  return (
    <div className={styles.playbackBar}>
      <div className={styles.playbackFill} style={{ width: '10%' }}></div>
    </div>
  );
}
