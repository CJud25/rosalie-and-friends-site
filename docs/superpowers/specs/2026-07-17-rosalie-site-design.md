# Rosalie & Friends — Live Website Design

**Date:** 2026-07-17 · **Status:** Approved pending user spec review
**Goal:** Turn the approved 7-page static mock into the live public website for Rosalie and Friends Inc. (501(c)(3) dog fospice rescue, Pensacola FL) at **rosalieandfriends.org**, hosted free on Vercel, so the rescue gets found and more dogs get adopted.

## Decisions already made (user-approved)

| Decision | Choice |
|---|---|
| Architecture | Keep plain static HTML/CSS/JS (Approach A). No framework, no build step. |
| Domain | rosalieandfriends.org (purchased at Porkbun) |
| Dog roster | Real dogs pulled from facebook.com/rosalieandfriends; petfinder.com fallback if Facebook is uncooperative |
| Mascot | Full-size profile photo from the Facebook page → navbar logo, favicon set, About page, og:image |
| Venmo | venmo.com/u/rosalieandfriends |
| PayPal | paypal.com homepage placeholder until the real link is provided |
| Contact | Replace dead contact form with "Message us on Facebook" (m.me/rosalieandfriends); keep JotForm application links + PO Box |
| Process | frontend-design polish pass; adversarial review gate between every phase; Beautiful Minds principles; multi-agent Workflow orchestration for review panels |

## Architecture

Static files served by Vercel. Repo layout stays as-is: `*.html` at root, `css/`, `js/`, `images/` (+ `images/dogs/` for downloaded, optimized dog photos). Add `vercel.json` (cleanUrls, security headers), `robots.txt`, `sitemap.xml`, `404.html`. No server code, no dependencies, nothing to patch or maintain.

Future upgrade path (explicitly out of scope now): roster fed from the Rescue Ops Google Sheet. Nothing in this build blocks it.

## Phases and gates

Every phase ends with an adversarial review gate before the next begins. Reviews use independent agents (Workflow tool) prompted to refute, not confirm.

**Phase 1 — Content harvest.**
Browse the Facebook page (user's Chrome session) for: full-size mascot photo; current adoptable and fospice dogs (names, photos, posted bio facts); any donate links in About; confirm PO Box/EIN details match the mock. Petfinder fallback for the roster. Download photos, resize to ≤900px wide, compress to web weight, store in `images/dogs/`.
*Truth rule (non-negotiable):* dog bios state only what the source actually says. No invented ages, breeds, or temperaments. Unknowns are written as unknowns ("ask us about Daisy"). Every dog card traces to a source post/listing recorded in `docs/content-sources.md`.
*Gate 1:* verification agent re-checks each dog card against its recorded source; refutes any unsourced claim; confirms no dog listed as adoptable is actually already adopted (recent posts checked).

**Phase 2 — Content integration + placeholder fixes.**
Replace fictional roster across index/dogs pages with real dogs; wire mascot into navbar/favicon/About; fix Venmo/PayPal buttons; rebuild contact page around Messenger; sweep every remaining placeholder (placedog.net URLs must be zero at gate).
*Gate 2:* adversarial content review — broken links, leftover placeholders, factual claims vs sources, JotForm links still correct.

**Phase 3 — Design polish (frontend-design skill).**
Elevate the mock from clean-template to distinctive: mascot-anchored brand moments, typography rhythm, hero treatment with a real photo, hover/motion restraint, mobile polish. The fospice identity leads — "fospice and fixer uppers" is the brand, not a footnote (Position principle: the disqualifier is the brand). Wittgenstein translation: every page must read plainly to a first-time visitor; "fospice" is explained where it first appears.
*Gate 3:* multi-agent design review panel (Workflow): visual-hierarchy critic, accessibility auditor (WCAG AA: contrast, focus states, alt text, reduced-motion), mobile/responsive critic, and a "first-time visitor" cold-read. Findings verified, then fixed.

**Phase 4 — Production hardening.**
Favicon set + apple-touch-icon from mascot; Open Graph + Twitter cards on all pages (og:image = mascot); JSON-LD `NonprofitOrganization` schema; sitemap.xml; robots.txt; 404.html; vercel.json (cleanUrls, headers); Lighthouse pass ≥90 on performance/accessibility/SEO/best-practices against local render.
*Gate 4:* repo-ship-gate — Gate 1 cold-clone (site opens from a fresh clone, all links/assets resolve) + Gate 2 secret/PII sweep (no personal info of fosters/adopters/applicants in tree or history; org PO Box/EIN are public record and stay).

**Phase 5 — Deploy.**
Public GitHub repo under CJud25 → push → Vercel import (owner logs in) → verify the `*.vercel.app` preview → add rosalieandfriends.org + www in Vercel → Porkbun DNS: `A @ → 76.76.21.21`, `CNAME www → cname.vercel-dns.com` (records confirmed against Vercel's dashboard values at deploy time) → verify HTTPS on the live domain, re-run link check, share on Facebook renders the og-card correctly.
*Gate 5:* post-deploy verification agent hits the live site: every page 200s, images load, mobile viewport, forms/links out to JotForm/Venmo/Messenger resolve.

**[OWNER] steps (the only things requiring Chris):** Vercel signup/login + repo import approval; Porkbun DNS entry (guided or browser-driven together); final look-over before the domain flips.

## Out of scope for v1 (cut out loud)

On-site donation processing · CMS/admin UI · Google-Sheet roster sync · newsletter · custom application forms (JotForm stays) · blog. Each can be a later phase; none blocks launch.

## Success criteria

1. rosalieandfriends.org live over HTTPS with the mascot as the site identity.
2. Every dog shown is a real, currently-listed dog traceable to a source.
3. Zero placeholder assets/links anywhere.
4. Lighthouse ≥90 across categories; WCAG AA basics verified.
5. A Facebook share of any page shows a proper mascot card.
6. Total recurring cost: $0 beyond the domain Chris already bought.
