import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { App } from "./App";

const renderApp = () => {
  const { hook } = memoryLocation({ path: "/" });

  return render(
    <Router hook={hook}>
      <App />
    </Router>,
  );
};

describe("App", () => {
  test("renders the dashboard shell", () => {
    renderApp();

    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByText("React SPA")).toBeInTheDocument();
  });

  test("adds a task from the tasks route", async () => {
    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Tasks" }));
    fireEvent.click(screen.getByRole("button", { name: "Add task" }));

    expect(await screen.findByText("Task 4")).toBeInTheDocument();
  });

  test("marks the current section for assistive technology", () => {
    renderApp();
    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    const tasksLink = screen.getByRole("link", { name: "Tasks" });

    expect(dashboardLink).toHaveAttribute("aria-current", "page");

    fireEvent.click(tasksLink);

    expect(tasksLink).toHaveAttribute("aria-current", "page");
    expect(dashboardLink).not.toHaveAttribute("aria-current");
  });
});
