import { describe, it, expect } from "vitest";
import { nameToEmail } from "./auth";
describe("nameToEmail", () => {
  it("is case and space insensitive", () => {
    expect(nameToEmail(" Jerrold ", "POH")).toBe(nameToEmail("jerrold", "poh"));
  });
  it("distinguishes different names", () => {
    expect(nameToEmail("Ann", "Lee")).not.toBe(nameToEmail("Anne", "Lee"));
  });
});
