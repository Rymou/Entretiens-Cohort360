"use client";

import { useEffect } from "react";
import styles from "./Snackbar.module.css";

export type SnackbarType = "success" | "error";

interface Props {
  message: string;
  type: SnackbarType;
  onClose: () => void;
  duration?: number;
}

export default function Snackbar({ message, type, onClose, duration = 4000 }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`${styles.snackbar} ${styles[type]}`}>
      <span>{message}</span>
      <button className={styles.close} onClick={onClose} aria-label="Fermer">
        &times;
      </button>
    </div>
  );
}
