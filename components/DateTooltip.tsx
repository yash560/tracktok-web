import { formatDateWithTime } from '@/lib/dateFormatter';

interface DateTooltipProps {
  dateInput: string | Date;
  children?: React.ReactNode;
}

export function DateTooltip({ dateInput, children }: DateTooltipProps) {
  const formattedDate = formatDateWithTime(dateInput);

  return (
    <span title={formattedDate}>
      {children}
    </span>
  );
}
