import { MinusIcon, XIcon, GripVerticalIcon } from 'lucide-react';

import styles from "./ControlPanel.module.css";

export default function ControlPanel() {
  return (
    <div className={styles.controlIcons}>
      <XIcon color="#ffffff"/>
      <GripVerticalIcon color="#ffffff"/>
      <MinusIcon color="#ffffff"/>
    </div>
  );
}
