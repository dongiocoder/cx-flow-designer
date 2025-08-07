# Product Requirements Document (PRD)

**Feature:** Client Home Snapshot (Dashboard Landing Page)
**Product Area:** AI BPO Platform – Client Workspace
**Owner:** (Your Name)
**Date:** July 25, 2025

---

## 1. Summary / Context

The Client Home Snapshot is the first screen a client (or prospect) sees after logging into their dedicated workspace. It provides a high-level snapshot of their current CX situation: volumes, contact drivers, staffing/costs, tool stack, knowledge base inventory, and manual vs automated workload. It is **not** the analytics module (which focuses on live AI performance) but a pre- and early-engagement overview used to align scope, capture baselines, and guide decision-making.

The screen is composed of self-contained **cards**. Each card displays top-level metrics and offers clear CTAs to view full details or edit the underlying data. The layout avoids nesting and redundancy, ensuring a fast, at-a-glance understanding.

---

## 1. High-Level UX Overview

* **Top Bar:** Client name/logo, status (Prospect/Onboarding/Live/Expansion), last updated timestamp, data completeness %, and an “Edit Snapshot” trigger.
* **Card Grid:** 2–3 columns responsive layout. Each card covers a domain:

  1. Contact Drivers
  2. Volume & Channels
  3. Knowledge Base
  4. Team & Providers
  5. Cost Snapshot
  6. Manual vs Automated
  7. Stack Overview

Each card contains:

* A concise title and headline numbers.
* Optional mini visualizations (very light weight).
* A maximum of 2 CTAs (e.g., “View all”, “Edit”).
* No redundant metrics already shown in other cards.

---

## 2. Card Specifications

### 2.1 Contact Drivers Card

**Purpose:** Show top drivers and total count.

* **Display:**

  * Total Drivers: integer
  * Top 3 (Name – Volume/mo)
* **CTAs:** “View all drivers”, “+ New driver”
* **States:**

  * Empty: Prompt to add first driver
  * Partial data: Show available drivers with warning icon for missing volumes
* **Edit Entry Point:** “+ New driver” opens modal/form; “View all drivers” routes to Drivers section

### 2.2 Volume & Channels Card

**Purpose:** Summarize total contacts and channel split, plus which platform handles each channel.

* **Display:**

  * Total Contacts/month
  * Channel split: Email %, Chat %, Phone %, Social %, etc. (mini bar/donut or inline text)
  * Platform icons per channel (e.g., Email → Zendesk)
* **CTAs:** “Edit volumes & channels”
* **States:**

  * Empty: Show “Add volumes” CTA
  * Incomplete: Highlight missing channel/platform mappings

### 2.3 Knowledge Base Card

**Purpose:** Snapshot of content assets and where they live.

* **Display:**

  * Totals by type: KB Articles, Macros, Talking Points, SOPs, Product Sheets
  * Source/platform icons: Zendesk Guide, Notion, GDrive, etc.
* **CTAs:** “Manage knowledge base”, “Import / Upload”
* **States:**

  * Empty: Suggest importing or uploading assets

### 2.4 Team & Providers Card

**Purpose:** Show headcount distribution across internal team and external BPOs.

* **Display:**

  * Total agents
  * Breakdown: Internal (Client logo), BPO A (logo), BPO B (logo), with counts
* **CTAs:** “Edit staffing & costs”
* **States:**

  * Empty: “Add staffing info” CTA

### 2.5 Cost Snapshot Card

**Purpose:** Show cost totals and cost/contact.

* **Display:**

  * Total monthly cost (calculated from staffing unless overridden)
  * Avg cost/contact (show override indicator if manually set)
* **CTAs:** “Edit cost assumptions”
* **States:**

  * Empty: Prompt to input cost or allow auto-calc once staffing is provided

### 2.6 Manual vs Automated Card

**Purpose:** Indicate current workload split. Optionally show “Before” baseline if available.

* **Display:**

  * Current: Manual X% / Automated Y%
  * Before: Optional line “Before automation: 100% Manual” (if baseline captured)
* **CTAs:** “View automation metrics” (routes to Analytics/Live Ops)
* **States:**

  * Prospect: 100% Manual by default with note “Planned automation”

### 2.7 Stack Overview Card

**Purpose:** Show which tools are in play and what they’re used for.

* **Display:** Icons + short labels (e.g., Zendesk – CX; Salesforce – CRM; Five9 – Telephony)
* **CTAs:** “Manage stack”
* **States:**

  * Empty: “Add tools” CTA

###

---

##

**End of PRD**
