# Trump’s Impossible Daily — Game and Admin Test Plan

**Version:** 1.0  
**Prepared:** 4 November 2026  
**Production URL:** <https://satiricalgames.github.io/TrumpsImpossibleGame/>  
**Admin URL:** <https://satiricalgames.github.io/TrumpsImpossibleGame/admin/>  
**Execution status:** Partial run completed 4 November 2026 — see `TEST_EXECUTION_REPORT_2026-11-04.md`

## 1. Purpose

This plan verifies the complete player journey and all currently deployed admin tools. It covers daily questions, the weekly tiled image puzzle, scoring and persistence, social sharing, browser/PWA behavior, content editing, validation, file import/export, and the hand-off between admin data and the published game.

The plan is written for repeatable manual execution. Test IDs can also be used as the basis for future Playwright or browser automation.

## 2. Current supported scope

The deployed product currently contains:

- 55 daily questions: 50 `standard` and 5 `live`.
- Five questions per local calendar day.
- Seven scheduled days per week, with 35 unique scheduled questions expected.
- One weekly image divided into a 5 × 5 grid of 25 covered tiles.
- One rectangular Trump target defined with percentage coordinates.
- One Trump guess per player per local day.
- Local-only player progress stored in IndexedDB with a localStorage fallback.
- Native device sharing when Web Share is available, with clipboard fallback.
- A seven-day testing clock.
- A PWA manifest and service worker.
- One Admin HQ and five content tools.

### Question-type boundary

Only four-choice `standard` and `live` questions are supported by the deployed daily player and active Question Bank Manager. Older `injunction`, `hotspot`, `taco`, `bing`, `golf`, and `final` definitions remain in unreachable legacy editor code and are not acceptance scope unless the product is intentionally expanded later.

## 3. Roles

| Role | Responsibility |
|---|---|
| Test lead | Prepares clean browser profiles, assigns runs, records evidence, manages defects. |
| Player tester | Executes the game tests without editing source data. |
| Content tester | Exercises the admin tools using copies of JSON and image files. |
| Release owner | Confirms approved files are committed, built, and deployed together. |

## 4. Test environments

Run all P0 tests in Edge and at least one mobile browser. Run the remainder across the matrix before release.

| Environment | Minimum coverage |
|---|---|
| Microsoft Edge, current stable, Windows desktop | Full game and full admin suite; file picker; clipboard fallback; keyboard. |
| Google Chrome, current stable, Windows or macOS | Full game smoke; file import/export; service worker. |
| Safari, current iOS | Game, touch targeting, native share sheet, add-to-home-screen. |
| Chrome, current Android | Game, touch targeting, native share sheet, installable PWA. |
| Firefox, current stable | Game smoke and upload/download fallback where direct file saving is unsupported. |
| 375 × 667 CSS pixels | Small-phone layout. |
| 768 × 1024 CSS pixels | Tablet layout. |
| 1366 × 768 and 1920 × 1080 | Desktop layouts. |

Test normal and throttled networks, keyboard-only input, 200% zoom, and private/incognito storage where practical.

## 5. Test data and reset procedure

### Required test files

- Published `content/questions.json`.
- Published `content/weekly_game.json`.
- Published `content/rotating_orders.json`.
- Published `content/executive_metrics.json`.
- Published `content/jokes.json`.
- One valid PNG, JPEG, and WebP weekly picture.
- Invalid JSON files for negative tests: empty file, malformed JSON, wrong root type, duplicate IDs, missing required fields, and unsupported question type.

Never use the only working copy of a production JSON file for save tests. Make a disposable copy first.

### Reset player progress between cases

Use a separate browser profile for each independent scenario, or run the following in DevTools Console and reload:

```js
localStorage.removeItem('trumps-impossible-daily');
localStorage.removeItem('trumps-impossible-daily-test-day-offset');
indexedDB.deleteDatabase('trumps-impossible-daily');
location.reload();
```

Record the actual local date, time zone, browser version, screen size, and whether Web Share is available for every run.

## 6. Entry and exit criteria

### Entry criteria

- The target commit has passed TypeScript, lint, and the GitHub Pages build.
- All JSON files parse successfully.
- The weekly image path resolves and the target coordinates have been reviewed in the Weekly Game Scheduler.
- Testers have disposable copies of all admin files.

### Exit criteria

- Every P0 case passes in Edge desktop and one mobile browser.
- No open defect causes data loss, blocks daily completion, exposes a broken route, awards incorrect credits, accepts an invalid target, or produces an incorrect share result.
- All P1 failures are fixed or explicitly accepted by the release owner.
- Admin exports validate and can be rebuilt and deployed without manual repair.

### Result codes

`PASS`, `FAIL`, `BLOCKED`, `NOT RUN`, or `NOT APPLICABLE`.

---

# Part A — Player Game Test Plan

## 7. Launch, home screen, and routing

| ID | Pri | Test and actions | Expected result |
|---|---:|---|---|
| G-001 | P0 | Open the production root URL with an empty profile. | Page returns successfully, no console-blocking error appears, loading state clears, and the home card is displayed. |
| G-002 | P0 | Reload the production URL and inspect network paths. | Scripts, icons, manifest, service worker, weekly picture, and navigation remain under `/TrumpsImpossibleGame/`; no root-path 404 occurs. |
| G-003 | P1 | Verify title, tagline, current date, local reset time, statistics, testing controls, parody notice, and ticker. | All text is visible, readable, and reflects the browser’s local date/time zone. |
| G-004 | P1 | Open at 375 px, 768 px, and desktop widths; rotate a mobile device. | No horizontal clipping, inaccessible control, unreadable text, or overlapping title/control occurs. |
| G-005 | P1 | Navigate with Tab, Shift+Tab, Enter, and Space. | Focus is visible and interactive controls work without a mouse. |
| G-006 | P1 | Zoom browser to 200%. | Core game remains usable without loss of content or controls. |
| G-007 | P1 | Open the game with JavaScript disabled. | A non-functional static shell is acceptable, but no sensitive data or secret is exposed; record the user experience for future progressive-enhancement decisions. |

## 8. Daily question engine — common behavior

| ID | Pri | Test and actions | Expected result |
|---|---:|---|---|
| G-010 | P0 | Select **Play Today’s 5 Questions**. | Question 1 of 5 opens with kicker, prompt, and exactly four choices labelled A–D. |
| G-011 | P0 | Answer a question correctly. | Correct choice is highlighted, the result says correct, the configured feedback for that choice appears, and answer buttons cannot be changed. |
| G-012 | P0 | Answer a question incorrectly. | Correct and selected wrong choices are distinguishable, result says wrong, and the selected choice’s configured feedback appears. |
| G-013 | P0 | Select **Next Question** after each answer. | The sequence advances exactly once, choice state resets, and the header increments to 5/5. |
| G-014 | P0 | Complete five questions with a known mix of answers. | Final score equals the number correct; the green/red result grid matches answer order. |
| G-015 | P0 | Complete all five correctly. | Score is 5/5, perfect-days increases by one, five weekly credits are earned, and streak data updates once. |
| G-016 | P1 | Complete all five incorrectly. | Score is 0/5, no reveal credits are earned, perfect-days does not increase, and completion is still saved. |
| G-017 | P0 | Return home after completion and press the main button again. | Today is marked complete and the player opens the weekly investigation; the daily quiz cannot be replayed for another score. |
| G-018 | P0 | Reload during an unanswered question. | Confirm and document current behavior. No previously completed daily result may be duplicated or corrupted. |
| G-019 | P0 | Reload after daily completion. | Completion, score, streak, and weekly credits persist. |
| G-020 | P1 | Double-click/tap an answer rapidly. | Only one answer is recorded and only one progression action becomes available. |
| G-021 | P1 | Test very long choice and feedback text at phone width. | Text wraps without covering controls or becoming unreadable. |

## 9. Standard question type

| ID | Pri | Test and actions | Expected result |
|---|---:|---|---|
| G-030 | P0 | Identify scheduled `standard` questions in the JSON and play at least one correct and one incorrect. | Prompt, four choices, correct index, and per-choice feedback match `questions.json`. |
| G-031 | P1 | Test standard questions whose correct answer is A, B, C, and D. | Every index is scored correctly; there is no off-by-one error. |
| G-032 | P1 | Test punctuation, apostrophes, ampersands, emoji, and long text from the bank. | Characters render correctly and are preserved in sharing and saved results. |
| G-033 | P1 | Compare all five questions for each day with `weekly_game.json`. | Every local day uses the five IDs scheduled for that weekday and preserves their order. |

## 10. Live-data question type

| ID | Pri | Test and actions | Expected result |
|---|---:|---|---|
| G-040 | P0 | Use the testing clock to reach days containing each of the five `live` questions. | Every live question renders as a valid four-choice question and scores the configured correct index. |
| G-041 | P0 | Compare each displayed live value with the published `questions.json` and `executive_metrics.json`. | Values and the configured metric reference agree with the approved content contract. Any stale or disconnected value is a defect. |
| G-042 | P1 | Change a metric in a test branch, rebuild, and play the associated live question. | The agreed product behavior is observed: either the correct choice updates from the metric or the release process explicitly updates the question choice. Record which contract applies. |
| G-043 | P1 | Supply a missing/invalid metric key in a test build. | Build/content validation should reject it, or the player should fail safely without presenting an incorrect answer. |

## 11. Scheduling, local dates, and testing clock

| ID | Pri | Test and actions | Expected result |
|---|---:|---|---|
| G-050 | P0 | From clean state, use **Advance One Day** repeatedly through +7. | The displayed date and weekday advance one local day at a time and each day loads its scheduled five questions. |
| G-051 | P0 | Reach +7 days. | Button becomes **7-Day Limit Reached** and cannot advance further. |
| G-052 | P0 | Select **Reset to Real Today**. | Offset key is removed, real local date returns, and home view opens. Player progress is not erased. |
| G-053 | P1 | Reload while at +1 through +7. | Testing offset persists and the same simulated date returns. |
| G-054 | P0 | Cross Sunday to Monday using the test clock. | A new weekly key is used; the new week begins with zero tiles, zero weekly score, and Trump not found. Historical statistics remain. |
| G-055 | P1 | Run in two materially different time zones around midnight. | “Today,” weekday schedule, daily lockout, and weekly rollover use the browser’s local calendar consistently. |
| G-056 | P1 | Complete today, then set the device/browser clock before and after midnight in a disposable profile. | Daily availability changes only at local date change; no duplicate score is created for one date. |

## 12. Weekly picture and 25-tile grid

| ID | Pri | Test and actions | Expected result |
|---|---:|---|---|
| G-060 | P0 | Open the weekly investigation after earning credits. | Correct weekly title, kicker, image, week key, 5 × 5 overlay, available credits, weekly score, and rank appear. |
| G-061 | P0 | Count the tile controls and inspect the source image. | Exactly 25 equal logical tiles cover the complete image; there are no gaps or overlaps at desktop and mobile widths. |
| G-062 | P0 | Reveal one covered tile. | One credit is consumed, that tile becomes visible and non-interactive, and all other tile states remain unchanged. |
| G-063 | P0 | Attempt to reveal with zero credits. | Covered tiles are disabled and no state changes. |
| G-064 | P1 | Rapidly click the same tile and adjacent tiles with one credit. | At most one new tile is recorded per available credit; duplicate tile IDs are impossible. |
| G-065 | P0 | Reload after revealing several tiles. | Exact revealed-tile set and credit balance persist. |
| G-066 | P0 | Earn more credits on later simulated days. | New credits equal cumulative correct answers minus already revealed tiles, capped by remaining tiles. |
| G-067 | P1 | Reach all 25 revealed tiles. | Grid is fully uncovered, no more reveal credit can be spent, and meltdown panel appears. |
| G-068 | P1 | Score from 26 through 35 weekly correct answers after all tiles are open. | Meltdown level rises from 1 to 10, label thresholds are correct, bar width matches level, and a configured response appears at 10. |
| G-069 | P1 | Verify image natural ratio, object-fit, and tile alignment at all target viewport sizes. | The target and tile coordinate system remain aligned with the displayed image. |
| G-070 | P1 | Use a screen reader on the weekly board. | Board exposes the configured image description; each tile has an accurate revealed/covered label. |

## 13. Trump target and guessing

| ID | Pri | Test and actions | Expected result |
|---|---:|---|---|
| G-080 | P0 | Before revealing any tile, inspect **I Know Where Trump Is**. | Guess button is disabled. |
| G-081 | P0 | Reveal a non-target tile, enter guess mode, and click a still-covered target area. | Guess is not consumed and message says the area is still classified. |
| G-082 | P0 | Reveal a non-target tile and guess inside that revealed tile but outside the configured target. | Guess is recorded as incorrect; today’s guess is consumed; total guesses increases once. |
| G-083 | P0 | Attempt a second guess on the same local day. | Button says today’s guess was used and no second guess is accepted. |
| G-084 | P0 | Advance one day after an incorrect guess. | A new guess is available while the same weekly tile/progress state persists. |
| G-085 | P0 | Reveal a tile intersecting the target and click clearly inside the target rectangle. | Trump is found, success count and tile count at discovery update once, and the found stamp appears. |
| G-086 | P0 | Click just outside each target edge and then test exact boundaries in disposable profiles. | Outside clicks fail; boundary behavior matches the inclusive percentage rectangle without mobile scaling error. |
| G-087 | P0 | Reload after finding Trump. | Found state and “found after N tiles” persist; no further Trump guess is offered that week. |
| G-088 | P1 | Find Trump with different numbers of revealed tiles. | `foundAtTiles`, average-supporting totals, and share text use the actual reveal count. |
| G-089 | P1 | Test target accuracy at phone, tablet, desktop, browser zoom, and device rotation. | The clickable target remains over the same visual subject. |

## 14. Statistics, ranks, and persistence

| ID | Pri | Test and actions | Expected result |
|---|---:|---|---|
| G-100 | P0 | Complete two consecutive simulated days. | Current streak increments to 2 and best streak is at least 2. |
| G-101 | P0 | Skip a simulated calendar day, then complete the next day. | Current streak resets to 1; best streak is preserved. |
| G-102 | P1 | Complete the same stored day again through reload/navigation attempts. | Streak and perfect-day totals do not increment twice. |
| G-103 | P1 | Verify rank thresholds at weekly totals 0, 10, 20, 25, 30, and 35. | Rank text changes at the defined boundary and not one point early/late. |
| G-104 | P0 | Close and reopen the browser. | IndexedDB state restores all days, weeks, scores, tiles, guesses, and aggregate statistics. |
| G-105 | P1 | Simulate IndexedDB failure while localStorage remains available. | LocalStorage fallback restores the player state without a crash. |
| G-106 | P1 | Deny persistent-storage permission/hint. | Game continues normally; persistence request failure is non-fatal. |
| G-107 | P1 | Reset only the test-day offset. | Player history remains intact. |
| G-108 | P1 | Perform the documented full test reset. | All player statistics, days, weeks, tiles, guesses, found state, and offset return to initial values. |

## 15. Sharing and social destinations

The game uses the operating system’s native share sheet when supported. It does not currently render separate Facebook/X/WhatsApp buttons. Test at least Messages, Mail, WhatsApp, and one social app that is installed on the mobile test device.

| ID | Pri | Test and actions | Expected result |
|---|---:|---|---|
| G-120 | P0 | Complete a day and select **Share Today’s Result** on iOS/Android. | Native share sheet opens with title, result text, and current game URL. |
| G-121 | P0 | Share to Messages/Mail. | Received content includes date, five-square grid, score, tile count, streak, Trump status, response text, and a working game URL. |
| G-122 | P1 | Share to WhatsApp and an installed social app. | Text remains legible, emoji survive, line breaks are sensible, and link opens the production game. |
| G-123 | P0 | Test desktop Edge where native share is unavailable or disabled. | Result plus URL is copied to clipboard and confirmation message appears. |
| G-124 | P1 | Deny clipboard permission during fallback. | Game remains usable; failure should be communicated rather than causing an unhandled rejection. Record current behavior. |
| G-125 | P1 | Cancel the native share sheet. | No duplicate share occurs. Record whether cancellation incorrectly triggers clipboard fallback. |
| G-126 | P1 | Share before Trump is found. | Text states that Trump remains under investigation. |
| G-127 | P1 | Share after Trump is found. | Text reports Trump found and the correct number of revealed tiles at discovery. |
| G-128 | P1 | Share at weekly totals 25 and 35. | Meltdown line is absent at 25 and correctly included at levels 1–10. |
| G-129 | P1 | Share from the GitHub Pages base path and from a future Cloudflare custom domain. | Shared URL matches the actual current origin/path and does not retain a stale host. |
| G-130 | P1 | Compare the player share result with `jokes.json` share templates. | Confirm the intended contract. If admin templates are expected to control player sharing but do not, log an integration defect. |

## 16. PWA, offline, caching, and installation

| ID | Pri | Test and actions | Expected result |
|---|---:|---|---|
| G-140 | P1 | Inspect `manifest.webmanifest`. | Name, short name, description, start URL, scope, colors, display mode, orientation, and 192/512 icons are valid under the deployed base path. |
| G-141 | P1 | Install/add to home screen on Android and iOS. | App launches with correct icon/title and stays in scope. |
| G-142 | P1 | Confirm service-worker registration and cache creation. | Worker activates without error and caches core game assets, icons, OG image, manifest, and weekly picture. |
| G-143 | P1 | Load once online, go offline, and reopen the current game route. | Cached shell and previously fetched assets load; player progress remains available. |
| G-144 | P1 | Request an uncached route while offline. | App falls back safely to the cached root rather than a browser network error. |
| G-145 | P1 | Deploy a changed asset, return online, and reload. | Network-first response updates the asset/cache and does not remain permanently stale. |
| G-146 | P2 | Confirm old cache versions are removed after a cache-name change. | Obsolete named caches are deleted during service-worker activation. |

## 17. Accessibility, privacy, security, and resilience

| ID | Pri | Test and actions | Expected result |
|---|---:|---|---|
| G-150 | P0 | Inspect browser network calls during a full game. | Player progress is not transmitted; only expected static assets, analytics/advertising if deliberately enabled, and share actions occur. |
| G-151 | P1 | Use keyboard only for daily questions, tiles, sharing, and navigation. | Every action is reachable and operable with visible focus. |
| G-152 | P1 | Use screen-reader heading and control navigation. | Page hierarchy, choice labels, statuses, tile labels, and buttons are understandable. |
| G-153 | P1 | Check contrast in normal, hover, focus, correct, wrong, disabled, and found states. | Text and meaningful controls meet the agreed accessibility threshold. |
| G-154 | P1 | Enable reduced-motion preference. | No essential information depends on animation; motion is tolerable or reduced. |
| G-155 | P1 | Block third-party scripts and wait beyond eight seconds. | Game remains fully usable and no empty advertising container consumes layout space. |
| G-156 | P1 | Inspect console through a full playthrough. | No uncaught exception, hydration error, repeated service-worker error, or invalid asset path appears. |
| G-157 | P1 | Directly open every game/admin route after a hard refresh. | Static routing works without relying on client navigation. |

---

# Part B — Admin Test Plan

## 18. Admin HQ

| ID | Pri | Test and actions | Expected result |
|---|---:|---|---|
| A-001 | P0 | Open `/admin/` directly. | Admin HQ loads and displays five editor cards plus links to the game and content guide. |
| A-002 | P0 | Open each editor card. | Correct base-path-safe route opens: questions, weekly, rotating orders, metrics, and jokes. |
| A-003 | P1 | Use browser Back/Forward and open links in new tabs. | Navigation is predictable and no editor draft is silently published. |
| A-004 | P0 | Inspect source metadata on Admin HQ and every editor. | `robots` and `googlebot` specify noindex/nofollow/noarchive/nosnippet/noimageindex. |
| A-005 | P0 | Open `/robots.txt`. | All six private-tool paths are disallowed under the active base path. |
| A-006 | P1 | Read the security-boundary notice. | It accurately states that tools edit/download local files only and publishing still requires authorized GitHub deployment. |
| A-007 | P1 | Test at phone, tablet, desktop, 200% zoom, and keyboard-only. | Cards and header links remain readable and operable. |

## 19. Question Bank Manager

| ID | Pri | Test and actions | Expected result |
|---|---:|---|---|
| Q-001 | P0 | Open `/question-editor/`. | Published question count, enabled count, live-data count, first selection, search, filter, and editor form load. |
| Q-002 | P0 | Filter All, Standard, Live-data, and Disabled. | Only matching questions appear and counts remain accurate. |
| Q-003 | P1 | Search by number, ID, kicker, and prompt fragment; clear search. | Matching list updates case-insensitively and restores correctly. |
| Q-004 | P0 | Add a valid standard question with four choices, four feedback lines, one correct answer, and original-satire provenance. | Draft accepts it, sorts by question number, count increases, and exported JSON contains normalized values. |
| Q-005 | P0 | Add a valid live question with a metric key. | Type and metric key are preserved in exported JSON and question is eligible for weekly scheduling. |
| Q-006 | P0 | Attempt unsupported type through uploaded JSON. | Import is rejected with a useful unsupported-type message. |
| Q-007 | P0 | Test invalid ID format, duplicate ID, invalid/duplicate number, missing kicker/prompt, empty choice, invalid correct index, missing feedback, and missing source. | Each invalid draft is blocked with the specific validation error. |
| Q-008 | P1 | Test official/reference source without complete HTTP(S) URL. | Draft is blocked. |
| Q-009 | P1 | Test internal/user-supplied source without project path. | Draft is blocked. |
| Q-010 | P1 | Add and remove multiple provenance records of every supported source kind. | Conditional URL/path fields and exported records remain correct. |
| Q-011 | P0 | Edit an existing question, including changing its ID and number to unused values. | Correct record is replaced once; no duplicate old/new record remains. |
| Q-012 | P0 | Delete an existing question; cancel once and confirm once. | Cancel changes nothing; confirm removes only that question and selection moves safely. |
| Q-013 | P0 | Upload the published valid file. | All questions import, normalize, sort by number, and display accurate counts. |
| Q-014 | P0 | Upload malformed JSON, empty array, duplicate IDs/numbers, missing arrays, and wrong root type. | Import is rejected; existing draft remains recoverable. |
| Q-015 | P0 | Download and parse `questions.json`. | File is valid JSON, contains the complete draft, and preserves four choices/feedback entries per question. |
| Q-016 | P1 | Copy complete JSON and paste into a validator. | Clipboard contains the same complete JSON as download. |
| Q-017 | P1 | Modify draft and select Reset. | Published built-in bank and counts are restored; unsaved changes are removed. |
| Q-018 | P1 | Open Weekly Scheduler link. | Correct base-path route opens. |

## 20. Weekly Game Scheduler and image targeting

| ID | Pri | Test and actions | Expected result |
|---|---:|---|---|
| W-001 | P0 | Open `/weekly-editor/`. | Published weekly details, picture, target box, 25-cell grid, enabled count, schedule, and responses load. |
| W-002 | P0 | Upload valid published questions JSON. | File name and enabled count update; compatible questions appear in selectors. |
| W-003 | P0 | Upload empty, malformed, duplicate-ID, unsupported-type, non-four-choice, or invalid-index question bank. | Upload is rejected with a useful message; prior valid bank remains. |
| W-004 | P0 | Set week-start to a non-Monday. | Schedule issue appears; generation and validated download are blocked. |
| W-005 | P0 | Set a Monday with at least 35 enabled questions and generate. | Exactly 35 unique enabled IDs are assigned, five per day. |
| W-006 | P1 | Generate twice with the same week-start and unchanged bank. | Deterministic schedule is identical. |
| W-007 | P1 | Generate with another Monday. | A valid deterministic schedule is produced and may differ from the prior week. |
| W-008 | P0 | Manually duplicate a question, leave a slot empty, select disabled/missing ID through imported data, or produce fewer than five for a day. | Visible schedule issues identify repeated, missing/disabled, or wrong-count items; download is blocked. |
| W-009 | P0 | Upload PNG, JPEG, and WebP pictures. | Browser preview updates and JSON path becomes `/assets/weekly/<filename>`; upload alone does not publish the image. |
| W-010 | P1 | Try a non-image file. | File chooser rejects it or the editor reports a safe failure. |
| W-011 | P0 | Click Trump at image center and near each edge. | Red target moves to the click and clamps fully inside 0–100% bounds. |
| W-012 | P0 | Edit x/y/width/height numerically. | Target rectangle moves/resizes accurately over the 25-cell preview. Invalid out-of-range data should be blocked before release. |
| W-013 | P0 | Verify target against the eventual player view at phone and desktop sizes. | Same visual subject is inside the player’s clickable rectangle at every size. |
| W-014 | P1 | Edit title, kicker, image path, and accessible description. | Values persist in the downloaded weekly file; image description is meaningful and non-empty. |
| W-015 | P1 | Add/remove meltdown-response lines and blank lines. | Non-empty normalized response list exports in displayed order. |
| W-016 | P0 | Download a valid week. | Filename contains week-start; JSON has all weekly fields and parses successfully. |
| W-017 | P1 | Reset after modifications/uploads. | Published weekly data, question bank, filename, preview, target, schedule, and status are restored. |
| W-018 | P0 | Publish JSON without its referenced picture in a test branch. | Build or production smoke detects missing image; release is rejected. |

## 21. Rotating Orders Editor

| ID | Pri | Test and actions | Expected result |
|---|---:|---|---|
| R-001 | P0 | Open `/rotating-orders-editor/`. | File-enabled flag, active order, order list, selected order, and JSON preview load. |
| R-002 | P0 | Add a valid standard rotating order. | Next number is at least 101, order is added once, and complete draft remains valid. |
| R-003 | P0 | Test invalid/duplicate ID, number below 101, duplicate number, non-standard type, missing kicker/prompt, fewer than two choices, feedback mismatch, invalid correct index, or missing source. | Update/add is blocked with specific validation errors. |
| R-004 | P1 | Test all source-kind URL/path requirements. | Same provenance rules as Question Manager are enforced. |
| R-005 | P0 | Edit, enable/disable, and remove an order. | Only intended order changes; active order remains valid or validation blocks export. |
| R-006 | P0 | Toggle file-level enabled and select active order. | Complete JSON preview and export reflect the settings. |
| R-007 | P0 | Upload/open a valid complete file. | All orders and settings load; direct-save handle is retained only for **Open Local File**. |
| R-008 | P0 | Upload invalid root, empty orders, or activeOrderId not present. | Import/export is blocked with useful errors. |
| R-009 | P0 | Save to an opened disposable local file. | Exact validated complete JSON replaces that file and unsaved indicator clears. |
| R-010 | P1 | Select Save without opening a file. | No write occurs; status instructs user to open or download. |
| R-011 | P1 | Download, copy, preview JSON, and reset. | Outputs are complete/equivalent; reset restores built-in file. |
| R-012 | P1 | Navigate away with an unsaved dirty draft. | Browser warns before data loss where supported. |
| R-013 | P1 | Publish an enabled active rotating order in a test branch. | Confirm whether the player consumes it. If not, log an integration defect or mark feature as admin-only by design. |

## 22. Executive Metrics Editor

| ID | Pri | Test and actions | Expected result |
|---|---:|---|---|
| M-001 | P0 | Open `/executive-metrics-editor/`. | Built-in metrics and complete JSON preview load. |
| M-002 | P0 | Enter valid whole-number injunction, golf, order value, and 0–100 poll values. | Validation succeeds and normalized numbers export. |
| M-003 | P0 | Test negatives, decimals, poll below 0/above 100, missing order object/label, invalid date, invalid timestamp, and blank ticker. | Each invalid value is blocked with a specific message. |
| M-004 | P1 | Test 0 and large whole-number boundaries. | Valid boundaries are retained without string conversion or rounding. |
| M-005 | P0 | Upload/open valid and malformed files. | Valid file loads; malformed/invalid file is rejected without destroying current draft. |
| M-006 | P0 | Save to an opened disposable file, then parse it. | Complete validated JSON is written and dirty state clears. |
| M-007 | P1 | Download, copy, validate, preview, reset, and open Question Editor link. | All controls work and outputs agree. |
| M-008 | P1 | Navigate away with dirty changes. | Unsaved-change warning appears where supported. |
| M-009 | P0 | Change each selectable metric in a test branch and play its associated live question. | Player behavior matches the approved live-data contract; disconnected metrics are logged as integration defects. |

## 23. Jokes and Wording Editor

| ID | Pri | Test and actions | Expected result |
|---|---:|---|---|
| J-001 | P0 | Open `/jokes-editor/`. | Ticker, recovery lines, nine share-template variations, labels, status, and JSON preview load. |
| J-002 | P0 | Edit ticker and recovery lists with blank surrounding lines. | Validation removes blank lines and preserves non-empty order. |
| J-003 | P0 | Remove all ticker or all recovery lines. | Validation blocks save/download. |
| J-004 | P0 | Test fewer/more than three variations in imported JSON. | Each share category is required to contain exactly three variations. |
| J-005 | P0 | Remove each required token from default, early, and late templates. | Validation identifies the missing token in the exact category/variation. |
| J-006 | P0 | Blank each interface label. | Validation blocks the file and names the missing label. |
| J-007 | P0 | Upload/open valid and malformed files. | Valid content loads; invalid content is rejected safely. |
| J-008 | P0 | Save to an opened disposable file. | Valid complete JSON is written and dirty indicator clears. |
| J-009 | P1 | Download, copy, preview, reset, and content-guide link. | Outputs agree and reset restores built-in wording. |
| J-010 | P1 | Navigate away with dirty changes. | Unsaved-change warning appears where supported. |
| J-011 | P0 | Publish changed ticker, recovery, share templates, and labels in a test branch. | Confirm every expected player surface changes. Any admin field not consumed by the player is logged as an integration defect or documented as reserved. |

## 24. Cross-editor and release integration

| ID | Pri | Test and actions | Expected result |
|---|---:|---|---|
| X-001 | P0 | Add a question, export questions, import it into Weekly Scheduler, schedule it, export weekly JSON, and build. | New question appears on its scheduled day and scores/feeds credits correctly. |
| X-002 | P0 | Disable a scheduled question and import the bank into Weekly Scheduler. | Scheduler flags it as missing/disabled and prevents download until replaced. |
| X-003 | P0 | Rename/delete a question used by the weekly file. | Cross-file validation or scheduler flags every stale ID. |
| X-004 | P0 | Upload a new weekly picture, position target, export JSON, add image to `public/assets/weekly`, build, and play. | Picture, tiles, target, alt text, and share state are correct in production-equivalent output. |
| X-005 | P0 | Change a live metric and its question, publish both together, and play. | Displayed answer and scoring match the approved value. |
| X-006 | P1 | Change jokes/labels and publish. | All intended player strings update, or unused fields are explicitly classified as future/reserved. |
| X-007 | P1 | Enable a rotating order and publish. | Intended player bonus behavior appears, or the feature is explicitly classified as admin-only/not integrated. |
| X-008 | P0 | Build with GitHub Pages environment variables. | Static export contains root game, Admin HQ, all editors, `robots.txt`, manifest, service worker, weekly image, and correct base-path assets. |
| X-009 | P0 | Deploy to GitHub Pages and hard-refresh every route. | Workflow succeeds and all routes/assets return HTTP 200. |
| X-010 | P1 | Build for a future Cloudflare root/custom domain with no GitHub base path. | Links, assets, manifest, service worker scope, robots rules, and shared URL work at root. |

## 25. Admin browser/file compatibility

| ID | Pri | Test and actions | Expected result |
|---|---:|---|---|
| B-001 | P0 | Test **Open Local File** and **Save to Open File** in supported Edge/Chrome. | File System Access picker works only after user gesture and writes only the selected file. |
| B-002 | P1 | Test the same controls in Firefox/Safari where direct file access may be unsupported. | Clear status directs user to Upload/Download; editor remains usable. |
| B-003 | P0 | Cancel file open/upload/save dialogs. | No error, data loss, or stale handle occurs. |
| B-004 | P0 | Deny clipboard permission. | Editor handles failure without losing draft; record whether user-facing error needs improvement. |
| B-005 | P1 | Download every JSON type twice. | Correct filenames and complete valid contents are produced; browser duplicate-name suffixes do not affect content. |
| B-006 | P1 | Use keyboard-only and a screen reader across all editors. | Form labels, status messages, errors, tabs, selectors, previews, and destructive actions are understandable and operable. |
| B-007 | P1 | Resize/zoom all admin pages. | Forms reflow without clipped fields, unreachable actions, or unreadable JSON preview. |

## 26. Deployment and security regression

| ID | Pri | Test and actions | Expected result |
|---|---:|---|---|
| D-001 | P0 | Push an approved commit to `main`. | GitHub workflow installs locked dependencies, builds static export, uploads artifact, and deploys successfully. |
| D-002 | P0 | Verify deployed commit SHA and page last-modified time. | Live deployment corresponds to the approved source commit. |
| D-003 | P0 | Verify Admin HQ and five editors after deployment. | Every route returns 200 and contains noindex metadata. |
| D-004 | P0 | Verify the game root is indexable while admin routes are excluded. | Root does not inherit admin noindex; `robots.txt` allows root and disallows private-tool paths. |
| D-005 | P1 | Inspect repository and built assets for secrets/passwords/tokens. | No secret, password, API credential, or private key is present in client-delivered code or committed files. |
| D-006 | P1 | Confirm GitHub 2FA and `main` protection with the repository owner. | Account uses 2FA; force pushes/deletions are blocked and the agreed pull-request rule is active. |
| D-007 | P1 | When Cloudflare is connected, protect admin hostname/routes with Cloudflare Access and keep the player public. | Unauthenticated admin request is blocked before static content is served; authorized owner can reach all tools; game remains public. |

---

## 27. Known implementation risks to resolve during testing

These are not assumed failures, but they require explicit product decisions and evidence before final sign-off:

1. **Live metrics integration:** the player currently consumes `questions.json` directly. Confirm whether `executive_metrics.json` is expected to replace live-answer values automatically or is a content-authoring reference only.
2. **Jokes integration:** the player’s current share text and ticker wording are implemented directly in the game. Confirm which `jokes.json` fields are expected to control live player output.
3. **Rotating orders integration:** the editor and JSON exist, but the daily player must be verified to consume them before this feature is advertised.
4. **Legacy question types:** older editor code mentions six additional types that the active player and active manager do not support. Keep them out of production content until deliberately rebuilt and separately tested.
5. **Test reset:** there is no in-game full-progress reset button. Manual browser-storage reset is currently required for isolated testing.
6. **Native sharing:** available destinations and formatting vary by installed apps, OS, and browser. Clipboard fallback needs explicit denial/cancellation testing.
7. **Admin privacy:** noindex and robots rules discourage discovery but are not authentication. Real access control begins only when Cloudflare Access or an equivalent server-side gate is configured.

## 28. Defect record template

For every failure, record:

- Defect ID and linked test ID.
- Build/commit SHA and URL.
- Browser, OS, viewport, device, local date/time zone.
- Clean or pre-populated storage state.
- Exact steps and expected/actual result.
- Screenshot/video and console/network evidence.
- Exported JSON or share payload when relevant.
- Severity: blocker, critical, major, minor, or cosmetic.
- Reproducibility and workaround.

## 29. Suggested execution order

1. Run deployment smoke: D-001 through D-005.
2. Run clean-profile player path: G-001, G-010–G-019, G-060–G-066, G-080–G-087, and G-120–G-123.
3. Run seven-day schedule/streak/weekly-rollover suite.
4. Run mobile target and sharing suite.
5. Run PWA/offline, accessibility, privacy, and resilience suites.
6. Run Admin HQ and each editor with disposable files.
7. Run cross-editor publication flow in a test branch.
8. Re-run the P0 smoke suite against the deployed candidate.

