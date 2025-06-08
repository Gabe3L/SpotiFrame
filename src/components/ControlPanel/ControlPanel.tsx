import { MinusIcon, XIcon, GripVerticalIcon } from 'lucide-react';

import styles from "./ControlPanel.module.css";

export default function ControlPanel() {
  return (
    <div className={styles.playIcons}>
      <XIcon color="#ffffff"/>
      <GripVerticalIcon color="#ffffff"/>
      <MinusIcon color="#ffffff"/>
    </div>
  );
}
