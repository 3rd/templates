import { TASK_PAGE_SIZE, type TaskPageInput } from "../../shared/schemas";
import type { SqliteDatabase } from "../db/sqlite";

export type Task = {
  completed: boolean;
  createdAt: string;
  id: string;
  title: string;
  updatedAt: string;
};

type TaskRow = {
  completed: number;
  created_at: string;
  id: string;
  title: string;
  updated_at: string;
};

const mapTask = (row: TaskRow): Task => ({
  completed: row.completed === 1,
  createdAt: row.created_at,
  id: row.id,
  title: row.title,
  updatedAt: row.updated_at,
});

export const listTasks = (db: SqliteDatabase, userId: string, input: TaskPageInput) => {
  let cursorFilter = "";
  const params: unknown[] = [userId];

  const hasCursor = input.beforeCreatedAt !== undefined && input.beforeId !== undefined;
  if (hasCursor) {
    cursorFilter = " AND (created_at, id) < (?, ?)";
    params.push(input.beforeCreatedAt, input.beforeId);
  }

  const rows = db
    .prepare(`SELECT id, title, completed, created_at, updated_at FROM tasks WHERE user_id = ?${cursorFilter} ORDER BY created_at DESC, id DESC LIMIT ?`)
    .all<TaskRow>(...params, TASK_PAGE_SIZE + 1);
  return { tasks: rows.slice(0, TASK_PAGE_SIZE).map(mapTask), hasNext: rows.length > TASK_PAGE_SIZE };
};

export const createTask = (db: SqliteDatabase, userId: string, title: string): Task => {
  const now = new Date().toISOString();
  const task = {
    completed: false,
    createdAt: now,
    id: crypto.randomUUID(),
    title,
    updatedAt: now,
  };
  db.prepare(
    "INSERT INTO tasks (id, user_id, title, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(task.id, userId, task.title, 0, task.createdAt, task.updatedAt);
  return task;
};

export const updateTask = (
  db: SqliteDatabase,
  userId: string,
  taskId: string,
  input: { completed?: boolean; title?: string },
): Task | undefined => {
  const current = db
    .prepare("SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = ? AND user_id = ?")
    .get<TaskRow>(taskId, userId);
  if (!current) return undefined;

  const next = {
    completed: input.completed ?? current.completed === 1,
    title: input.title ?? current.title,
    updatedAt: new Date().toISOString(),
  };
  db.prepare("UPDATE tasks SET title = ?, completed = ?, updated_at = ? WHERE id = ? AND user_id = ?").run(
    next.title,
    next.completed ? 1 : 0,
    next.updatedAt,
    taskId,
    userId,
  );

  return mapTask({
    ...current,
    completed: next.completed ? 1 : 0,
    title: next.title,
    updated_at: next.updatedAt,
  });
};

export const deleteTask = (db: SqliteDatabase, userId: string, taskId: string): boolean => {
  const result = db.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?").run(taskId, userId);
  return result.changes > 0;
};
