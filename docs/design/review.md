# Mobile experience review

## Actionable Findings

No unresolved blocking findings in the final change. Review fixes included oversized implicit grid rows, duplicated detail actions, misleading live-adviser wording, unpublished-service request access, greeting substring matches, lost postcode context, malformed saved chat data, inbox scope and browser-back navigation. New app requests now describe local saving accurately.

## Coverage

Reviewed sequentially in the main task, as required by the supplied AGENTS instructions. This was an inline review, not an independent or cross-model review. Applied correctness, maintainability, testing, project standards, security, reliability, frontend lifecycle and adversarial checks to the customer app changes and their storage/matching helpers.

- `npm test`: 40 passing tests, including assistant follow-ups, crisis precedence, session validation, customer inbox filtering and truthful app-request confirmation.
- `npx tsc --noEmit`: passed. `npm run build`: passed, generating 138 static pages, including all 104 service detail pages.
- `git diff --check`: passed.
- Browser checks covered Browse, category selection, Search, inbox, assistant, provider/adviser modes, service details, unpublished services, request saving, conversation opening and Profile.
- Verified assistant messages and cards after navigating away and returning with browser Back. Checked malformed session recovery and bounded history. Used fictional request details in a separate browser session.
- Inspected 320, 390 and 613-pixel layouts. Checked horizontal overflow, message scrolling, compact controls and composer/bottom-navigation separation. Browser error collection was empty after the exercised flows.
- Verified 104 catalogue IDs resolve to 104 distinct local image paths, with no missing files. All 104 optimised images have distinct hashes and total 5.48 MiB. Inspected every image in seven contact sheets and checked successful browser loading.

## Verdict

Ready for a design preview. The directory assistant is deterministic and runs locally; it is not a connected language-model service. Referrals, adviser messages and example profiles remain browser demonstrations. No live provider contact, SMS, booking, authentication or shared-account messaging was added. Existing catalogue coverage and contact information require a separate provider audit before operational use. Physical iOS/Android keyboard behaviour and real-device accessibility testing remain release checks for a live service.

The hosted preview URL and its final browser verification belong in the pull request delivery record.

## Groupon-style card follow-up

The follow-up adds descriptions, location, approximate kilometres from Nowra, cost and an explicit unrated state to service cards. Search uses two photo columns. Reviewed the distance calculation, national-listing exclusion, long text, result-count layout and mobile widths. All 42 tests pass, including distance tests; the production build passes. Ratings are not fabricated, and distance is not presented as device location or driving distance. The user explicitly authorised publishing the complete redesign to the production website.
