export interface MarketingCronSettingField {
  key: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'multi-number';
  options?: { label: string; value: string }[];
  defaultValue: any;
  description?: string;
  min?: number;
  max?: number;
}

export interface MarketingCronDefinition {
  id: string;
  name: string;
  description: string;
  category: 'reengagement' | 'lifecycle' | 'social' | 'smart';
  defaultCronExpression: string;
  cronDescription: string;
  settingsFields: MarketingCronSettingField[];
}

export const MARKETING_CRON_CATEGORIES = {
  reengagement: { label: 'Re-engagement & Churn Prevention', icon: '🔄' },
  lifecycle: { label: 'Milestone & Lifecycle', icon: '🎯' },
  social: { label: 'Social & Viral Growth', icon: '🚀' },
  smart: { label: 'Predictive & Smart', icon: '🧠' },
} as const;

export const MARKETING_CRONS: MarketingCronDefinition[] = [
  {
    id: 'win-back',
    name: 'Win-Back Campaign',
    description: 'Escalating email sequence for users inactive 14/30/60 days. Includes estimated untracked spending based on their average.',
    category: 'reengagement',
    defaultCronExpression: '0 10 * * *',
    cronDescription: 'Daily at 10 AM',
    settingsFields: [
      {
        key: 'inactiveDays',
        label: 'Inactive Day Thresholds',
        type: 'multi-number',
        defaultValue: [14, 30, 60],
        description: 'Days of inactivity that trigger each escalation level',
      },
    ],
  },
  {
    id: 'streak-nudge',
    name: 'Streak Tracker & Nudge',
    description: 'Track consecutive days of expense logging. Nudge users when their streak is about to break.',
    category: 'reengagement',
    defaultCronExpression: '0 20 * * *',
    cronDescription: 'Daily at 8 PM',
    settingsFields: [
      {
        key: 'minStreakDays',
        label: 'Min Streak to Notify',
        type: 'number',
        defaultValue: 3,
        min: 2,
        max: 30,
        description: 'Minimum streak length before sending nudge',
      },
    ],
  },
  {
    id: 'weekly-insights',
    name: 'Weekly Spending Insights',
    description: 'Personalized weekly email with spending comparisons vs last week, top categories, and trends.',
    category: 'reengagement',
    defaultCronExpression: '0 9 * * 1',
    cronDescription: 'Monday at 9 AM',
    settingsFields: [
      {
        key: 'dayOfWeek',
        label: 'Day of Week',
        type: 'select',
        defaultValue: '1',
        options: [
          { label: 'Sunday', value: '0' },
          { label: 'Monday', value: '1' },
          { label: 'Tuesday', value: '2' },
          { label: 'Wednesday', value: '3' },
          { label: 'Thursday', value: '4' },
          { label: 'Friday', value: '5' },
          { label: 'Saturday', value: '6' },
        ],
      },
    ],
  },
  {
    id: 'onboarding-drip',
    name: 'Onboarding Drip Sequence',
    description: 'Automated email series for new users: Day 1 welcome, Day 3 split groups, Day 7 budgets, Day 14 reminders.',
    category: 'lifecycle',
    defaultCronExpression: '0 10 * * *',
    cronDescription: 'Daily at 10 AM',
    settingsFields: [
      {
        key: 'dripDays',
        label: 'Drip Day Triggers',
        type: 'multi-number',
        defaultValue: [1, 3, 7, 14],
        description: 'Days after signup to send each drip email',
      },
    ],
  },
  {
    id: 'achievement-emails',
    name: 'Achievement Emails',
    description: 'Celebrate milestones: 100 expenses tracked, saved 20% vs last month, 1 month anniversary, etc.',
    category: 'lifecycle',
    defaultCronExpression: '0 10 1 * *',
    cronDescription: '1st of each month at 10 AM',
    settingsFields: [
      {
        key: 'expenseMilestones',
        label: 'Expense Count Milestones',
        type: 'multi-number',
        defaultValue: [10, 50, 100, 500, 1000],
        description: 'Number of expenses that trigger achievement email',
      },
      {
        key: 'savingsThreshold',
        label: 'Savings % Threshold',
        type: 'number',
        defaultValue: 20,
        min: 5,
        max: 50,
        description: 'Minimum savings % vs last month to celebrate',
      },
    ],
  },
  {
    id: 'monthly-report',
    name: 'Monthly Personal Report',
    description: 'End-of-month spending breakdown with top categories, month-over-month comparison, and trends.',
    category: 'lifecycle',
    defaultCronExpression: '0 9 1 * *',
    cronDescription: '1st of each month at 9 AM',
    settingsFields: [
      {
        key: 'includeCharts',
        label: 'Include Charts',
        type: 'select',
        defaultValue: 'yes',
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ],
      },
    ],
  },
  {
    id: 'split-group-digest',
    name: 'Split Group Activity Digest',
    description: 'Weekly digest of split group activity: new expenses, pending balances, settlement nudges.',
    category: 'social',
    defaultCronExpression: '0 9 * * 1',
    cronDescription: 'Monday at 9 AM',
    settingsFields: [
      {
        key: 'includeSettled',
        label: 'Include Settled Groups',
        type: 'select',
        defaultValue: 'no',
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ],
      },
    ],
  },
  {
    id: 'referral-reminder',
    name: 'Referral Reminder',
    description: 'Nudge active users to invite friends. Targets users with split groups whose contacts are not on the platform.',
    category: 'social',
    defaultCronExpression: '0 10 1 * *',
    cronDescription: '1st of each month at 10 AM',
    settingsFields: [
      {
        key: 'minSplitGroups',
        label: 'Min Split Groups',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 10,
        description: 'Minimum split groups a user must have to receive referral nudge',
      },
    ],
  },
  {
    id: 'bill-prediction',
    name: 'Bill Prediction Alert',
    description: 'Analyze recurring expenses and alert users before predicted bills are due.',
    category: 'smart',
    defaultCronExpression: '0 9 * * *',
    cronDescription: 'Daily at 9 AM',
    settingsFields: [
      {
        key: 'daysBeforeDue',
        label: 'Days Before Due',
        type: 'number',
        defaultValue: 3,
        min: 1,
        max: 7,
        description: 'How many days before predicted due date to alert',
      },
      {
        key: 'minOccurrences',
        label: 'Min Occurrences',
        type: 'number',
        defaultValue: 3,
        min: 2,
        max: 12,
        description: 'Minimum times an expense must recur to be considered a bill',
      },
    ],
  },
  {
    id: 'spending-anomaly',
    name: 'Spending Anomaly Alert',
    description: 'Alert users when spending in a category significantly exceeds their average. Friendly, non-alarming tone.',
    category: 'smart',
    defaultCronExpression: '0 18 * * *',
    cronDescription: 'Daily at 6 PM',
    settingsFields: [
      {
        key: 'multiplierThreshold',
        label: 'Anomaly Multiplier',
        type: 'number',
        defaultValue: 2,
        min: 1.5,
        max: 5,
        description: 'Spending must exceed average by this multiplier (e.g., 2x)',
      },
      {
        key: 'lookbackWeeks',
        label: 'Lookback Weeks',
        type: 'number',
        defaultValue: 4,
        min: 2,
        max: 12,
        description: 'Weeks of history to compute average',
      },
    ],
  },
];

export function getMarketingCron(id: string): MarketingCronDefinition | undefined {
  return MARKETING_CRONS.find(c => c.id === id);
}

export function getDefaultSettings(def: MarketingCronDefinition): Record<string, any> {
  const settings: Record<string, any> = {};
  for (const field of def.settingsFields) {
    settings[field.key] = field.defaultValue;
  }
  return settings;
}

export function systemSettingsKey(cronId: string): string {
  return `marketing_cron_${cronId}`;
}
