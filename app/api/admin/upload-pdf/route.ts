import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isAdmin } from "@/lib/auth";
import {
  PDF_MAX_BYTES,
  isPdfBuffer,
  sanitizePdfBasename,
} from "@/lib/pdf-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, error: "Choose a PDF file" }, { status: 400 });
  }
  if (file.size > PDF_MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: `PDF must be under ${Math.round(PDF_MAX_BYTES / (1024 * 1024))} MB` },
      { status: 400 }
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (!isPdfBuffer(buf)) {
    return NextResponse.json({ ok: false, error: "File is not a valid PDF" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public", "uploads", "pdfs");
  fs.mkdirSync(dir, { recursive: true });
  const name = `${Date.now()}-${sanitizePdfBasename(file.name)}.pdf`;
  fs.writeFileSync(path.join(dir, name), buf);
  const src = `/uploads/pdfs/${name}`;
  const title = sanitizePdfBasename(file.name).replace(/_/g, " ");

  return NextResponse.json({ ok: true, src, title, name });
}
