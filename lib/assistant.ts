import type { Service } from "../app/data.ts";
import { detectNeedCategory, matchServices } from "./service-matching.ts";

export type AssistantContext = { need?: string; postcode?: string; serviceId?: string; matches?: string[] };
export type AssistantReply = {
  text: string;
  serviceIds: string[];
  context: AssistantContext;
  humanSupport?: boolean;
  crisis?: boolean;
};

/** Directory guidance only: no bookings, eligibility decisions or live handoff. */
export function replyToMessage(catalogue: Service[], message: string, previous: AssistantContext): AssistantReply {
  const text = message.trim();
  const lower = text.toLowerCase();
  const context = { ...previous };
  const respond = (text: string, serviceIds: string[] = [], extra: Partial<AssistantReply> = {}): AssistantReply => ({ text, serviceIds, context, ...extra });
  if (/\b(danger|suicid\w*|kill myself|hurt myself|unsafe|emergency|crisis)\b/.test(lower)) {
    return respond("If you or someone else is in immediate danger, call 000.\nFor someone to talk to now, call 13YARN on 13 92 76 or Lifeline on 13 11 14.\nAre you safe right now?", [], { crisis: true });
  }
  if (/\b(human|real person|talk to a person|speak to someone|talk to someone|advisor)\b/.test(lower)) {
    return respond("You can call a service directly or open its details to prepare a request for support. This demo does not notify a live adviser. Choose a service below, or tell me what kind of help you need.", context.serviceId ? [context.serviceId] : [], { humanSupport: true });
  }
  const postcode = text.match(/\b\d{4}\b/)?.[0];
  if (postcode) context.postcode = postcode;
  else if (/\bnowra\b/.test(lower)) context.postcode = "2541";
  else if (/\bwollongong\b/.test(lower)) context.postcode = "2500";
  else if (/\bulladulla\b/.test(lower)) context.postcode = "2539";

  const named = catalogue.find(s => lower.includes(s.name.toLowerCase()));
  if (named) context.serviceId = named.id;
  const ordinal = lower.match(/\b(first|second|third)\b/)?.[1];
  if (ordinal && context.matches) context.serviceId = context.matches[["first", "second", "third"].indexOf(ordinal)];
  if (!context.serviceId && context.matches?.length === 1) context.serviceId = context.matches[0];
  const selected = catalogue.find(s => s.id === context.serviceId);
  if (selected && /\b(eligible|eligibility|qualify|who can|age)\b/.test(lower)) {
    return respond(`Eligibility listed for ${selected.name}: ${selected.eligibility}\nThe service will confirm whether it can help with your situation. You can review its details or prepare a request below.`, [selected.id]);
  }
  if (selected && /\b(call|phone|number|contact|hours|open|visit|next|connect|book|appointment)\b/.test(lower)) {
    const phone = /\d/.test(selected.phone) ? `Phone: ${selected.phone}.` : "Use Request help on the service page to prepare your next step.";
    return respond(`${selected.name}\n${phone}\n${selected.hours}\n${selected.isNational ? "Check the service details for coverage." : `${selected.address}, ${selected.suburb}.`}\nNothing is booked or sent to the provider by this chat.`, [selected.id]);
  }
  if (/^(hi|hello|hey|g['’]?day|yo)[!.\s]*$/i.test(text)) {
    return respond("Hi, I’m here to help. What would make things a little easier today? You can tell me in your own words.");
  }
  if (/^(thanks|thank you|cheers)[!.\s]*$/i.test(text)) return respond("You’re welcome. We can look at another service or work through the next step together.");

  // Supplement the shared matcher with everyday phrases, without greeting substring matches.
  const everyday = lower
    .replace(/\b(child|kids)\b/g, "children")
    .replace(/\b(food|groceries)\b/g, "financial emergency relief")
    .replace(/\b(sad|depressed|stressed|lonely|feeling low)\b/g, "mental health")
    .replace(/\b(nowhere to stay|somewhere to stay|sleeping in my car|evicted|eviction)\b/g, "housing")
    .replace(/\b(youth|teen|teenager)\b/g, "youth young person");
  const category = detectNeedCategory(everyday);
  if (category !== "Other") {
    context.need = everyday;
    if (!named) delete context.serviceId;
  }
  if (named) return respond(`${named.description}\nWhat would you like to know: eligibility, contact details, or the next step?`, [named.id]);
  const locationReply = Boolean(postcode || /\b(nowra|wollongong|ulladulla)\b/.test(lower));
  if (context.need && (category !== "Other" || locationReply || /\b(more|options|services|yes|help|another)\b/.test(lower))) {
    const candidates = context.postcode
      ? catalogue.filter(s => s.isNational || s.postcode === context.postcode || s.postcode.slice(0, 2) === context.postcode!.slice(0, 2))
      : catalogue;
    const needCategory = detectNeedCategory(context.need);
    const matches = matchServices(candidates.filter(s => s.category === needCategory), { need: context.need, postcode: context.postcode ?? "", category: needCategory }, 3);
    if (!matches.length) return respond(`I don’t have a listed ${needCategory.toLowerCase()} match${context.postcode ? ` around ${context.postcode}` : ""}. Try a nearby postcode or use Search to explore the directory. I don’t want to point you to a service that may be too far away.`);
    context.matches = matches.map(m => m.service.id);
    return respond(`Here are ${matches.length} ${needCategory.toLowerCase()} options${context.postcode ? ` listed in your postcode region or available by phone` : " from the directory"}. Open a card to check coverage and how to get support.${context.postcode ? "" : "\nWhat’s your postcode? I can narrow these down."}`, context.matches);
  }
  if (context.matches?.length && /\b(call|phone|number|contact|eligible|eligibility|open|hours)\b/.test(lower)) return respond("Which service would you like to check? You can say the first, second or third, or use its name.", context.matches);
  if (selected) return respond(`${selected.description}\nI can help with eligibility, opening hours or contacting this service. What would you like to check?`, [selected.id]);
  return respond("What kind of support would help most: housing, health, money, work, family or something else? If you share your postcode too, I can look for relevant services.");
}
