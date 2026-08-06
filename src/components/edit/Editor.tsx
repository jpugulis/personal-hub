"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Field, Section } from "@/lib/edit/sources";

const DRAFT_KEY = "atlas-edit-draft";

type Status =
  | { kind: "idle" }
  | { kind: "busy"; message: string }
  | { kind: "error"; message: string }
  | { kind: "done"; message: string; url?: string };

/* ------------------------------------------------------------------ */

function AutoTextarea({
  value,
  onChange,
  mono,
}: {
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 520)}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      className={`ed-input ed-area${mono ? " ed-mono" : ""}`}
      value={value}
      spellCheck
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function FieldRow({
  field,
  value,
  dirty,
  onChange,
}: {
  field: Field;
  value: string;
  dirty: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label className={`ed-field${dirty ? " is-dirty" : ""}`}>
      <span className="ed-label">
        {field.label}
        {dirty && <em>mainīts</em>}
      </span>
      {field.kind === "line" || field.kind === "number" ? (
        <input
          className="ed-input"
          type={field.kind === "number" ? "text" : "text"}
          inputMode={field.kind === "number" ? "decimal" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <AutoTextarea
          value={value}
          onChange={onChange}
          mono={field.kind === "html"}
        />
      )}
      {field.hint && <span className="ed-hint">{field.hint}</span>}
    </label>
  );
}

/* ------------------------------------------------------------------ */

function SignIn({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/edit/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError((await res.json().catch(() => ({})))?.error ?? "Neizdevās");
        setPassword("");
      } else {
        onDone();
      }
    } catch {
      setError("Nav savienojuma");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="ed-gate" onSubmit={submit}>
      <div className="ed-gate-mark">JP</div>
      <h1>Redaktors</h1>
      <p className="ed-gate-sub">Personīgais Atlants</p>
      <input
        className="ed-input"
        type="password"
        autoFocus
        autoComplete="current-password"
        placeholder="Parole"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="ed-gate-err">{error}</p>}
      <button className="ed-btn" type="submit" disabled={busy || !password}>
        {busy ? "Pārbauda…" : "Ienākt"}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ */

export default function Editor() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [sections, setSections] = useState<Section[] | null>(null);
  /* restore an interrupted draft — a phone call should not cost work.
     Safe to read storage here: the first render is the boot placeholder
     either way, so server and client markup still agree. */
  const [edits, setEdits] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem(DRAFT_KEY) ?? "{}");
    } catch {
      return {};
    }
  });
  const [open, setOpen] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    try {
      if (Object.keys(edits).length) {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(edits));
      } else {
        window.localStorage.removeItem(DRAFT_KEY);
      }
    } catch {
      /* private mode — drafts simply are not kept */
    }
  }, [edits]);

  const load = useCallback(async () => {
    setStatus({ kind: "busy", message: "Ielādē no repozitorija…" });
    try {
      const res = await fetch("/api/edit/content");
      if (res.status === 401) {
        setSignedIn(false);
        setStatus({ kind: "idle" });
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Neizdevās ielādēt");
      setSections(data.sections);
      setStatus({ kind: "idle" });
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Neizdevās ielādēt",
      });
    }
  }, []);

  /* session check, then pull content in the same async chain */
  useEffect(() => {
    fetch("/api/edit/session")
      .then((r) => r.json())
      .then((d) => {
        const ok = Boolean(d.signedIn);
        setSignedIn(ok);
        if (ok) void load();
      })
      .catch(() => setSignedIn(false));
  }, [load]);

  const original = useMemo(() => {
    const map: Record<string, string> = {};
    sections?.forEach((s) =>
      s.groups.forEach((g) => g.fields.forEach((f) => (map[f.id] = f.value)))
    );
    return map;
  }, [sections]);

  /* only fields that actually differ from the repo count as changes */
  const changed = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(edits).filter(
          ([id, v]) => id in original && v !== original[id]
        )
      ),
    [edits, original]
  );
  const changedCount = Object.keys(changed).length;

  const setField = useCallback((id: string, v: string) => {
    setEdits((prev) => ({ ...prev, [id]: v }));
  }, []);

  async function save() {
    if (!changedCount) return;
    setStatus({ kind: "busy", message: "Saglabā…" });
    try {
      const res = await fetch("/api/edit/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edits: changed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Neizdevās saglabāt");
      setEdits({});
      setStatus({
        kind: "done",
        message: `Saglabāts — ${data.fields} lauki, ${data.files.length} faili. Vercel pārbūvē ~1 min.`,
        url: data.commit?.url,
      });
      void load();
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Neizdevās saglabāt",
      });
    }
  }

  function discard() {
    if (!window.confirm("Atmest visas nesaglabātās izmaiņas?")) return;
    setEdits({});
    setStatus({ kind: "idle" });
  }

  async function signOut() {
    await fetch("/api/edit/session", { method: "DELETE" });
    setSignedIn(false);
    setSections(null);
  }

  if (signedIn === null) return <div className="ed-boot">…</div>;
  if (!signedIn) {
    return (
      <SignIn
        onDone={() => {
          setSignedIn(true);
          void load();
        }}
      />
    );
  }

  return (
    <div className="ed">
      <header className="ed-top">
        <span className="ed-top-mark">
          <b>JP</b> Redaktors
        </span>
        <button className="ed-link" type="button" onClick={signOut}>
          Iziet
        </button>
      </header>

      {status.kind !== "idle" && (
        <div className={`ed-status ed-status--${status.kind}`}>
          <span>{status.message}</span>
          {status.kind === "done" && status.url && (
            <a href={status.url} target="_blank" rel="noopener">
              Commit ↗
            </a>
          )}
        </div>
      )}

      {sections?.map((s) => (
        <section key={s.id} className="ed-section">
          <h2 className="ed-section-head">{s.title}</h2>
          {s.groups.map((g) => {
            const key = `${s.id}/${g.id}`;
            const isOpen = open === key;
            const dirty = g.fields.filter((f) => f.id in changed).length;
            return (
              <div key={key} className={`ed-group${isOpen ? " is-open" : ""}`}>
                <button
                  type="button"
                  className="ed-group-head"
                  onClick={() => setOpen(isOpen ? null : key)}
                >
                  <span>{g.title}</span>
                  <span className="ed-group-meta">
                    {dirty > 0 && <em>{dirty}</em>}
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="ed-group-body">
                    {g.note && <p className="ed-note">{g.note}</p>}
                    {g.fields.map((f) => (
                      <FieldRow
                        key={f.id}
                        field={f}
                        value={edits[f.id] ?? f.value}
                        dirty={f.id in changed}
                        onChange={(v) => setField(f.id, v)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      ))}

      <div className="ed-bar">
        <span className="ed-bar-count">
          {changedCount === 0
            ? "Nav izmaiņu"
            : `${changedCount} ${changedCount === 1 ? "izmaiņa" : "izmaiņas"}`}
        </span>
        {changedCount > 0 && (
          <button className="ed-link" type="button" onClick={discard}>
            Atmest
          </button>
        )}
        <button
          className="ed-btn"
          type="button"
          disabled={changedCount === 0 || status.kind === "busy"}
          onClick={save}
        >
          Saglabāt
        </button>
      </div>
    </div>
  );
}
