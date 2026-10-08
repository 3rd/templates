import { trpc } from "./api";
import type { TaskPageInput } from "../shared/schemas";

export type User = {
  email: string;
  id: string;
};

const updateCurrentUser = async (utils: ReturnType<typeof trpc.useUtils>, user: User | null) => {
  await Promise.all([utils.auth.me.cancel(), utils.tasks.list.cancel()]);
  utils.auth.me.setData(undefined, { user });
  await utils.tasks.list.reset();
};

export const useCurrentUser = () => trpc.auth.me.useQuery(undefined, { retry: false });

export const useTasks = (enabled: boolean, input: TaskPageInput) => trpc.tasks.list.useQuery(input, { enabled, trpc: { abortOnUnmount: true } });

export const useRegister = () => {
  const utils = trpc.useUtils();
  return trpc.auth.register.useMutation({
    onSuccess: ({ user }) => updateCurrentUser(utils, user),
  });
};

export const useLogin = () => {
  const utils = trpc.useUtils();
  return trpc.auth.login.useMutation({
    onSuccess: ({ user }) => updateCurrentUser(utils, user),
  });
};

export const useLogout = () => {
  const utils = trpc.useUtils();
  return trpc.auth.logout.useMutation({
    onSuccess: () => updateCurrentUser(utils, null),
  });
};

export const useCreateTask = () => {
  const utils = trpc.useUtils();
  return trpc.tasks.create.useMutation({
    onSuccess: () => utils.tasks.list.invalidate(),
  });
};
