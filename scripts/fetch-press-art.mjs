/**
 * Fetch official press art for every reviewed game.
 *
 * Source of truth is the Steam store listing already cited in each review's
 * `sources` array. Steam store assets (capsule/header key art and screenshots)
 * are publisher-supplied marketing material intended for store and editorial
 * use, which is exactly how this site uses them: alongside editorial coverage
 * of that specific game, credited to the developer and publisher.
 *
 * This script is deliberately committed so the provenance of every image in
 * assets/press/ is reproducible and auditable rather than a one-off scrape.
 *
 *   node scripts/fetch-press-art.mjs
 */

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REVIEWS = path.join(root, 'data', 'reviews.json');
const MANIFEST = path.join(root, 'data', 'press-art.json');
const OUT_DIR = path.join(root, 'assets', 'press');

const SHOTS_PER_GAME = 3;
const DELAY_MS = 350;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Normalize a title so "Akiiwan: Relaxing Survival" can be matched to "Akiiwan". */
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[\u2018\u2019\u201c\u201d]/g, "'")
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function titlesAgree(ours, theirs) {
  const a = norm(ours);
  const b = norm(theirs);
  if (!a || !b) return false;
  if (a === b) return true;
  // Our titles sometimes carry a descriptive subtitle the store page omits.
  const aBase = norm(String(ours).split(':')[0]);
  const bBase = norm(String(theirs).split(':')[0]);
  return a.startsWith(b) || b.startsWith(a) || aBase === bBase || a.includes(b) || b.includes(a);
}

function appIdFor(review) {
  for (const src of review.sources || []) {
    const m = /\/app\/(\d+)/.exec(src.url || '');
    if (m) return m[1];
  }
  return null;
}

async function getJson(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'PsychoBros-PressArt/1.0 (+https://psychobrosgames.github.io)',
      Accept: 'application/json'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'PsychoBros-PressArt/1.0 (+https://psychobrosgames.github.io)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return buf.length;
}

/** Steam appends a `?t=` cache-buster we do not want in the recorded provenance. */
const stripQuery = (u) => String(u || '').split('?')[0];

const reviews = JSON.parse(await readFile(REVIEWS, 'utf8'));

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

const manifest = {};
const problems = [];
let totalBytes = 0;

for (const review of reviews) {
  const appid = appIdFor(review);
  if (!appid) {
    problems.push(`${review.slug}: no Steam app id in sources`);
    continue;
  }

  let payload;
  try {
    payload = await getJson(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=us&l=english`
    );
  } catch (err) {
    problems.push(`${review.slug}: appdetails failed - ${err.message}`);
    await sleep(DELAY_MS);
    continue;
  }

  const entry = payload?.[appid];
  if (!entry?.success || !entry.data) {
    problems.push(`${review.slug}: appdetails returned no data for app ${appid}`);
    await sleep(DELAY_MS);
    continue;
  }

  const data = entry.data;
  if (!titlesAgree(review.title, data.name)) {
    problems.push(
      `${review.slug}: TITLE MISMATCH - ours "${review.title}" vs steam "${data.name}" (app ${appid})`
    );
  }

  const dir = path.join(OUT_DIR, review.slug);
  await mkdir(dir, { recursive: true });

  const record = {
    appid,
    steamName: data.name,
    developers: data.developers || [],
    publishers: data.publishers || [],
    storeUrl: `https://store.steampowered.com/app/${appid}/`,
    fetchedAt: new Date().toISOString(),
    header: null,
    shots: []
  };

  if (data.header_image) {
    const dest = path.join(dir, 'header.jpg');
    try {
      totalBytes += await download(data.header_image, dest);
      record.header = {
        file: `assets/press/${review.slug}/header.jpg`,
        origin: stripQuery(data.header_image)
      };
    } catch (err) {
      problems.push(`${review.slug}: header download failed - ${err.message}`);
    }
  } else {
    problems.push(`${review.slug}: no header_image on store listing`);
  }

  const shots = (data.screenshots || []).slice(0, SHOTS_PER_GAME);
  for (let i = 0; i < shots.length; i += 1) {
    const url = shots[i].path_full || shots[i].path_thumbnail;
    if (!url) continue;
    const name = `shot-${i + 1}.jpg`;
    try {
      totalBytes += await download(url, path.join(dir, name));
      record.shots.push({
        file: `assets/press/${review.slug}/${name}`,
        origin: stripQuery(url)
      });
    } catch (err) {
      problems.push(`${review.slug}: ${name} download failed - ${err.message}`);
    }
  }

  manifest[review.slug] = record;
  const shotCount = String(record.shots.length);
  console.log(
    `ok  ${review.slug.padEnd(28)} app ${appid.padEnd(8)} header:${record.header ? 'y' : 'n'} shots:${shotCount}  ${data.name}`
  );

  await sleep(DELAY_MS);
}

await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log('\n--- summary ---');
console.log(`games with art : ${Object.keys(manifest).length} / ${reviews.length}`);
console.log(`downloaded     : ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
console.log(`manifest       : ${path.relative(root, MANIFEST)}`);

if (problems.length) {
  console.log(`\n--- ${problems.length} problem(s) ---`);
  for (const p of problems) console.log(`  ! ${p}`);
} else {
  console.log('\nno problems.');
}
