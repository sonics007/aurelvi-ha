# Aurelvi annual watermark licences

Implemented in source; commerce remains disabled. The owner's deployed Worker must be updated separately. No live products, secrets or accounts are created by this repository.

## Offer

| Plan | Per panel, per year | Signed entitlement |
| --- | --- | --- |
| Free | EUR 0 | All functions and styles with watermark after launch |
| Page | EUR 7.90, recurring | `page:grid`, `page:clock`, `page:weather`, `page:alarm`, `page:camera` or `page:music` |
| Full | EUR 34.90, recurring | `full`, every current and future page type during the paid term |

Clock includes the screensaver. A type licence covers every page/layout/style of that type. Multiple type licences coexist on the panel. Settings have no watermark. Expiry never blocks a control or changes the page configuration. Existing signed annual/lifetime/skin/pack tokens remain verifiable, keep their expiry and are not sold by new checkout. Legacy visual tokens are grandfathered into clean rendering rather than reducing existing rights.

The released preview stays unwatermarked: native `LicencePolicy.COMMERCE_LIVE=false`. The website and Worker also default to sales disabled. Remove these launch guards only as part of a tested release.

## Architecture

- Static site on `https://aurelvi-app.com`; Worker on `https://api.aurelvi-app.com`.
- `POST /checkout` accepts panel ID, `full` or `page`, and a page product. Server checks the Stripe yearly EUR Price and fixes quantity to 1. Browser input never sets the price.
- Stripe Checkout explicitly requires acceptance of published terms. Each checkout creates a separate yearly subscription with signed panel/product metadata.
- `POST /licence` retrieves the original session and latest subscription/invoice/charge through depth-limited Stripe calls. Only a fully paid, nonrefunded, nondisputed annual period gets an RSA-SHA256 `AV1` token.
- Native app saves multiple licences encrypted with Android Keystore. Renewals replace only the same plan/product. Startup and periodic HTTPS refresh use the original order reference, and only a valid signature for the same panel/order/product is accepted. Keep the matching original private signing key; a new unrelated key would invalidate compatibility.
- `POST /portal` uses the Stripe customer from the receipt, never a browser-provided customer ID. The owner must configure an end-of-period cancellation-only portal (payment method updates allowed, price/product/quantity changes disabled).
- Cancel future renewal: licence stays valid until the paid expiry; then the watermark returns. The app can work offline until its signed expiry. An offline panel needs internet to retrieve the new annual token.

Native and browser refresh send the receipt in a POST body, avoiding query-string access logs. The legacy GET retrieval route remains supported for compatibility. The original checkout reference is a bearer capability for renewal and billing management. Save it privately; never share it, include it in MQTT payloads, analytics or logs. No new receipt is needed for the next paid annual period. The activation page supports manual licence retrieval and billing management. There is no custom customer account or custom licence email delivery yet; enable Stripe receipts and its hosted customer portal login for recovery.

Offline verification cannot instantly revoke an already-issued token after a refund or dispute. Online refresh refuses a new token; the cached token remains valid until its original expiry. A stronger revocation policy would require bounded online validity. Do not claim instantaneous revocation.

## Owner setup (test environment first)

1. Update this Worker's code in Cloudflare. Keep `SITE_URL=https://aurelvi-app.com`, `COMMERCE_ENABLED=false`, `NATIVE_ACTIVATION_READY=false` until tests are finished.
2. In Stripe create **two new yearly recurring EUR Prices**: Full 34.90 and Page 7.90. Do not reuse old lifetime/skin/pack or EUR 14.90 Price IDs. One shared Page Price covers the six allowlisted types through server-side subscription metadata.
3. Configure the customer portal: cancellation **at period end**, invoice/history/payment method management, no changing subscription products, prices or quantities. Set `STRIPE_PORTAL_CONFIGURATION=bpc_…`.
4. Set `STRIPE_PRICE_FULL=price_…`, `STRIPE_PRICE_PAGE=price_…` as Worker variables. Store `STRIPE_SECRET_KEY` and the existing matching `LICENCE_PRIVATE_JWK` only as Cloudflare secrets. Never commit or paste their values into chat.
5. Publish the actual seller details, terms, privacy, cancellation/refund and recovery policies. Confirm tax-inclusive EUR totals. The current verifier requires the exact displayed total and fully paid invoice amount; adding tax on top, discounts, trials, prorations or extra items is intentionally rejected. Configure prices and tax consistently, and test country-specific totals before launch.
6. Test two page licences on one panel; Full; cross-panel and tampered tokens; yearly renewal and expiry; cancel-at-period-end; failed payments; refund/dispute; offline use; reinstall/recovery. Verify the existing public signing key in the supported APK.
7. Release the updated native verifier and refresh UI. Only then set native `COMMERCE_LIVE=true` in a supported release and enable both Worker flags and website flags with the actual API endpoint. Never enable live billing on an older APK that does not support page/full claims.

## Tests

`node --test licensing-server/worker.test.mjs`

New sales intentionally exclude one-time and legacy products. Stripe sandbox and on-device end-to-end tests are still required before taking money. The deployed Worker does not automatically update from a GitHub commit when it was created in the dashboard.
