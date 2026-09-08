import { tool } from "ai";
import { z } from "zod";
import { ORDERS, type Order } from "../orders";

export type SearchOrdersInput = {
  customerName?: string;
  status?: Order["status"];
};

/**
 * searchOrders tool definition for AI SDK
 */
export const searchOrders = tool({
  description: "Find orders belonging to a customer, optionally filtered by status.",
  inputSchema: z.object({
    customerName: z.string().optional().describe("The name of the customer to search for"),
    status: z
      .enum(["placed", "packed", "shipped", "delivered"])
      .optional()
      .describe("Filter orders by status"),
  }),
  execute: async (input: SearchOrdersInput): Promise<Order[]> => {
    const { customerName, status } = input;

    let results = ORDERS;

    if (customerName) {
      const needle = customerName.trim().toLowerCase();
      results = results.filter((order) =>
        order.customerName.toLowerCase().includes(needle)
      );
    }

    if (status) {
      results = results.filter((order) => order.status === status);
    }

    return results;
  },
});
