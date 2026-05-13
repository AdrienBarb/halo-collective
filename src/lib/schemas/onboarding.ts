import { z } from "zod";

// Bounded arrays — the UI picks from fixed option lists; unbounded posts here
// would be DoS / storage abuse on an authenticated endpoint with no rate limit.
const interestList = z.array(z.string().min(1).max(64)).max(64);

export const onboardingPayloadSchema = z.object({
  sports: interestList,
  lifestyle: interestList,
  brands: interestList,
});

export type OnboardingPayload = z.infer<typeof onboardingPayloadSchema>;
