const removeUndefinedEntries = <T = unknown>(record: Record<string, T | undefined>): Record<string, T> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return Object.fromEntries(Object.entries(record).filter(([_, value]) => value != null)) as Record<string, T>;
};

export { removeUndefinedEntries };
