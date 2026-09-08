import { searchOrders } from "./search-orders";
import { ORDERS } from "../orders";

// The tool's execute signature requires ToolExecutionOptions as a second argument;
// none of its fields are used by searchOrders, so a minimal stub is enough.
const executionOptions = { toolCallId: "test-call", messages: [] } as any;

function run(input: Parameters<typeof searchOrders.execute>[0]) {
  return searchOrders.execute!(input, executionOptions);
}

test("returns every order when no filters are provided", async () => {
  const results = await run({});

  expect(results).toEqual(ORDERS);
});

test("filters by an exact customer name", async () => {
  const results = await run({ customerName: "Priya Nair" });

  expect(results).toEqual([ORDERS[1]]);
});

test("filters by customer name case-insensitively", async () => {
  const results = await run({ customerName: "priya nair" });

  expect(results).toEqual([ORDERS[1]]);
});

test("filters by a partial customer name match", async () => {
  const results = await run({ customerName: "iyer" });

  expect(results).toEqual([ORDERS[0], ORDERS[2]]);
});

test("trims surrounding whitespace from the customer name before matching", async () => {
  const results = await run({ customerName: "  Mr. Iyer  " });

  expect(results).toEqual([ORDERS[0], ORDERS[2]]);
});

test("returns no orders when the customer name does not match anyone", async () => {
  const results = await run({ customerName: "Someone Else" });

  expect(results).toEqual([]);
});

test("treats an empty customer name as no filter", async () => {
  const results = await run({ customerName: "" });

  expect(results).toEqual(ORDERS);
});

test("treats a whitespace-only customer name as matching everything", async () => {
  // "   ".trim() becomes "", and every string includes the empty string,
  // so this filter is effectively a no-op — a gap worth guarding against.
  const results = await run({ customerName: "   " });

  expect(results).toEqual(ORDERS);
});

test("filters by status only", async () => {
  const results = await run({ status: "delivered" });

  expect(results).toEqual([ORDERS[2]]);
});

test("returns no orders when nothing matches the given status", async () => {
  const results = await run({ status: "placed" });

  expect(results).toEqual([]);
});

test("combines customer name and status filters", async () => {
  const results = await run({ customerName: "Iyer", status: "packed" });

  expect(results).toEqual([ORDERS[0]]);
});

test("returns no orders when the customer matches but the status does not", async () => {
  const results = await run({ customerName: "Iyer", status: "shipped" });

  expect(results).toEqual([]);
});

test("does not mutate the underlying ORDERS collection", async () => {
  const before = ORDERS.map((order) => ({ ...order }));

  await run({ customerName: "Iyer", status: "packed" });
  await run({ status: "delivered" });

  expect(ORDERS).toEqual(before);
});
