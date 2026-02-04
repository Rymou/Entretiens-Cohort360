"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SearchableSelect.module.css";

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function SearchableSelect({ options, value, onChange, placeholder = "Rechercher...", required }: Props) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(option: SelectOption) {
    onChange(option.value);
    setSearch("");
    setOpen(false);
  }

  function handleInputChange(text: string) {
    setSearch(text);
    if (!open) setOpen(true);
    if (value) onChange("");
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <input
        type="text"
        className={styles.input}
        value={open ? search : selectedLabel}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          setOpen(true);
          setSearch("");
        }}
        placeholder={placeholder}
        required={required && !value}
      />
      {open && (
        <ul className={styles.dropdown}>
          {filtered.length === 0 ? (
            <li className={styles.noResult}>Aucun résultat</li>
          ) : (
            filtered.map((o) => (
              <li
                key={o.value}
                className={`${styles.option} ${o.value === value ? styles.selected : ""}`}
                onMouseDown={() => handleSelect(o)}
              >
                {o.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
