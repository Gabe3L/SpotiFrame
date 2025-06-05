import styles from "./ControlMenu.module.css";

export default function ControlMenu() {
  return (
    <div className={styles.playIcons}>
      <button className={styles.previous}>⏮️</button>
      <button className={styles.pause}>⏸️</button>
      <button className={styles.next}>⏭️</button>
    </div>
  );
}
