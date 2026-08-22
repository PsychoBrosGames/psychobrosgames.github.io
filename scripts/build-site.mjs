import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const reviews = JSON.parse(
  fs.readFileSync(path.join(rootDir, "data", "reviews.json"), "utf8"),
).sort((left, right) => right.date.localeCompare(left.date));

const siteUrl = "https://psychobrosgames.github.io/";
const modifiedDate = "2026-08-22";

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const escapeXml = escapeHtml;

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));

const shortDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));

const lensLabels = {
  "The Casual": "Dad Who Skipped the Tutorial",
  "The Tactician": "The Descent Guy",
  "The All-Rounder": "Normal-ish Dad",
};

const lensLabel = (name) => lensLabels[name] || name;

const brandMark = `
  <svg class="brand-mark" viewBox="0 0 44 44" aria-hidden="true">
    <path
      d="M9 12.5h26a5 5 0 0 1 4.72 6.66l-4.4 12.5a4.5 4.5 0 0 1-7.46 1.7L24.6 30h-5.2l-3.26 3.36a4.5 4.5 0 0 1-7.46-1.7l-4.4-12.5A5 5 0 0 1 9 12.5Z"
      fill="var(--cp-accent-soft)"
      stroke="var(--cp-accent)"
      stroke-width="2.5"
    />
    <path d="M13 21h8M17 17v8" stroke="var(--cp-accent)" stroke-width="2.5" />
    <circle cx="29" cy="19.5" r="1.75" fill="var(--cp-patina)" />
    <circle cx="33.5" cy="24" r="1.75" fill="var(--cp-accent)" />
  </svg>`;

const themeToggle = `
  <button class="icon-button theme-toggle" type="button" aria-label="Switch color theme">
    <svg class="sun-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.41M17.66 6.34l1.41-1.41" />
    </svg>
    <svg class="moon-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.7 14.1A8 8 0 0 1 9.9 3.3 8.5 8.5 0 1 0 20.7 14.1Z" />
    </svg>
  </button>`;

const header = (prefix, active) => {
  const links = [
    ["reviews", `${prefix}reviews/`, "Reviews"],
    ["pax", `${prefix}pax-west-2025/`, "The PAX Pile"],
    ["crew", `${prefix}about/#crew`, "The Dads"],
    ["about", `${prefix}about/`, "Fine Print"],
  ];
  const linkMarkup = links
    .map(
      ([key, href, label]) =>
        `<a href="${href}"${active === key ? ' aria-current="page"' : ""}>${label}</a>`,
    )
    .join("\n");

  return `
    <header class="site-header" data-header>
      <div class="shell header-inner">
        <a class="brand" href="${prefix}" aria-label="PsychoBros home">
          ${brandMark}
          <span>PSYCHO<span>BROS</span></span>
        </a>
        <nav class="desktop-nav" aria-label="Main navigation">
          ${linkMarkup}
        </nav>
        <div class="header-actions">
          ${themeToggle}
          <button
            class="icon-button menu-toggle"
            type="button"
            aria-expanded="false"
            aria-controls="mobile-nav"
            aria-label="Open navigation"
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
      <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation" aria-hidden="true" inert>
        ${linkMarkup}
      </nav>
    </header>`;
};

const footer = (prefix) => `
  <footer class="site-footer">
    <div class="shell footer-grid">
      <div>
        <a class="brand footer-brand" href="${prefix}" aria-label="PsychoBros home">
          ${brandMark}
          <span>PSYCHO<span>BROS</span></span>
        </a>
        <p>Game reviews from three dads, one group chat, and a suspicious number of opinions after bedtime.</p>
      </div>
      <div class="footer-nav">
        <p>Read stuff</p>
        <a href="${prefix}reviews/">All the overthinking</a>
        <a href="${prefix}pax-west-2025/">The PAX pile</a>
      </div>
      <div class="footer-nav">
        <p>Responsible adult stuff</p>
        <a href="${prefix}about/#crew">Meet the dads</a>
        <a href="${prefix}about/#standards">How we stay honest</a>
        <a href="${prefix}about/#press">Press, parties &amp; snacks</a>
      </div>
    </div>
    <div class="shell footer-bottom">
      <p>&copy; <span data-year></span> PsychoBros. Built after the kids went to bed. Mostly.</p>
      <a href="#top">Back to top &uarr;</a>
    </div>
  </footer>`;

const pageHead = ({
  title,
  description,
  canonical,
  prefix,
  type = "website",
  structuredData,
}) => `
  <head>
    <meta charset="UTF-8" />
    <script>
      (() => {
        const supportedThemes = new Set(["light", "dark"]);
        const param = new URLSearchParams(window.location.search).get("scoutTheme");
        const saved = localStorage.getItem("psychobros-theme");
        const theme =
          (supportedThemes.has(param) && param) ||
          (supportedThemes.has(saved) && saved) ||
          (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("psychobros-theme", theme);
      })();
    </script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${siteUrl}assets/psychobros-social-card.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="PsychoBros: three dads, zero media training" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="${siteUrl}assets/psychobros-social-card.png" />
    <title>${escapeHtml(title)}</title>
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" href="${prefix}assets/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Albert+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800&family=Barlow+Condensed:wght@600;700;800;900&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="${prefix}styles.css" />
    ${structuredData ? `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>` : ""}
  </head>`;

const pageShell = ({
  head,
  body,
  prefix = "",
  active = "",
  bodyClass = "",
}) => `<!doctype html>
<html lang="en">
${head}
  <body class="${bodyClass}">
    <a class="skip-link" href="#main">Skip to content</a>
    ${header(prefix, active)}
    ${body}
    ${footer(prefix)}
    <script src="${prefix}script.js"></script>
  </body>
</html>
`;

const reviewCard = (review, prefix, size = "standard") => `
  <article
    class="review-card review-card-${size} reveal"
    data-review-card
    data-review-title="${escapeHtml(review.title.toLowerCase())}"
    data-review-studio="${escapeHtml(review.studio.toLowerCase())}"
    data-review-genre="${escapeHtml(review.genre.toLowerCase())}"
    data-review-group="${escapeHtml(review.groupKey)}"
  >
    <a class="review-card-art" href="${prefix}reviews/${review.slug}/" aria-label="Read ${escapeHtml(review.title)} review">
      <img src="${prefix}assets/reviews/${review.slug}.svg" alt="" loading="lazy" />
    </a>
    <div class="review-card-body">
      <div class="review-meta">
        <span>${escapeHtml(review.genre)}</span>
        <time datetime="${review.date}">${shortDate(review.date)}</time>
      </div>
      <h3><a href="${prefix}reviews/${review.slug}/">${escapeHtml(review.title)}</a></h3>
      <p class="review-card-dad-take">${escapeHtml(review.dadTake)}</p>
      <div class="review-card-footer">
        <span>${escapeHtml(review.studio)}</span>
        <a class="text-link" href="${prefix}reviews/${review.slug}/">Read the overthink <span aria-hidden="true">&rarr;</span></a>
      </div>
    </div>
  </article>`;

const reviewLedger = (items, prefix) => `
  <div class="review-ledger">
    ${items
      .map(
        (review, index) => `
      <a class="review-ledger-row reveal" href="${prefix}reviews/${review.slug}/">
        <span class="review-ledger-index">${String(index + 1).padStart(2, "0")}</span>
        <span class="review-ledger-title">${escapeHtml(review.title)}</span>
        <span class="review-ledger-genre">${escapeHtml(review.genre)}</span>
        <time datetime="${review.date}">${shortDate(review.date)}</time>
        <span aria-hidden="true">&rarr;</span>
      </a>`,
      )
      .join("")}
  </div>`;

const homePage = () => {
  const featured = reviews.find((review) => review.featured) || reviews[0];
  const latest = reviews.filter((review) => review.slug !== featured.slug).slice(0, 5);
  const description =
    "Three dads review games between school pickup, bedtime, and one man's ongoing Descent monologue.";

  return pageShell({
    active: "",
    head: pageHead({
      title: "PsychoBros - Game reviews after bedtime",
      description,
      canonical: siteUrl,
      prefix: "",
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "PsychoBros",
        url: siteUrl,
        description,
        sameAs: ["https://github.com/PsychoBrosGames"],
      },
    }),
    bodyClass: "publication-site home-page",
    body: `
      <main id="main" class="publication-main">
        <section class="review-hero" id="top">
          <div class="shell review-hero-grid">
            <div class="review-hero-copy reveal">
              <p class="dad-sticker">Three dads. No adult supervision.</p>
              <p class="eyebrow"><span></span> Featured dad argument / ${formatDate(featured.date)}</p>
              <p class="review-hero-game">${escapeHtml(featured.genre)} &middot; ${escapeHtml(featured.studio)}</p>
              <h1>${escapeHtml(featured.title)}</h1>
              <p class="review-hero-deck">${escapeHtml(featured.deck)}</p>
              <div class="review-hero-verdict">
                <span>Dad verdict</span>
                <strong>${escapeHtml(featured.dadTake)}</strong>
              </div>
              <a class="button button-primary" href="reviews/${featured.slug}/">
                Read the whole overthink <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
            <a class="review-hero-art reveal" href="reviews/${featured.slug}/" aria-label="Read ${escapeHtml(featured.title)} review">
              <img src="assets/reviews/${featured.slug}.svg" alt="" />
            </a>
          </div>
        </section>

        <section class="review-strip" aria-label="Latest review coverage">
          <div class="shell review-strip-inner">
            <span>20 indie rabbit holes</span>
            <span>3 dad opinions per game</span>
            <span>0 matching bedtimes</span>
          </div>
        </section>

        <section class="section latest-review-section" aria-labelledby="latest-title">
          <div class="shell">
            <div class="publication-section-head reveal">
              <div>
                <p class="section-index">01 / New nonsense</p>
                <h2 id="latest-title">Fresh from the folding-table newsroom.</h2>
              </div>
              <a class="text-link" href="reviews/">See all 20 questionable decisions <span aria-hidden="true">&rarr;</span></a>
            </div>
            <div class="review-card-grid">
              ${latest.map((review) => reviewCard(review, "")).join("")}
            </div>
          </div>
        </section>

        <section class="section pax-ledger-section" aria-labelledby="pax-ledger-title">
          <div class="shell">
            <div class="publication-section-head reveal">
              <div>
                <p class="section-index">02 / The PAX pile</p>
                <h2 id="pax-ledger-title">Twenty indies we would not shut up about.</h2>
              </div>
              <p>We went looking for one neat list and found a paperwork boss fight. Here are the official PAX Rising games plus eight more indies from the official event page.</p>
            </div>
            ${reviewLedger(reviews, "")}
            <div class="ledger-action reveal">
              <a class="button button-secondary" href="pax-west-2025/">Dig through the whole PAX pile</a>
            </div>
          </div>
        </section>

        <section class="section home-lens-section" id="what-we-do" aria-labelledby="home-lens-title">
          <div class="shell home-lens-grid">
            <div class="reveal">
              <p class="section-index">03 / The dad tribunal</p>
              <h2 id="home-lens-title">Three dads enter. One usable verdict leaves.</h2>
            </div>
            <div class="home-lens-list">
              <article class="reveal">
                <span>01</span>
                <h3>Dad Who Skipped the Tutorial</h3>
                <p>Plays six games a year and keeps asking what all fourteen currencies are for.</p>
              </article>
              <article class="reveal">
                <span>02</span>
                <h3>The Descent Guy</h3>
                <p>Will explain line of sight, campaign balance, and Descent whether prompted or not.</p>
              </article>
              <article class="reveal">
                <span>03</span>
                <h3>Normal-ish Dad</h3>
                <p>Plays a healthy amount and stops the other two from reviewing the loading screen.</p>
              </article>
            </div>
          </div>
        </section>
      </main>`,
  });
};

const reviewsPage = () =>
  pageShell({
    prefix: "../",
    active: "reviews",
    bodyClass: "publication-site",
    head: pageHead({
      title: "Game reviews and dad arguments - PsychoBros",
      description: "Browse every PsychoBros game review and filter by title, studio, genre, or PAX West showcase group.",
      canonical: `${siteUrl}reviews/`,
      prefix: "../",
    }),
    body: `
      <main id="main" class="publication-main">
        <section class="archive-hero" id="top">
          <div class="shell archive-hero-grid">
            <div class="reveal">
              <p class="eyebrow"><span></span> The backlog won</p>
              <h1>Reviews, hot takes, and one dad who skipped the tutorial.</h1>
            </div>
            <p class="archive-hero-copy reveal">Search by game, studio, or genre. We cannot filter by “the one where Dave yelled at the inventory,” but we are working on it.</p>
          </div>
        </section>
        <section class="section archive-section" aria-labelledby="archive-title">
          <div class="shell">
            <div class="review-tools reveal">
              <label>
                <span>Search the pile</span>
                <input type="search" placeholder="Game, studio, genre, bad decision..." data-review-search />
              </label>
              <label>
                <span>Which pile?</span>
                <select data-review-group>
                  <option value="all">Everything we argued about</option>
                  <option value="pax-rising">PAX Rising Showcase</option>
                  <option value="official-pax">Additional official PAX entries</option>
                </select>
              </label>
              <p role="status" aria-live="polite" aria-atomic="true">
                <strong data-review-count>${reviews.length}</strong>
                <span data-review-label>arguments found</span>
              </p>
            </div>
            <h2 class="visually-hidden" id="archive-title">All reviews</h2>
            <div class="review-card-grid review-card-grid-archive" data-review-results>
              ${reviews.map((review) => reviewCard(review, "../")).join("")}
            </div>
            <p class="review-empty" data-review-empty hidden>Nope. Try a less specific dad word.</p>
          </div>
        </section>
      </main>`,
  });

const paxPage = () =>
  pageShell({
    prefix: "../",
    active: "pax",
    bodyClass: "publication-site",
    head: pageHead({
      title: "PAX West 2025 indie pile - PsychoBros",
      description: "Twenty PsychoBros retrospective reviews of indie games featured on the official PAX West 2025 event page.",
      canonical: `${siteUrl}pax-west-2025/`,
      prefix: "../",
    }),
    body: `
      <main id="main" class="publication-main">
        <section class="collection-hero" id="top">
          <div class="shell collection-hero-grid">
            <div class="reveal">
              <p class="eyebrow"><span></span> Aug. 29 - Sept. 1, 2025 / Seattle / comfortable shoes required</p>
              <h1>PAX West 2025<br /> <span>the giant indie pile.</span></h1>
            </div>
            <div class="collection-note reveal">
              <p class="section-index">Receipts, because apparently this is journalism</p>
              <p>This retrospective uses the official PAX West 2025 Steam event archive. Twelve games are verified PAX Rising Showcase selections; eight more are additional indie titles surfaced on the same official event page.</p>
              <p>Indie MEGABOOTH did not publish a standalone 20-game PAX West 2025 lineup that we could independently verify, so the archive labels the two groups precisely.</p>
            </div>
          </div>
        </section>
        <section class="section collection-section" aria-labelledby="collection-title">
          <div class="shell">
            <div class="publication-section-head reveal">
              <div>
                <p class="section-index">September 2025 / 20 extremely normal obsessions</p>
                <h2 id="collection-title">The whole beautiful mess.</h2>
              </div>
              <p>Short reviews about the pitch, the systems, and which dad will still be talking about the demo while everyone else is trying to find dinner.</p>
            </div>
            ${reviewLedger(reviews, "../")}
          </div>
        </section>
      </main>`,
  });

const aboutPage = () =>
  pageShell({
    prefix: "../",
    active: "about",
    bodyClass: "publication-site",
    head: pageHead({
      title: "Meet the PsychoBros dads",
      description: "Meet the three PsychoBros perspectives, read the editorial standards, and find press and partnership information.",
      canonical: `${siteUrl}about/`,
      prefix: "../",
    }),
    body: `
      <main id="main" class="publication-main">
        <section class="about-hero" id="top">
          <div class="shell about-hero-grid">
            <div class="reveal">
              <p class="eyebrow"><span></span> About the highly trained professionals</p>
              <h1>Three dads.<br /><span>Zero media training.</span></h1>
            </div>
            <p class="reveal">This started as three friends arguing about games and accidentally became a website. One barely plays, one has Descent opinions, and one is doing his best to keep this normal.</p>
          </div>
        </section>

        <section class="section about-crew-section" id="crew" aria-labelledby="crew-title">
          <div class="shell">
            <div class="publication-section-head reveal">
              <div>
                <p class="section-index">01 / Meet the dads</p>
                <h2 id="crew-title">A balanced party, if you squint.</h2>
              </div>
              <p>Our disagreement is the format. Our production studio is whichever room has the fewest LEGO bricks on the floor.</p>
            </div>
            <div class="about-role-list">
              <article class="reveal">
                <span>Dad 01</span>
                <h3>Dad Who Skipped the Tutorial</h3>
                <p>Plays roughly six games a year and therefore asks the questions normal humans ask. Frequently wonders why there are fourteen currencies.</p>
                <strong>Clarity / first-hour fun / “which button?”</strong>
              </article>
              <article class="reveal">
                <span>Dad 02</span>
                <h3>The Descent Guy</h3>
                <p>Owns opinions about line of sight, campaign design, and Descent expansions nobody else remembers asking about.</p>
                <strong>Systems / strategy / one more Descent story</strong>
              </article>
              <article class="reveal">
                <span>Dad 03</span>
                <h3>Normal-ish Dad</h3>
                <p>Actually plays a healthy amount of games and keeps the other two from turning every review into a hostage situation.</p>
                <strong>Time value / group fit / adult supervision</strong>
              </article>
            </div>
          </div>
        </section>

        <section class="section standards-section" id="standards" aria-labelledby="standards-title">
          <div class="shell standards-grid">
            <div class="standards-copy reveal">
              <p class="eyebrow"><span></span> The surprisingly serious part</p>
              <h2 id="standards-title">We joke around. The disclosures do not.</h2>
              <p>Access is useful. Trust is essential. Whether a game is bought, borrowed, previewed, or handed to us next to a tray of tiny sandwiches, you get the same context.</p>
            </div>
            <div class="standards-list">
              <article class="standard-item reveal"><span>01</span><div><h3>Tell you who paid for what</h3><p>Keys, travel, sponsorships, and suspiciously fancy appetizers get labeled clearly.</p></div></article>
              <article class="standard-item reveal"><span>02</span><div><h3>No sponsor gets the controller</h3><p>Partners can sponsor access or production. The opinion stays in our grubby dad hands.</p></div></article>
              <article class="standard-item reveal"><span>03</span><div><h3>Respect your tiny pocket of free time</h3><p>Every piece should inform, entertain, or ideally both before someone needs a snack.</p></div></article>
              <article class="standard-item reveal"><span>04</span><div><h3>Say what we actually reviewed</h3><p>Demo, preview build, public materials, or final release: no pretending we played something we did not.</p></div></article>
            </div>
          </div>
        </section>

        <section class="section press-section" id="press" aria-labelledby="press-title">
          <div class="shell press-grid">
            <div class="reveal">
              <p class="section-index">02 / Press, parties &amp; tiny sandwiches</p>
              <h2 id="press-title">Need three middle-aged men near a canapé?</h2>
            </div>
            <div class="reveal">
              <p>Available for review coverage, creator activations, developer interviews, indie showcases, and event access. We clean up reasonably well. Editorial independence is still not part of the negotiation.</p>
              <a class="button button-primary" href="https://github.com/PsychoBrosGames" target="_blank" rel="noreferrer">Summon the dads</a>
            </div>
          </div>
        </section>
      </main>`,
  });

const reviewPage = (review, index) => {
  const previous = reviews[index - 1];
  const next = reviews[index + 1];
  const canonical = `${siteUrl}reviews/${review.slug}/`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Review",
    name: `${review.title} review`,
    headline: review.deck,
    datePublished: review.date,
    dateModified: modifiedDate,
    url: canonical,
    author: {
      "@type": "Organization",
      name: "PsychoBros",
      url: siteUrl,
    },
    itemReviewed: {
      "@type": "VideoGame",
      name: review.title,
      author: {
        "@type": "Organization",
        name: review.studio,
      },
      gamePlatform: review.platforms,
      genre: review.genre,
    },
    reviewBody: review.verdict,
  };

  return pageShell({
    prefix: "../../",
    active: "reviews",
    bodyClass: "publication-site",
    head: pageHead({
      title: `${review.title} review - PsychoBros`,
      description: review.deck,
      canonical,
      prefix: "../../",
      type: "article",
      structuredData,
    }),
    body: `
      <main id="main" class="publication-main">
        <article class="review-article" id="top">
          <header class="review-article-hero">
            <div class="shell">
              <nav class="breadcrumb" aria-label="Breadcrumb">
                <a href="../../">Home</a><span>/</span><a href="../">Reviews</a><span>/</span><span aria-current="page">${escapeHtml(review.title)}</span>
              </nav>
              <div class="review-article-hero-grid">
                <div class="reveal">
                  <p class="eyebrow"><span></span> ${escapeHtml(review.group)}</p>
                  <h1>${escapeHtml(review.title)}</h1>
                  <p class="review-article-deck">${escapeHtml(review.deck)}</p>
                  <p class="review-article-dad-take">${escapeHtml(review.dadTake)}</p>
                  <dl class="review-facts">
                    <div><dt>Developer</dt><dd>${escapeHtml(review.studio)}</dd></div>
                    <div><dt>Genre</dt><dd>${escapeHtml(review.genre)}</dd></div>
                    <div><dt>Platforms</dt><dd>${escapeHtml(review.platforms)}</dd></div>
                    <div><dt>At PAX</dt><dd>${escapeHtml(review.statusAtShow)}</dd></div>
                  </dl>
                </div>
                <img class="review-article-cover reveal" src="../../assets/reviews/${review.slug}.svg" alt="" />
              </div>
              <div class="review-byline">
                <span>By three dads with one shared calendar</span>
                <time datetime="${review.date}">${formatDate(review.date)}</time>
                <span>PAX 2025 time capsule</span>
              </div>
            </div>
          </header>

          <div class="shell review-article-layout">
            <aside class="review-verdict reveal" aria-label="Quick verdict">
              <p class="section-index">The 30-second dad verdict</p>
              <p class="review-verdict-joke">${escapeHtml(review.dadTake)}</p>
              <h2>${escapeHtml(review.verdictTitle)}</h2>
              <p>${escapeHtml(review.verdict)}</p>
              <dl>
                ${review.lenses
                  .map(
                    (lens) =>
                      `<div><dt>${escapeHtml(lensLabel(lens.name))}</dt><dd>${escapeHtml(lens.signal)}</dd></div>`,
                  )
                  .join("")}
              </dl>
            </aside>

            <div class="review-copy">
              <section class="reveal" aria-labelledby="review-overview-title">
                <h2 class="section-index" id="review-overview-title">Okay, what is this thing?</h2>
                ${review.overview.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
              </section>

              <section class="review-system-section reveal" aria-labelledby="review-system-title">
                <h2 class="section-index" id="review-system-title">Why it escaped the group chat</h2>
                <ul class="review-system-list">
                  ${review.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join("")}
                </ul>
              </section>

              <section class="review-perspectives" aria-labelledby="perspectives-title">
                <p class="section-index">The dad tribunal</p>
                <h2 id="perspectives-title">Three dads enter. Agreement remains unlikely.</h2>
                <div class="review-perspective-list">
                  ${review.lenses
                    .map(
                      (lens, lensIndex) => `
                    <article class="reveal">
                      <span>0${lensIndex + 1}</span>
                      <div>
                        <p>${escapeHtml(lensLabel(lens.name))}</p>
                        <h3>${escapeHtml(lens.headline)}</h3>
                        <p>${escapeHtml(lens.body)}</p>
                      </div>
                    </article>`,
                    )
                    .join("")}
                </div>
              </section>

              <section class="review-fit-grid reveal" aria-labelledby="review-fit-title">
                <h2 class="visually-hidden" id="review-fit-title">Who should play and what to watch for</h2>
                <div>
                  <h3 class="section-index">Invite these people</h3>
                  <ul>${review.bestFor.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                </div>
                <div>
                  <h3 class="section-index">Dad caveats</h3>
                  <ul>${review.watchFor.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                </div>
              </section>

              <section class="review-disclosure reveal" aria-labelledby="review-disclosure-title">
                <h2 class="section-index" id="review-disclosure-title">Receipts, because apparently this is journalism</h2>
                <p>${escapeHtml(review.reviewBasis)}</p>
                <ul>
                  ${review.sources
                    .map(
                      (source) =>
                        `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)}</a></li>`,
                    )
                    .join("")}
                </ul>
              </section>
            </div>
          </div>

          <nav class="shell review-pagination" aria-label="More reviews">
            ${
              previous
                ? `<a href="../${previous.slug}/"><span>Newer nonsense</span><strong>${escapeHtml(previous.title)}</strong></a>`
                : "<span></span>"
            }
            ${
              next
                ? `<a href="../${next.slug}/"><span>Older nonsense</span><strong>${escapeHtml(next.title)}</strong></a>`
                : "<span></span>"
            }
          </nav>
        </article>
      </main>`,
  });
};

const wrapTitle = (title, lineLength = 20) => {
  const words = title.split(" ");
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > lineLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 3);
};

const reviewCover = (review, index) => {
  const titleLines = wrapTitle(review.title);
  const seed = [...review.slug].reduce((total, character) => total + character.charCodeAt(0), 0);
  const x = 590 + (seed % 180);
  const y = 100 + (seed % 120);
  const radius = 120 + (seed % 90);
  const greenFirst = index % 3 === 1;
  const accent = greenFirst ? "oklch(78% 0.19 145)" : "oklch(66% 0.24 20)";
  const secondary = greenFirst ? "oklch(66% 0.24 20)" : "oklch(78% 0.19 145)";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(review.title)} review artwork</title>
  <desc id="desc">Original geometric PsychoBros artwork for ${escapeXml(review.title)}.</desc>
  <rect width="1200" height="675" fill="oklch(10% 0.015 20)"/>
  <path d="M0 1h1200M0 674h1200M600 0v675" stroke="oklch(96% 0.01 95 / 0.16)"/>
  <g fill="none" stroke="${accent}" opacity="0.9">
    <circle cx="${x}" cy="${y}" r="${radius}" stroke-width="12"/>
    <circle cx="${x + 170}" cy="${y + 180}" r="${Math.round(radius * 0.62)}" stroke-width="20"/>
    <path d="M${x - 240} ${y + 280}  ${x + 280} ${y - 30}  ${x + 460} ${y + 280}" stroke-width="12"/>
  </g>
  <path d="M760 0h440v675H890Z" fill="${accent}" opacity="0.2"/>
  <path d="M900 0h300v675H1060Z" fill="${secondary}" opacity="0.15"/>
  <circle cx="1050" cy="118" r="24" fill="${secondary}"/>
  <rect x="84" y="70" width="268" height="58" fill="${accent}"/>
  <text x="104" y="108" fill="oklch(98% 0.005 95)" font-family="Arial Black, Arial, sans-serif" font-size="20" letter-spacing="3">DAD REVIEW ${String(index + 1).padStart(2, "0")}</text>
  ${titleLines
    .map(
      (line, lineIndex) =>
        `<text x="82" y="${390 + lineIndex * 78}" fill="oklch(96% 0.01 95)" font-family="Arial Black, Arial, sans-serif" font-size="70" font-weight="900">${escapeXml(line)}</text>`,
    )
    .join("\n")}
  <text x="84" y="620" fill="oklch(76% 0.01 95)" font-family="Albert Sans, Arial, sans-serif" font-size="22">${escapeXml(review.studio)} / ${escapeXml(review.genre)}</text>
  <text x="1114" y="620" fill="${accent}" font-family="Arial Black, Arial, sans-serif" font-size="20" text-anchor="end">PSYCHOBROS</text>
</svg>`;
};

const writeFile = (relativePath, content) => {
  const destination = path.join(rootDir, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const normalized = content.replace(/[ \t]+$/gm, "").replace(/\n*$/, "\n");
  fs.writeFileSync(destination, normalized);
};

writeFile("index.html", homePage());
writeFile(path.join("reviews", "index.html"), reviewsPage());
writeFile(path.join("pax-west-2025", "index.html"), paxPage());
writeFile(path.join("about", "index.html"), aboutPage());

reviews.forEach((review, index) => {
  writeFile(path.join("reviews", review.slug, "index.html"), reviewPage(review, index));
  writeFile(path.join("assets", "reviews", `${review.slug}.svg`), reviewCover(review, index));
});

const sitemapUrls = [
  siteUrl,
  `${siteUrl}reviews/`,
  `${siteUrl}pax-west-2025/`,
  `${siteUrl}about/`,
  ...reviews.map((review) => `${siteUrl}reviews/${review.slug}/`),
];

writeFile(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
    <changefreq>${url === siteUrl ? "weekly" : "monthly"}</changefreq>
    <priority>${url === siteUrl ? "1.0" : "0.8"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`,
);

console.log(`Built ${reviews.length} reviews and ${sitemapUrls.length} sitemap URLs.`);
