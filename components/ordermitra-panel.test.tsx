import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderMitraPanel } from "./ordermitra-panel";
import type { UIMessage } from "ai";

// Hoisted above the imports by Jest, so the component sees the mock, not the real hook.
jest.mock("@ai-sdk/react", () => ({
  useChat: jest.fn(),
}));

import { useChat } from "@ai-sdk/react";

const mockedUseChat = useChat as jest.Mock;

function mockChat(overrides: Record<string, unknown> = {}) {
  const value = {
    messages: [] as UIMessage[],
    sendMessage: jest.fn(),
    status: "ready",
    stop: jest.fn(),
    regenerate: jest.fn(),
    error: undefined,
    addToolApprovalResponse: jest.fn(),
    ...overrides,
  };
  mockedUseChat.mockReturnValue(value);
  return value;
}

beforeEach(() => {
  jest.clearAllMocks();
});

test("renders the assistant message returned by useChat", () => {
  mockChat({
    messages: [
      {
        id: "1",
        role: "assistant",
        parts: [{ type: "text", text: "Your order ships tomorrow." }],
      },
    ],
  });

  render(<OrderMitraPanel />);

  expect(screen.getByText("Your order ships tomorrow.")).toBeInTheDocument();
});

test("renders the user message returned by useChat", () => {
  mockChat({
    messages: [
      {
        id: "1",
        role: "user",
        parts: [{ type: "text", text: "find Mr. Iyer's orders" }],
      },
    ],
  });

  render(<OrderMitraPanel />);

  expect(screen.getByText("find Mr. Iyer's orders")).toBeInTheDocument();
});

test("shows a pending badge while searchOrders is running", () => {
  mockChat({
    messages: [
      {
        id: "1",
        role: "assistant",
        parts: [{ type: "tool-searchOrders", state: "input-available" }],
      },
    ],
  });

  render(<OrderMitraPanel />);

  expect(screen.getByText("Running searchOrders...")).toBeInTheDocument();
});

test("shows a done badge once searchOrders completes", () => {
  mockChat({
    messages: [
      {
        id: "1",
        role: "assistant",
        parts: [{ type: "tool-searchOrders", state: "output-available" }],
      },
    ],
  });

  render(<OrderMitraPanel />);

  expect(screen.getByText("✓ searchOrders complete")).toBeInTheDocument();
});

test("renders the cancel confirmation dialog when cancelOrder needs approval", () => {
  mockChat({
    messages: [
      {
        id: "1",
        role: "assistant",
        parts: [
          {
            type: "tool-cancelOrder",
            state: "approval-requested",
            input: { orderId: "OM-1041", customerName: "Mr. Iyer" },
            approval: { id: "approval-1" },
          },
        ],
      },
    ],
  });

  render(<OrderMitraPanel />);

  expect(
    screen.getByRole("dialog", { name: "Confirm cancellation" })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Cancel order OM-1041?" })
  ).toBeInTheDocument();
});

test("confirming the dialog approves the cancelOrder tool call", async () => {
  const chat = mockChat({
    messages: [
      {
        id: "1",
        role: "assistant",
        parts: [
          {
            type: "tool-cancelOrder",
            state: "approval-requested",
            input: { orderId: "OM-1041", customerName: "Mr. Iyer" },
            approval: { id: "approval-1" },
          },
        ],
      },
    ],
  });

  render(<OrderMitraPanel />);

  await userEvent.click(
    screen.getByRole("checkbox", { name: "I understand this cannot be undone" })
  );
  await userEvent.click(screen.getByRole("button", { name: "Cancel the order" }));

  expect(chat.addToolApprovalResponse).toHaveBeenCalledWith({
    id: "approval-1",
    approved: true,
  });
});

test("dismissing the dialog denies the cancelOrder tool call with a reason", async () => {
  const chat = mockChat({
    messages: [
      {
        id: "1",
        role: "assistant",
        parts: [
          {
            type: "tool-cancelOrder",
            state: "approval-requested",
            input: { orderId: "OM-1041", customerName: "Mr. Iyer" },
            approval: { id: "approval-1" },
          },
        ],
      },
    ],
  });

  render(<OrderMitraPanel />);

  await userEvent.click(screen.getByRole("button", { name: "Keep the order" }));

  expect(chat.addToolApprovalResponse).toHaveBeenCalledWith({
    id: "approval-1",
    approved: false,
    reason: "User rejected the cancellation request.",
  });
});

test("shows a pending badge while an approved cancelOrder call is executing", () => {
  mockChat({
    messages: [
      {
        id: "1",
        role: "assistant",
        parts: [
          {
            type: "tool-cancelOrder",
            state: "approval-responded",
            input: { orderId: "OM-1041", customerName: "Mr. Iyer" },
            approval: { id: "approval-1", approved: true },
          },
        ],
      },
    ],
  });

  render(<OrderMitraPanel />);

  expect(screen.getByText("Cancelling order OM-1041...")).toBeInTheDocument();
});

test("shows a denied badge when the user rejected the cancellation", () => {
  mockChat({
    messages: [
      {
        id: "1",
        role: "assistant",
        parts: [
          {
            type: "tool-cancelOrder",
            state: "output-denied",
            input: { orderId: "OM-1041", customerName: "Mr. Iyer" },
            approval: { id: "approval-1", approved: false },
          },
        ],
      },
    ],
  });

  render(<OrderMitraPanel />);

  expect(
    screen.getByText("Cancellation of order OM-1041 was not approved.")
  ).toBeInTheDocument();
});

test("shows a success badge once an approved cancelOrder call completes", () => {
  mockChat({
    messages: [
      {
        id: "1",
        role: "assistant",
        parts: [
          {
            type: "tool-cancelOrder",
            state: "output-available",
            input: { orderId: "OM-1041", customerName: "Mr. Iyer" },
            output: { ok: true },
          },
        ],
      },
    ],
  });

  render(<OrderMitraPanel />);

  expect(screen.getByText("✓ Order OM-1041 cancelled")).toBeInTheDocument();
});

test("shows the tool's reason when the completed cancelOrder call fails", () => {
  mockChat({
    messages: [
      {
        id: "1",
        role: "assistant",
        parts: [
          {
            type: "tool-cancelOrder",
            state: "output-available",
            input: { orderId: "OM-1041", customerName: "Mr. Iyer" },
            output: { ok: false, reason: "Order OM-1041 has already shipped." },
          },
        ],
      },
    ],
  });

  render(<OrderMitraPanel />);

  expect(
    screen.getByText(
      "Could not cancel order OM-1041: Order OM-1041 has already shipped."
    )
  ).toBeInTheDocument();
});

test("clicking Stop generating aborts the in-flight stream", async () => {
  const chat = mockChat({ status: "streaming" });

  render(<OrderMitraPanel />);

  expect(screen.getByRole("status")).toHaveTextContent("OrderMitra is typing…");

  await userEvent.click(screen.getByRole("button", { name: "Stop generating" }));

  expect(chat.stop).toHaveBeenCalledTimes(1);
});

test("clicking Retry on the error alert reloads the request", async () => {
  const chat = mockChat({ error: new Error("network down") });

  render(<OrderMitraPanel />);

  expect(screen.getByRole("alert")).toHaveTextContent(
    "Something went wrong: network down"
  );

  await userEvent.click(screen.getByRole("button", { name: "Retry" }));

  expect(chat.regenerate).toHaveBeenCalledTimes(1);
});

test("submitting the form sends the typed question and clears the input", async () => {
  const chat = mockChat();

  render(<OrderMitraPanel />);

  const question = screen.getByLabelText("Ask a question");
  await userEvent.type(question, "find Mr. Iyer's orders");
  await userEvent.click(screen.getByRole("button", { name: "Send" }));

  expect(chat.sendMessage).toHaveBeenCalledWith({ text: "find Mr. Iyer's orders" });
  expect(question).toHaveValue("");
});

test("the Send button is disabled while the input is empty", () => {
  mockChat();

  render(<OrderMitraPanel />);

  expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
});
