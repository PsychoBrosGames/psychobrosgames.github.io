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
    ["pax", `${prefix}pax-west-2025/`, "PAX West 2025"],
    ["crew", `${prefix}about/#crew`, "Crew"],
    ["about", `${prefix}about/`, "About"],
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
        <p>Independent game reviews from three players with three very different save files.</p>
      </div>
      <div class="footer-nav">
        <p>Read</p>
        <a href="${prefix}reviews/">All reviews</a>
        <a href="${prefix}pax-west-2025/">PAX West 2025</a>
      </div>
      <div class="footer-nav">
        <p>About</p>
        <a href="${prefix}about/#crew">The crew</a>
        <a href="${prefix}about/#standards">Editorial standards</a>
        <a href="${prefix}about/#press">Press &amp; partnerships</a>
      </div>
    </div>
    <div class="shell footer-bottom">
      <p>&copy; <span data-year></span> PsychoBros. Built after the kids went to bed.</p>
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
    <meta property="og:image:alt" content="PsychoBros game reviews" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="${siteUrl}assets/psychobros-social-card.png" />
    <title>${escapeHtml(title)}</title>
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" href="${prefix}assets/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Albert+Sans:ital,wght@0,400;0,500;0,600;0,700&family=Alumni+Sans:ital,wght@0,100;0,300;0,400;0,600&display=swap"
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
      <p>${escapeHtml(review.deck)}</p>
      <div class="review-card-footer">
        <span>${escapeHtml(review.studio)}</span>
        <a class="text-link" href="${prefix}reviews/${review.slug}/">Read review <span aria-hidden="true">&rarr;</span></a>
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
  const latest = reviews.filter((review) => review.slug !== featured.slug).slice(0, 6);
  const description =
    "PsychoBros reviews indie games through three perspectives: the Casual, the Tactician, and the All-Rounder.";

  return pageShell({
    active: "",
    head: pageHead({
      title: "PsychoBros - Independent game reviews",
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
              <p class="eyebrow"><span></span> Featured review / ${formatDate(featured.date)}</p>
              <p class="review-hero-game">${escapeHtml(featured.genre)} &middot; ${escapeHtml(featured.studio)}</p>
              <h1>${escapeHtml(featured.title)}</h1>
              <p class="review-hero-deck">${escapeHtml(featured.deck)}</p>
              <div class="review-hero-verdict">
                <span>PsychoBros take</span>
                <strong>${escapeHtml(featured.verdictTitle)}</strong>
              </div>
              <a class="button button-primary" href="reviews/${featured.slug}/">
                Read the review <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
            <a class="review-hero-art reveal" href="reviews/${featured.slug}/" aria-label="Read ${escapeHtml(featured.title)} review">
              <img src="assets/reviews/${featured.slug}.svg" alt="" />
            </a>
          </div>
        </section>

        <section class="review-strip" aria-label="Latest review coverage">
          <div class="shell review-strip-inner">
            <span>20 PAX West 2025 indie reviews</span>
            <span>3 player perspectives</span>
            <span>0 manufactured hype</span>
          </div>
        </section>

        <section class="section latest-review-section" aria-labelledby="latest-title">
          <div class="shell">
            <div class="publication-section-head reveal">
              <div>
                <p class="section-index">01 / Latest</p>
                <h2 id="latest-title">Fresh from the review queue.</h2>
              </div>
              <a class="text-link" href="reviews/">Browse all 20 reviews <span aria-hidden="true">&rarr;</span></a>
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
                <p class="section-index">02 / PAX West 2025</p>
                <h2 id="pax-ledger-title">Twenty indies. One month of field notes.</h2>
              </div>
              <p>The archive runs across September 2025 and covers the official PAX Rising slate plus additional indie games surfaced by the official PAX West event page.</p>
            </div>
            ${reviewLedger(reviews, "")}
            <div class="ledger-action reveal">
              <a class="button button-secondary" href="pax-west-2025/">Open the PAX West collection</a>
            </div>
          </div>
        </section>

        <section class="section home-lens-section" id="what-we-do" aria-labelledby="home-lens-title">
          <div class="shell home-lens-grid">
            <div class="reveal">
              <p class="section-index">03 / The format</p>
              <h2 id="home-lens-title">Every review has to survive three players.</h2>
            </div>
            <div class="home-lens-list">
              <article class="reveal">
                <span>01</span>
                <h3>The Casual</h3>
                <p>Is it welcoming, readable, and fun before the homework starts?</p>
              </article>
              <article class="reveal">
                <span>02</span>
                <h3>The Tactician</h3>
                <p>Do the systems create real decisions after the novelty wears off?</p>
              </article>
              <article class="reveal">
                <span>03</span>
                <h3>The All-Rounder</h3>
                <p>Does it earn a place in an actual weekly rotation?</p>
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
      title: "Game reviews - PsychoBros",
      description: "Browse every PsychoBros game review and filter by title, studio, genre, or PAX West showcase group.",
      canonical: `${siteUrl}reviews/`,
      prefix: "../",
    }),
    body: `
      <main id="main" class="publication-main">
        <section class="archive-hero" id="top">
          <div class="shell archive-hero-grid">
            <div class="reveal">
              <p class="eyebrow"><span></span> Review archive</p>
              <h1>Games worth arguing about.</h1>
            </div>
            <p class="archive-hero-copy reveal">Every verdict runs through three player perspectives before it reaches the page. Search the full archive or narrow the 2025 PAX collection.</p>
          </div>
        </section>
        <section class="section archive-section" aria-labelledby="archive-title">
          <div class="shell">
            <div class="review-tools reveal">
              <label>
                <span>Search reviews</span>
                <input type="search" placeholder="Game, studio, or genre" data-review-search />
              </label>
              <label>
                <span>Showcase</span>
                <select data-review-group>
                  <option value="all">All PAX West indies</option>
                  <option value="pax-rising">PAX Rising Showcase</option>
                  <option value="official-pax">Additional official PAX entries</option>
                </select>
              </label>
              <p role="status" aria-live="polite" aria-atomic="true">
                <strong data-review-count>${reviews.length}</strong>
                <span data-review-label>reviews shown</span>
              </p>
            </div>
            <h2 class="visually-hidden" id="archive-title">All reviews</h2>
            <div class="review-card-grid review-card-grid-archive" data-review-results>
              ${reviews.map((review) => reviewCard(review, "../")).join("")}
            </div>
            <p class="review-empty" data-review-empty hidden>No reviews match that search.</p>
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
      title: "PAX West 2025 indie review archive - PsychoBros",
      description: "Twenty PsychoBros retrospective reviews of indie games featured on the official PAX West 2025 event page.",
      canonical: `${siteUrl}pax-west-2025/`,
      prefix: "../",
    }),
    body: `
      <main id="main" class="publication-main">
        <section class="collection-hero" id="top">
          <div class="shell collection-hero-grid">
            <div class="reveal">
              <p class="eyebrow"><span></span> Aug. 29 - Sept. 1, 2025 / Seattle</p>
              <h1>PAX West 2025<br /> <span>indie review archive.</span></h1>
            </div>
            <div class="collection-note reveal">
              <p class="section-index">Source note</p>
              <p>This retrospective uses the official PAX West 2025 Steam event archive. Twelve games are verified PAX Rising Showcase selections; eight more are additional indie titles surfaced on the same official event page.</p>
              <p>Indie MEGABOOTH did not publish a standalone 20-game PAX West 2025 lineup that we could independently verify, so the archive labels the two groups precisely.</p>
            </div>
          </div>
        </section>
        <section class="section collection-section" aria-labelledby="collection-title">
          <div class="shell">
            <div class="publication-section-head reveal">
              <div>
                <p class="section-index">September 2025 / 20 entries</p>
                <h2 id="collection-title">The complete collection.</h2>
              </div>
              <p>Short-form retrospective reviews focused on the pitch, the systems, and which kind of player should keep each game on the radar.</p>
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
      title: "About the PsychoBros",
      description: "Meet the three PsychoBros perspectives, read the editorial standards, and find press and partnership information.",
      canonical: `${siteUrl}about/`,
      prefix: "../",
    }),
    body: `
      <main id="main" class="publication-main">
        <section class="about-hero" id="top">
          <div class="shell about-hero-grid">
            <div class="reveal">
              <p class="eyebrow"><span></span> About PsychoBros</p>
              <h1>Three friends.<br /><span>Three difficulty settings.</span></h1>
            </div>
            <p class="reveal">We review games the way a real group talks about them: one player needs a clean welcome, one wants every system opened up, and one decides whether the game survives next week's group chat.</p>
          </div>
        </section>

        <section class="section about-crew-section" id="crew" aria-labelledby="crew-title">
          <div class="shell">
            <div class="publication-section-head reveal">
              <div>
                <p class="section-index">01 / The crew</p>
                <h2 id="crew-title">Different character builds.</h2>
              </div>
              <p>Our disagreement is the format. Every game gets tested against three ways people actually play.</p>
            </div>
            <div class="about-role-list">
              <article class="reveal">
                <span>Player 01</span>
                <h3>The Casual</h3>
                <p>Not buried in every release calendar. Cuts through jargon, tests the welcome mat, and asks the question everyone else forgot.</p>
                <strong>Gateway test / clarity / first-hour fun</strong>
              </article>
              <article class="reveal">
                <span>Player 02</span>
                <h3>The Tactician</h3>
                <p>Systems thinker, campaign planner, and unapologetic Descent evangelist. If a game has layers, he will find every one.</p>
                <strong>Decision depth / strategy / campaign legs</strong>
              </article>
              <article class="reveal">
                <span>Player 03</span>
                <h3>The All-Rounder</h3>
                <p>Plays broadly, knows the language, and still remembers to go outside. The reality check for an actual weekly rotation.</p>
                <strong>Time value / group fit / replay pull</strong>
              </article>
            </div>
          </div>
        </section>

        <section class="section standards-section" id="standards" aria-labelledby="standards-title">
          <div class="shell standards-grid">
            <div class="standards-copy reveal">
              <p class="eyebrow"><span></span> Editorial standards</p>
              <h2 id="standards-title">No manufactured hype. No hidden strings.</h2>
              <p>Access is useful. Trust is essential. Whether a game is bought, borrowed, previewed, or provided by a partner, the audience gets the same unfiltered context.</p>
            </div>
            <div class="standards-list">
              <article class="standard-item reveal"><span>01</span><div><h3>Disclose the relationship</h3><p>Review keys, travel, sponsorships, and paid collaborations are labeled clearly.</p></div></article>
              <article class="standard-item reveal"><span>02</span><div><h3>Keep the verdict independent</h3><p>Partners can sponsor access or production - never the opinion.</p></div></article>
              <article class="standard-item reveal"><span>03</span><div><h3>Respect the audience's time</h3><p>Every piece should inform, entertain, or ideally do both. Filler gets cut.</p></div></article>
              <article class="standard-item reveal"><span>04</span><div><h3>Say what was reviewed</h3><p>Demo, preview build, public materials, or final release: the basis of every verdict is named.</p></div></article>
            </div>
          </div>
        </section>

        <section class="section press-section" id="press" aria-labelledby="press-title">
          <div class="shell press-grid">
            <div class="reveal">
              <p class="section-index">02 / Press &amp; partnerships</p>
              <h2 id="press-title">Put three honest players in the room.</h2>
            </div>
            <div class="reveal">
              <p>Available for review coverage, creator activations, developer interviews, indie showcases, and event access. Editorial independence is not part of the negotiation.</p>
              <a class="button button-primary" href="https://github.com/PsychoBrosGames" target="_blank" rel="noreferrer">Contact the crew</a>
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
                <span>By PsychoBros</span>
                <time datetime="${review.date}">${formatDate(review.date)}</time>
                <span>Retrospective archive</span>
              </div>
            </div>
          </header>

          <div class="shell review-article-layout">
            <aside class="review-verdict reveal" aria-label="Quick verdict">
              <p class="section-index">Quick verdict</p>
              <h2>${escapeHtml(review.verdictTitle)}</h2>
              <p>${escapeHtml(review.verdict)}</p>
              <dl>
                ${review.lenses
                  .map(
                    (lens) =>
                      `<div><dt>${escapeHtml(lens.name)}</dt><dd>${escapeHtml(lens.signal)}</dd></div>`,
                  )
                  .join("")}
              </dl>
            </aside>

            <div class="review-copy">
              <section class="reveal" aria-labelledby="review-overview-title">
                <h2 class="section-index" id="review-overview-title">What it is</h2>
                ${review.overview.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
              </section>

              <section class="review-system-section reveal" aria-labelledby="review-system-title">
                <h2 class="section-index" id="review-system-title">What stands out</h2>
                <ul class="review-system-list">
                  ${review.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join("")}
                </ul>
              </section>

              <section class="review-perspectives" aria-labelledby="perspectives-title">
                <p class="section-index">The three-player read</p>
                <h2 id="perspectives-title">One game. Three save files.</h2>
                <div class="review-perspective-list">
                  ${review.lenses
                    .map(
                      (lens, lensIndex) => `
                    <article class="reveal">
                      <span>0${lensIndex + 1}</span>
                      <div>
                        <p>${escapeHtml(lens.name)}</p>
                        <h3>${escapeHtml(lens.headline)}</h3>
                        <p>${escapeHtml(lens.body)}</p>
                      </div>
                    </article>`,
                    )
                    .join("")}
                </div>
              </section>

              <section class="review-fit-grid reveal" aria-labelledby="review-fit-title">
                <h2 class="visually-hidden" id="review-fit-title">Who this game fits</h2>
                <div>
                  <h3 class="section-index">Best for</h3>
                  <ul>${review.bestFor.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                </div>
                <div>
                  <h3 class="section-index">Watch for</h3>
                  <ul>${review.watchFor.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                </div>
              </section>

              <section class="review-disclosure reveal" aria-labelledby="review-disclosure-title">
                <h2 class="section-index" id="review-disclosure-title">Review basis &amp; sources</h2>
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
                ? `<a href="../${previous.slug}/"><span>Newer review</span><strong>${escapeHtml(previous.title)}</strong></a>`
                : "<span></span>"
            }
            ${
              next
                ? `<a href="../${next.slug}/"><span>Older review</span><strong>${escapeHtml(next.title)}</strong></a>`
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
  const patina = index % 3 === 1;
  const accent = patina ? "oklch(70% 0.12 188)" : "oklch(84% 0.19 80.46)";
  const secondary = patina ? "oklch(84% 0.19 80.46)" : "oklch(49% 0.08 188)";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(review.title)} review artwork</title>
  <desc id="desc">Original geometric PsychoBros artwork for ${escapeXml(review.title)}.</desc>
  <rect width="1200" height="675" fill="oklch(7% 0.006 95)"/>
  <path d="M0 1h1200M0 674h1200M600 0v675" stroke="oklch(78% 0 0 / 0.16)"/>
  <g fill="none" stroke="${accent}" opacity="0.72">
    <circle cx="${x}" cy="${y}" r="${radius}" stroke-width="2"/>
    <circle cx="${x + 170}" cy="${y + 180}" r="${Math.round(radius * 0.62)}" stroke-width="10"/>
    <path d="M${x - 240} ${y + 280}  ${x + 280} ${y - 30}  ${x + 460} ${y + 280}" stroke-width="5"/>
  </g>
  <path d="M790 0h410v675H940Z" fill="${accent}" opacity="0.08"/>
  <path d="M840 0h360v675H1060Z" fill="${secondary}" opacity="0.08"/>
  <circle cx="1050" cy="118" r="16" fill="${secondary}"/>
  <path d="M84 82h130" stroke="${accent}" stroke-width="4"/>
  <text x="84" y="126" fill="${accent}" font-family="Consolas, monospace" font-size="18" letter-spacing="5">PAX WEST 2025 / REVIEW ${String(index + 1).padStart(2, "0")}</text>
  ${titleLines
    .map(
      (line, lineIndex) =>
        `<text x="82" y="${420 + lineIndex * 72}" fill="oklch(91% 0 0)" font-family="Alumni Sans, Arial, sans-serif" font-size="74" font-weight="300">${escapeXml(line)}</text>`,
    )
    .join("\n")}
  <text x="84" y="620" fill="oklch(72% 0 0)" font-family="Albert Sans, Arial, sans-serif" font-size="22">${escapeXml(review.studio)} / ${escapeXml(review.genre)}</text>
  <text x="1114" y="620" fill="${accent}" font-family="Consolas, monospace" font-size="20" text-anchor="end">PSYCHOBROS</text>
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
