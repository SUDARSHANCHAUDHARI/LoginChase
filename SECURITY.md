# Security Policy

## Supported version

The latest commit on the default branch is the supported version while LoginChase remains private and pre-deployment.

## Reporting a vulnerability

Report security issues privately to `sunny.sudarshan@gmail.com`. Include reproduction steps, affected files or behavior, and the expected impact. Do not open a public issue for a vulnerability.

## Security model

LoginChase is a static joke interface, not an authentication product. It intentionally has no backend, account system, analytics, dependencies, credential handling, or network communication. A report is still relevant if a change could violate those constraints, enable script or HTML injection, weaken the content security policy, or cause typed field content to leave the page.
