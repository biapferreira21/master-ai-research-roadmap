import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { lessonPdfs } from "../../../db/schema";
import { getPdfBucket, getRequestUserId, safePdfFileName } from "./storage";

export const dynamic = "force-dynamic";

const maxPdfBytes = 50 * 1024 * 1024;

function publicPdf(pdf: typeof lessonPdfs.$inferSelect) {
  return {
    id: pdf.id,
    lessonId: pdf.lessonId,
    fileName: pdf.fileName,
    size: pdf.size,
    createdAt: pdf.createdAt,
    url: `/api/lesson-pdfs/${pdf.id}`,
  };
}

function validLessonId(value: string) {
  return /^[a-z0-9][a-z0-9-]{2,80}$/.test(value);
}

export async function GET(request: Request) {
  const userId = getRequestUserId(request);
  if (!userId) return Response.json({ error: "Sign in is required." }, { status: 401 });

  const lessonId = new URL(request.url).searchParams.get("lessonId")?.trim() ?? "";
  if (!validLessonId(lessonId)) return Response.json({ error: "A valid lesson is required." }, { status: 400 });

  try {
    const rows = await getDb()
      .select()
      .from(lessonPdfs)
      .where(and(eq(lessonPdfs.userId, userId), eq(lessonPdfs.lessonId, lessonId)))
      .orderBy(desc(lessonPdfs.createdAt));
    return Response.json({ pdfs: rows.map(publicPdf) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load PDFs." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = getRequestUserId(request);
  if (!userId) return Response.json({ error: "Sign in is required." }, { status: 401 });

  try {
    const form = await request.formData();
    const lessonId = String(form.get("lessonId") ?? "").trim();
    const file = form.get("file");

    if (!validLessonId(lessonId)) return Response.json({ error: "A valid lesson is required." }, { status: 400 });
    if (!(file instanceof File)) return Response.json({ error: "Choose a PDF file." }, { status: 400 });
    if (file.size === 0 || file.size > maxPdfBytes) return Response.json({ error: "PDFs must be between 1 byte and 50 MB." }, { status: 400 });
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return Response.json({ error: "Only PDF files are supported." }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const objectKey = `${encodeURIComponent(userId)}/${lessonId}/${id}.pdf`;
    const fileName = safePdfFileName(file.name);
    const bucket = getPdfBucket();

    await bucket.put(objectKey, file.stream(), { httpMetadata: { contentType: "application/pdf" } });
    try {
      const [created] = await getDb().insert(lessonPdfs).values({
        id,
        userId,
        lessonId,
        fileName,
        objectKey,
        contentType: "application/pdf",
        size: file.size,
      }).returning();
      return Response.json({ pdf: publicPdf(created) }, { status: 201 });
    } catch (error) {
      await bucket.delete(objectKey);
      throw error;
    }
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not upload PDF." }, { status: 500 });
  }
}
