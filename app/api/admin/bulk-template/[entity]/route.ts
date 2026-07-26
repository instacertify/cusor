import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { buildTemplateWorkbook, getBulkEntity, type BulkEntity } from "@/lib/bulk-import";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ entity: string }>;
}

export async function GET(_req: Request, { params }: Props) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { entity } = await params;
  const def = getBulkEntity(entity);
  if (!def) {
    return NextResponse.json({ error: "Unknown entity" }, { status: 404 });
  }
  const buffer = buildTemplateWorkbook(entity as BulkEntity);
  const filename = `certko-${def.id}-template.xlsx`;
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
