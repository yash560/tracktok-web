const REACH_API_URL = process.env.REACH_API_URL;
const REACH_API_KEY = process.env.REACH_API_KEY;
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL;

interface CreateCronJobParams {
  name: string;
  description?: string;
  endpoint?: string;
  body: Record<string, any>;
  cronExpression: string;
  timezone?: string;
  sourceReferenceId: string;
  maxRetries?: number;
}

interface CronJobResponse {
  _id: string;
  name: string;
  status: string;
  cronExpression: string;
}

async function reachRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!REACH_API_URL || !REACH_API_KEY) {
    throw new Error('REACH_API_URL and REACH_API_KEY must be configured');
  }

  const res = await fetch(`${REACH_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': REACH_API_KEY,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Reach API error: ${res.status}`);
  }

  return res.json();
}

export async function registerCronJob(params: CreateCronJobParams): Promise<CronJobResponse> {
  return reachRequest<CronJobResponse>('/api/cron-jobs', {
    method: 'POST',
    body: JSON.stringify({
      name: params.name,
      description: params.description,
      baseUrl: NEXT_PUBLIC_APP_URL,
      endpoint: params.endpoint || '/api/cron/execute',
      method: 'POST',
      body: params.body,
      cronExpression: params.cronExpression,
      timezone: params.timezone || 'Asia/Kolkata',
      sourceReferenceId: params.sourceReferenceId,
      maxRetries: params.maxRetries || 3,
    }),
  });
}

export async function updateCronJob(id: string, params: Partial<CreateCronJobParams>): Promise<CronJobResponse> {
  const payload: Record<string, any> = {};
  if (params.name) payload.name = params.name;
  if (params.description !== undefined) payload.description = params.description;
  if (params.body) payload.body = params.body;
  if (params.cronExpression) payload.cronExpression = params.cronExpression;
  if (params.timezone) payload.timezone = params.timezone;

  return reachRequest<CronJobResponse>(`/api/cron-jobs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteCronJob(id: string): Promise<void> {
  await reachRequest(`/api/cron-jobs/${id}`, { method: 'DELETE' });
}

export function frequencyToCron(frequency: string, dueDate: string): string | null {
  const date = new Date(dueDate);
  const minute = date.getMinutes();
  const hour = date.getHours() || 9;
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1;
  const dayOfWeek = date.getDay();

  switch (frequency) {
    case 'weekly':
      return `${minute} ${hour} * * ${dayOfWeek}`;
    case 'monthly':
      return `${minute} ${hour} ${dayOfMonth} * *`;
    case 'yearly':
      return `${minute} ${hour} ${dayOfMonth} ${month} *`;
    case 'once':
    default:
      return null;
  }
}
