export const PLANS = [
  { id: "free", name: "Free", price: 0, limit: 10, benefits: ["10 cards across your boards", "Private boards"] },
  { id: "basic", name: "Basic", price: 5, limit: null, benefits: ["Unlimited cards", "Private boards"] },
  { id: "premium", name: "Premium", price: 50, limit: null, benefits: ["Unlimited cards", "Private boards", "24/7 support"] },
] as const;
export type PlanId = typeof PLANS[number]["id"];
export function canAddCard(plan: PlanId, count: number) {
  const limit = PLANS.find((p) => p.id === plan)?.limit;
  return limit === null || (limit !== undefined && count < limit);
}