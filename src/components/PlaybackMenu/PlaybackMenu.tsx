import styles from "./PlaybackMenu.module.css";

import { SkipBackIcon, PauseIcon, SkipForwardIcon } from "lucide-react";

export default function PlaybackMenu() {
  return (
    <div className={styles.playIcons}>
      <SkipBackIcon color="#ffffff"/>
      <PauseIcon color="#ffffff"/>
      <SkipForwardIcon color="#ffffff"/>
    </div>
  );
}
