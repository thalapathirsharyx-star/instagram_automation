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
