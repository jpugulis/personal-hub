/**
 * Minimal GitHub client for the editor.
 *
 * /edit reads and writes files straight from the repository rather than from
 * the deployed bundle. That matters because the cycling site lives in the
 * same repo but is a different Vercel project — its files are not on disk
 * next to this app. Going through GitHub means one code path for everything,
 * and the editor always shows the true current state of the repo.
 *
 * Required environment variables:
 *   GITHUB_TOKEN   fine-grained PAT, Contents: read and write, this repo only
 *   GITHUB_REPO    e.g. "jpugulis/personal-hub"   (optional, has a default)
 *   GITHUB_BRANCH  e.g. "main"                    (optional, has a default)
 */

const API = "https://api.github.com";

function repo(): string {
  return process.env.GITHUB_REPO || "jpugulis/personal-hub";
}

export function branch(): string {
  return process.env.GITHUB_BRANCH || "main";
}

function headers(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function gh<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { ...headers(), ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`GitHub ${res.status} on ${path}: ${detail.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

/** Read one text file at the tip of the working branch. */
export async function readFile(path: string): Promise<string> {
  const data = await gh<{ content: string; encoding: string }>(
    `/repos/${repo()}/contents/${encodeURI(path)}?ref=${branch()}`
  );
  if (data.encoding !== "base64") throw new Error(`unexpected encoding for ${path}`);
  return Buffer.from(data.content, "base64").toString("utf-8");
}

export async function readFiles(paths: string[]): Promise<Record<string, string>> {
  const entries = await Promise.all(
    paths.map(async (p) => [p, await readFile(p)] as const)
  );
  return Object.fromEntries(entries);
}

/**
 * Commit several files at once through the git data API, so a save that
 * touches three files lands as one commit instead of three.
 */
export async function commitFiles(
  files: { path: string; content: string }[],
  message: string
): Promise<{ sha: string; url: string }> {
  if (files.length === 0) throw new Error("nothing to commit");
  const r = repo();
  const b = branch();

  const ref = await gh<{ object: { sha: string } }>(
    `/repos/${r}/git/ref/heads/${b}`
  );
  const head = ref.object.sha;
  const headCommit = await gh<{ tree: { sha: string } }>(
    `/repos/${r}/git/commits/${head}`
  );

  const blobs = await Promise.all(
    files.map(async (f) => {
      const blob = await gh<{ sha: string }>(`/repos/${r}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({
          content: Buffer.from(f.content, "utf-8").toString("base64"),
          encoding: "base64",
        }),
      });
      return { path: f.path, mode: "100644" as const, type: "blob" as const, sha: blob.sha };
    })
  );

  const tree = await gh<{ sha: string }>(`/repos/${r}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: headCommit.tree.sha, tree: blobs }),
  });

  const commit = await gh<{ sha: string; html_url: string }>(
    `/repos/${r}/git/commits`,
    {
      method: "POST",
      body: JSON.stringify({ message, tree: tree.sha, parents: [head] }),
    }
  );

  await gh(`/repos/${r}/git/refs/heads/${b}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });

  return { sha: commit.sha.slice(0, 7), url: commit.html_url };
}
