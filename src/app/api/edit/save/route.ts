import { isEditor, unauthorized } from "@/lib/edit/auth";
import { applyEdits } from "@/lib/edit/sources";
import { commitFiles } from "@/lib/edit/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FIELD = 200_000;

/** Write the changed fields back to the repo as one commit. */
export async function POST(req: Request) {
  if (!(await isEditor())) return unauthorized();

  let edits: Record<string, string>;
  try {
    const body = await req.json();
    edits = body?.edits ?? {};
  } catch {
    return Response.json({ error: "Bojāts pieprasījums" }, { status: 400 });
  }

  const entries = Object.entries(edits);
  if (entries.length === 0) {
    return Response.json({ error: "Nav izmaiņu, ko saglabāt" }, { status: 400 });
  }
  for (const [id, value] of entries) {
    if (typeof value !== "string" || value.length > MAX_FIELD) {
      return Response.json({ error: `Lauks "${id}" ir pārāk garš` }, { status: 400 });
    }
  }

  try {
    const files = await applyEdits(edits);
    if (files.length === 0) {
      return Response.json({ error: "Izmaiņas neko nemainīja" }, { status: 400 });
    }

    const what = files.map((f) => f.path.split("/").slice(-2).join("/")).join(", ");
    const commit = await commitFiles(
      files,
      `Edit from /edit: ${entries.length} field${entries.length === 1 ? "" : "s"} in ${what}`
    );

    return Response.json({
      ok: true,
      files: files.map((f) => f.path),
      fields: entries.length,
      commit,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "nezināma kļūda";
    return Response.json({ error: message }, { status: 500 });
  }
}
