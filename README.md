# Kavira

Kavira is a website for people who write poems in English and Hindi. You write a poem, you get put in a small circle of other poets, and everyone in the circle reads and reviews each other's poems.

This is our project for CSE326 (Internet Programming).

**Live site:** https://kavira-zeta.vercel.app/

## What you can do on the site

- **Join and sign in.** You need to be 16 or older. The password needs 8 characters with at least one letter and one number.
- **Home.** See every poem, newest first. You can show only English or only Hindi poems.
- **Save a poem.** Press Save, or drag the poem into the Saved box on the right.
- **My circle.** Up to 5 other poets who write in your language. You get your circle once and it stays the same.
- **Write.** A poem needs at least 80 words. A counter shows how many you have. If you refresh by mistake, your half-written poem is still there.
- **Poem page.** Read a poem and the reviews on it. A review needs at least 30 words. You can only review a poem once, and not your own.
- **Profile.** Your own poems, your saved poems and a few numbers.
- **About.** What the site is, the rules, and a page where we show audio, video, a table and drawings in plain HTML.


## How it works, in simple words

Everything is HTML, CSS and JavaScript. There is no server we wrote ourselves.

- Each page has its own folder inside `pages`, with three files: `index.html` (what you see), `style.css` (how it looks) and `script.js` (what it does).
- Code that many pages need lives in `shared`. That is where the colours and fonts are kept, and where the rules (80 words, 30 words, 16+) are written.
- Accounts, poems, reviews and saved poems are stored online in a **Supabase** database (Supabase is a free service that gives you a database and a login system). Everyone who uses the site sees the same poems, and your circle is the same on every device.
- The database itself checks the rules (80 words, 30 words, one review per poem, no review on your own poem, 16 or older), so they cannot be skipped even by someone clever.
- `data/poems.json` is a plain text file with sample poems. JSON is just a simple way to write a list of things in text. If the database cannot be reached, the site reads this file with `fetch` and shows the sample poems instead of an empty page.


## What is in each folder

```
kavira/
  index.html           opens the sign-in page
  data/poems.json      sample poems, used only if the database cannot be reached
  assets/              the logo, audio and video
  supabase/schema.sql  the database: tables, security rules, circle picker, starter poems
  shared/
    css/               colours and fonts, then buttons and forms, then the page layout
    js/                config and db (connection to Supabase), utils (small helpers),
                       store (browser storage), auth (accounts), poems, reviews, circle
                       (loading and saving), poem-card and layout (what you see)
  pages/               sign-in, join, home, circle, write, poem, profile, about, rules
  tests/run.js         checks that the rules work
```

## Where the course topics are used

| Topic | Where to find it |
|---|---|
| HTML structure, forms, tables, SVG, audio, video, iframe | every page, and `pages/about` |
| Flexbox, Grid, responsive layout | `shared/css/layout.css` |
| CSS variables | `shared/css/tokens.css` |
| Hover and focus effects, transitions, animation | `shared/css/components.css` |
| JavaScript functions, arrays, objects | everything in `shared/js` |
| Events and changing the page | the `script.js` in each page folder |
| Checking forms with regular expressions | `shared/js/auth.js` and `shared/js/utils.js` |
| Dates and times | `shared/js/utils.js` (age check, "3 hours ago") |
| Local Storage and Session Storage | `shared/js/store.js`: language filter in `pages/home`, draft in `pages/write` |
| Fetch, JSON and async/await | `shared/js/poems.js` (sample file), `data/poems.json`, and every call to Supabase |
| Drag and drop | `pages/home/script.js` |
| GitHub and GitHub Pages / Vercel | this repo and the live link above |

## Our rules for the code

- One folder per page, always with the same three file names.
- File and folder names are lowercase words joined with hyphens.
- Colours, fonts and sizes are only written in `tokens.css`.
- Only `store.js` saves things. Pages ask it, they never touch browser storage themselves.
- Every function has a comment above it saying what it does.


The URL and publishable key in `config.js` are meant to be public. Never put the secret or service_role key in the code.

## Who did what

Vineet Bahan Vinayak – Came up with the idea of Kavira and planned what the site should do and which pages it needs. Wrote and modified the HTML and JavaScript for the pages and made sure all files, scripts and styles link to each other correctly. Created the GitHub repository and uploaded the project. Set up the Supabase database and connected it to the site. AI assistance was used as a reference for the code and the Supabase setup, which are outside our syllabus, the code was then adapted and integrated by us.

Rawnak Raj – Designed the look of the website and wrote the CSS. Created the sample poet profiles and poems in the JSON file. Tested the code and the website page by page and recorded the results in the testing report. Deployed the project on Vercel.
