import PocketBase, { ClientResponseError, type RecordModel } from "pocketbase";
import { TASK_PAGE_SIZE, type AuthInput, type CreateTaskInput, type Task, type TaskPage, type TaskPageInput, type UpdateTaskInput, type User } from "../../shared/schemas";

type UserRecord = RecordModel & {
  email: string;
};

type TaskRecord = RecordModel & {
  completed?: boolean;
  title: string;
};

export type PocketBaseSession = {
  token: string;
  user: User;
};

export type PocketBaseGateway = {
  createTask(session: PocketBaseSession, input: CreateTaskInput): Promise<Task>;
  currentSession(token: string): Promise<PocketBaseSession>;
  deleteTask(session: PocketBaseSession, id: string): Promise<void>;
  listTasks(session: PocketBaseSession, input: TaskPageInput): Promise<TaskPage>;
  login(input: AuthInput): Promise<PocketBaseSession>;
  logout(token: string | undefined): void;
  register(input: AuthInput): Promise<PocketBaseSession>;
  updateTask(session: PocketBaseSession, id: string, input: UpdateTaskInput): Promise<Task>;
};

export class PocketBaseGatewayError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const toUser = (record: UserRecord): User => ({
  email: record.email,
  id: record.id,
});

const toTask = (record: TaskRecord): Task => ({
  completed: Boolean(record.completed),
  createdAt: String(record["created"]),
  id: record.id,
  title: record.title,
  updatedAt: String(record["updated"]),
});

const createPocketBase = (baseUrl: string, token?: string): PocketBase => {
  const pb = new PocketBase(baseUrl);

  if (token) {
    pb.authStore.save(token);
  }

  return pb;
};

const rethrowPocketBaseError = (error: unknown): never => {
  if (error instanceof PocketBaseGatewayError) {
    throw error;
  }

  if (error instanceof ClientResponseError) {
    const message = typeof error.response["message"] === "string" ? error.response["message"] : error.message;
    throw new PocketBaseGatewayError(error.status || 500, message);
  }

  throw error;
};

export const createPocketBaseGateway = (baseUrl: string): PocketBaseGateway => {
  const authenticate = async (input: AuthInput): Promise<PocketBaseSession> => {
    try {
      const pb = createPocketBase(baseUrl);
      const auth = await pb.collection<UserRecord>("users").authWithPassword(input.email, input.password);
      return { token: auth.token, user: toUser(auth.record) };
    } catch (error) {
      return rethrowPocketBaseError(error);
    }
  };

  return {
    async createTask(session, input) {
      try {
        const pb = createPocketBase(baseUrl, session.token);
        const record = await pb.collection<TaskRecord>("tasks").create({
          completed: false,
          owner: session.user.id,
          title: input.title,
        });
        return toTask(record);
      } catch (error) {
        return rethrowPocketBaseError(error);
      }
    },
    async currentSession(token) {
      try {
        const pb = createPocketBase(baseUrl, token);
        const auth = await pb.collection<UserRecord>("users").authRefresh();
        return { token, user: toUser(auth.record) };
      } catch (error) {
        return rethrowPocketBaseError(error);
      }
    },
    async deleteTask(session, id) {
      try {
        const pb = createPocketBase(baseUrl, session.token);
        await pb.collection<TaskRecord>("tasks").delete(id);
      } catch (error) {
        return rethrowPocketBaseError(error);
      }
    },
    async listTasks(session, input) {
      try {
        const pb = createPocketBase(baseUrl, session.token);
        let filter = pb.filter("owner = {:owner}", { owner: session.user.id });

        const hasCursor = input.beforeCreatedAt !== undefined && input.beforeId !== undefined;
        if (hasCursor) {
          filter += pb.filter(" && (created < {:created} || (created = {:created} && id < {:id}))", {
            created: input.beforeCreatedAt,
            id: input.beforeId,
          });
        }

        const records = await pb.collection<TaskRecord>("tasks").getList(1, TASK_PAGE_SIZE + 1, {
          filter,
          skipTotal: true,
          sort: "-created,-id",
        });
        return { tasks: records.items.slice(0, TASK_PAGE_SIZE).map(toTask), hasNext: records.items.length > TASK_PAGE_SIZE };
      } catch (error) {
        return rethrowPocketBaseError(error);
      }
    },
    login: authenticate,
    logout() {},
    async register(input) {
      try {
        const pb = createPocketBase(baseUrl);
        await pb.collection<UserRecord>("users").create({
          email: input.email,
          emailVisibility: true,
          password: input.password,
          passwordConfirm: input.password,
        });
        return authenticate(input);
      } catch (error) {
        return rethrowPocketBaseError(error);
      }
    },
    async updateTask(session, id, input) {
      try {
        const pb = createPocketBase(baseUrl, session.token);
        const record = await pb.collection<TaskRecord>("tasks").update(id, input);
        return toTask(record);
      } catch (error) {
        return rethrowPocketBaseError(error);
      }
    },
  };
};
