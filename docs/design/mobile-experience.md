# MobLink mobile service experience

## Purpose

Help Aboriginal and Torres Strait Islander people explore relevant support, understand a service and take a clear next step. The existing app is a browser-based demonstration: service administration and referrals use local storage, and the assistant offers directory guidance without an external language-model API.

## Design decisions

- Compact, image-led Browse rows with consistent crops, restrained labels and horizontal scrolling. The first row mixes nearby support categories; separate rows surface culture and connection, recent additions and phone listings.
- A single search field and immediate compact results. Category buttons expose their selected state. Text search also recognises postcode and the existing free, local, national and Aboriginal-led links.
- A familiar conversation layout: small identity mark, clearly labelled human support, left/right message bubbles, timestamps, a scrollable history and a fixed composer. Provider mode buttons never stretch to fill remaining height.
- One MobLink service guide powers general and Centrelink conversations. It retains need, postcode and selected-service context; replies link to the current published directory. Provider chats identify automated replies as MobLink guidance.
- Assistant conversations remain in the current browser tab, with bounded and validated session data. Clear chat removes the saved conversation. Provider conversations retain the existing local referral storage.
- Generated photographs illustrate each service's purpose. They do not depict verified staff, clients or premises. No invented cultural motifs, organisation logos or sacred imagery were requested. Each image has its own generation prompt and is optimised for the app.

The image manifest records all 104 public asset paths: the first 21 entries retain their scene briefs, and the remaining 83 retain the full generation prompts. The 800-pixel WebP assets total 5.48 MiB and load lazily in service lists. All images are unique; the app does not reuse category placeholders.

## Research references

[Groupon's listings](https://www.groupon.ae/) and the supplied screenshot informed the follow-up card layout: image, service name, short description, location, approximate distance, rating availability and cost. Distances use the existing directory coordinates and Nowra centre; they are labelled estimates, not device or road distances. The directory has no verified public rating data, so cards show “Not yet rated” rather than invented scores. Search uses a compact two-column photo grid.

[Airbnb's 2025 app and service presentation](https://news.airbnb.com/product-releases/airbnb-2025-summer-release) informed the photo cards and separation between discovery, details and messages. [Bark's customer journey](https://www.bark.com/en/gb/how-it-works/customers/) informed the prominent need-based search and clear route from a service to contact. [WhatsApp's chat presentation](https://faq.whatsapp.com/6298875896807790/?cms_platform=web) informed the restrained bubble palette and conversation-first screen. These are design adaptations, not claims of feature parity.

The existing 13YARN crisis contact was checked against [13YARN's official site](https://www.13yarn.org.au/). General catalogue entries were not re-audited as part of this visual and interaction redesign.

## Verification contract

- Test everyday support requests, greeting boundaries, postcode follow-up, distant locations, named and ordinal service follow-ups, eligibility, contact questions, crisis precedence and unknown needs.
- Test corrupt session data, context restoration and history bounds.
- Build every Next.js route and run the existing referral, provider-service, member, reporting and service-matching tests.
- Inspect Browse, Search, inbox, assistant, service details, request confirmation and provider chat in a browser.
- Check 320, 390 and 613-pixel layouts, scroll containment, composer/nav separation, image loading and console errors.
- Confirm one distinct local image asset per directory entry, inspect the image contact sheets, and check production preview routes before delivery.

## Operational boundaries

The app does not send live adviser messages, SMS or bookings. Request confirmation explicitly says the request stays in this browser. Service names, eligibility, phone numbers and coverage come from the existing directory and require provider verification before a live launch. `isNational` is an existing catalogue flag, not newly verified nationwide coverage. Real accounts, secure provider messaging and a live AI service require a separate operational implementation.
