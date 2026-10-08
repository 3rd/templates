export interface Greeting {
  message: string;
}

export const createGreeting = (name: string, excited = false): Greeting => {
  const trimmedName = name.trim();
  const suffix = excited ? "!" : "";

  return { message: `hello ${trimmedName}${suffix}` };
};
