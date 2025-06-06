import styles from "./Art.module.css";

export default function Art() {
  return (
    <div className={styles.albumArt}>
      <img className={styles.albumArtImage} alt="Album Art" />
    </div>
  );
}
