import assert from "node:assert/strict";
import test from "node:test";
import { distanceFromNowra, serviceDistanceLabel } from "./service-distance.ts";

test("distance uses the displayed Nowra area, with a sensible Wollongong distance", () => {
  assert.equal(distanceFromNowra({ lat: -34.882, lng: 150.6 }), 0);
  const km = distanceFromNowra({ lat: -34.4278, lng: 150.8931 });
  assert.ok(km > 55 && km < 58);
  assert.equal(serviceDistanceLabel({ lat: -34.882, lng: 150.6, isNational: false }), "Under 0.1 km from Nowra");
});

test("national listings do not present a misleading physical distance", () => {
  assert.equal(serviceDistanceLabel({ lat: -33.868, lng: 151.209, isNational: true }), "Phone / national listing");
  assert.equal(serviceDistanceLabel({ lat: NaN, lng: NaN, isNational: false }), "Distance unavailable");
});
