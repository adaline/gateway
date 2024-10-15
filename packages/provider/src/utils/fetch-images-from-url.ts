// TODO: add logic from model options to get workerUrl and fetch images
// const fetchAndConvertToBase64 = async (imageUrl: string): Promise<{ base64: string; contentType: string }> => {
//   const workerUrl = "https://images.arsh-adaline.workers.dev";
//   const proxyUrl = `${workerUrl}/?url=${encodeURIComponent(imageUrl)}`;
//   const response = await axios.get(proxyUrl, { responseType: "arraybuffer" });

//   let base64: string;
//   if (isRunningInBrowser()) {
//     const uintArray = new Uint8Array(response.data);
//     const characters = uintArray.reduce((data, byte) => {
//       return data + String.fromCharCode(byte);
//     }, "");
//     base64 = btoa(characters);
//   } else {
//     base64 = Buffer.from(response.data, "binary").toString("base64");
//   }

//   const contentType = response.headers["content-type"] || getImageTypeFromUrl(imageUrl);
//   return { base64, contentType };
// };

// const fetchImageData = async (url: string): Promise<{ type: string; source: { type: string; media_type: string; data: string } }> => {
//   const { base64, contentType } = await fetchAndConvertToBase64(url);
//   return {
//     type: "image",
//     source: {
//       type: "base64",
//       media_type: contentType,
//       data: base64,
//     },
//   };
// };

// function encodedBase64ToString(base64: string): string {
//   if (isRunningInBrowser()) {
//     const binaryString = atob(base64);
//     const bytes = new Uint8Array(binaryString.length);
//     for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
//     const decoder = new TextDecoder("utf-8");
//     return decoder.decode(bytes);
//   } else {
//     return Buffer.from(base64, "base64").toString("utf-8");
//   }
// }
