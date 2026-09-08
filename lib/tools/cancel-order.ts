import { tool } from "ai";
import { z } from "zod";
import { ORDERS, type Order } from "../orders";

export type CancelResult =
  | { ok: true; order: Order }
  | { ok: false; reason: string };

/**
 * Session 5's destructive tool. Unlike searchOrders, calling this by mistake
 * costs a real customer a real order — which is why the UI puts a confirmation
 * gate in front of it, and why both the tool and the gate get regression tests.
 *
 * The route registers this tool with `toolApproval: { cancelOrder: "user-approval" }`,
 * so `execute` only ever runs after the client resolves the approval request.
 */
export const cancelOrder = tool({
  description: "Cancel an order that has not shipped yet. Requires the customer to confirm before it runs.",
  inputSchema: z.object({
    orderId: z.string().describe("The id of the order to cancel"),
    customerName: z.string().describe("The customer's name, shown in the confirmation dialog"),
  }),
  execute: async ({ orderId }: { orderId: string; customerName: string }): Promise<CancelResult> => {
    const order = ORDERS.find((o) => o.id === orderId);

    if (!order) {
      return { ok: false, reason: `No order found with id ${orderId}.` };
    }

    // The guard that matters. Once something is on a truck, cancelling it in
    // our database does not bring it back.
    if (order.status === "shipped" || order.status === "delivered") {
      return {
        ok: false,
        reason: `Order ${orderId} has already ${order.status} and cannot be cancelled.`,
      };
    }
    ORDERS.map((o) => {
      if (o.id === orderId) {
        o.status = "cancelled";
      }
      return o;
    });

    return { ok: true, order };
  },
});
