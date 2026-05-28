export interface PlanLimits {
  activeContactsLimit: number;
  instagramAccountsLimit: number;
  teamUsersLimit: number;
  maxAutomationsLimit: number;
  hasBroadcasts: boolean;
  hasFullAi: boolean;
  hasBranding: boolean;
  aiMessagesLimit: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  Free: {
    activeContactsLimit: 25,
    instagramAccountsLimit: 1,
    teamUsersLimit: 1,
    maxAutomationsLimit: 4,
    hasBroadcasts: false,
    hasFullAi: false,
    hasBranding: true,
    aiMessagesLimit: 250,
  },
  Essential: {
    activeContactsLimit: 250,
    instagramAccountsLimit: 2,
    teamUsersLimit: 2,
    maxAutomationsLimit: 999999, // unlimited
    hasBroadcasts: false,
    hasFullAi: false,
    hasBranding: false,
    aiMessagesLimit: 2500,
  },
  Pro: {
    activeContactsLimit: 2500,
    instagramAccountsLimit: 3,
    teamUsersLimit: 3,
    maxAutomationsLimit: 999999,
    hasBroadcasts: true,
    hasFullAi: true,
    hasBranding: false,
    aiMessagesLimit: 25000,
  },
  Business: {
    activeContactsLimit: 7500,
    instagramAccountsLimit: 999, // unlimited
    teamUsersLimit: 5,
    maxAutomationsLimit: 999999,
    hasBroadcasts: true,
    hasFullAi: true,
    hasBranding: false,
    aiMessagesLimit: 75000,
  },
  Advanced: {
    activeContactsLimit: 25000,
    instagramAccountsLimit: 999,
    teamUsersLimit: 10,
    maxAutomationsLimit: 999999,
    hasBroadcasts: true,
    hasFullAi: true,
    hasBranding: false,
    aiMessagesLimit: 250000,
  },
};
