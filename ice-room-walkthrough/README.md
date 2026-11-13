# TryHackMe: Ice — Windows Privilege Escalation Walkthrough

A static documentation site covering a practical run through the TryHackMe **Ice** room: Icecast exploitation for initial access, a real architecture-mismatch troubleshooting detour, UAC bypass, process migration, and credential enumeration with Kiwi (Mimikatz).

Live structure:

```
ice-room-walkthrough/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── script.js
└── README.md
```

## Editing before you publish

Open `index.html` and fill in:

- `[INSERT LINKEDIN PROFILE URL]` — appears in the hero and footer
- `[INSERT TRYHACKME PROFILE URL]` — appears in the hero, the "View My Profile" button, and the footer

Open `js/script.js` and, if you'd like to list certifications, add entries to the `CERTIFICATIONS` array near the bottom of the file:

```js
const CERTIFICATIONS = [
  { name: "Your Certification Name" },
];
```

Nothing is invented here — the array is empty by default and the hero section shows no certification badges until you add real ones.

The lab credential and hashes in the "Credential Enumeration with Kiwi" section are stored base64-encoded in `ENCODED_CREDS` inside `js/script.js` and only decoded in the browser after a visitor clicks the "reveal" spoiler button. They belong to a disposable TryHackMe training VM and are not sensitive outside that context, but they're kept out of plain page text deliberately.

## Running locally

No build step and no dependencies — it's plain HTML/CSS/JS. Just open `index.html` in a browser, or serve the folder locally:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deploying to GitHub Pages

1. Create a new GitHub repository (or use an existing one) and push this folder's contents to it:

   ```bash
   git init
   git add .
   git commit -m "Add Ice room walkthrough site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
4. Choose the `main` branch and the `/ (root)` folder, then save.
5. GitHub will give you a URL shortly after, typically:

   ```
   https://<your-username>.github.io/<your-repo>/
   ```

All asset paths in this project are relative (`css/styles.css`, `js/script.js`), so it will work correctly whether it's served from the repository root or from a project subpath — no changes needed either way.

## A note on accuracy

TryHackMe assigns a new target IP and VPN tunnel address for every lab session, so this write-up never hardcodes a real one — `TARGET_IP` and `VPN_IP` stand in throughout. The walkthrough also documents the two privilege-escalation attempts that *didn't* work (`bypassuac_comhijack`, twice) before the one that did (`bypassuac_eventvwr`), because that troubleshooting is the most useful part of the lab to learn from.
