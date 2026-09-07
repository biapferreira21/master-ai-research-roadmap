import { env } from "cloudflare:workers";

type StoredObject = {
  body: ReadableStream;
  size?: number;
  httpMetadata?: { contentType?: string };
};

type PdfBucket = {
  put: (key: string, value: ReadableStream, options?: { httpMetadata?: { contentType?: string } }) => Promise<unknown>;
  get: (key: string) => Promise<StoredObject | null>;
  delete: (key: string) => Promise<unknown>;
};

export function getPdfBucket(): PdfBucket {
  const bucket = (env as unknown as { NOTES_BUCKET?: PdfBucket }).NOTES_BUCKET;
  if (!bucket) throw new Error("Private PDF storage is unavailable.");
  return bucket;
}

export function getRequestUserId(request: Request): string | null {
  const userId = request.headers.get("oai-authenticated-user-id");
  if (userId) return userId;

  const hostname = new URL(request.url).hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") return "local-preview-user";
  return null;
}

export function safePdfFileName(fileName: string): string {
  const cleaned = fileName.replace(/[\r\n]/g, " ").trim();
  return cleaned || "annotated-notes.pdf";
}
