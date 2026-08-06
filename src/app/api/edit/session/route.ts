import { cookies } from "next/headers";
import {
  COOKIE,
  isEditor,
  mintToken,
  passwordIsCorrect,
  penaltyDelay,
} from "@/lib/edit/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Is the current visitor already signed in? */
export async function GET() {
  return Response.json({ signedIn: await isEditor() });
}

/** Sign in with the password. */
export async function POST(req: Request) {
  let password = "";
  try {
    ({ password = "" } = await req.json());
  } catch {
    /* malformed body is just a failed attempt */
  }

  if (!password || !passwordIsCorrect(password)) {
    await penaltyDelay();
    return Response.json({ error: "Nepareiza parole" }, { status: 401 });
  }

  const token = await mintToken();
  const jar = await cookies();
  jar.set(COOKIE, token.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: token.maxAge,
  });
  return Response.json({ signedIn: true });
}

/** Sign out. */
export async function DELETE() {
  const jar = await cookies();
  jar.delete(COOKIE);
  return Response.json({ signedIn: false });
}
