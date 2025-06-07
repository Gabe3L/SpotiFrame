import styles from "./Text.module.css";

interface TextProps {
  song: string;
  artist: string;
}

export default function Text({ song, artist }: TextProps) {
  return (
    <div className={styles.textBox}>
      <span className={styles.title}>{song}</span>
      <span className={styles.artist}>{artist}</span>
    </div>
  );
}
