# Energy Advisor

A smart-home energy-saving alert center. It shows energy-saving alerts based on the tariff, indoor and outdoor temperature, and appliance activity.

## Pages
| Page | What it does |
|---|---|
| **Home** (`#home`) | Intro, a 24-hour alert timeline, the three rules, and how it works |
| **Dashboard** (`#dashboard`) | Summary stats, the latest alert with Accept/Dismiss, and searchable, filterable alert history |
| **Insights** (`#insights`) | Charts: load per alert, indoor vs outdoor temperature, and alerts by rule |
| **Rules** (`#rules`) | Turn each rule on or off (saved in the browser) and reset the demo |
| **About** (`#about`) | Project and data notes |

It also has a light/dark theme toggle and works on phones.

## Project structure
```
energy-advisor/
├── index.html            ← the website (open this)
├── README.md
└── assets/
    ├── favicon.svg
    ├── css/styles.css    ← all styling
    └── js/
        ├── data.js       ← the alerts data (edit this to change content)
        └── app.js        ← page logic
```
It's plain HTML, CSS and JavaScript, so there's **no build step and nothing to install**.

## Run it on your computer
Double-click `index.html` to open it in your browser.

## Deploy (pick one)

### Option A: Netlify Drop (easiest, about 1 minute, no account needed to start)
1. Unzip `energy-advisor.zip`.
2. Go to https://app.netlify.com/drop
3. Drag the **`energy-advisor` folder** (the one that contains `index.html`) onto the page.
4. You get a live URL like `https://random-name.netlify.app`. Sign up (free) to keep it permanently and rename it.

### Option B: GitHub Pages (free, easy to update)
1. Create a free account at https://github.com and click **New repository** (name it `energy-advisor`, set it to **Public**).
2. On the new repo page click **uploading an existing file**, then drag in **everything inside** the folder (`index.html`, `README.md`, `assets`). Click **Commit changes**.
3. Go to **Settings → Pages**. Under *Source* choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
4. After 1–2 minutes the site is live at `https://YOUR-USERNAME.github.io/energy-advisor/`.

### Option C: Vercel
1. Put the project on GitHub (Option B, steps 1–2).
2. Go to https://vercel.com, sign in with GitHub, click **Add New → Project**, and import the repo.
3. Framework preset: **Other**. Leave the build command empty. Click **Deploy**.

## Updating the site
- **Netlify Drop:** in your site's **Deploys** tab, drag the updated folder again.
- **GitHub Pages / Vercel:** upload the changed files to the repo; the site redeploys by itself.
