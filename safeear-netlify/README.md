# SafeEar Netlify Site

Static SafeEar booking site prepared for GitHub and Netlify.

## Deploy on Netlify

1. Create a GitHub repository and upload this folder.
2. In Netlify, import the GitHub repository.
3. Use these build settings:
   - Build command: leave empty
   - Publish directory: `.`
4. Enable Forms in Netlify so booking submissions appear in the Forms dashboard.
5. Optional translator: add `ANTHROPIC_API_KEY` in Netlify environment variables. `ANTHROPIC_MODEL` defaults to `claude-sonnet-5`.

## What is included

- `index.html` plus `assets/`: main SafeEar site.
- Netlify Forms capture for bookings.
- `translator.html`: live session translator.
- `netlify/functions/translate.js`: server-side translator proxy so the API key is not public.
- `netlify.toml` and `_redirects`: Netlify routing for the app and translator function.

## Notes

Booking submissions are saved in Netlify Forms. EmailJS and WhatsApp alerts in the built app are optional fallbacks; do not put private API keys directly in public files.
