import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { customLibrarySources } from "../../../db/schema";
import { getRequestUserId } from "../lesson-pdfs/storage";

export const dynamic = "force-dynamic";
const validSections = new Set(["dictionary", "primers", "algorithms", "data-structures", "papers", "readings", "videos", "information-theory"]);

function publicSource(row: typeof customLibrarySources.$inferSelect) {
  let tags: string[] = [];
  try { tags = JSON.parse(row.tags); } catch { /* Ignore malformed legacy values. */ }
  return { ...row, tags };
}

export async function GET(request: Request) {
  const userId = getRequestUserId(request);
  if (!userId) return Response.json({ error: "Sign in is required." }, { status: 401 });
  try {
    const rows = await getDb().select().from(customLibrarySources).where(eq(customLibrarySources.userId, userId)).orderBy(desc(customLibrarySources.createdAt));
    return Response.json({ sources: rows.map(publicSource) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load custom sources." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = getRequestUserId(request);
  if (!userId) return Response.json({ error: "Sign in is required." }, { status: 401 });
  try {
    const body = await request.json() as { title?: string; url?: string; section?: string; description?: string; tags?: string[]; format?: string };
    const title = String(body.title ?? "").trim().slice(0, 220);
    const section = String(body.section ?? "").trim();
    let url: URL;
    try { url = new URL(String(body.url ?? "")); } catch { return Response.json({ error: "Enter a valid source URL." }, { status: 400 }); }
    if (!title) return Response.json({ error: "Enter a title." }, { status: 400 });
    if (!validSections.has(section)) return Response.json({ error: "Choose a valid library section." }, { status: 400 });
    if (!new Set(["http:", "https:"]).has(url.protocol)) return Response.json({ error: "Only web links are supported." }, { status: 400 });
    const value = {
      id: crypto.randomUUID(), userId, title, url: url.toString(), section,
      description: String(body.description ?? "").trim().slice(0, 1200),
      tags: JSON.stringify((body.tags ?? []).map(String).map((tag) => tag.trim()).filter(Boolean).slice(0, 12)),
      format: String(body.format ?? "reference").trim().slice(0, 40) || "reference",
      createdAt: new Date().toISOString(),
    };
    const [created] = await getDb().insert(customLibrarySources).values(value).returning();
    return Response.json({ source: publicSource(created) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not add the source." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = getRequestUserId(request);
  if (!userId) return Response.json({ error: "Sign in is required." }, { status: 401 });
  try {
    const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
    if (!/^[a-f0-9-]{30,50}$/i.test(id)) return Response.json({ error: "A valid source is required." }, { status: 400 });
    await getDb().delete(customLibrarySources).where(eq(customLibrarySources.id, id));
    return Response.json({ deleted: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not remove the source." }, { status: 500 });
  }
}
