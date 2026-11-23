import { NextRequest, NextResponse } from "next/server";
import { ensureDbReady } from "@/db/ensure-db";
import { requireAdminSession } from "@/lib/auth";
import {
  exportAllTablesSnapshot,
  isBackupPostgresConfigured,
  isR2BackupConfigured,
  restoreFromSnapshot,
  syncToBackupPostgres,
  uploadBackupToR2,
  type DatabaseBackupSnapshot,
} from "@/lib/backup";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const { searchParams } = new URL(req.url);

  if (searchParams.get("download") === "1") {
    const snapshot = await exportAllTablesSnapshot();
    const dateTag = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(snapshot, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="mqtech-backup-${dateTag}.json"`,
      },
    });
  }

  const snapshot = await exportAllTablesSnapshot();
  return NextResponse.json({
    r2Configured: isR2BackupConfigured(),
    backupPostgresConfigured: isBackupPostgresConfigured(),
    counts: snapshot.counts,
    exportedAt: snapshot.exportedAt,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const body = await req.json();
  const action = String(body.action || "").toLowerCase();

  try {
    if (action === "r2") {
      const snapshot = await exportAllTablesSnapshot();
      const uploaded = await uploadBackupToR2(snapshot);
      return NextResponse.json({
        ok: true,
        action: "r2",
        ...uploaded,
        counts: snapshot.counts,
        exportedAt: snapshot.exportedAt,
      });
    }

    if (action === "postgres") {
      if (!isBackupPostgresConfigured()) {
        return NextResponse.json(
          {
            error:
              "Chưa cấu hình biến môi trường BACKUP_DATABASE_URL trên máy chủ (Fly.io secrets hoặc .env.local).",
          },
          { status: 400 }
        );
      }
      const snapshot = await exportAllTablesSnapshot();
      const synced = await syncToBackupPostgres(snapshot);
      return NextResponse.json({
        ok: true,
        action: "postgres",
        ...synced,
      });
    }

    if (action === "restore") {
      const snapshot = body.snapshot as DatabaseBackupSnapshot | undefined;
      if (!snapshot || !snapshot.tables) {
        return NextResponse.json(
          { error: "Thiếu dữ liệu file backup JSON hợp lệ." },
          { status: 400 }
        );
      }
      const res = await restoreFromSnapshot(snapshot);
      return NextResponse.json({
        ok: true,
        action: "restore",
        counts: res.counts,
      });
    }

    return NextResponse.json(
      { error: "Hành động backup không hợp lệ (r2 | postgres | restore)." },
      { status: 400 }
    );
  } catch (err) {
    console.error("[POST /api/admin/backup]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Không thể thực hiện sao lưu/khôi phục lúc này.",
      },
      { status: 500 }
    );
  }
}
