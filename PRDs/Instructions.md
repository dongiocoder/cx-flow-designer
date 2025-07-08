Copy-paste the text below into your spec file.
It is a pure product description—no code hints, no file trees—so the Cursor agent can translate it into implementation details.

⸻

0. Overview

The application is a single workbench with two working modes that swap inside the same page frame:
	1.	Contact-Driver Table – default view where teams manage every driver, its data, and its flows.
	2.	Flow Editor – full-width canvas for drawing or updating one flow.

The top header never changes; all settings and utilities appear as overlays or drawers.

⸻

1. Global header
	•	Logo (left) – clicking it always returns to the Contact-Driver Table and clears any open drawers or modals.
	•	Avatar button (right) – opens a dropdown with:
	•	Profile
	•	Billing
	•	Account
	•	Tools
	•	Log out
Each item launches a modal dialog; none of them navigate away from the page.
	•	Nothing else lives in the header—no search field, no KPI widgets, no side navigation.

⸻

2. Contact-Driver Table (default mode)

2.1 Table layout

Columns (left → right):

Name	Tier	Volume / month	Avg Handle Time	CSAT	Current Flow	Drafts count	Last modified	…


	•	Current Flow column shows one green-border chip (e.g. “v 3.2”).
	•	Drafts column shows a blue badge such as “+2” when alternatives exist.
	•	Clicking anywhere on the row (except the “…” menu) opens the Driver Drawer to the right.

2.2 Controls above the table
	•	Add Driver – opens a modal form.
	•	Import data – launches a three-step wizard (upload file → map columns → confirm).
Both controls sit side-by-side and do not alter the header.

2.3 Bulk actions

An optional checkbox column supports bulk archive or delete of drivers (flows themselves are not selectable here).

⸻

3. Driver Drawer (opens from the right, width ≈ 400 px)

The drawer overlays the table but never covers the header. It contains a tab strip:
	1.	Volumes – static snapshot chart(s) showing contact volume per channel.
	2.	KPIs – grid of current numbers (AHT, CSAT, QA, etc.).
	3.	Flows – list of cards:
	•	Current Flow card (green border) with buttons Open and Duplicate.
	•	Zero - many Draft cards, each with Open, Set as Current, Delete.
	•	A persistent + New Flow button that starts a brand-new draft.

Closing the drawer (X or ESC) returns focus to the table row that launched it.

⸻

4. Flow Editor mode

Entered in two ways:
	•	+ New Flow button (creates blank draft tied to the driver).
	•	Open on any flow card (edits existing diagram).

4.1 Page composition
	•	The global header remains visible and unchanged.
	•	The entire main content area is replaced by:
	•	Editor top bar
	•	← Back to drivers – returns to the table and re-opens the originating driver drawer.
	•	Non-interactive label “Driver: <driver name>”.
	•	Save state indicator (e.g. “Saved • 3 s ago” or “Saving …”).
	•	React-Flow canvas filling all remaining space.

4.2 Leaving the editor
	•	Back button, browser Back, or Logo all restore the Contact-Driver Table.
	•	The table scroll position and any previously open drawer are restored so the user continues exactly where they left off.

⸻

5. Avatar dropdown details

Menu item	Behaviour
Profile	Opens a modal with name, email, password reset.
Billing	Modal with plan, payment method, invoices.
Account	Organisation settings (name, timezone, logo).
Tools	Miscellaneous utilities or feature flags (modal).
Log out	Ends session and redirects to sign-in.

No menu item performs a page-level navigation; all are modal overlays.

⸻

6. Data-import wizard
	•	Triggered from the Import data button.
	•	Three full-screen modal steps with a stepper indicator:
	1.	Upload – drag-and-drop XLS/CSV.
	2.	Map columns – dropdowns to match file columns to system fields.
	3.	Confirm – summary of rows to be added/updated.
	•	On completion, the wizard closes and a toast appears:
“June volumes imported • 15 drivers updated”.
	•	The Contact-Driver Table refreshes to reflect new numbers, and any open drawer updates in place.

⸻

7. Interaction summary
	1.	User logs in → lands on Contact-Driver Table.
	2.	Click driver row → Drawer slides in.
	3.	Click + New Flow → Flow Editor replaces table.
	4.	Finish edits → press Back → table view returns, drawer still open on same driver.
	5.	Avatar → Billing → modal opens; ESC closes it without leaving the page.

The result is a seamless, no-sidebar workbench where the user’s context never disappears—only the central workspace swaps between list-management and flow-design tasks.