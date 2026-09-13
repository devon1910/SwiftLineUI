import assert from "node:assert/strict";
import test from "node:test";
import { getEventSaveErrorMessage } from "../src/services/eventFormUtils.js";

test("surfaces the API validation message in the event form toast", () => {
  const error = { response: { data: { message: "Capacity must be at least 1." } } };
  assert.equal(getEventSaveErrorMessage(error), "Capacity must be at least 1.");
});

test("supports nested API error messages", () => {
  const error = { response: { data: { data: { message: "Choose a location radius of at least 1 metre." } } } };
  assert.equal(getEventSaveErrorMessage(error), "Choose a location radius of at least 1 metre.");
});

test("uses an action-specific fallback when the API has no safe message", () => {
  assert.match(getEventSaveErrorMessage(new Error("network"), true), /update this event/);
});

