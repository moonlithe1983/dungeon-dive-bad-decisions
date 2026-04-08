# Build a Viable Expo App

*General edition for any realistic Codex + Expo + GitHub project*

Updated April 8, 2026

This edition is intentionally general again. It is written to help with utilities, internal tools, consumer apps, API-backed products, content apps, community apps, and games that are honestly viable within Expo's workflow. It keeps the practical, criteria-driven structure of the earlier guide, and moves type-specific questions into optional sections instead of making one product shape the default.

> **What changed in this edition**
>
> The previous revision had become too project-specific. This version restores the guide's broader purpose: to help you judge whether an Expo app deserves to be built, whether Expo is still the honest stack for the job, how to use Codex without handing it product judgment, and how to use GitHub as the safety rail that keeps experimentation from turning into chaos.

## How to use this guide

Read Sections 1 through 7 before you write much code. Those sections decide whether the idea is real, whether Expo is an honest fit, whether your first version is small enough, and whether your Codex and GitHub workflow will stay under control.

Use the later sections as a field manual. When you get stuck, ask what proof you are missing next: proof of user need, proof that the main path works, proof that the native behavior is real, proof that the release build is stable, or proof that the launch materials match reality.

If three or more core decisions are still vague, shrink scope before coding. If the main path is not clear, do not hide the problem under more features. If the trust materials are not ready, the app is not ready.

## 1. Start with a narrow problem, not a broad ambition

A first app should prove one thing: that a specific user can complete a specific task, or reach a specific state, without help. If you cannot name the user, the problem, and the main task in one sentence, do not start coding yet.

Most early projects fail for ordinary reasons: inflated scope, weak distribution, fragile workflows, vague trust disclosures, and long stretches of coding without real-device testing. Version 1 should solve one real problem well, or deliver one clear repeatable experience well.

- The first user cannot be 'everyone.'
- A working prototype is not the same thing as a viable product.
- If launch work, privacy work, and support work are not planned, the app is not actually planned.
## 2. Run a viability screen before you invest weeks of work

Before you build, answer the questions that determine whether the app deserves the effort. The goal is not to prove the idea is brilliant. The goal is to find out whether the first version can earn more of your time.

| Question | What a strong answer looks like | Warning sign |
| --- | --- | --- |
| Who is the first user? | A specific person, role, or audience with a recognizable problem or repeated desire. | The answer is 'everyone' or a broad demographic. |
| What pain, job, or repeated desire are you serving? | The value is obvious in the user's real life, workflow, or hobby. | The value only appears after a long explanation. |
| What do they use now? | You can name the current substitute, even if it is messy or manual. | You have not identified a real substitute. |
| Why choose your version? | There is one concrete reason it is faster, simpler, cheaper, clearer, or more enjoyable. | The difference depends on a vague future roadmap. |
| How will the first 10 users hear about it? | You can name a believable channel, community, client path, or existing audience. | Discovery is left to the stores or 'social media somehow.' |
| Why return? | The task repeats, the value compounds, the app saves time again, or the experience changes enough to invite another session. | It looks interesting once, but there is no return loop. |
| Why pay, if money matters? | Payment is rational because the app saves money, time, risk, or effort, or because the value is clearly worth the premium. | Pricing exists only because you hope users will pay. |

Decision rule: if at least three answers remain vague after a serious attempt, the idea usually needs to become smaller before it becomes better.

## 3. Confirm that Expo is an honest fit

Expo is not a promise that every app idea is equally easy. It is a strong development and release workflow for React Native projects, and it becomes much more production-grade once you move from Expo Go to development builds. Use that distinction early instead of pretending a playground setup is proof of shipping reality.

| Project profile | Usually a good fit for Expo | What to prove early |
| --- | --- | --- |
| Standard product apps | Utilities, trackers, CRUD apps, internal tools, content apps, community apps, many API-backed products, and many local-first or form-based workflows. | Main path clarity, permission flow, offline behavior if relevant, and release build stability. |
| Conditional or proof-heavy apps | Apps with unusual native integrations, heavy camera/audio behavior, advanced realtime features, or richer game/media interaction can still fit, but only if the representative slice behaves well on devices. | Native library compatibility, performance, latency, battery use, restart behavior, and whether the hardest path still feels good outside Expo Go. |
| Weak fit unless you deliberately own native complexity | If the product's core value mostly lives in custom native code or platform-specific rendering, you may still use Expo tooling, but you should treat native proof as the product constraint, not as future polish. | Whether Expo remains the right workflow after the first honest native spike. |

- Use Expo Go to learn quickly, not to prove that a production app is ready.
- Move to development builds early if the roadmap includes custom native configuration, native SDKs, purchases, ads, notifications, or any behavior that must match the real binary.
- Treat representative-slice testing as a gate. The hardest important path should work on real devices before you add breadth.
## 4. Choose the smallest honest version and the simplest app shape

Write down the version-1 promise, the version-1 scope, and the version-1 non-goals. Non-goals matter because they protect the schedule. Do not add accounts, sync, a backend, or an admin layer because they sound professional. Add them only when the problem actually requires them.

| App shape | Good fit | Complexity it adds |
| --- | --- | --- |
| Local-only | Utilities, small trackers, offline reference, simple games, single-device workflows. | No sync, no shared data, limited server burden. |
| Public API-backed | Read-only or light integrations with outside services. | Rate limits, third-party dependency risk, and client-side constraints. |
| Accounts and sync | Multi-device usage, saved state across devices, collaborative or personalized data. | Auth, deletion, retention, support burden, privacy work, access control. |
| Sensitive workflow or payments | Subscriptions, regulated data, identity-heavy flows, or trust-sensitive actions. | Billing, compliance, more edge cases, more support. |

Decision rule: keep the shape as boring as the problem allows. Complexity compounds quickly once you own auth, deletion, moderation, billing, or shared data.

## 5. Set up the tools you actually need

The default stack here is simple: Expo for the app workflow, GitHub for version control and review, and Codex as a scoped coding agent rather than a substitute for product judgment. Keep the local toolchain minimal: Node.js LTS, Git, VS Code or another editor, a terminal, an Expo account, a GitHub account, and the device tooling you actually need for testing.

- Run the project once immediately, then change one visible line so you know the edit loop works.
- Do not postpone real-device testing because the simulator and Expo Go look clean.
- If your project will need environment separation, create the naming and config plan before you fill the repo with ad hoc secrets and one-off fixes.
## 6. Put the project in GitHub immediately, and work in reviewable slices

A project that exists only on one laptop is already at risk. Create the repository early, make the first commit, push it, and stop treating main as a scratchpad once the app becomes non-trivial.

- Use branches for meaningful changes.
- Read diffs before merging.
- Open pull requests, even if you are working alone, when the change is large enough that you would benefit from a review pass.
- Keep generated files, credentials, signing material, and private keys out of version control from day one.
GitHub should function as your memory, rollback plan, review surface, and release history, not just as cloud backup.

## 7. Use Codex to accelerate scoped work, not to replace ownership

Codex is most useful when the task is narrow, the acceptance criteria are clear, and you still review the diff. It can explain code, generate a focused change, suggest tests, summarize risk, and speed up repetitive work. It should not decide product rules, privacy behavior, billing logic, or launch strategy for you.

Give it the goal, the exact files it may change, the constraints, and the condition for success. Then read the diff, run the app, and test the changed path yourself.

| Good tasks for Codex | Bad tasks for Codex |
| --- | --- |
| Explain an error, refactor one component, add one validation rule, suggest tests for one flow, summarize a pull request, or implement a tightly defined feature. | Invent the architecture, redefine the product, add privacy or billing behavior you have not specified, or make broad multi-file changes that you do not understand. |
| Work from an issue, a tight prompt, or an explicit acceptance checklist. | Work from a vague ambition and hope the repo becomes coherent afterward. |

## 8. Build the main user path before side features

The main user path is the shortest end-to-end route that delivers the app's promise. Build that path before the dashboard, admin tools, advanced filters, decorative polish, or expansion systems.

- Sketch the flow first.
- Decide what each screen is for, what the primary action is, and what counts as success.
- Define the empty state, loading state, error state, and success state for the core path.
- Use one stable term for each core concept across the app.
## 9. Use a proof ladder that matches the app type

Different products fail in different places. Choose the proof ladder that matches the thing you are actually building, not the one that sounds most impressive.

| App type | First proof you need | What usually breaks next |
| --- | --- | --- |
| Local utility or tracker | A user can complete the core task once without confusion. | State handling, persistence, and edge-case UX. |
| API-backed product | The main path works against the real service and recovers gracefully from network failure. | Auth, rate limits, caching, and error states. |
| Account and sync app | Sign-up, sign-in, restore, and deletion logic are coherent. | Retention burden, support burden, and data consistency. |
| Media, camera, audio, or native-heavy app | The representative device path works outside Expo Go and feels acceptable on real hardware. | Permissions, device variance, and performance. |
| Game or live product | The first satisfying session, replay hook, and fast restart loop are real on-device. | Content hunger, return-loop weakness, and event or monetization overreach. |

The point of the proof ladder is to stop building the wrong confidence. A polished settings screen is not proof that the hardest important path is ready.

## 10. Reduce friction in onboarding, copy, and permissions

The first-run experience should answer three questions quickly: what this app does, what the first useful action is, and what the user should do next. Do not make onboarding longer than the distance to first value.

- Prefer progressive disclosure to tutorial walls.
- Ask permissions just in time, and explain why the permission is needed for the action the user is taking.
- Write error messages that say what failed, what the user can try next, and what will happen if they retry.
## 11. Treat security, privacy, accessibility, and trust as build requirements

These are not launch-week chores. They shape the architecture, the screens, the disclosures, and the support burden. Start by listing the data the app touches, the permissions it requests, the third-party SDKs it includes, and the places where users could reasonably hesitate to trust the app.

- Never commit secrets, signing files, or private keys.
- Request only the permissions the current feature actually needs.
- Make privacy disclosures and store declarations match the real behavior of the app and its SDKs.
- Treat accessibility as a release gate on the main path, not as future cleanup.
## 12. Separate identity, environments, and release discipline on purpose

Choose the app name, package name, bundle identifier, icon direction, and versioning approach earlier than feels necessary. Late identity churn creates store friction, tester confusion, and avoidable build work.

Keep local, preview, and production environments separate. Client-side bundles are not a safe place for true secrets. If a value must remain secret, it belongs on trusted server-side infrastructure rather than in the shipped app.

## 13. Test in layers and on real devices

Expo Go is useful for learning and fast iteration, but it is not proof that the real app is ready. Development builds are closer to reality. Internal distribution is closer still. Closed beta and store testing reveal installation, permission, and device-specific problems that local preview does not.

| Layer | Main question | What it proves |
| --- | --- | --- |
| Local preview | Does the project basically run? | Fast feedback on layout and simple logic. |
| Development build | Do native config and native libraries behave correctly? | Closer-to-real device behavior than Expo Go. |
| Real-device self-test | Can the builder complete the main path on real hardware? | Permissions, keyboard, touch, performance, and reality. |
| Guided task test | Can another person complete the task without help? | Language clarity, navigation clarity, and hidden confusion. |
| Closed beta or store testing | Can testers install and use the app under normal conditions? | Installability, device spread, release flow, and support readiness. |

A useful bug report includes device, OS version, app version, exact steps, what happened instead, and whether the problem can be reproduced.

## 14. Measure the first-session funnel and technical failures

Track only the events that answer whether people reached value. For many first apps, that means app open, onboarding started and completed if onboarding exists, main task started, main task completed, and the business conversion event if money matters.

| Event | Why it matters |
| --- | --- |
| app_opened | Confirms that people are arriving at all. |
| onboarding_started | Shows whether first-time users even begin setup. |
| onboarding_completed | Shows whether the path to first value is survivable. |
| main_task_started | Measures intent. |
| main_task_completed | Measures delivered value. |
| purchase_started or paywall_shown | Shows conversion timing and friction when money matters. |
| error_shown or permission_denied | Shows blockers that product metrics alone can hide. |

## 15. Understand the difference between development, beta, and release

A development build is a development tool. A production build is the signed release artifact meant for testers or stores. Keep those concepts distinct, and keep a record of which commit and environment produced a given release build.

When you move toward release, the platform-specific work becomes real. Testing tracks, privacy disclosures, support contacts, release notes, and store metadata are all part of shipping, not paperwork after the fact.

## 16. Define what 'ready' means before you upload anything

| Area | Ready means... |
| --- | --- |
| Core product | The main user path works end to end on real devices, and no obvious unfinished screens or fake settings remain. |
| Quality | Manual end-to-end tests are complete, key checks pass, and release behavior matches the intended source commit. |
| Privacy and trust | Permissions are justified, disclosures are accurate, support contact exists, and deletion or retention paths are defined where needed. |
| Store materials | Name, icon, screenshots, descriptions, privacy URL, support URL or email, ratings, and content declarations are coherent and honest. |
| Measurement | Analytics, crash reporting, and basic technical monitoring are live and verified. |

It is better to delay than to upload a build that still depends on placeholders, fake settings, unclear permissions, or undeclared data use.

## 17. Decide what happens after launch before the launch happens

A first release should buy information. Decide in advance what counts as promising, uncertain, or weak. Then let those thresholds guide whether you fix, expand, narrow, or stop. The first weeks after launch are usually about support, bug fixes, and clarity rather than major feature work.

## Appendix A. One-page worksheets

### Project brief

My app helps: ________________________________________________

Their painful problem or repeated desire is: __________________________

Right now they solve it by: ___________________________________

My version is better because: __________________________________

The first meaningful success moment is: ________________________

My first 10 users could come from: _____________________________

Version 1 includes only: ______________________________________

Version 1 explicitly does not include: _________________________

### Success hypotheses

Activation hypothesis: ________________________________________

Retention hypothesis: _________________________________________

Distribution hypothesis: _____________________________________

Trust hypothesis: ____________________________________________

Conversion hypothesis, if money matters: ______________________

Decision rule for early data: promising / uncertain / weak = ___

## Appendix B. Type-specific product-loop questions

These questions are optional. Use the set that matches the product you are actually building.

| Product type | Questions that matter early | Common trap |
| --- | --- | --- |
| Utility or workflow app | What is the success moment? How quickly can the user reach it? Why would they trust it again next week? | Adding dashboards, AI, or collaboration before the main task works. |
| Content or community app | Why would someone return tomorrow? What changes between visits? What is the smallest repeatable loop? | Mistaking content quantity for product retention. |
| Account or sync product | Why is sign-in worth the friction? What breaks if the user changes device? How do restore and deletion work? | Adding accounts before proving the local value. |
| Game or live product | What is the win or success condition? How long should first success take? What changes after success that makes the next run, class, mode, or season feel worth trying? What stops the player from uninstalling after one win? | Using punishment or grind as a substitute for a real replay loop. |

For games and live products, soft pressure usually ages better than punitive deletion. Optional challenge ladders, streak systems, seasonal goals, or prestige loss can create tension without teaching players that their time is disposable.

## Appendix C. Official docs to re-check before release

These are the current primary references worth checking again right before release, because tooling, submission steps, and review expectations change.

| Source | URL |
| --- | --- |
| Expo workflow overview | https://docs.expo.dev/workflow/overview/ |
| Expo development builds | https://docs.expo.dev/develop/development-builds/introduction/ |
| Expo EAS Build | https://docs.expo.dev/build/introduction/ |
| Expo EAS Workflows | https://docs.expo.dev/eas/workflows/introduction/ |
| OpenAI Codex IDE extension | https://developers.openai.com/codex/ide |
| OpenAI Codex configuration basics | https://developers.openai.com/codex/config-basic |
| GitHub pull requests | https://docs.github.com/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests |
| GitHub requesting a pull request review | https://docs.github.com/articles/requesting-a-pull-request-review |

Use the official docs as the source of truth when this guide and the current platform docs differ.
