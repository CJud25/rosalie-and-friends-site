# Launch checklist — rosalieandfriends.org

## Claude does (already scripted)
- [x] Gates 1–4 passed (source verification, content review, design review, repo-ship-gate)
- [ ] `gh repo create CJud25/rosalie-and-friends-site --public --source . --push`
- [ ] Verify the `*.vercel.app` preview after you import the repo (step below)
- [ ] Gate 5: post-deploy live-site verification workflow
- [ ] Tag `v1.0.0`

## Chris does ([OWNER] steps)

### 1. Vercel (~5 minutes)
1. Go to https://vercel.com and **Continue with GitHub** (free Hobby plan).
2. **Add New… → Project** → import `rosalie-and-friends-site`.
3. Framework Preset: **Other**. Leave build command and output directory EMPTY (it's a static site — `vercel.json` handles everything). → **Deploy**.
4. Tell Claude the `*.vercel.app` URL it gives you.

### 2. Domain (~5 minutes + DNS propagation)
1. In the Vercel project: **Settings → Domains** → add `rosalieandfriends.org`, then add `www.rosalieandfriends.org` (choose "Redirect to rosalieandfriends.org" for www).
2. Vercel will show the required DNS records — use ITS values. Expected:
   - `A` record: host `@` (blank/apex) → `76.76.21.21`
   - `CNAME` record: host `www` → `cname.vercel-dns.com`
3. In Porkbun (porkbun.com → Domain Management → rosalieandfriends.org → DNS Records):
   - DELETE Porkbun's default `ALIAS`/`CNAME` parking records for `@` and `www`.
   - ADD the two records above (TTL default is fine).
4. Wait for propagation (minutes to a few hours). The site is live when https://rosalieandfriends.org loads with a padlock.

### 3. Before announcing (the important owner to-dos)
- [ ] **PayPal**: the Donate-via-PayPal button currently points at the PayPal homepage (your call until the real link exists). Get the org's real PayPal donation link and swap it in `ways-to-help.html` — or ask Claude to remove the button until then.
- [ ] **Venmo**: confirm with the rescue that `@rosalieandfriends` (venmo.com/u/rosalieandfriends) is really their account — a wrong handle sends money to a stranger.
- [ ] **Fospice wording**: confirm with the rescue that "all medical treatment covered" is how they want the fospice promise stated (`fospice.html`).
- [ ] **Foster form**: confirm `fb.jotform.com/223377576549168` is the current foster application.
- [ ] Show the site to the rescue's board before sharing publicly.

### 4. Announce
- [ ] Update the Facebook page's Website field to https://rosalieandfriends.org
- [ ] Share the site in a post — the link preview will show the mascot card.
- [ ] Ask Petfinder/Adoptapet listings to link the new site.

## Maintenance rhythm (suggested)
Weekly-ish: compare the site roster to the rescue's Petfinder page; move adopted dogs to Happy Tails; add new arrivals per README house rules. Ask Claude — the harvest + verification pipeline is repeatable.
