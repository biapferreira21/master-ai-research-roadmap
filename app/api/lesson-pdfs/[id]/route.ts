import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { lessonPdfs } from "../../../../db/schema";
import { getPdfBucket, getRequestUserId } from "../storage";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

async function ownedPdf(request: Request, id: string) {
  const userId = getRequestUserId(request);
  if (!userId) return { error: Response.json({ error: "Sign in is required." }, { status: 401 }) };

  const [pdf] = await getDb()
    .select()
    .from(lessonPdfs)
    .where(and(eq(lessonPdfs.id, id), eq(lessonPdfs.userId, userId)))
    .limit(1);
  if (!pdf) return { error: Response.json({ error: "PDF not found." }, { status: 404 }) };
  return { pdf };
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await ownedPdf(request, id);
    if ("error" in result) return result.error;

    const object = await getPdfBucket().get(result.pdf.objectKey);
    if (!object) return Response.json({ error: "PDF file not found." }, { status: 404 });

    const download = new URL(request.url).searchParams.get("download") === "1";
    const encodedName = encodeURIComponent(result.pdf.fileName);
    return new Response(object.body, {
      headers: {
        "Content-Type": object.httpMetadata?.contentType ?? "application/pdf",
        "Content-Length": String(object.size ?? result.pdf.size),
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename*=UTF-8''${encodedName}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not open PDF." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await ownedPdf(request, id);
    if ("error" in result) return result.error;

    await getPdfBucket().delete(result.pdf.objectKey);
    await getDb().delete(lessonPdfs).where(eq(lessonPdfs.id, result.pdf.id));
    return Response.json({ deleted: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not remove PDF." }, { status: 500 });
  }
}
