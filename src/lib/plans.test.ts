import { describe, expect, it } from "vitest";
import { canAddCard, PLANS } from "./plans";
describe("Account plans", () => {
  it("Free allows the tenth card but not the eleventh", () => {
    expect(canAddCard("free", 9)).toBe(true);
    expect(canAddCard("free", 10)).toBe(false);
    expect(canAddCard("free", 11)).toBe(false);
  });
  it("Basic is $5 monthly with unlimited cards", () => {
    expect(PLANS.find(p => p.id === "basic")?.price).toBe(5);
    expect(canAddCard("basic", 10000)).toBe(true);
  });
  it("Premium is $50 monthly with unlimited cards and round-the-clock support", () => {
    expect(PLANS.find(p => p.id === "premium")?.price).toBe(50);
    expect(canAddCard("premium", 10000)).toBe(true);
    expect(PLANS.find(p => p.id === "premium")?.benefits).toContain("24/7 support");
  });
  it("Free costs zero", () => expect(PLANS.find(p => p.id === "free")?.price).toBe(0));
});