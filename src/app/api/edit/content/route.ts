import { isEditor, unauthorized } from "@/lib/edit/auth";
import { loadSections } from "@/lib/edit/sources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Everything the editor can change, read fresh from the repository. */
export async function GET() {
  if (!(await isEditor())) return unauthorized();
  try {
    return Response.json({ sections: await loadSections() });
  } catch (e) {
    const message = e instanceof Error ? e.message : "nezināma kļūda";
    return Response.json({ error: message }, { status: 500 });
  }
}
