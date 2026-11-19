# Kavira

Kavira is a website for people who write poems in English and Hindi. You write a poem, you get put in a small circle of other poets, and everyone in the circle reads and reviews each other's poems.

This is our project for CSE326 (Internet Programming).

**Live site:** (add the Vercel link here)

## What you can do on the site

- **Join and sign in.** You need to be 16 or older. The password needs 8 characters with at least one letter and one number.
- **Home.** See every poem, newest first. You can show only English or only Hindi poems.
- **Save a poem.** Press Save, or drag the poem into the Saved box on the right.
- **My circle.** Up to 5 other poets who write in your language. You get your circle once and it stays the same.
- **Write.** A poem needs at least 80 words. A counter shows how many you have. If you refresh by mistake, your half-written poem is still there.
- **Poem page.** Read a poem and the reviews on it. A review needs at least 30 words. You can only review a poem once, and not your own.
- **Profile.** Your own poems, your saved poems and a few numbers.
- **About.** What the site is, the rules, and a page where we show audio, video, a table and drawings in plain HTML.

## How to run it on your own computer

You need VS Code and its "Live Server" extension. The site will not work if you just double-click `index.html`, because it has to load the starter poems from a file and browsers block that.

1. Open the `kavira` folder in VS Code.
2. Right-click `index.html` and choose **Open with Live Server**.

To run the tests (you need Node installed): `node tests/run.js`

## How it works, in simple words

Everything is HTML, CSS and JavaScript. There is no server we wrote ourselves.

- Each page has its own folder inside `pages`, with three files: `index.html` (what you see), `style.css` (how it looks) and `script.js` (what it does).
- Code that many pages need lives in `shared`. That is where the colours and fonts are kept, and where the rules (80 words, 30 words, 16+) are written.
- The poems, reviews and accounts are saved inside your browser.
- `data/poems.json` is a plain text file with the starter poems. JSON is just a simple way to write a list of things in text. The site reads it with `fetch` the first time you open it, so the feed is never empty.

## What is in each folder

```
kavira/
  index.html           opens the sign-in page
  data/poems.json      the starter poems and poets
  assets/              the logo, audio and video
  supabase/            the database setup (see below)
  shared/
    css/               colours and fonts, then buttons and forms, then the page layout
    js/                utils (small helpers), store (saving), auth (accounts),
                       poems, reviews, circle (the rules), poem-card and layout (what you see)
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
| Local Storage and Session Storage | `shared/js/store.js`, and the draft in `pages/write` |
| Fetch and JSON | `shared/js/seed.js` and `data/poems.json` |
| Drag and drop | `pages/home/script.js` |
| GitHub and GitHub Pages / Vercel | this repo and the live link above |

## Our rules for the code

- One folder per page, always with the same three file names.
- File and folder names are lowercase words joined with hyphens.
- Colours, fonts and sizes are only written in `tokens.css`.
- Only `store.js` saves things. Pages ask it, they never touch browser storage themselves.
- Every function has a comment above it saying what it does.

## Starting fresh

If you want to reset the site in your browser: press F12, open the Application tab, find Local Storage and clear it.

## Next step

We plan to move accounts and poems to a Supabase database, so poets on different computers can share the same circles. The setup for that is in `supabase/schema.sql`.

## Who did what

- (Your name): add what you built
- (Teammate's name): add what they did
