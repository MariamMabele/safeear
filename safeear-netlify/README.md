# SafeEar Netlify Site

A static site for SafeEar, a safe place to vent and be heard. There is no build step.

## Deploy on Netlify

1. Connect this GitHub repository in Netlify.
2. Build settings:
   - Base directory: `safeear-netlify`
   - Build command: leave empty
   - Publish directory: `.` (inside the base directory)
3. Turn on form detection: **Site configuration → Forms → Enable form detection**.
4. Get an email for each booking: **Forms → booking → Form notifications → Add notification → Email**, and use `safeear97@gmail.com`.
5. Optional translator: add `ANTHROPIC_API_KEY` in Netlify environment variables. `ANTHROPIC_MODEL` defaults to `claude-sonnet-5`.

## Files

| File | What it does |
| --- | --- |
| `index.html` | Home page text and sections. Edit words here. |
| `js/config.js` | Sessions, prices, contact methods and bookable hours. |
| `css/styles.css` | Page colors, fonts and layout. |
| `css/booking.css` | Booking pop-up styles. |
| `js/booking.js` | The 3-step booking pop-up. |
| `js/booking-submit.js` | Sends the booking to Netlify Forms. |
| `js/time.js` | Time zone conversion to Tanzania time. |
| `js/site.js` | Menu, booking buttons and the "Let it out" box. |
| `session-*.html`, `admin-session.html` | Live chat, voice and video session pages. |
| `translator.html`, `netlify/functions/translate.js` | Live session translator. |

## Change a price

Open `js/config.js` and change the price in `sessions`. Then change the same price in the Pricing section of `index.html`.

## Notes

- Bookings are saved in Netlify Forms. The field names in the hidden form in `index.html` must match `js/booking-submit.js`.
- The "Let it out" box never saves or sends text. It stays in the visitor's browser and is cleared on release.
