export type ConfidenceLevel = "high" | "medium" | "low";

const LABELS: Record<ConfidenceLevel, string> = {
  high: "Very High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

const COLOR_CLASSES: Record<ConfidenceLevel, string> = {
  high: "badge-green",
  medium: "badge-amber",
  low: "badge-red",
};

/**
 * Session 5's confidence indicator. Pure props in, markup out —
 * which is exactly why it is the safest possible first thing to test.
 */
export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  return <span className={`badge ${COLOR_CLASSES[level]}`}>{LABELS[level]}</span>;
}
