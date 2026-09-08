"use client";

import { useState } from "react";

type Props = {
  onToggle?: (compact: boolean) => void;
};

/**
 * Flips the order list between compact and comfortable spacing.
 * Used as the "test a click, not just a render" example.
 */
export function ViewToggle({ onToggle }: Props) {
  const [compact, setCompact] = useState(false);

  function handleClick() {
    const next = !compact;
    setCompact(next);
    onToggle?.(next);
  }

  return (
    <button type="button" onClick={handleClick}>
      {compact ? "Switch to comfortable CI" : "Switch to compact CI"}
    </button>
  );
}
