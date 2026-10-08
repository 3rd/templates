import { useRef, useState, type FormEvent } from "react";
import { Link, Route, Switch } from "wouter";
import type { TaskPageInput } from "../shared/schemas";
import { useCreateTask, useCurrentUser, useLogin, useLogout, useRegister, useTasks } from "./queries";

export const App = () => (
  <div className="min-h-screen bg-zinc-950 text-zinc-100">
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-emerald-300">Hono + PocketBase</p>
          <h1 className="text-3xl font-semibold tracking-tight">Fullstack starter</h1>
        </div>
        <nav className="flex gap-3 text-sm text-zinc-300">
          <Link href="/">App</Link>
          <Link href="/about">About</Link>
        </nav>
      </header>
      <Switch>
        <Route path="/" component={Workspace} />
        <Route path="/about" component={AboutRoute} />
      </Switch>
    </div>
  </div>
);

const Workspace = () => {
  const currentUser = useCurrentUser();
  const user = currentUser.data?.user ?? null;

  return (
    <main className="grid gap-6 lg:grid-cols-[360px_1fr]">
      {currentUser.error && <p role="alert">{currentUser.error.message}</p>}
      <AuthPanel user={user} />
      <TaskPanel authenticated={Boolean(user)} key={user?.id ?? "anonymous"} />
    </main>
  );
};

const AuthPanel = ({ user }: { user: { email: string } | null }) => {
  const [email, setEmail] = useState("ada@example.com");
  const [password, setPassword] = useState("password123");
  const login = useLogin();
  const logout = useLogout();
  const register = useRegister();
  const authError = login.error ?? register.error;

  const authenticate = (action: "login" | "register") => {
    login.reset();
    register.reset();

    const input = { email, password };

    if (action === "login") {
      login.mutate(input);
    } else {
      register.mutate(input);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    authenticate("login");
  };

  return (
    <section className="rounded-md border border-white/10 bg-white/[0.03] p-4">
      <h2 className="text-xl font-semibold">Auth</h2>
      {user ? (
        <div className="mt-4">
          <p className="text-sm text-zinc-300">Signed in as {user.email}</p>
          <button className="mt-4 rounded-md bg-white px-3 py-2 text-sm font-medium text-zinc-950" onClick={() => logout.mutate()} type="button">
            Sign out
          </button>
          {logout.error && <p className="mt-3 text-sm text-red-300" role="alert">{logout.error.message}</p>}
        </div>
      ) : (
        <form className="mt-4 grid gap-3" onSubmit={submit}>
          {authError && <p className="text-sm text-red-300" role="alert">{authError.message}</p>}
          <label className="grid gap-1 text-sm">
            Email
            <input className="rounded-md border border-white/10 bg-zinc-900 px-3 py-2" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
          </label>
          <label className="grid gap-1 text-sm">
            Password
            <input className="rounded-md border border-white/10 bg-zinc-900 px-3 py-2" onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
          </label>
          <div className="flex gap-2">
            <button className="rounded-md bg-emerald-400 px-3 py-2 text-sm font-medium text-zinc-950" type="submit">
              Sign in
            </button>
            <button className="rounded-md border border-white/10 px-3 py-2 text-sm font-medium" onClick={() => authenticate("register")} type="button">
              Register
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

const TaskPanel = ({ authenticated }: { authenticated: boolean }) => {
  const [title, setTitle] = useState("");
  const draftRevision = useRef(0);
  const [cursors, setCursors] = useState<TaskPageInput[]>([]);
  const tasks = useTasks(authenticated, cursors.at(-1) ?? {});
  const createTask = useCreateTask();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) return;

    const submittedRevision = draftRevision.current;
    setCursors([]);
    createTask.mutate(title, {
      onSuccess: () => {
        if (draftRevision.current !== submittedRevision) return;

        setTitle("");
      },
    });
  };

  if (!authenticated) {
    return (
      <section className="rounded-md border border-white/10 bg-white/[0.03] p-4">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <p className="mt-3 text-sm text-zinc-400">Sign in to manage your tasks.</p>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-white/10 bg-white/[0.03] p-4">
      <h2 className="text-xl font-semibold">Tasks</h2>
      <form className="mt-4 flex gap-2" onSubmit={submit}>
        <input className="min-w-0 flex-1 rounded-md border border-white/10 bg-zinc-900 px-3 py-2" onChange={(event) => {
          draftRevision.current += 1;
          setTitle(event.target.value);
        }} placeholder="New task" value={title} />
        <button className="rounded-md bg-emerald-400 px-3 py-2 text-sm font-medium text-zinc-950" type="submit">
          Add
        </button>
      </form>
      {createTask.error && <p className="mt-3 text-sm text-red-300" role="alert">{createTask.error.message}</p>}
      {tasks.error && <p className="mt-3 text-sm text-red-300" role="alert">{tasks.error.message}</p>}
      <ul className="mt-4 divide-y divide-white/10">
        {(tasks.data?.tasks ?? []).map((task) => (
          <li className="py-3 text-sm" key={task.id}>
            {task.title}
          </li>
        ))}
      </ul>
      {tasks.data?.tasks.length === 0 && <p className="mt-4 text-sm">No tasks on this page.</p>}
      <nav aria-label="Task pages" className="mt-4 flex items-center gap-3">
        <button disabled={cursors.length === 0} onClick={() => setCursors((previous) => previous.slice(0, -1))} type="button">
          Previous
        </button>
        <span>Page {cursors.length + 1}</span>
        <button disabled={!tasks.data?.hasNext || tasks.isFetching} onClick={() => {
          const lastTask = tasks.data?.tasks.at(-1);
          if (!lastTask) return;

          setCursors((previous) => [...previous, { beforeCreatedAt: lastTask.createdAt, beforeId: lastTask.id }]);
        }} type="button">
          Next
        </button>
      </nav>
    </section>
  );
};

const AboutRoute = () => (
  <section className="rounded-md border border-white/10 bg-white/[0.03] p-4">
    <h2 className="text-xl font-semibold">About</h2>
    <p className="mt-3 text-sm text-zinc-400">This variant keeps PocketBase behind Hono while using PocketBase-native auth and records.</p>
  </section>
);
