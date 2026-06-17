export function formatDateWithTime(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}
