Drawer refinement — Flows only

(Leave the KPI chips and Contact-Volume block exactly as they are; change nothing else in the drawer.)

⸻

1. Visual goals for the flow area

Objective	Why
Cut vertical bulk	You should see at least one Current + three Draft cards on a laptop screen.
Instant hierarchy	“Current Flow” must pop; drafts should read as secondary options.
Simplify actions	A single obvious click-target to open, plus compact secondary actions.


⸻

2. Card anatomy   (Current & Draft use the same shell)

▌status-colour  Title (16 / semi-bold)   v 3.4      ⠇
                One-line description (14 / grey-700)
                Last edited 2025-07-07
                —  Duplicate   •   Set Live / Delete  —

Element	Spec
Left border	4 px — Green #4ade80 for Current, Blue #38bdf8 for Draft.
Background tint	Only on Current → 3 % green (rgba(74,222,128,0.03)); Draft stays white.
Padding	12 px all around.
Height	≤ 96 px (one-line desc) – roughly 35 % shorter than today.
Clickable area	Entire card opens the Flow Editor. Remove the large Open button.
Action row	12 px font, pill buttons 28 px tall:
	• Current → Duplicate only.
	• Draft → Set Live • Delete (Duplicate lives in ⠇ menu).
Overflow menu	Tiny ⠇ icon, hover/focus reveals Duplicate + Delete as alt clicks.
Hover/focus	Card lifts with a light shadow; 2 px blue outline on keyboard focus.


⸻

3. Section layout & labels
	•	Heading “CURRENT FLOW” (12 px, uppercase, grey-600)
→ 16 px margin above the first card.
	•	Heading “DRAFTS (n)” — 16 px above its first card.
	•	16 px vertical gap between cards (Current→Draft, Draft→Draft).

⸻

4. Draft overflow rule

If there are more than three drafts:
show first two, then a collapsed dashed card:

＋  Show 3 more drafts

	•	Click reveals the remaining drafts and disappears.

⸻

5. Interaction specifics

Action	Result
Click or ENTER anywhere on card	Navigate to /flow/{id} (or /flow/new?driver=…).
Set Live on a draft	Draft card turns green, moves to Current section; previous Current demotes to Draft (blue). Toast: “Draft promoted to current.”
Delete draft	Card fades out 150 ms, then is removed; toast confirms.
Duplicate (menu or pill)	New Draft card appears directly below source, named “Copy of …”.

Drawer width, KPI chips, and volume tiles stay untouched.

⸻

6. Acceptance checklist (flows area only)
	•	No “Open” button; card body triggers open.
	•	Current card tinted; Draft cards white.
	•	Card padding 12 px; total height ≤ 96 px.
	•	Action pills 28 px tall, font 12 px; pills match relevance rules above.
	•	Draft overflow placeholder appears when drafts > 3 and toggles correctly.
	•	Promotion, deletion, duplication update UI instantly and fire toasts.

Deliver these changes; everything else in the drawer remains exactly as it is today.