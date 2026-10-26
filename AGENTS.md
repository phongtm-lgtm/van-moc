# Deployment workflow

- Do not commit or push changes automatically. Only do so when the user explicitly requests it.
- When the user requests a push for either Vercel app (`van-moc-admin` or `van-moc-frontend`), include only the relevant changes. After pushing, verify the deployment for that commit and check the affected production URL; report any deployment blocker explicitly.
- Never commit environment files, credentials, or secrets. Do not push unrelated work without the user's authorization.
