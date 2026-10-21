function base64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// 32 bytes aleatorios → 43 caracteres del alfabeto que exige RFC 7636.
function randomBase64Url(): string {
  return base64Url(crypto.getRandomValues(new Uint8Array(32)));
}

export const createState = randomBase64Url;
export const createCodeVerifier = randomBase64Url;

export async function createCodeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return base64Url(new Uint8Array(digest));
}
