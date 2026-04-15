# Google Play Data Safety Draft

Version date: April 15, 2026

Purpose: capture the current best-fit Play Console Data safety draft for the repo's present offline-first product model.

Important: this draft is based on the current repo behavior and current official Google Play policy guidance. Re-check the Play Console form and policy docs immediately before any closed, open, or production track submission.

Official references:

- [Provide information for Google Play's Data safety section](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)
- [Developer Program Policy - Privacy Policy](https://support.google.com/googleplay/android-developer/answer/16543315?hl=en)
- [Understand app privacy & security practices with Google Play's Data safety section](https://support.google.com/googleplay/answer/11416267?hl=en&p=data-safety)

## 1. Current repo-based declaration stance

If the public build ships exactly as the repo currently describes:

- gameplay data is stored locally on device
- no account is required
- no cloud sync is required
- no third-party sign-in is required
- no normal-play gameplay data is intentionally sent to Moonlithe-operated services by default
- the remote analytics validation path is dev-only and inert unless explicitly configured for QA

Then the current best-fit declaration is:

- user data collected: `No`
- user data shared with third parties: `No`

Reasoning:

- Google Play's help guidance says developers do not need to disclose data as collected when the app accesses it only on the device and it is not sent off the device.
- The repo's current public model is local-save only for normal play.

## 2. Security and policy expectations that still apply

Even if the app declares no collection and no sharing:

- a privacy policy is still required for a Play-published app
- the privacy policy URL must be active, publicly accessible, non-geofenced, and not a PDF
- the policy and Data safety answers must stay consistent with the shipped build

## 3. Current repo behavior that supports the declaration

Current repo-aligned statements:

- local data includes progression, unlocks, run state, backup recovery, archive history, and settings
- support/privacy text says the public game is offline-first and local-save by default
- `app/dev-smoke.tsx` is a dev-only validation surface, not part of the public gameplay path
- the repo does not describe production analytics or crash reporting as active for the public build today

## 4. Draft Play Console answer set

Use this as the current draft, then verify against the live Play Console form at submission time.

### 4.1 Data collection and sharing

- Does the app collect any required user data types off device? `No`
- Does the app share any required user data types with third parties? `No`

### 4.2 Security practices

Draft answers to verify in the live form:

- data is encrypted in transit: `No user data is transmitted during normal public play, so confirm the exact form wording before answering`
- users can request data deletion: `Not applicable under the current no-account, local-only model`

Do not guess here in the live console. Re-check the exact questions shown for the final artifact.

## 5. Immediate release blockers before submission

Before any Play track outside internal testing:

- host the final privacy policy at a public URL
- confirm the in-app privacy/support text matches that hosted policy
- verify the shipped build still has no production analytics or crash SDK that would change the declaration
- verify no third-party SDK in the released artifact transmits user data off device

## 6. Change triggers that require revisiting this draft

Rework the Data safety answers before release if any of these become true:

- a production analytics SDK is enabled
- a production crash-reporting SDK is enabled
- the app adds account creation, cloud sync, or third-party sign-in
- data leaves the device for support, telemetry, ads, attribution, or backend gameplay services
- a library or SDK in the shipped artifact transmits required user data types off device

## 7. Submission note

Google Play applies one global Data safety representation per app package across versions currently distributed on Google Play. If any distributed variant collects or shares data, the form must reflect that broader reality.
