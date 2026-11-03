# Faith Life Community Ministries
Edit the current website directly in dist/. It includes every HTML page, stylesheet, script and image. No build is needed. The original Python generator in scripts/ predates manual edits and can overwrite current pages.

## GitHub Pages
Extract this archive into your repository root, including .github/. Commit and push to main. Under Settings > Pages select GitHub Actions, then run the included workflow from the Actions tab.

## Preview
Run python3 -m http.server 8000 --directory dist and open http://localhost:8000.

## External services
The contact form submits to the existing WordPress form at flcmonline.com. Keep that endpoint active or configure a replacement when migrating. Verify delivery after migration. Spotify and Google Maps also require internet access.
