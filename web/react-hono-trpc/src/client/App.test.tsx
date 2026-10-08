import { notifyManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, onTestFinished, test, vi } from "vitest";
import { App } from "./App";
import { createTrpcClient, trpc } from "./api";

const renderApp = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  onTestFinished(() => queryClient.clear());
  const view = render(
    <trpc.Provider client={createTrpcClient()} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>,
  );
  return { ...view, queryClient };
};

const createTrpcResponse = (data: unknown) => Response.json({ result: { data } });

describe("App", () => {
  test("preserves a draft and the selected page when an older page request completes", async () => {
    const pendingPage = Promise.withResolvers<Response>();
    const didStartPage = Promise.withResolvers<void>();
    const firstPage = {
      hasNext: true,
      tasks: Array.from({ length: 20 }, (_, index) => ({
        id: `task-${index}`,
        title: `Recent task ${index}`,
        completed: false,
        createdAt: "2026-01-02T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      })),
    };
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(createTrpcResponse({ user: { id: "user-1", email: "ada@example.com" } }))
      .mockResolvedValueOnce(createTrpcResponse(firstPage))
      .mockImplementationOnce(() => {
        didStartPage.resolve();
        return pendingPage.promise;
      })
      .mockImplementation(() => Promise.resolve(createTrpcResponse(firstPage)));

    renderApp();
    const recentTask = await screen.findByText("Recent task 0");
    expect(recentTask).toBeInTheDocument();

    const draftInput = screen.getByPlaceholderText("New task");
    fireEvent.change(draftInput, { target: { value: "Unsent draft" } });
    const nextButton = screen.getByRole("button", { name: "Next" });
    fireEvent.click(nextButton);
    await didStartPage.promise;
    const secondPageLabel = screen.getByText("Page 2");
    expect(secondPageLabel).toBeInTheDocument();
    expect(draftInput).toHaveValue("Unsent draft");

    const previousButton = screen.getByRole("button", { name: "Previous" });
    fireEvent.click(previousButton);
    const restoredTask = await screen.findByText("Recent task 0");
    expect(restoredTask).toBeInTheDocument();

    await act(async () => {
      pendingPage.resolve(createTrpcResponse({ hasNext: false, tasks: [] }));
      await pendingPage.promise;
      await new Promise<void>((resolve) => notifyManager.schedule(resolve));
    });
    const firstPageLabel = screen.getByText("Page 1");
    const currentTask = screen.getByText("Recent task 0");
    expect(firstPageLabel).toBeInTheDocument();
    expect(currentTask).toBeInTheDocument();
    expect(draftInput).toHaveValue("Unsent draft");
  });

  test("keeps a successful login when an older anonymous identity request completes", async () => {
    const pendingUser = Promise.withResolvers<Response>();
    vi.spyOn(globalThis, "fetch")
      .mockReturnValueOnce(pendingUser.promise)
      .mockResolvedValueOnce(createTrpcResponse({ user: { id: "user-1", email: "ada@example.com" } }))
      .mockResolvedValue(createTrpcResponse({ hasNext: false, tasks: [] }));

    renderApp();
    const signIn = screen.getByRole("button", { name: "Sign in" });
    fireEvent.click(signIn);
    expect(await screen.findByText("Signed in as ada@example.com")).toBeInTheDocument();

    await act(async () => {
      pendingUser.resolve(createTrpcResponse({ user: null }));
      await pendingUser.promise;
      await new Promise<void>((resolve) => notifyManager.schedule(resolve));
    });
    const signedInStatus = screen.getByText("Signed in as ada@example.com");
    expect(signedInStatus).toBeInTheDocument();
  });

  test("shows a task-list failure separately from an empty successful list", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      if (String(input).includes("auth.me")) return Promise.resolve(createTrpcResponse({ user: { id: "user-1", email: "ada@example.com" } }));

      return Promise.resolve(Response.json({ error: { message: "Task list unavailable", code: -32603, data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500 } } }, { status: 500 }));
    });

    renderApp();
    expect(await screen.findByRole("alert")).toHaveTextContent("Task list unavailable");
  });

  test("shows task creation failure and retains the rejected draft", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      if (String(input).includes("auth.me")) return Promise.resolve(createTrpcResponse({ user: { id: "user-1", email: "ada@example.com" } }));
      if (init?.method === "POST") return Promise.resolve(Response.json({ error: { message: "Task could not be created", code: -32603, data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500 } } }, { status: 500 }));

      return Promise.resolve(createTrpcResponse({ hasNext: false, tasks: [] }));
    });

    renderApp();
    const input = await screen.findByPlaceholderText("New task");
    fireEvent.change(input, { target: { value: "Unsent task" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Task could not be created");
    expect(input).toHaveValue("Unsent task");
  });

  test("keeps logout authoritative when an earlier identity response arrives", async () => {
    const pendingUser = Promise.withResolvers<Response>();
    const didStart = Promise.withResolvers<void>();
    let shouldDelayUser = false;
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);
      if (url.includes("auth.logout")) return Promise.resolve(createTrpcResponse({ ok: true }));
      if (url.includes("auth.me")) {
        if (shouldDelayUser) {
          didStart.resolve();
          return pendingUser.promise;
        }

        return Promise.resolve(createTrpcResponse({ user: { id: "user-1", email: "ada@example.com" } }));
      }

      return Promise.resolve(createTrpcResponse({ hasNext: false, tasks: [] }));
    });

    const { queryClient } = renderApp();
    expect(await screen.findByText("Signed in as ada@example.com")).toBeInTheDocument();
    shouldDelayUser = true;
    const refetch = queryClient.refetchQueries({ queryKey: [["auth", "me"]] });
    await didStart.promise;
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(await screen.findByRole("button", { name: "Sign in" })).toBeInTheDocument();
    pendingUser.resolve(createTrpcResponse({ user: { id: "user-1", email: "ada@example.com" } }));
    await act(async () => {
      await refetch;
      await new Promise<void>((resolve) => notifyManager.schedule(resolve));
    });
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  test("preserves the next task draft when an earlier creation succeeds", async () => {
    const pendingTask = Promise.withResolvers<Response>();
    const task = { id: "task-1", title: "First task", completed: false, createdAt: "2026-01-01", updatedAt: "2026-01-01" };
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(createTrpcResponse({ user: { id: "user-1", email: "ada@example.com" } }))
      .mockResolvedValueOnce(createTrpcResponse({ hasNext: false, tasks: [{ ...task, id: "existing-task", title: "Existing task" }] }))
      .mockReturnValueOnce(pendingTask.promise)
      .mockResolvedValue(createTrpcResponse({ hasNext: false, tasks: [task] }));

    renderApp();
    expect(await screen.findByText("Existing task")).toBeInTheDocument();

    const input = await screen.findByPlaceholderText("New task");
    fireEvent.change(input, { target: { value: "First task" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    fireEvent.change(input, { target: { value: "Next task" } });
    await act(async () => {
      pendingTask.resolve(createTrpcResponse({ task }));
      await pendingTask.promise;
    });
    expect(await screen.findByText("First task")).toBeInTheDocument();
    expect(input).toHaveValue("Next task");
  });

  test("shows a rejected sign-in instead of silently retaining the form", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) => {
      if (init?.method === "POST") return Promise.resolve(Response.json({ error: { message: "Invalid email or password", code: -32001, data: { code: "UNAUTHORIZED", httpStatus: 401 } } }, { status: 401 }));

      return Promise.resolve(createTrpcResponse({ user: null }));
    });

    renderApp();
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
  });

  test("renders the auth-ready workspace", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ result: { data: { user: null } } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    renderApp();

    expect(screen.getByRole("heading", { name: "Fullstack starter" })).toBeInTheDocument();
    expect(await screen.findByText("Sign in to manage your tasks.")).toBeInTheDocument();
  });
});
