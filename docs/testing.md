[Back to README](../README.md)

## Testing

The application currently uses one framework for frontend testing: [Jest](https://jestjs.io/). There are plans to implement back-end tests in the future.

### Jest Testing

Frontend tests leverage the [Jest framework](https://jestjs.io/).

To run the Jest test suite, execute the command `docker exec -it webpack_watcher npm test`.

To update snapshots, execute `docker exec -it webpack_watcher npm run-script update-snapshot`.

### LTI Browser Smoke Helper

The standalone launcher needs Google Chrome and the `playwright` package available locally. With Playwright installed in the project, run:

```sh
node scripts/lti-browser-chrome.mjs
```

Alternatively, set `PLAYWRIGHT_MODULE` to the absolute path of an isolated Playwright `index.mjs` before running the launcher. `CANVAS_TOOL_URL` and `MYLA_TOOL_ORIGIN` override the default Canvas test launch URL and ngrok origin when they change. Sign in and approve Okta directly in the opened browser, then enter `check` in the launcher terminal; enter `close` to end the session. Starting another instance of this launcher closes the previous launcher-controlled browser; other Chrome windows are unaffected. It does not save browser authentication state, so a replacement requires another sign-in.

The reusable `scripts/lti-browser-smoke.mjs` also exports `checkMylaViews` for an existing authenticated Playwright `page`:

```js
import { checkMylaViews } from './scripts/lti-browser-smoke.mjs'

await checkMylaViews(page, {
    toolOrigin: 'https://your-current-ngrok-domain.example'
})
```

The helper finds the tool frame by origin and checks navigation and loaded controls/content at desktop size (1280 x 800) by default. Mobile is not fully supported and is not an upgrade gate. Optional exploratory sizes can be supplied through the `viewports` option. It checks resource and grade charts, assignment controls, heading overflow, and sanitized API HTTP/network failures and uncaught page errors. Errors from Canvas itself can also be reported as page errors. It requires data by default; pass `expectedStates: { resources: 'empty', grades: 'empty' }` only when those empty states are the approved baseline. Unexpected empty states and timeouts fail. These are smoke checks, not verification of grade values, all layout/overlap issues, or saved settings. The integrated browser cannot import the helper directly. See `.claude/lti-browser-testing-plan.md` for the manual handoff and real-course safety rules.

For optional heading-only screenshots when calling the helper, pass `screenshotDirectory: 'playwright-artifacts'`. The directory is gitignored. These screenshots do not capture the full page or establish a layout baseline; never capture course data without appropriate permission.

Run the synthetic browser regression checks with Chrome and Playwright installed using `node --test scripts/__tests__/lti-browser-smoke.test.mjs`. The same `PLAYWRIGHT_MODULE` override works for an isolated installation. These fixtures contain no Canvas or course data.

### Data Validation Testing

Data validation scripts are in `scripts/data_validation` folder.
To run the data validation scripts, follow the steps below:

1. Copy `env_validation.hjson` file from `env_sample.hjson` file
    ```sh
    cp scripts/data_validation/env_sample.hjson scripts/data_validation/env_validation.hjson
    ```

2. Update the configuration values. Note the hard-coded Michigan specific filters in various query strings.
Please adjust those values based on your institution's needs.

3. Run the data validation script within the Docker container:

    - Validate queries using UDP BigQuery Expanded Table:
    This script will validate queries against the UDP BigQuery `expanded` table,
    and compare whether the data results are identical with those returned from the `events` table queries.
        ```sh
        docker exec -it student_dashboard /bin/bash -c \
            "python scripts/data_validation/validate_udp_events_vs_expanded.py"
        ```

[Next: Contributing](../docs/CONTRIBUTING.md)
