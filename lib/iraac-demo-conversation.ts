import type { ReferralMessage } from "./referrals.ts";

// Fictional scenario shared by the customer app and the IRAAC staff demo.
const exchanges: Array<[ReferralMessage["sender"], string, string]> = [
  [
    "moblink",
    "IRAAC assistant",
    "Hi Jayden, I’m the IRAAC assistant for YouthScape. I can help you prepare for a conversation with our team. What would make today a little easier?",
  ],
  [
    "community",
    "Jayden",
    "I’m in Wollongong. I have a court date coming up and I don’t really understand what I need to do.",
  ],
  [
    "moblink",
    "IRAAC assistant",
    "Thanks for telling me. A qualified legal service can explain the court process and your paperwork. YouthScape can help with practical support and connecting with a trusted worker. Are you somewhere safe tonight?",
  ],
  [
    "community",
    "Jayden",
    "Yes, I’m staying with my aunt tonight. I’m mostly worried about missing the date or getting there late.",
  ],
  [
    "moblink",
    "IRAAC assistant",
    "Let’s focus on getting organised. Keep your court letter somewhere you can find it. You don’t need to put private details from it into this demo. Would you like help with transport as well as understanding who to contact?",
  ],
  [
    "community",
    "Jayden",
    "Both please. I don’t have a car and I’m not sure which bus to get.",
  ],
  [
    "moblink",
    "IRAAC assistant",
    "I can include transport in the handover. An IRAAC worker would check available options with you; transport and appointments aren’t booked through this assistant. Would you prefer messages here or a phone call?",
  ],
  [
    "community",
    "Jayden",
    "Messages here are easier. I’d like my aunt involved when we make a plan.",
  ],
  [
    "moblink",
    "IRAAC assistant",
    "Understood. The team should check your permission before involving your aunt or sharing information with another service. Your priorities are legal information, getting to the appointment and a safe place to stay.",
  ],
  [
    "community",
    "Jayden",
    "That’s right. Can I talk to someone from IRAAC now?",
  ],
  [
    "moblink",
    "IRAAC assistant",
    "Use ‘IRAAC adviser’ above to see the human conversation. The adviser can read this history, so you won’t need to start again. This example uses fictional people and messages.",
  ],
  [
    "provider",
    "IRAAC adviser · demo",
    "Hi Jayden, I’m an IRAAC YouthScape worker in this example. I’ve read your conversation with our assistant. You’re in Wollongong, staying with your aunt tonight, and want help with your court appointment and transport. Have I understood?",
  ],
  ["community", "Jayden", "Yes. I feel a bit better having it written down."],
  [
    "provider",
    "IRAAC adviser · demo",
    "We can take it one step at a time. First we’d check the date and location together, then help you contact a qualified legal service. After that we can look at transport. Does that order work for you?",
  ],
  [
    "community",
    "Jayden",
    "Yes please. Can you explain things slowly? I get stressed when there’s a lot at once.",
  ],
  [
    "provider",
    "IRAAC adviser · demo",
    "Of course. We can keep each message short and check that it makes sense before moving on. You can ask questions or take a break at any point.",
  ],
  [
    "community",
    "Jayden",
    "Thank you. I’d like to start with who I should call about the letter.",
  ],
  [
    "provider",
    "IRAAC adviser · demo",
    "That’s a good place to start. In a live conversation, I’d help you check the appropriate legal contact and agree the next step with you. You can leave a message here in the demo, or return to the IRAAC assistant using the tabs above.",
  ],
];
export const iraacDemoConversation: ReferralMessage[] = exchanges.map(
  ([sender, senderName, body], index) => ({
    id: `youthscape_story_v2_${index}`,
    sender,
    senderName,
    body,
    mode: index < 11 ? "assistant" : "advisor",
    createdAt: new Date(Date.UTC(2026, 7, 15, 8, 35 + index * 2)).toISOString(),
  }),
);

export function upgradeYouthscapeConversation(
  stored: ReferralMessage[],
): ReferralMessage[] {
  const additions = stored.filter(
    (item) =>
      !item.id.startsWith("youthscape_story_v2_") &&
      item.id !== "msg_demo_1" &&
      item.id !== "msg_demo_2",
  );
  return [...iraacDemoConversation, ...additions];
}
