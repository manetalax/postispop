# PostisPop interface quality

Harmony, simplicity and understandable actions are requirements of the workspace.

- Keep notes visible on arrival. Account and Premium share a compact action row; help opens on demand.
- Give an action one visible entry point. Sharing destinations belong inside Share. Appearance, paper, colour, symbol and text marking belong inside Personalize. Files, links, camera and audio belong inside Add content.
- Use the chosen note colour for writing and drawing. Align the text mirror, input, caret and scroll gutters.
- Keep transient menus above other controls. Verify actual pointer targets, not just dimensions or screenshots. Offscreen menu content must scroll into view.
- Dismiss menus on outside clicks and Escape, preserve focus and save data before closing editors. Closing a recording drawer stops and saves its recording.
- Translate labels, tooltips, empty states and errors in es, en, de, fr, pt, it, ja and ko. Do not translate user-authored note content or filenames.
- Check all ten interface palettes, the six note colours, short mobile screens, desktop and native packaging. A passing Chromium test is not evidence of Safari, Firefox or a physical Android device.

Run `node tests/workspace-harmony-ui.cjs` against the staged website. Set `POSTISPOP_TEST_ENGINE=webkit` or `firefox` for the other browser engines. `POSTISPOP_SITE_ROOT` selects a packaged distribution. Keep media, save, import, encryption and sharing regression journeys passing when regrouping controls.
