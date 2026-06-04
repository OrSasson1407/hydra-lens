# Security Policy

HydraLens scans pages for exposed secrets. We take our own security posture seriously.

---

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x | ✅ Active |
| 0.5.x | ⚠️ Critical fixes only |
| < 0.5 | ❌ End of life |

---

## Reporting a Vulnerability

**Do not open a public GitHub issue for security bugs.**

Report vulnerabilities via one of:

- **GitHub Private Advisory**: [Security tab → Report a vulnerability](https://github.com/your-org/hydra-lens/security/advisories/new)
- **Email**: security@your-org.example (PGP key on keybase.io/your-org)

We will acknowledge your report within **48 hours** and provide a remediation timeline within **7 days**.

---

## Scope

| In scope | Out of scope |
|----------|-------------|
| Secrets leaked via the extension itself | False-positive secret detections (file a bug issue) |
| XSS in the DevTools panel | Performance issues |
| Arbitrary code execution via crafted HTML | Browser crashes unrelated to HydraLens |
| Bypass of Content Security Policy by the extension | Missing secret patterns (file an enhancement issue) |

---

## Known Limitations

- **Unauthenticated fetch** — the CLI fetches the server HTML without authentication cookies. Pages behind login will return the login page HTML, not the authenticated DOM.
- **No CORS bypass** — the extension cannot read cross-origin iframe content.
- **CSP-blocked pages** — pages with `script-src: 'none'` will prevent the content script from running; the extension degrades gracefully with a "scan blocked" message.
