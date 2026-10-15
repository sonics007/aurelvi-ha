# Aurelvi website

Static product website for the Aurelvi NSPanel Pro project. English by default, Slovak language switch. Own branding, own demo and original documentation; original Aurelvi branding and screenshots.

Pages: home, features, 80-skin palette gallery, setup guide, proposed Plus pricing and activation result. Gallery controls are an illustrative browser demo, not connected to a real panel. The editor image is the existing public Aurelvi Studio 0.3.4 screenshot and is labelled with its version.

Host the `website` directory with GitHub Pages. All links are relative, supporting `https://sonics007.github.io/aurelvi-ha/` and a custom domain. Current integration and APK versions are fetched from public release endpoints with static fallback labels. No GitHub token is used in the website.

## Hosting

The repository remains public only for integration and website files. Private Android sources are untouched. A Pages workflow uploads only `website/`. No billing plan is assumed. A GitHub Pages repository setting may need to be enabled by a repository administrator if automatic setup is denied.

## Commerce status

`assets/commerce.json` defaults to disabled. Plus prices (€14.90/year and €39.90 lifetime, per panel) are proposals. No real payment is collected. Native licence application, merchant onboarding, policies, subscription cancellation/management and a deployed backend are prerequisites for launch. See `licensing-server/README.md` in the repository for the server preparation and limitations. Do not enable the buttons merely by changing a frontend flag.

## Publishing after first-time setup

In repository Settings → Pages, select **GitHub Actions** as the source. The **Publish Aurelvi website** workflow deploys the `website/` directory when its content changes. The expected public address is `https://sonics007.github.io/aurelvi-ha/`. Future website commits redeploy automatically. Deployment success must be checked in Actions before treating this address as live.

Atelier 0.3.7 adds a persistent light/dark switch, eight locally bundled full app images and an 80-cell screenshot atlas. Micro purchases are proposed at EUR 1.49 per skin and EUR 4.90 per eight-skin collection, per panel. Purchases stay disabled. Native activation is implemented, but commercial gating, renewal/restore and subscription management are not live.
