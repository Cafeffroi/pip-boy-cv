/**
 * Decodes a base64-encoded string.
 * Used to obfuscate contact info (email, phone, URLs) in static JSON files
 * so automated scrapers/bots can't harvest them.
 */
export function decodeValue(encoded: string): string {
  try {
    return atob(encoded);
  } catch {
    // If decoding fails, return the original value as fallback
    return encoded;
  }
}
