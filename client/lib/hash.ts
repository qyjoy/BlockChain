export async function generateFileHash(file: File): Promise<string> {
  try {
    const webCrypto = globalThis.crypto;

    if (!webCrypto?.subtle) {
      if (typeof window !== "undefined" && !window.isSecureContext) {
        throw new Error("File hashing requires a secure context. Open the app with localhost instead of a local IP address.");
      }

      throw new Error("Web Crypto is not available in this browser context.");
    }

    const buffer = await file.arrayBuffer();
    const hashBuffer = await webCrypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  } catch (error: any) {
    throw new Error(error.message || "Failed to generate file hash");
  }
}
