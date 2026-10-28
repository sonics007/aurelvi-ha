# Security: MQTT broker ACLs for Aurelvi panels

Aurelvi panels and the Home Assistant integration talk over MQTT under the prefix `aurelvi/panel/<panel id>/`.
The integration trusts panel events by topic: any message on `aurelvi/panel/<id>/event` or `sys/*` is treated as coming from panel `<id>`.
The integration does not check payload signatures. **The broker ACL is the only thing that stops one panel from acting as another or as the Home Assistant bridge.**

## Recommendation

- Give the Home Assistant integration its own broker user with access to `aurelvi/panel/#`.
- Give each panel its own broker user, named exactly as its panel id, that can read and write only `aurelvi/panel/<its id>/#`.
- Do not allow anonymous access.

## Mosquitto example

`/etc/mosquitto/acl`:

```
# Home Assistant integration
user aurelvi_ha
topic readwrite aurelvi/panel/#

# Every panel: the username must equal the panel id (for example livingroom)
pattern readwrite aurelvi/panel/%u/#
```

Create one broker user per panel with `mosquitto_passwd`, using the panel id as the username, and enable the ACL in `mosquitto.conf`:

```
allow_anonymous false
password_file /etc/mosquitto/passwd
acl_file /etc/mosquitto/acl
```

With this setup, panel `livingroom` can publish `aurelvi/panel/livingroom/event` but not `aurelvi/panel/kitchen/event`.

## Notes

- Camera state documents contain a short-lived Home Assistant access token. They are published non-retained, so the token is not stored on the broker. Any user allowed to read `aurelvi/panel/<id>/#` still sees it while it is live, so keep that read access limited to the panel and the integration.
- A panel can still forge events for its own id. Limit the damage by keeping each panel's Home Assistant permissions narrow.
- Review the ACL after adding a panel. An unknown panel id has no broker user, so it cannot connect.
