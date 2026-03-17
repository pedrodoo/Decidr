# Components

Reusable UI used on the decision input flow. All are used on `/decisions/new`.

| Component | Role | Main props |
|-----------|------|------------|
| **AudienceGate** | Audience selection screen before the steps. User picks who they’re communicating to (e.g. CEO); copy and coaching tone are keyed by audience. | `onStart(audience)` — called with `{ id, label }` when user clicks Start. |
| **AudienceIndicator** | Pill in the steps header showing the current audience. Clicking it resets back to the gate. | `label` (e.g. `"CEO"`), `onReset()`. |
| **StepProgress** | Step tabs: 1 — Context, 2 — Analysis, 3 — Outcomes. Display-only; parent controls `currentStep`. | `currentStep` (1–3). |
| **CoachResponse** | Inline coach block shown after the user submits a step. Shows intro, optional questions, challenge, and Continue. | `visible`, `stepLabel`, `audienceLabel`, `intro`, `questions[]`, `challenge`, `challengeIsPositive`, `onContinue()`, `continueLabel`. |

Copy for these components comes from `$lib/strings.js` (e.g. `strings.audienceGate`, `strings.stepProgress`, `strings.coach`).
