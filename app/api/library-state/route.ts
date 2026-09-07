import { and, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { libraryItemState } from "../../../db/schema";
import { getRequestUserId } from "../lesson-pdfs/storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const userId = getRequestUserId(request);
  if (!userId) return Response.json({ error: "Sign in is required." }, { status: 401 });
  try {
    const rows = await getDb().select().from(libraryItemState).where(eq(libraryItemState.userId, userId));
    return Response.json({
      items: Object.fromEntries(rows.map((row) => [row.itemId, {
        favourite: row.favourite,
        completed: row.completed,
        notes: row.notes,
        updatedAt: row.updatedAt,
      }])),
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load library state." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const userId = getRequestUserId(request);
  if (!userId) return Response.json({ error: "Sign in is required." }, { status: 401 });
  try {
    const body = await request.json() as { itemId?: string; favourite?: boolean; completed?: boolean; notes?: string };
    const itemId = String(body.itemId ?? "").trim();
    if (!/^[a-z0-9][a-z0-9-]{2,140}$/.test(itemId)) return Response.json({ error: "A valid item is required." }, { status: 400 });
    const current = await getDb().select().from(libraryItemState)
      .where(and(eq(libraryItemState.userId, userId), eq(libraryItemState.itemId, itemId))).limit(1);
    const previous = current[0];
    const value = {
      id: `${userId}:${itemId}`,
      userId,
      itemId,
      favourite: body.favourite ?? previous?.favourite ?? false,
      completed: body.completed ?? previous?.completed ?? false,
      notes: typeof body.notes === "string" ? body.notes.slice(0, 20000) : previous?.notes ?? "",
      updatedAt: new Date().toISOString(),
    };
    await getDb().insert(libraryItemState).values(value).onConflictDoUpdate({
      target: libraryItemState.id,
      set: { favourite: value.favourite, completed: value.completed, notes: value.notes, updatedAt: value.updatedAt },
    });
    return Response.json({ item: value });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not save library state." }, { status: 500 });
  }
}
