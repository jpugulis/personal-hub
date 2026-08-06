import type { Metadata } from "next";
import Editor from "@/components/edit/Editor";
import "../edit.css";

export const metadata: Metadata = {
  title: "Redaktors — Personīgais Atlants",
  robots: { index: false, follow: false, nocache: true },
};

/** Nothing here is prerendered; the editor loads its content after sign-in. */
export const dynamic = "force-dynamic";

export default function EditPage() {
  return <Editor />;
}
