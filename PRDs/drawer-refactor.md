# UI-Refinement: Wide “Inspector” Drawer & Flow Interaction  
_08 Jul 2025 – authoritative spec_

---

## 0 · Objective
* Replace the current narrow, tabbed drawer with a **single-scroll, wide Inspector** that shows **all driver information at once**.
* Keep the one-page workbench model: the header never changes; the contact-driver table always lives beneath any overlay.

---

## 1 · Updated interaction map

| Step | What the user sees |
|------|--------------------|
| 1. Land on `Contact-Driver Table` | Table + “New Contact Driver” + “Import data” buttons. |
| 2. Click a driver row | **Inspector Drawer** slides in from the right, --> width ≈ 60 % of viewport. |
| 3. Click **Open** (or **+ New draft**) on a flow card | Table fades, **Flow Editor** takes over the main area. Header remains constant. |
| 4. Click **← Back to drivers** in the editor | Contact-driver table re-appears **with the same drawer still open**. |

---

## 2 · Inspector Drawer layout (top→bottom)

1. **Fixed header (sticky)**
   * Driver name -- bold 18 pt  
   * Tier pill (colour) next to name  
   * Close **✕** on the right  
   * One-line driver description directly below the name

2. **KPI chips (horizontal)**
   * Avg Handle Time · CSAT · QA Score · Volume / month  
   * 56 × 56 px blocks, arrow indicator if trend is known

3. **Contact volume list**
   * “Phone — 123”, “Email — 456”, “Chat — 789”  
   * Display 3–5 lines max; no charts

4. **CURRENT FLOW** section  
   * Single card with green left-border  
   * Buttons: **Open** · Duplicate

5. **DRAFTS (n)** section  
   * One card per draft with blue left-border  
   * Buttons: **Open** · Set Live · Delete  
   * **＋ New draft** link after the last card

6. **Spacing & scroll**  
   * 24 px vertical rhythm between sections  
   * Drawer itself scrolls (`overflow-y: auto`) while header stays fixed

> **Visual note**: cards use a soft shadow and 16 px internal padding; left border 4 px indicates status, not a full background fill.

---

## 3 · Behavioural rules

* Drawer width: `min(960 px, 60 vw)`  
* Table background dim: 15 % opacity; still interactive if drawer is closed  
* Closing drawer: `ESC`, click outside, or **✕**  
* URL retains context: `/app?driver={id}` so refresh re-opens the drawer  
* Bulk driver selection disables drawer access and surfaces a top bulk-action bar instead

---

## 4 · Flow Editor specifics (unchanged except for Back behaviour)

* Opens at `/flow/{id}` (existing) or `/flow/new?driver={id}` (new)  
* Top bar inside the editor: **← Back to drivers** • “Driver: …” • save state indicator  
* Back button returns to table **with drawer re-loaded**; browser Back does the same

---

## 5 · Acceptance checklist

- [ ] Drawer opens to **60 % width**, dims table, scrolls independently  
- [ ] Header contains **name + tier + description + ✕** only  
- [ ] All KPI chips, volume list, current flow card, drafts list, and “＋ New draft” are visible without secondary navigation  
- [ ] Flow card actions work, immediately reflecting state changes  
- [ ] Opening any flow navigates to the editor; Back returns with drawer still open  
- [ ] Keyboard: `ESC` closes drawer; arrow keys navigate table rows as before  
- [ ] Bulk selection bar overrides drawer opening when ≥1 checkbox is ticked

_When every box is green, the UI refactor is done._