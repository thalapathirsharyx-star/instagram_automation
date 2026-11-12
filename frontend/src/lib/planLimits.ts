/**
 * Team seats per plan, mirroring `teamUsersLimit` in
 * backend/src/Config/PlanLimits.ts, which is what the server enforces when a
 * member is added. Keep the two in step when a plan changes.
 */
const TEAM_SEATS: Record<string, number> = {
  Free: 1,
  Essential: 2,
  Pro: 3,
  Business: 5,
  Advanced: 10,
};

export const teamSeatsFor = (plan?: string | null) => TEAM_SEATS[plan || 'Free'] ?? TEAM_SEATS.Free;

/**
 * Automated AI replies per month, mirroring `aiMessagesLimit` in
 * backend/src/Config/PlanLimits.ts (the server pauses replies at this number).
 */
const AI_MESSAGES: Record<string, number> = {
  Free: 250,
  Essential: 2500,
  Pro: 25000,
  Business: 75000,
  Advanced: 250000,
};

export const aiMessagesFor = (plan?: string | null) => AI_MESSAGES[plan || 'Free'] ?? AI_MESSAGES.Free;
