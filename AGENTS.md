# Deployment workflow

- For changes to either Vercel app (`van-moc-admin` or `van-moc-frontend`), commit and push only the relevant changes to `main` on GitHub so Vercel can auto-deploy. Do not include unrelated working-tree changes in that commit.
- After pushing, verify the Vercel deployment for that commit succeeded **and** check the affected production URL. A successful push or local build alone does not prove production is updated; report any deployment blocker explicitly.
- Never commit environment files, credentials, or secrets. Do not push unrelated work without the user's authorization.
