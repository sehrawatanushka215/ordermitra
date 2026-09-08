import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ViewToggle } from "./view-toggle";

test("click switches the label", async () => {
  // Arrange
  render(<ViewToggle />);
  const button = screen.getByText("Switch to compact CI");

  // Act
  await userEvent.click(button);

  // Assert
  expect(screen.getByText("Switch to comfortable CI")).toBeInTheDocument();

   // Act
  await userEvent.click(button);

  // Assert
  expect(screen.getByText("Switch to compact CI")).toBeInTheDocument();
});
