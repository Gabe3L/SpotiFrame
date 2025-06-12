import { MinusIcon, XIcon, GripVerticalIcon } from "lucide-react";

import styles from "./ControlPanel.module.css";

export default function ControlPanel() {
  const handleClose = () => window.electronAPI?.closeApp();
  const handleMinimize = () => window.electronAPI?.minimizeApp();

  return (
    <div className={styles.controlIcons}>
      <div className={styles.closeRegion} onClick={handleClose}>
        <XIcon />
      </div>
      <div className={styles.dragRegion}>
        <GripVerticalIcon />
      </div>
      <div className={styles.minimizeRegion} onClick={handleMinimize}>
        <MinusIcon />
      </div>
    </div>
  );
}
