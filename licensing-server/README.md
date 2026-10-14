# Aurelvi Plus — pre-launch payment and licence service

**Not deployed; sales disabled.** The static website has proposed prices and a disabled checkout. Current Aurelvi HA/APK releases do not consume Plus licence tokens yet. Do not turn on checkout until the supported APK/HA activation UI and actual premium deliverables are released and tested.

## Proposed offer

- Community: €0, all current controls and skins remain available.
- Plus Annual: €12 per panel per year, recurring until cancelled.
- Plus Lifetime: €29 once per panel, for the supported life of the project.
- Plus supports development and planned future premium visual packs. No promised support response time or unavailable feature is sold now.
- Each token binds to the Aurelvi device ID, **not a hardware-attested serial**. Never use a customer's MQTT password or HA token.

## Payment flow

1. The browser sends a selected plan and panel ID to `/checkout`.
2. The Worker checks the real Stripe Price against a server-side EUR price/interval allowlist. Browser input never sets the amount.
3. Stripe-hosted Checkout accepts card details. Annual uses subscription mode; lifetime uses payment mode.
4. The success page sends the Stripe checkout session reference to `/licence`. A success redirect alone grants nothing.
5. The Worker reads the session and expanded payment/subscription data from Stripe. It verifies the plan, quantity, currency, exact amount, successful payment, absence of refund/dispute and the paid annual period.
6. It issues an RSA-SHA256 signed `AV1` token. No database or webhook is required for this synchronous retrieval design. No email delivery is implemented; the customer must copy/save the token. Stripe receipts and subscription customer communication must be configured in the Stripe account.
7. Native verification uses only the public RSA key. Annual renewal needs the client to fetch a new token after the next paid period; the currently published APK does not do this yet. Do not describe renewal as working until that client is shipped.

A copied session reference is a bearer capability: do not log full URLs or put analytics on the activation page. The frontend removes it from browser history after successful retrieval. Keys and tokens are not sent to this project's GitHub repository.

## Deployment checklist for the owner

1. Create/verify the owner's Stripe account, set business details, payout destination and customer-facing terms. The owner must complete identity/payment onboarding themselves.
2. Create EUR prices: annual €12/one year and lifetime €29/one-time. No discounts, trials, extra line items or tax additions are currently supported by the strict verifier. Resolve the final tax-inclusive pricing with the owner before launch; change both the UI and server checks together if needed.
3. Provide a supported secure account/subscription management route and cancellation instructions before enabling subscriptions. No customer billing portal has been implemented yet.
4. Create a Cloudflare Workers project. Set `SITE_URL` to the exact website base path. Configure Stripe Price IDs in Wrangler.
5. Generate an RSA keypair of at least 2048 bits with a trusted local tool. Store the **private JWK only as a Cloudflare secret** `LICENCE_PRIVATE_JWK`; distribute only the public key to clients. Store the Stripe secret as `STRIPE_SECRET_KEY`. Do not put secrets in `wrangler.toml`, GitHub source, browser JavaScript, commits or chat.
6. Ship and test native/HA token verification/application, annual refresh, expiry and panel ID changes. Test with Stripe test-mode success, failure, refund, renewal, cancellation and dispute cases. Decide transfer/replacement policy before publishing customer terms.
7. Deploy the Worker using Wrangler from the owner's authenticated Cloudflare environment. Enable commerce/native flags on both the Worker and `website/assets/commerce.json` only after everything above is complete. Set `apiBase` to the actual deployed HTTPS endpoint.
8. Switch live Stripe credentials and publish the customer-facing policies when approved by the owner. This source change does not create a merchant account, enable live charges, provide legal terms or deploy a server.

Offline verification establishes authenticity and expiry, not instantaneous revocation. A previously issued lifetime token cannot be remotely revoked while a device stays offline. A production client must define periodic entitlement checks, refund/dispute handling, account recovery and cancellation UX before commercial launch.

## Token format

`AV1.<base64url UTF-8 JSON>.<base64url RSA-SHA256 signature>`

The signature covers the ASCII string `AV1.<payload>` using RSASSA-PKCS1-v1_5 with SHA-256. Claims: version, issuer, audience, panel ID, plan, issued-at, expiry (`null` for lifetime) and Stripe order reference. Reject mismatched panels, unsupported issuer/audience/version, modified signatures and expired annual licences. Never distribute the private key with the APK.
