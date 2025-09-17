# Commands to Update Your Friend's GitHub Repository

Since your friend already has a GitHub repo with old code, here's how to update it:

## Option 1: Force Push (Replaces everything)
```bash
# In the project folder
git init
git add .
git commit -m "Complete rebuild with AWS deployment ready"
git branch -M main
git remote add origin [friend's-github-repo-url]
git push -u origin main --force
```

## Option 2: Clone and Update (Preserves history)
```bash
# Clone friend's repo first
git clone [friend's-github-repo-url] temp-repo
cd temp-repo

# Remove old files except .git
rm -rf * .[^.]*

# Copy new files
cp -r /path/to/Area-25-project/* .
cp -r /path/to/Area-25-project/.* . 2>/dev/null

# Commit and push
git add .
git commit -m "Major update: S3 integration, CI/CD, and EB deployment ready"
git push origin main
```

## What's in the new code:
- ✅ S3 image upload integration
- ✅ GitHub Actions workflows (.github/workflows/)
- ✅ Elastic Beanstalk configuration (.ebextensions/)
- ✅ Fixed database performance issues
- ✅ Category management features
- ✅ Production-ready deployment files