import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CancelOrderDialog } from "./cancel-order-dialog";

function renderDialog(overrides: Partial<React.ComponentProps<typeof CancelOrderDialog>>={}) {
  const onConfirm = jest.fn();
  const onDismiss = jest.fn();

 
  render(
    <CancelOrderDialog
      orderId="OM-1041"
      customerName="Mr. Iyer"
      onConfirm={onConfirm}
      onDismiss={onDismiss}
      {...overrides}
    />
  );

  return { onConfirm, onDismiss };
}

test("renders the order id and customer name", () => {
  // Arrange
  renderDialog();

  expect(
    screen.getByRole("heading", { name: "Cancel order OM-1041?" })
  ).toBeInTheDocument();
  expect(
    screen.getByText("This will cancel Mr. Iyer's order. It cannot be undone.")
  ).toBeInTheDocument();
});

test("exposes the dialog role and accessible name", () => {
  renderDialog();

  expect(
    screen.getByRole("dialog", { name: "Confirm cancellation" })
  ).toBeInTheDocument();
});

test("the confirm button is disabled until the checkbox is ticked", () => {
  renderDialog();

  expect(screen.getByRole("button", { name: "Cancel the order" })).toBeDisabled();
});


test("unchecking the box disables the confirm button again and vice versa", async () => {
  renderDialog();

  const checkbox = screen.getByRole("checkbox", {
    name: "I understand this cannot be undone",
  });

  await userEvent.click(checkbox);
  expect(screen.getByRole("button", { name: "Cancel the order" })).toBeEnabled();

  await userEvent.click(checkbox);
  expect(screen.getByRole("button", { name: "Cancel the order" })).toBeDisabled();
});

test("clicking Confirm before acknowledging does nothing", async () => {
  const { onConfirm } = renderDialog();

  // Disabled buttons do not fire click handlers, but this guards against a
  // regression where the disabled attribute is dropped.
  await userEvent.click(screen.getByRole("button", { name: "Cancel the order" }));

  expect(onConfirm).not.toHaveBeenCalled();
});

test("clicking Confirm after acknowledging calls onConfirm with the order id", async () => {
  const { onConfirm, onDismiss } = renderDialog();

  await userEvent.click(
    screen.getByRole("checkbox", { name: "I understand this cannot be undone" })
  );
  await userEvent.click(screen.getByRole("button", { name: "Cancel the order" }));

  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(onDismiss).not.toHaveBeenCalled();
});

test("clicking Keep the order calls onDismiss without requiring acknowledgement", async () => {
  const { onConfirm, onDismiss } = renderDialog();

  await userEvent.click(screen.getByRole("button", { name: "Keep the order" }));

  expect(onDismiss).toHaveBeenCalledTimes(1);
  expect(onConfirm).not.toHaveBeenCalled();
});

test("clicking Keep the order after acknowledging still calls onDismiss, not onConfirm", async () => {
  const { onConfirm, onDismiss } = renderDialog();

  await userEvent.click(
    screen.getByRole("checkbox", { name: "I understand this cannot be undone" })
  );
  await userEvent.click(screen.getByRole("button", { name: "Keep the order" }));

  expect(onDismiss).toHaveBeenCalledTimes(1);
  expect(onConfirm).not.toHaveBeenCalled();
});

test("renders a different order id and customer name when props change", () => {
  renderDialog({ orderId: "OM-2099", customerName: "Priya Nair" });

  expect(
    screen.getByRole("heading", { name: "Cancel order OM-2099?" })
  ).toBeInTheDocument();
  expect(
    screen.getByText("This will cancel Priya Nair's order. It cannot be undone.")
  ).toBeInTheDocument();
});
