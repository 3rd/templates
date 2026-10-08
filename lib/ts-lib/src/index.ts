export const createGreeting = (name: string): string => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("name is required");
  }

  return `hello ${trimmedName}`;
};
