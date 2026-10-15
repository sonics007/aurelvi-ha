# OpenPanel dependency notices

Own application code: MIT (LICENSE).
Lucide Static 0.468.0: ISC, https://github.com/lucide-icons/lucide
Sendspin JS 5.0.0: Apache-2.0, https://github.com/Sendspin/sendspin-js
Bundled Sendspin dependencies: @noble/ciphers, @noble/curves, @noble/hashes,
opus-encdec. License texts are under assets/third-party and assets/LICENSE-*.
The Sendspin bundle is built using esbuild 0.25.5, browser IIFE, target Chrome 87.
Only PCM is advertised by OpenPanel; compatibility depends on installed WebView
and Music Assistant version. No runtime CDN dependency is used.
Public integration reference files preserve their MIT license in tests/upstream.
Aurelvi application code and visual assets are independently maintained.

SIP client: JsSIP 3.10.1 (MIT), bundled locally with debug, events, sdp-transform and ms. Licence texts are included under the frontend/assets third-party directory. No SIP CDN is loaded at runtime.

Material finishes are independently generated digital textures; they are not photographs of physical Aurelvi products.
