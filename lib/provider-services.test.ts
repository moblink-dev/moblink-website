import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Service } from "../app/data.ts";
import { applyProviderServiceOverrides, toProviderServiceOverrides } from "./provider-services.ts";

const service = {
  id: "iraac-youthscape",
  name: "IRAAC YouthScape",
  category: "Youth",
  subcategory: "Young people",
  tags: ["Youth"],
  address: "Illawarra and South Coast service area",
  suburb: "Illawarra",
  state: "NSW",
  postcode: "2500",
  lat: -34.4,
  lng: 150.8,
  distance: "Illawarra region",
  phone: "Connect through Moblink",
  website: "https://www.iraac-aco.com/",
  hours: "Contact IRAAC",
  description: "YouthScape connects young people with support.",
  isAboriginalLed: true,
  isCrisis: false,
  isNational: false,
  isFree: true,
  eligibility: "Young people",
  createdAt: "2026-08-16",
} satisfies Service;

const iraacServices = [service, { ...service, id: "iraac-mcc", name: "IRAAC MCC", category: "Culture" as const }];

describe("provider service overrides", () => {
  it("applies provider edits without changing canonical service data", () => {
    const original = iraacServices[1];
    const effective = applyProviderServiceOverrides(iraacServices, {
      [original.id]: { name: "Edited MCC", description: "Updated description", address: "Wollongong", published: true },
    }).find((item) => item.id === original.id)!;

    assert.equal(effective.name, "Edited MCC");
    assert.equal(effective.category, original.category);
    assert.notEqual(original.name, "Edited MCC");
  });

  it("removes draft services from the public collection", () => {
    const draft = iraacServices[0];
    const effective = applyProviderServiceOverrides(iraacServices, {
      [draft.id]: { name: draft.name, description: draft.description, address: draft.address, published: false },
    });

    assert.equal(effective.some((service) => service.id === draft.id), false);
  });

  it("persists only editable provider fields", () => {
    const overrides = toProviderServiceOverrides(iraacServices.map((service) => ({ ...service, published: true })));
    assert.deepEqual(overrides["iraac-youthscape"], {
      name: "IRAAC YouthScape",
      description: iraacServices[0].description,
      address: "Illawarra and South Coast service area",
      published: true,
    });
  });
});
