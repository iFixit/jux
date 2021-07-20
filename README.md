## Setup
1. Copy the `src/pages.json.demo` file to `src/pages.json`.
2. Run `npm start`

Most of the interesting config in the app can be set up with the
`pages.json` file:

Key | Description
--- | -----------
`pages` | An array of paths to pages to view; don't include the initial `/` on their paths.
`default_comparison_source` | A domain to use for the left-hand-side view by default. Can be overridden from the UI. Defaults to the domain Jux is hosted at if not present.
`comparison_target` | A domain to use for the right-hand-side view. Not configurable from the UI.
`deploy_target` | A location to copy the built files to using Rsync when deploying using the provided Makefile.
