"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithApprovalResponses } from "ai";
import { ConfidenceBadge, type ConfidenceLevel } from "./confidence-badge";
import { CancelOrderDialog } from "./cancel-order-dialog";
import { ViewToggle } from "./view-toggle";

/**
 * Session 5's streaming chat panel.
 *
 * Everything above the "--- recovery controls ---" comment is the happy path:
 * type a question, watch a reply stream in. Everything below it is what happens
 * when the user changes their mind or the request fails.
 *
 * An AI asked to "cover sending a message and showing the reply" will test the
 * first part thoroughly and never touch the second. That is Chapter 2.
 */
export function OrderMitraPanel() {
  const [input, setInput] = useState("");
  const [compact, setCompact] = useState(false);
  const {
    messages,
    sendMessage,
    status,
    stop,
    error,
    regenerate,
    addToolApprovalResponse,
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    // Resubmit automatically once the user has confirmed/rejected every pending cancelOrder call.
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });

  const isLoading = status === "submitted" || status === "streaming";

  function confidenceFor(content: string): ConfidenceLevel {
    if (content.includes("not sure") || content.includes("could not")) return "low";
    if (content.includes("might")) return "medium";
    return "high";
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <section className="panel">
      <h1>OrderMitra</h1>
      <ViewToggle onToggle={setCompact} />

      <ul className={`messages${compact ? " messages-compact" : ""}`}>
        {messages.length === 0 && (
          <li className="empty">Ask about an order to get started.</li>
        )}

        {messages.map((message: any) => (
          <li key={message.id} className={`message message-${message.role}`}>
            {
              message.parts?.map((part: any, index: number) => {
                if (part.type === 'text') {
                  if (message.role === "assistant") {
                    return (
                      <div key={index}>
                        <p>{part.text}</p>
                        <ConfidenceBadge level={confidenceFor(part.text)} />
                      </div>
                    );
                  }
                  return <p key={index}>{part.text}</p>;
                }
                if (part.type === 'tool-searchOrders') {
                  if (part.state === "input-available" || part.state === "input-streaming") {
                    return (
                      <div key={index} className="step-badge step-pending">
                        Running searchOrders...
                      </div>
                    );
                  }
                  if (part.state === "output-available") {
                    return (
                      <div key={index} className="step-badge step-done">
                        ✓ searchOrders complete
                      </div>
                    );
                  }
                }
                if (part.type === 'tool-cancelOrder') {
                  if (part.state === "approval-requested") {
                    return (
                      <CancelOrderDialog
                        key={index}
                        orderId={part.input.orderId}
                        customerName={part.input.customerName}
                        onConfirm={() =>
                          addToolApprovalResponse({
                            id: part.approval.id,
                            approved: true,
                          })
                        }
                        onDismiss={() =>
                          addToolApprovalResponse({
                            id: part.approval.id,
                            approved: false,
                            reason: "User rejected the cancellation request.",
                          })
                        }
                      />
                    );
                  }
                  if (part.state === "approval-responded" && part.approval.approved) {
                    return (
                      <div key={index} className="step-badge step-pending">
                        Cancelling order {part.input.orderId}...
                      </div>
                    );
                  }
                  if (part.state === "output-denied") {
                    return (
                      <div key={index} className="step-badge step-denied">
                        Cancellation of order {part.input.orderId} was not approved.
                      </div>
                    );
                  }
                  if (part.state === "output-available") {
                    return (
                      <div key={index} className="step-badge step-done">
                        {part.output?.ok
                          ? `✓ Order ${part.input.orderId} cancelled`
                          : `Could not cancel order ${part.input.orderId}: ${part.output?.reason}`}
                      </div>
                    );
                  }
                }
                return null;
              })
            }
            <span className="role">
              {message.role === "user" ? "You" : "OrderMitra"}
            </span>
          </li>
        ))}
      </ul>

      {isLoading && <p role="status">OrderMitra is typing…</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="question">Ask a question</label>
        <input
          id="question"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="find Mr. Iyer's orders"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || input.trim() === ""}>
          Send
        </button>
      </form>

      {/* --- recovery controls -------------------------------------------- */}
      {/* The lines below are the coverage gap Chapter 2 is built around.     */}

      {isLoading && (
        <button type="button" onClick={() => stop()}>
          Stop generating
        </button>
      )}
      {error && (
        <div role="alert" className="error">
          <p>Something went wrong: {error.message}</p>
          <button type="button" onClick={() => regenerate()}>
            Retry
          </button>
        </div>
      )}
    </section>
  );
}
