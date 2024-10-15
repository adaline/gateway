const urlWithoutTrailingSlash = (url: string): string => {
  return url?.replace(/\/$/, "");
};

export { urlWithoutTrailingSlash };
