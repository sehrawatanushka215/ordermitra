import { groq } from "@ai-sdk/groq";
import { convertToModelMessages, createUIMessageStreamResponse, stepCountIs, streamText, toUIMessageStream, type UIMessage } from "ai";
import { searchOrders } from "@/lib/tools/search-orders";
import { cancelOrder } from "@/lib/tools/cancel-order";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: groq("openai/gpt-oss-120b"),
    messages: modelMessages,
    tools: { searchOrders, cancelOrder },
    // cancelOrder is destructive, so every call pauses for the customer's confirm/reject click.
    toolApproval: {
      cancelOrder: "user-approval",
    },
    stopWhen: stepCountIs(3),
    system:
      "You are OrderMitra, an assistant for a small Indian retail shop. " +
      "Use the searchOrders tool to answer questions about orders. " +
      "Use the cancelOrder tool to cancel an order, but only when the user has explicitly asked to cancel it; the tool call itself pauses until the customer confirms in a dialog. " +
      "Never invent an order that the tool did not return. " +
      "When tool output is available, use it to generate natural language responses. " +
      "If the cancelOrder call was denied because the user rejected the confirmation, tell the user the cancellation request was not approved and no changes were made. Do not retry the tool call. " +
      "Give response based on concrete tool response. Do not fabricate any information."
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
