## Plan: Prefilled Registration PDF Generation

Generate a prefilled PDF registration form for each child of a selected parent, triggered from a post-enrollment success page. Uses pdf-lib (pure JS, no native deps) to overlay text and shapes onto a flat PDF template. One multi-page PDF is produced per parent (one page per child), opened in a new browser tab.

**Key facts discovered during planning:**

- `club-compass/public/Adventurer_Registration_Form.pdf` is a flat/static PDF with no AcroForm fields. Text and shapes must be overlaid using x,y coordinates in pdf-lib points (1 pt = 1/72 inch, origin bottom-left).
- pdf-lib supports `page.drawText()`, `page.drawEllipse()`, and `page.drawRectangle()` — all usable for filling fields and circling/boxing values.
- `parentsService.getChildrenByParentId(parentId)` already exists and queries the `parents_children` join table — no new service queries needed.
- Dropdowns use Chakra UI `NativeSelect` (established pattern across the app).
- The `page.jsx` + `view.jsx` pattern: page.jsx is a minimal Server Component wrapping `<View />` in `<Suspense>`.

**Steps**

1. Phase 1 — Move PDF template (no dependencies)
1. Move `club-compass/public/Adventurer_Registration_Form.pdf` to `club-compass/src/resources/Adventurer_Registration_Form.pdf`. Create the `src/resources/` directory. The server will access it via `fs.readFileSync(path.join(process.cwd(), 'src', 'resources', 'Adventurer_Registration_Form.pdf'))`. This file is never served statically.

1. Phase 2 — Install pdf-lib (no dependencies)
1. Inside `club-compass/`, run `npm install pdf-lib`. Confirm it appears in `package.json`.

1. Phase 3 — Update enrollment redirect (no dependencies on phases 1-2)
1. In `club-compass/src/app/[club_year_label]/families/enroll/view.jsx` line 101, change `router.push(`/${clubYearLabel}/dashboard`)` to `router.push(`/${clubYearLabel}/families/enroll/success?parentIds=${result.parents.map(p => p.id).join(',')}`)`. The API response already returns `{ parents: [...], children: [...] }` with IDs — parse the JSON response body before this redirect (currently `response.ok` is checked but the body is not parsed on success; add `const result = await response.json()` before the redirect).

1. Phase 4 — Create success page (depends on Phase 3)
1. Create `club-compass/src/app/[club_year_label]/families/enroll/success/page.jsx` as a minimal Server Component following the established pattern: import Suspense and View, export metadata `{ title: 'Enrollment Complete' }`, return `<Suspense><View /></Suspense>`.
1. Create `club-compass/src/app/[club_year_label]/families/enroll/success/view.jsx` as a `'use client'` component. Read `parentIds` (comma-separated) from `useSearchParams()`. On mount, fetch each parent's name via `GET /api/parents/[id]` (one request per parentId) using `Promise.all`. Store as `[{ id, first_name, last_name }, ...]`. Render a `NativeSelect` (Chakra UI) populated with parent names — pre-select if only one parent (set value state to that parent's id on load). Render three buttons: **Print Forms** (disabled when no parent selected) — calls `window.open(`/api/club-years/${clubYearLabel}/families/registration-form?parentId=${selectedParentId}`, '_blank')`; **Enroll Another Family** — `router.push(`/${clubYearLabel}/families/enroll`)`; **Done** — `router.push(`/${clubYearLabel}/dashboard`)`. Use `PageLayout` + `AppHeader` + `Breadcrumbs` for consistent layout. Breadcrumbs: `[{ label: 'Enroll Family', href: `/${clubYearLabel}/families/enroll` }, { label: 'Enrollment Complete' }]`.

1. Phase 5 — Create PDF API route (depends on Phase 1 and 2)
1. Create `club-compass/src/app/api/club-years/[club_year_label]/families/registration-form/route.js`. Export `async function GET(request, { params })`. Parse `parentId` from `new URL(request.url).searchParams`. Return 400 if missing. Call `parentsService.getById(parentId)` and `parentsService.getChildrenByParentId(parentId)` in parallel with `Promise.all`. Return 404 if parent not found; 400 if no children. Call `generateRegistrationPdf(parent, children)` from `@/lib/pdfUtils`. Return `new Response(pdfBytes, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="registration-${parent.last_name}.pdf"` } })`.

1. Phase 6 — Create PDF generation utility (depends on Phase 1 and 2)
1. Create `club-compass/src/lib/pdfUtils.js` and export `async function generateRegistrationPdf(parent, children)`. Load template bytes: `fs.readFileSync(path.join(process.cwd(), 'src', 'resources', 'Adventurer_Registration_Form.pdf'))`. Create a merged output document: `const mergedDoc = await PDFDocument.create()`. Embed a standard font (e.g. `StandardFonts.Helvetica`) in the merged doc. For each child in `children`: load a fresh copy of the template with `await PDFDocument.load(templateBytes)`, get page 0, call `page.drawText(value, { x, y, size, font })` for each field, call `page.drawEllipse(...)` or `page.drawRectangle(...)` for any circled/boxed values (borderColor only, no fill so the underlying template text remains visible), then copy the page into `mergedDoc` using `mergedDoc.copyPages(childDoc, [0])` and `mergedDoc.addPage(copiedPage)`. Return `await mergedDoc.save()` as `Uint8Array`.
1. **Field coordinate mapping** (most manual step): The field coordinates (x, y in points, bottom-left origin) must be determined by visually inspecting the PDF. A temporary dev helper route can be added that overlays a dot grid every 50 points with coordinate labels onto the blank template — this makes mapping trivial. Map at minimum: child first+last name, date of birth, sex (circle M or F), allergies, medical conditions, parent name, phone, email, address.

**Relevant files**

- `/Users/payros/Documents/Websites/Adventurers App/club-compass/public/Adventurer_Registration_Form.pdf` — move to src/resources/
- `/Users/payros/Documents/Websites/Adventurers App/club-compass/src/resources/Adventurer_Registration_Form.pdf` — destination after move
- `/Users/payros/Documents/Websites/Adventurers App/club-compass/src/app/[club_year_label]/families/enroll/view.jsx` — change router.push at line 101; parse response JSON on success to extract parent IDs
- `/Users/payros/Documents/Websites/Adventurers App/club-compass/src/app/[club_year_label]/families/enroll/success/page.jsx` — create (Server Component, Suspense wrapper)
- `/Users/payros/Documents/Websites/Adventurers App/club-compass/src/app/[club_year_label]/families/enroll/success/view.jsx` — create (Client Component, NativeSelect dropdown + 3 buttons)
- `/Users/payros/Documents/Websites/Adventurers App/club-compass/src/app/api/club-years/[club_year_label]/families/registration-form/route.js` — create (GET handler, returns PDF response)
- `/Users/payros/Documents/Websites/Adventurers App/club-compass/src/lib/pdfUtils.js` — create (generateRegistrationPdf function)
- `/Users/payros/Documents/Websites/Adventurers App/club-compass/src/services/parentsService.js` — reuse getById and getChildrenByParentId (no changes needed)
- `/Users/payros/Documents/Websites/Adventurers App/club-compass/src/app/api/parents/[id]/route.js` — reuse GET by id for success page parent name fetch (no changes needed)
- `/Users/payros/Documents/Websites/Adventurers App/club-compass/package.json` — add pdf-lib dependency

**Verification**

1. After moving the PDF, confirm `fs.readFileSync` in pdfUtils.js resolves correctly inside the Docker container (volume-mounted src/ maps to /app/src/).
2. Enroll a test family with 2 parents and 2 children. Confirm the redirect URL is `/${clubYearLabel}/families/enroll/success?parentIds=X,Y`.
3. On the success page, confirm both parents appear in the dropdown and both are selectable.
4. Select a parent and click Print Forms. Confirm a PDF opens in a new tab with one page per child.
5. Verify all text fields are correctly positioned on the form (child name, DOB, parent info, etc.).
6. Verify any circled/boxed values render with a visible border and no opaque fill.
7. Enroll a family with 1 parent — confirm the dropdown auto-selects that parent.
8. Click "Enroll Another Family" — confirm navigation back to the enroll form with a clean state.
9. Click "Done" — confirm navigation to the club year dashboard.

**Decisions**

- PDF is flat (no AcroForm fields); text must be placed by x,y coordinates in pdf-lib points.
- One PDF per parent (not per family); staff prints separately for each parent if needed.
- pdf-lib is pure JS and has no native binaries — safe for Docker.
- PDF template is stored in src/resources/ (server-only), never exposed via the public/ static folder.
- drawEllipse/drawRectangle with borderColor only (no fill) is used for circling/boxing values so underlying template text remains visible.
- Not included in this plan: emailing PDFs, persisting generated PDFs to disk or storage, re-downloading from child or parent detail pages.

**Further Considerations**

1. Coordinate mapping requires the developer to open the PDF and measure field positions. A temporary dev grid overlay route is the fastest approach — strongly recommended before hardcoding coordinates.
2. If children are enrolled across multiple club years, getChildrenByParentId returns all children ever associated with that parent. If the form should only include children enrolled in the current club year, add a club_year_label filter to the query in parentsService or pass it as a parameter to the API route and filter results.
3. Font choice: pdf-lib's StandardFonts.Helvetica does not support special characters (accented letters). If parent/child names may include characters like é, ñ, or ü, embed a custom TTF font via PDFDocument.embedFont() instead.
