/**
 * Safe JSON-LD Serializer
 * Meng-escape karakter '<' menjadi '\u003c' untuk mencegah injeksi XSS yang dapat memutus tag <script>.
 */
export function safeJsonLdStringify(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
