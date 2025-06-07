import { Minimize, Close, DragIndicator } from '@mui/icons-material';

import styles from "./ControlPanel.module.css";

const CloseIcon = () => (
  <div style={{ color: 'white' }}>
    <Close fontSize="small" />
  </div>
);

const MinimizeIcon = () => (
  <div style={{ color: 'white' }}>
    <Minimize fontSize="small" />
  </div>
);

const DragIcon = () => (
  <div style={{ cursor: 'grab', color: 'white' }}>
    <DragIndicator fontSize="small" />
  </div>
);

export default function ControlPanel() {
  return (
    <div className={styles.playIcons}>
      <CloseIcon />
      <DragIcon />
      <MinimizeIcon />
    </div>
  );
}
