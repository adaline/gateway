import { isRunningInBrowser } from "./is-running-in-browser";

const convertBase64ToUint8Array = (base64String: string): Uint8Array => {
  const base64Url = base64String.replace(/-/g, "+").replace(/_/g, "/");
  const latin1string = globalThis.atob(base64Url);
  return Uint8Array.from(latin1string, (byte) => byte.codePointAt(0)!);
};

const convertUint8ArrayToBase64 = (array: Uint8Array): string => {
  let latin1string = "";

  // Note: regular for loop to support older JavaScript versions that
  // do not support for..of on Uint8Array
  for (let i = 0; i < array.length; i++) {
    latin1string += String.fromCodePoint(array[i]);
  }

  return globalThis.btoa(latin1string);
};

const encodedBase64ToString = (base64: string): string => {
  if (isRunningInBrowser()) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(bytes);
  } else {
    return Buffer.from(base64, "base64").toString("utf-8");
  }
};

const getMimeTypeFromBase64 = (base64: string): string => {
  const mimeTypePrefix = base64.split(";")[0];
  const mimeType = mimeTypePrefix.split("/")[1];
  return mimeType;
};

export { convertBase64ToUint8Array, convertUint8ArrayToBase64, encodedBase64ToString, getMimeTypeFromBase64 };
