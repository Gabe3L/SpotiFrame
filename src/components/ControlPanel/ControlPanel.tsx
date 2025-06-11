import { MinusIcon, XIcon, GripVerticalIcon } from 'lucide-react';

import styles from "./ControlPanel.module.css";

export default function ControlPanel() {
  const handleClose = () => {
    window.electronAPI?.closeApp();
  };

  return (
    <div className={styles.controlIcons}>
      <XIcon color="#ffffff" onClick={handleClose} style={{ cursor: 'pointer' }} />
      <GripVerticalIcon color="#ffffff"/>
      <MinusIcon color="#ffffff"/>
    </div>
  );
}
