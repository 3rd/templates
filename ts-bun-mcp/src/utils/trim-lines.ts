const normalizeNewlines = (value: string) => value.replaceAll("\r\n", "\n");

export const trimLines = (value: string) => {
  const lines = normalizeNewlines(value).split("\n");

  while (lines[0]?.trim() === "") lines.shift();
  while (lines.at(-1)?.trim() === "") lines.pop();

  const prefixLength = lines.reduce<number>((smallestPrefix, line) => {
    if (line.trim() === "") return smallestPrefix;
    const linePrefixLength = /^\s*/.exec(line)?.[0].length ?? 0;
    return Math.min(smallestPrefix, linePrefixLength);
  }, Number.POSITIVE_INFINITY);

  if (!Number.isFinite(prefixLength)) return "";

  return lines
    .map((line) => {
      if (line.trim() === "") return "";
      return line.slice(prefixLength);
    })
    .join("\n");
};
