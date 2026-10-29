# Russel A. Valdez — portfolio

A responsive, dependency-free HTML/CSS/JavaScript portfolio based on the supplied reference. The website is in `dist/`; it can be served by any static web server. No build or package installation is required.

## Quick editing guide

Everything that appears on the site is editable in `dist/`. Open these files in a code editor; there is no build step.

| What you want to change | File to edit |
| --- | --- |
| Home page wording and section order | `dist/index.html` |
| Case studies page wording and section order | `dist/case-studies.html` |
| Home page colors, spacing, and layout | `dist/styles.css` |
| Case studies page colors, spacing, and layout | `dist/case-studies.css` |
| Button and small heading text sizes shared by both pages | `dist/text-sizes.css` |
| Font files and font definitions | `dist/fonts.css` and `dist/assets/fonts/` |
| Featured projects and live website entries | `dist/portfolio-data.js` |
| Carousel and lightbox behavior | `dist/app.js` |
| Case-study product image viewer | `dist/case-studies.js` |

For a text change, edit the words in the HTML file or the project entry in `portfolio-data.js`. For a visual change, search the CSS file for the matching class name (for example, `.hero-content` or `.featured-copy`). The CSS rules near the end of `case-studies.css` contain the latest hero, typography, and mobile adjustments; start there for those changes. Keep image paths relative to `dist/`.

## Preview locally

From this folder: `python3 -m http.server 5173 --bind 127.0.0.1 --directory dist`

Then open http://localhost:5173.

## Update your work

Edit **`dist/portfolio-data.js`**. The clearly labeled `projects` and `websites` arrays control the carousel, lightbox and live websites showcase. Add, remove or reorder entries without changing HTML.

Add new project images to **`dist/assets/projects/`**. Each entry supports `name`, `image`, optional `fullImage`, optional `description`, optional live `url`, and optional `fit: 'contain'` for landscape artwork. Tall website screenshots use a consistent crop from the top in the carousel. The lightbox shows the complete image, with vertical scrolling for long designs and previous/next navigation that wraps in both directions. Arrow keys and touch swipes work; Escape closes the viewer and returns focus to the project.

The supplied resume is preserved, including its filename, at **`dist/assets/resume/Russel_Valdez_Resume-compressed.pdf`**. To replace it, copy the new file into that folder and update `resume` in the data file. Both LinkedIn links use the supplied profile.

Eight additional project images were added at the start of the Featured Work carousel. Both carousel thumbnails and larger lightbox images are included for each. The hero uses an enhanced high-resolution WebP generated from the supplied `hero-bg.jpg`; the original remains preserved byte-for-byte. The experience arrows use an SVG recreation of the supplied transparent `arrow.png` so the shape stays crisp when scaled. Other original background assets were found in the supplied image folder and optimized to WebP. Uploaded project screenshots were optimized without distorting their proportions. The carousel uses cropped thumbnails; `fullImage` points to larger, complete images that load only when the lightbox opens. Original artwork is kept untouched outside this project.

Sharp original company logos were retrieved where available. Tyrant CNC and Slatter Law Firm badges were reconstructed with the built-in image-generation tool; their geometry and colors may vary slightly from the original brand files. Mangan Cyber uses the original company artwork because its generated alternatives did not preserve clean edges. Sources are recorded in `asset-sources.json`, and the reconstruction prompts are in `logo-generation-prompts.json` and `logo-repair-prompt.txt`.

The Live Websites section uses a scrollable, keyboard-accessible project list and a fixed website preview. Its count and numbered tabs come from the `websites` array. All 12 website previews use the matching supplied screenshot from `dist/assets/websites/`. Original screenshot files are copied without re-encoding. No sample screenshots or metrics from the reference mockup are used as portfolio content.

To add a screenshot, place it in **`dist/assets/websites/`** and set that website entry's `previewImage` to a path relative to `dist`, for example `assets/websites/tlgmarketing.com.jpg`. Set `previewAlt` to a concise description of the screenshot. Each website entry has a stable `id`, name, URL, logo, optional description, and optional preview image. Keep IDs unchanged when reordering entries. `url` opens through the separate **View Website** link. If an image is not mapped or cannot load, the preview falls back to the neutral placeholder.

The two non-resolving addresses in the brief were corrected, with your approval, to `https://tyrantcnc.com` and `https://slatterlawfirm.com`.

The editable page layout is `dist/index.html`, visual styles are `dist/styles.css`, and interactions are `dist/app.js`. Local Poppins and Roboto font subsets are in `dist/assets/fonts/`; their Google Fonts declarations are in `dist/fonts.css`.
