# Revised Decision Memo: Enterprise Knowledge Assistant

## Context

The product team is re-evaluating the AI-powered enterprise knowledge assistant after early discovery with security leads, IT admins, and five design partners. Customers still want cited answers across Google Drive, Slack, and Confluence, but they now expect stronger permission handling, auditability, and administrative controls before deployment.

## Recommendation

Launch a narrower Q4 pilot with 6 design partners in security-reviewed workspaces. Position the product as a governed knowledge layer for enterprise teams, not just an internal productivity assistant.

## Updated Assumptions

- Retrieval quality requires permission-aware indexing, document freshness checks, and reranking; basic embedding search is not sufficient for enterprise trust.
- Design partners will not tolerate incomplete answers for policy, legal, or customer escalation questions even when citations are present.
- Manual onboarding is acceptable only for pilot setup; repeatable admin-led onboarding is required before paid expansion.
- Security review is now a primary adoption gate because the assistant processes sensitive internal content and may influence operational decisions.
- The highest-value use case has shifted toward faster onboarding of new customer-facing employees and reduced escalation load for subject-matter experts.

## New Risks

- Permission leakage could expose restricted content if source-system access rules are not mirrored exactly.
- Buyers may delay adoption until audit logs, admin controls, and data-retention settings are available.
- Pilot scope could become too narrow to prove broad productivity impact.
- Real-time freshness expectations may raise infrastructure cost and operational complexity.

## Risks Reduced Or Removed

- Slack and Confluence API limits are less urgent because the Q4 pilot will start with Google Drive and Slack only.
- Broad connector coverage is no longer required for launch, reducing integration risk.
- English-only support is acceptable for the selected pilot accounts.

## Product Tradeoffs

- Prioritize permission-aware retrieval, audit logs, and admin controls over connector breadth.
- Add a lightweight admin dashboard before launch, even though this delays the pilot from Q3 to Q4.
- Move from nightly batch ingestion to hourly incremental sync for high-value folders, while keeping long-tail content batch-based.
- Keep the pilot smaller so security and customer success can review each deployment closely.

## Decision Log

- Reversed the Q3 beta decision and moved to a Q4 governed pilot with 6 design partners.
- Reversed the decision to defer SOC 2 readiness; start SOC 2 gap assessment before pilot launch.
- Reversed the decision to defer admin analytics; ship a basic admin dashboard with usage, answer quality, and audit events.
- Keep manual onboarding for pilot accounts, but require an admin-led onboarding plan before general availability.

## Success Metrics

- At least 5 of 6 pilot customers complete security approval.
- At least 75% of sampled answers include useful citations and respect source permissions.
- New customer-facing hires report a 25% reduction in time spent searching for internal guidance.
- Subject-matter experts report fewer repeated escalation questions after pilot week four.

## New Opportunities

- Package audit logs and permission-aware retrieval as enterprise differentiation.
- Use onboarding and escalation workflows as focused wedge use cases for sales.
- Turn admin dashboard data into expansion reports for champions.

## Open Questions

- What minimum audit-log fields are required for security approval?
- Which SOC 2 controls must be addressed before the pilot versus before general availability?
- How much freshness is enough: hourly sync for all content or only priority folders?
- Should legal and policy documents be excluded from generative answers until confidence thresholds are proven?
