# Russel A. Valdez — portfolio

A responsive, dependency-free HTML/CSS/JavaScript portfolio based on the supplied reference. The website is in `dist/`; it can be served by any static web server. No build or package installation is required.

## Preview locally

From this folder: `python3 -m http.server 5173 --directory dist`

Then open http://localhost:5173.

## Update your work

Edit **`dist/portfolio-data.js`**. The clearly labeled `projects` and `websites` arrays control the carousel, lightbox and website grid. Add, remove or reorder entries without changing HTML.

Add new project images to **`dist/assets/projects/`**. Each entry supports `name`, `image`, optional `fullImage`, optional `description`, optional live `url`, and optional `fit: 'contain'` for landscape artwork. Tall website screenshots use a consistent crop from the top in the carousel. The lightbox shows the complete image, with vertical scrolling for long designs and previous/next navigation that wraps in both directions. Arrow keys and touch swipes work; Escape closes the viewer and returns focus to the project.

The supplied resume is preserved, including its filename, at **`dist/assets/resume/Russel_Valdez_Resume-compressed.pdf`**. To replace it, copy the new file into that folder and update `resume` in the data file. Both LinkedIn links use the supplied profile.

Original background assets were found in the supplied image folder and optimized to WebP. Uploaded project screenshots were optimized without distorting their proportions. The carousel uses cropped thumbnails; `fullImage` points to larger, complete images that load only when the lightbox opens. Original artwork is kept untouched outside this project.

Sharp original company logos were retrieved where available. Tyrant CNC and Slatter Law Firm badges were reconstructed with the built-in image-generation tool; their geometry and colors may vary slightly from the original brand files. Mangan Cyber uses the original company artwork because its generated alternatives did not preserve clean edges. Sources are recorded in `asset-sources.json`, and the reconstruction prompts are in `logo-generation-prompts.json` and `logo-repair-prompt.txt`.

The two non-resolving addresses in the brief were corrected, with your approval, to `https://tyrantcnc.com` and `https://slatterlawfirm.com`. Project live-site URLs were not guessed: you can add verified `url` fields to show a “Visit website” link in the lightbox.

The editable page layout is `dist/index.html`, visual styles are `dist/styles.css`, and interactions are `dist/app.js`. Local Poppins and Roboto font subsets are in `dist/assets/fonts/`; their Google Fonts declarations are in `dist/fonts.css`.
