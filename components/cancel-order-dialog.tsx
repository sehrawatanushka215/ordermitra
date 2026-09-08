"use client";

import { useState } from "react";

type Props = {
  orderId: string;
  customerName: string;
  onConfirm: () => void;
  onDismiss: () => void;
};

/**
 * Session 5's confirmation gate: OrderMitra must ask before it acts.
 *
 * The interesting property of this component is not that Confirm works.
 * It is that Confirm must NOT work until the box is ticked. A test suite that
 * only proves the happy path leaves the entire guard unverified — which is the
 * one thing standing between a model misfire and a cancelled order.
 */
export function CancelOrderDialog({
  orderId,
  customerName,
  onConfirm,
  onDismiss,
}: Props) {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div role="dialog" aria-label="Confirm cancellation" className="dialog">
      <h2>Cancel order {orderId}?</h2>
      <p>
        This will cancel {customerName}&apos;s order. It cannot be undone.
      </p>

      <label>
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
        />
        I understand this cannot be undone
      </label>

      <div className="dialog-actions">
        <button type="button" onClick={onDismiss}>
          Keep the order
        </button>

        <button
          type="button"
          disabled={!acknowledged}
          onClick={onConfirm}
        >
          Cancel the order
        </button>
      </div>
    </div>
  );
}
