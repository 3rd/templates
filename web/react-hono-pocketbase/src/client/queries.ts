import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import type { AuthInput, TaskPageInput, User } from "../shared/schemas";
import { api, readJson } from "./api";

const updateCurrentUser = async (queryClient: QueryClient, user: User | null) => {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: ["current-user"] }),
    queryClient.cancelQueries({ queryKey: ["tasks"] }),
  ]);
  queryClient.setQueryData(["current-user"], { user });
  queryClient.removeQueries({ queryKey: ["tasks"] });
};

export const useCurrentUser = () => {
  const queryClient = useQueryClient();
  return useQuery({
    queryFn: async ({ signal }) => {
      const response = await api.api.auth.me.$get(undefined, { init: { signal } });
      if (response.status === 401) {
        signal.throwIfAborted();
        await queryClient.cancelQueries({ queryKey: ["tasks"] });
        signal.throwIfAborted();
        queryClient.removeQueries({ queryKey: ["tasks"] });
        return { user: null };
      }

      return readJson(response);
    },
    queryKey: ["current-user"],
    retry: false,
  });
};

export const useTasks = (enabled: boolean, input: TaskPageInput) =>
  useQuery({
    enabled,
    queryFn: async ({ signal }) => readJson(api.api.tasks.$get({ query: input }, { init: { signal } })),
    queryKey: ["tasks", input],
  });

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AuthInput) => readJson(api.api.auth.register.$post({ json: input })),
    onSuccess: ({ user }) => updateCurrentUser(queryClient, user),
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AuthInput) => readJson(api.api.auth.login.$post({ json: input })),
    onSuccess: ({ user }) => updateCurrentUser(queryClient, user),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => readJson(api.api.auth.logout.$post()),
    onSuccess: () => updateCurrentUser(queryClient, null),
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => readJson(api.api.tasks.$post({ json: { title } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
};
