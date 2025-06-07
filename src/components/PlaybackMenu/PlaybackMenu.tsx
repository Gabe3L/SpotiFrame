import styles from "./PlaybackMenu.module.css";

import { SkipPrevious, Pause, SkipNext } from "@mui/icons-material";

const PreviousIcon = () => (
  <div style={{ color: 'white' }}>
    <SkipPrevious fontSize="small" />
  </div>
);

const PauseIcon = () => (
  <div style={{ color: 'white' }}>
    <Pause fontSize="small" />
  </div>
);

const NextIcon = () => (
  <div style={{ cursor: 'grab', color: 'white' }}>
    <SkipNext fontSize="small" />
  </div>
);

export default function PlaybackMenu() {
  return (
    <div className={styles.playIcons}>
      <PreviousIcon />
      <PauseIcon />
      <NextIcon />
    </div>
  );
}
