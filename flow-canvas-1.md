# React‑Flow Designer – Descriptive Spec (v 1.0)

This note is **concept‑only**: no snippets, no TypeScript, no JSX – just words that explain *what* the interface must do and *why*. Use it as the north‑star when refactoring the Flow‑Builder UI.

---

## 1  Canvas Philosophy

1. **Free‑form first** – designers can drag steps anywhere on the grid.
2. **Minimal shapes** – one pill for Start/Outcome, one rounded rectangle for everything else; diamonds only if a formal gateway is essential.
3. **Colour = category** – a thin left border tells you whether the step is Self‑Service (blue), Contact Channel (purple), Agent (green) or Outcome (black).
4. **Edge = logic** – branches are explained by the colour, label and pattern of the connecting line, not by extra node clutter.
5. **Collapse‑to‑clarity** – large chunks (e.g. an entire driver) can be folded into a single group box so the board stays readable.

---

## 2  Header & Toolbar – the new anatomy

| Zone                        | Element               | Purpose               | Behaviour                                                                                           |
| --------------------------- | --------------------- | --------------------- | --------------------------------------------------------------------------------------------------- |
| **Breadcrumb rail** (left)  | ◀ **Back to Drivers** | Return to driver list | Always visible.                                                                                     |
|                             | **Driver:** *{name}*  | Context of the flow   | Click = rename.                                                                                     |
|                             | **Flow:** *{name}*    | Current flow          | Click = rename.                                                                                     |
| **Primary actions** (right) | **Save / Publish**    | Persist the diagram   | Disabled until dirty.                                                                               |
|                             | **Add Step ▾**        | Insert nodes          | Drop‑down groups: *Self‑Service, Channel, Agent, Outcome, Router, Cluster*.                         |
|                             | **View ▾**            | Tweak canvas          | Toggles: *Show Legend*, *Show Swim‑lanes*, *Scenario Lens* (filter path by axis/value), *Mini‑map*. |
|                             | **Auto‑Layout**       | Orthogonal tidy‑up    | Re‑routes edges, respects manual locks.                                                             |
|                             | **Import / Export ▾** | Data I/O              | Import *Excel* or *JSON*. Export *PNG, PDF, JSON*.                                                  |
|                             | **Run Test**          | Quick validation      | Simulate one journey and highlight the traversed edges.                                             |

> **Why drop “Settings”?**  Everything previously hidden there is now in *View* or *Import/Export*, so the button disappears.

---

## 3  Node Palette (verbal)

* **Start / Outcome (pill)** – icons ▶, ✔, ⚠, colours green for success, red for abandon.
* **Rounded Rectangle** – default step; left border colour indicates category.

  * Blue = Self‑Service (Website Page, FAQ, Chatbot, etc.)
  * Purple = Contact Channel (Phone, Email, Chat, Messaging, Social DM, Forum)
  * Green = Agent Step (Greeting, Verification, Diagnosis, Resolution, Survey spiel)
  * Black = Outcome (Issue Resolved, CSAT Sent)
* **Router** – a special rectangle showing a stacked list of rules; appears automatically when a step needs more than five distinct branches.

---

## 4  Edge & Port Language

* **Edge colour = axis**

  * Gold – Customer Segment (VIP, New, At‑risk)
  * Orange – Issue Type (Billing, Legal, Tech)
  * Purple – Channel Capability (Rich‑text, Voice‑only)
  * Grey – Business Policy (Out‑of‑hours, Warranty)
  * Teal – Real‑time Metric (Bot confidence, Queue length)
* **Edge pattern** – solid (primary), dashed (escalation), dotted (timeout).
* **Port dots** – sit on the node border, inherit edge colour, carry a miniature icon matching the axis. Hover reveals the rule text.

---

## 5  Cluster / Driver Handling

* Every driver (e.g. *Order Status, Returns, WISMO*) lives inside a **collapsible outline** with its title in the header.
* Collapsed view shows a summary chip: step‑count and KPIs (deflection %, CSAT).
* Group boxes can nest, but keep nesting depth ≤ 2 to avoid visual recursion.

---

## 6  Legend Widget

A sticky, dismissible panel in the bottom‑right corner explains:

* Node border colours → categories
* Edge colours → branching axes
* Edge patterns → path semantics

The legend honours dark/light modes and fades to 40 % opacity when the mouse hasn’t moved for five seconds.

---

## 7  Interaction Cheatsheet

* **Drag‑drop** from **Add Step** menu directly onto the grid.
* **Double‑click** any node to rename; **⌘D** duplicates.
* **Hold R** then drag – rubber‑band selects multiple nodes.
* **C** – centres the view on the selected cluster.
* **⌘L** – triggers *Auto‑Layout*.
* **Shift‑hover** on an edge – shows full rule description.
* **Tab** – cycles through scenario lens presets (Segment → Issue → Policy → All).

---

## 8  Import Workflow (non‑technical outline)

1. A designer chooses **Import ▾ → Excel** and selects a workbook.
2. The wizard shows each worksheet as a preview; designer ticks the ones to ingest.
3. Columns are mapped via a three‑step wizard (row order defines sequence, `step_type`→role, `Intent`→branch rules).
4. Press **Generate Flow** → nodes & edges populate and clusters are named after the sheets.
5. Designer tweaks anything manually, presses **Save / Publish**.

---

## 9  Success Criteria

* A ten‑sheet workbook (≈ 300 rows) renders in under 3 s.
* No more than four colours and two shapes visible at default zoom.
* A stakeholder unfamiliar with the tool can, within 30 s, point to any coloured border or edge and name its meaning using only the legend.
* Auto‑layout never overlaps nodes or routes edges through a node centre.

---

*End of purely descriptive spec.*
