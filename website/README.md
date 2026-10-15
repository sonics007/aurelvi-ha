# Aurelvi website

Static product website for the Aurelvi NSPanel Pro project. English by default, Slovak language switch. Own branding, own demo and original documentation; original Aurelvi branding and screenshots.

Pages: home, features, 80-skin palette gallery, setup guide, proposed Plus pricing and activation result. Gallery controls are an illustrative browser demo, not connected to a real panel. The editor image is the existing public Aurelvi Studio 0.3.4 screenshot and is labelled with its version.

Host the `website` directory with GitHub Pages. All links are relative, supporting `https://sonics007.github.io/aurelvi-ha/` and a custom domain. Current integration and APK versions are fetched from public release endpoints with static fallback labels. No GitHub token is used in the website.

## Hosting

The repository remains public only for integration and website files. Private Android sources are untouched. A Pages workflow uploads only `website/`. No billing plan is assumed. A GitHub Pages repository setting may need to be enabled by a repository administrator if automatic setup is denied.

## Commerce status

Sales remain disabled. The current offer is yearly recurring, per panel: Full EUR 34.90 or one page type EUR 7.90. All functions and all styles remain free with a watermark after launch; the current preview stays unwatermarked. Clock includes the screensaver. No lifetime, skin or pack purchases are offered. Existing issued licences keep their rights. See `licensing-server/README.md` for Stripe prices, renewal, customer portal, tax setup and launch requirements.

## Publishing after first-time setup

In repository Settings → Pages, select **GitHub Actions** as the source. The **Publish Aurelvi website** workflow deploys the `website/` directory when its content changes. The target public address is `https://aurelvi-app.com/`. The original address remains `https://sonics007.github.io/aurelvi-ha/` until the custom domain is activated. Future website commits redeploy automatically. Deployment success must be checked in Actions before treating this address as live.

Atelier 0.3.7 adds a persistent light/dark switch, eight locally bundled full app images and an 80-cell screenshot atlas. The previous skin/pack/lifetime proposal is superseded by annual page-type and Full licences. Purchases stay disabled pending Stripe and on-device testing.


## Custom domain: aurelvi-app.com

Status: website URLs are prepared; GitHub Pages custom-domain and registrar DNS configuration must be completed and verified separately.

1. In repository Settings → Pages → Custom domain, save `aurelvi-app.com`. Keep GitHub Actions as the publishing source.
2. At the domain registrar, replace conflicting parking/redirect A or AAAA records for the apex only. Add these records (do not change mail records):

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | sonics007.github.io |

3. Wait for DNS validation and the GitHub certificate, then enable Enforce HTTPS.
4. Verify that the homepage, assets and subpages load at `https://aurelvi-app.com/`, and that the old GitHub Pages URL redirects correctly.

The Actions publishing method ignores a repository CNAME file: the custom domain must be saved in Pages settings. Do not add a JavaScript redirect before DNS and TLS work, as that would send visitors to an unavailable domain.

Reference: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Page showcase

The home page and gallery show 12 actual app captures: room controls, scenes, dimmers, blinds, two clocks, two weather finishes, alarm, camera, music and fan. The gallery filters these independently of the 80-skin catalogue. Images enlarge with keyboard or touch. English and Slovak captions are included.

`node website-tests/page-captures.mjs` generates `website/assets/pages/*.png` using the production frontend at 480 × 480. Data is fictional, the camera feed is explicitly an illustration, external requests are blocked, and the fake client never reaches MQTT. No application DOM or CSS is replaced to make screenshots. Run after installing `website-tests` dependencies and Chromium. The Pages workflow generates the captures and runs responsive browser checks before publishing; generated PNGs are build outputs.
