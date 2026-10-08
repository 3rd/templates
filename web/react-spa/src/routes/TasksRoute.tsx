import { useState } from "react";

const initialTasks = ["Wire API client", "Add empty states", "Tune dashboard copy"];

export const TasksRoute = () => {
  const [tasks, setTasks] = useState(initialTasks);

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Tasks</h2>
          <p className="mt-2 text-slate-400">A tiny interactive example for component tests.</p>
        </div>
        <button
          className="rounded-md bg-cyan-400 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-300"
          onClick={() => setTasks((current) => [...current, `Task ${current.length + 1}`])}
          type="button"
        >
          Add task
        </button>
      </div>
      <ul className="divide-y divide-white/10 rounded-md border border-white/10 bg-white/[0.03]">
        {tasks.map((task) => (
          <li className="px-4 py-3 text-sm" key={task}>
            {task}
          </li>
        ))}
      </ul>
    </section>
  );
};
