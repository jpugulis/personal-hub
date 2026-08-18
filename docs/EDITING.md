# Editing the site from a phone

`pugulis.com/edit` is a password-gated editor. It reads the current text
straight from GitHub, lets you change it on a phone, and commits the result
back as one commit. Vercel then rebuilds — roughly a minute before the change
is live.

Nothing is stored anywhere else. The repository stays the single source of
truth, so every edit has a diff and can be reverted like any other commit.

## One-time setup

Three environment variables, all in **Vercel → the `personal-hub` project →
Settings → Environment Variables**. Add each to *Production* (and *Preview*
if you want to test there). They are server-only — none of them is ever sent
to the browser.

| Variable | What it is |
| --- | --- |
| `EDIT_PASSWORD` | The password you type on `/edit`. Pick something long. |
| `EDIT_SECRET` | A long random string used to sign your session cookie. Generate with `openssl rand -base64 48`. Never needs to be typed. |
| `GITHUB_TOKEN` | A GitHub **fine-grained** personal access token. |

Optionally `GITHUB_REPO` (defaults to `jpugulis/personal-hub`) and
`GITHUB_BRANCH` (defaults to `main`).

### Creating the GitHub token

GitHub → Settings → Developer settings → Personal access tokens →
Fine-grained tokens → Generate new token.

- **Repository access:** Only select repositories → `personal-hub`
- **Permissions:** Repository permissions → **Contents: Read and write**
- Nothing else. No account permissions, no other repositories.
- Set an expiry you are willing to renew — a year is reasonable.

Redeploy after adding the variables; Vercel only picks up new environment
variables on the next build.

## Using it

1. Open `pugulis.com/edit` and enter the password. The session lasts two
   weeks, so on your own phone you will rarely retype it.
2. Tap a group to open it. Change what you want.
3. Changed fields are outlined and marked `mainīts`, and the bar at the
   bottom counts them.
4. **Saglabāt** commits everything at once and links to the commit.

Unsaved work is kept in the browser, so a phone call or an accidental tab
close will not lose it. **Atmest** throws the draft away.

## What is editable

| Group | File it writes |
| --- | --- |
| Teritorijas | `content/site/territories.json` |
| Velo — ekspedīcijas | `sites/cycling/assets/tours.js` |
| Velo — ekspedīciju lapas | the five `sites/cycling/<tour>/index.html` pages |
| Velo — atskaites | the nine `sites/cycling/reports/*/index.html` pages (English originals plus Latvian translations for four of the five tours) |

The cycling pages are hand-written HTML, so they are split at every `<h2>`
and each section is edited as a block of HTML. Plain sentences can be typed
normally; the tags around them should be left alone. A save is refused if a
tag is left unclosed.

## Things worth knowing

- **The `.md` downloads drift.** Each report also has a downloadable
  `sites/cycling/reports/<tour>.md`. The editor changes the published HTML
  only — the markdown copy is not regenerated.
- **One commit per save**, touching only the files that actually changed.
- **The cycling site is a separate Vercel project** from the same repo, so a
  save that touches it rebuilds that project rather than this one.
- **Editing is not collaborative.** If you edit on two devices at once, the
  later save wins for the fields it touched.

## Checks

```bash
node scripts/test_edit_roundtrip.mjs   # rewriting a page must not corrupt it
python3 scripts/check_lang.py          # no string may mix Latvian and English
```

The round-trip test is the important one: it proves that reading a page and
writing it back unchanged is byte-identical, and that editing one section
leaves every other section alone.
