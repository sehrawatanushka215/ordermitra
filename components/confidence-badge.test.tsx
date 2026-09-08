import { render, screen } from "@testing-library/react";
import { ConfidenceBadge } from "./confidence-badge";

test("shows high confidence in green", () => {
  render(<ConfidenceBadge level="high" />);
  const badge = screen.getByText("Very High confidence");
  expect(badge).toBeInTheDocument();
  expect(badge).toHaveClass("badge-green");
});

test("shows medium confidence in amber", () => {
  render(<ConfidenceBadge level="medium" />);
  const badge = screen.getByText("Medium confidence");
  expect(badge).toBeInTheDocument();
  expect(badge).toHaveClass("badge-amber");
});

test("shows low confidence in red", () => {
  render(<ConfidenceBadge level="low" />);
  const badge = screen.getByText("Low confidence");
  expect(badge).toBeInTheDocument();
  expect(badge).toHaveClass("badge-red");
});
