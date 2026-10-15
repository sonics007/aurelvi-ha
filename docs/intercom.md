# Aurelvi intercom (SIP/WebRTC preview)

APK 0.3.11 adds a phone button and **Intercom and phone contacts** in local Settings. The panel can register to a SIP account over WSS and call one of up to 12 explicitly configured contacts. Calls are audio-only. A second contact cannot be called while a call is active. Incoming calls require acceptance and are restricted to configured contacts. The UI includes mute, hang up, registration status and a microphone-permission check.

This release contains the client, not a hosted calling or push service. It has passed simulated signalling/UI tests and an Android build. Audio quality, panel WebView compatibility and a complete call on real phones still require device testing.

## Requirements

1. A SIP server or provider with SIP over secure WebSockets and WebRTC-compatible audio (for example a correctly configured Asterisk installation). Use a trusted WSS certificate; Aurelvi does not bypass certificate validation.
2. A separate SIP identity for the panel and each target phone. Give each phone a different contact address so calling one does not ring several registrations of a shared account. Do not use a ring-group address if you want only one phone to ring.
3. A compatible iOS/Android calling application. Reliable incoming calls with a locked screen need mobile push support from both the app and provider. A generic SIP account alone does not establish that support. Linphone documents that its mobile push is enabled for Linphone accounts, with separate integration needed for third-party servers.
4. A WebRTC-capable Android WebView and microphone permission. Aurelvi requests microphone access when placing or accepting a call; it never answers automatically. A permission check does not capture or record audio.
5. For calls outside the home network, appropriate routing and usually TURN media relay support. Configure STUN/TURN explicitly; no public relay service is silently used.

## Configure on the panel

Open Intercom → Connection and contacts. Enter the WSS endpoint, panel SIP URI, optional authentication username and password. Add named phone contacts with individual SIP URIs. Optional ICE servers use a JSON array, for example:

```json
[{"urls":"turn:turn.example.com:3478","username":"YOUR_USER","credential":"YOUR_SECRET"}]
```

Save and connect, grant microphone permission when requested, and wait for **Ready — choose one phone**. Registration success is not a complete media or mobile-push test. Test each phone on Wi-Fi and mobile data with its screen locked.

SIP passwords and TURN credentials are stored separately in Android's encrypted private preferences. They are not included in HA configuration, MQTT layouts or layout backups. Do not paste them into Advanced layout JSON.

## eWeLink

The documented vendor calling function allows the mobile app to call the original panel interface. Aurelvi does not have a documented eWeLink endpoint for initiating a call to a chosen phone, and this preview does not connect to the eWeLink calling service.

References: [JsSIP UA](https://jssip.net/documentation/3.10.x/api/ua/), [Android microphone permission requests](https://developer.android.com/reference/android/webkit/PermissionRequest), [Linphone mobile push](https://www.linphone.org/en/faq/).
