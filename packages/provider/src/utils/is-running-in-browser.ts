const isRunningInBrowser = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return typeof window !== "undefined" && typeof window.document !== "undefined" && typeof navigator !== "undefined";
};

export { isRunningInBrowser };
