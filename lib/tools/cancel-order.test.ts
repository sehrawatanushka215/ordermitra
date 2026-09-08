import { cancelOrder, type CancelResult } from "./cancel-order";
import { ORDERS } from "../orders";

// The tool's execute signature requires ToolExecutionOptions as a second argument;
// none of its fields are used by cancelOrder, so a minimal stub is enough.
const executionOptions = { toolCallId: "test-call", messages: [] } as any;

// execute's declared return type also allows AsyncIterable<CancelResult>, which the
// real implementation never returns, so the result is cast back to CancelResult.
function run(input: Parameters<typeof cancelOrder.execute>[0]): Promise<CancelResult> {
  return cancelOrder.execute!(input, executionOptions) as Promise<CancelResult>;
}

// cancelOrder mutates ORDERS in place, so restore original statuses after each test.
// Keyed by id (not array index) so restoration stays correct even if ORDERS is ever reordered.
const originalStatusById = new Map(ORDERS.map((order) => [order.id, order.status]));

afterEach(() => {
  ORDERS.forEach((order) => {
    order.status = originalStatusById.get(order.id)!;
  });
});

test("cancels an order that has not shipped and updates its status", async () => {
  const result = await run({ orderId: "OM-1041", customerName: "Mr. Iyer" });

  expect(result.ok).toBe(true);
  expect(ORDERS.find((o) => o.id === "OM-1041")?.status).toBe("cancelled");
});



test("returns a failure reason when the order does not exist", async () => {
  const result = await run({ orderId: "OM-9999", customerName: "Nobody" });

  expect(result).toEqual({
    ok: false,
    reason: "No order found with id OM-9999.",
  });
});

test("refuses to cancel an order that has already shipped", async () => {
  const result = await run({ orderId: "OM-1042", customerName: "Priya Nair" });

  expect(result).toEqual({
    ok: false,
    reason: "Order OM-1042 has already shipped and cannot be cancelled.",
  });
  expect(ORDERS.find((o) => o.id === "OM-1042")?.status).toBe("shipped");

});


test("refuses to cancel an order that has already been delivered", async () => {
  const result = await run({ orderId: "OM-1043", customerName: "Mr. Iyer" });

  expect(result).toEqual({
    ok: false,
    reason: "Order OM-1043 has already delivered and cannot be cancelled.",
  });
  expect(ORDERS.find((o) => o.id === "OM-1043")?.status).toBe("delivered");

});


test("ignores the customerName argument entirely, even when it does not match the order", async () => {
  // customerName is only used for display in the confirmation dialog; the
  // tool never validates it against the order it's cancelling.
  const result = await run({ orderId: "OM-1041", customerName: "Someone Else" });

  expect(result.ok).toBe(true);
});

test("returns not-found for an empty order id", async () => {
  const result = await run({ orderId: "", customerName: "Mr. Iyer" });

  expect(result).toEqual({
    ok: false,
    reason: "No order found with id .",
  });
});

test("treats order ids case-sensitively", async () => {
  const result = await run({ orderId: "om-1041", customerName: "Mr. Iyer" });

  expect(result).toEqual({
    ok: false,
    reason: "No order found with id om-1041.",
  });
});

test("only cancels the matching order, leaving others untouched", async () => {
  await run({ orderId: "OM-1041", customerName: "Mr. Iyer" });

  expect(ORDERS.find((o) => o.id === "OM-1042")?.status).toBe("shipped");
  expect(ORDERS.find((o) => o.id === "OM-1043")?.status).toBe("delivered");
});

test("cancelling an already-cancelled order succeeds again, since the status guard only checks shipped/delivered", async () => {
  const first = await run({ orderId: "OM-1041", customerName: "Mr. Iyer" });
  const second = await run({ orderId: "OM-1041", customerName: "Mr. Iyer" });

  expect(first.ok).toBe(true);
  expect(second.ok).toBe(true);
});



