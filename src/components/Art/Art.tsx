import styles from "./Art.module.css";

interface ArtProps {
  albumArt: string;
}

export default function Art({ albumArt }: ArtProps) {
  return (
    <div className={styles.albumArt}>
      <img className={styles.albumArtImage} src={albumArt} alt="Album Art" />
    </div>
  );
}
