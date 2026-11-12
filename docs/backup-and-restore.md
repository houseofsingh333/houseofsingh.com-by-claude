# Backups of the Sanity content, and how to restore them

Every Sunday a GitHub Action copies everything in the Sanity dataset `production`:
- every document, published and draft;
- the private records (contact messages, sign ups, orders and collectors);
- every image and file.

The copy is encrypted and kept for 90 days. The workflow is `.github/workflows/sanity-backup.yml`.

## Why it is encrypted

This repository is public, and anyone signed in to GitHub can download a public repository's workflow files. Without encryption, the backup would give away every private record. So the copy is locked with a passphrase (AES-256) before it is uploaded. Without that passphrase nobody can open it, including you, so keep it safe.

## Setting it up (once)

**1. A read only Sanity token.**
- In sanity.io/manage, open project 31g7gu7n, then **API**, then **Tokens**, then **Add API token**.
- Name it `GitHub backup` and give it the **Viewer** permission (read only). Copy the token.

**2. A passphrase.**
- In Terminal, run `openssl rand -base64 32`, which prints a long random passphrase.
- Save it in your password manager first, as "House of Singh backup passphrase". If it is lost, the backups cannot be opened.

**3. Two GitHub secrets.**
- In GitHub, open the repository, then **Settings**, **Secrets and variables**, **Actions**, **New repository secret**.
- Add `SANITY_BACKUP_TOKEN` with the token from step 1.
- Add `BACKUP_PASSPHRASE` with the passphrase from step 2.

**4. A first backup now.**
- Open **Actions**, then **sanity backup**, then **Run workflow**.
- After a few minutes the run shows a green tick. Its summary gives the number of documents, images and files, and the size.

If a secret is missing, the run fails and says which one. GitHub emails you about the failed run, so a backup cannot quietly stop.

## Downloading a backup

1. Open **Actions**, then **sanity backup**, then the run for the date you want.
2. Under **Artifacts**, download `sanity-production-YYYY-MM-DD`.
3. GitHub wraps it in a zip. Unzip it to get `sanity-production-YYYY-MM-DD.tar.gz.enc`.

## Opening it

In Terminal, in the folder where the file is, run this. Change the date to match your file:

```
openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 -in sanity-production-2026-11-15.tar.gz.enc -out backup.tar.gz
```

It asks for the passphrase. `bad decrypt` means the passphrase is wrong. On an older Mac, if `-pbkdf2` is not recognised, install a current OpenSSL with `brew install openssl` and run the same line with `$(brew --prefix openssl)/bin/openssl` in place of `openssl`.

`backup.tar.gz` is a standard Sanity export:
- `data.ndjson` holds the documents, one per line;
- `images/` and `files/` hold the uploads.

## Restoring

Never restore straight over the live content. First restore into a separate copy, check it, and only then replace.

**1. Into a new dataset, to inspect it.**

In the project folder:

```
npx sanity dataset create restore-check
npx sanity dataset import backup.tar.gz restore-check
```

Then check that what you need is there. For example, to list the Journal entries in the copy:

```
npx sanity documents query '*[_type == "journalEntry"] | order(date desc){title, date}' --dataset restore-check
```

Or ask me, and I will compare the copy with the live content.

**2. Replacing the live content.** Only do this if `production` itself is damaged:

```
npx sanity dataset import backup.tar.gz production --replace
```

`--replace` overwrites documents with the same id. Documents created after the backup stay as they are.

**3. To restore a few documents only**, for example one deleted Journal entry, ask me. I can take just those documents from `data.ndjson` and import them on their own.

**4. Afterwards,** delete the check dataset:

```
npx sanity dataset delete restore-check
```

## What is not in a backup

- **Schema:** it lives in this repository (`src/sanity/schemas`), so git keeps every version.
- **Kit subscribers, Stripe payments and Resend emails:** these live in those services, which keep their own records.
- **Settings in Vercel and Sanity** (environment variables, tokens, webhooks): these are listed in the docs for each (`docs/email.md`, `docs/editions-setup.md`, `docs/indexnow.md`).
