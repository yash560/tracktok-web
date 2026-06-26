'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import axios from 'axios';
import { useCurrency } from './CurrencyContext';

interface HeatmapDay {
  date: string;
  amount: number;
  count: number;
}

export function SpendingHeatmap() {
  const { fmt } = useCurrency();
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<HeatmapDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; day: HeatmapDay } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/analytics/heatmap?year=${year}`);
        setData(res.data.data || []);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  const dayMap = useMemo(() => {
    const map: Record<string, HeatmapDay> = {};
    data.forEach((d) => { map[d.date] = d; });
    return map;
  }, [data]);

  const { weeks, monthLabels, maxAmount } = useMemo(() => {
    const jan1 = new Date(year, 0, 1);
    const dec31 = new Date(year, 11, 31);

    const startDay = jan1.getDay();
    const totalDays = Math.ceil((dec31.getTime() - jan1.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const cells: (string | null)[] = [];
    // pad start
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(year, 0, 1 + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      cells.push(key);
    }

    const weeks: (string | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    // pad last week
    while (weeks.length > 0 && weeks[weeks.length - 1].length < 7) {
      weeks[weeks.length - 1].push(null);
    }

    // month labels
    const labels: { label: string; col: number }[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      for (const cell of week) {
        if (cell) {
          const m = parseInt(cell.split('-')[1]) - 1;
          if (m !== lastMonth) {
            labels.push({ label: months[m], col: wi });
            lastMonth = m;
          }
          break;
        }
      }
    });

    let max = 0;
    data.forEach((d) => { if (d.amount > max) max = d.amount; });

    return { weeks, monthLabels: labels, maxAmount: max };
  }, [year, data]);

  const getColor = (dateStr: string | null): string => {
    if (!dateStr) return 'bg-transparent';
    const day = dayMap[dateStr];
    if (!day || day.amount === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (maxAmount === 0) return 'bg-gray-100 dark:bg-gray-800';

    const ratio = day.amount / maxAmount;
    if (ratio <= 0.25) return 'bg-green-200 dark:bg-green-900';
    if (ratio <= 0.5) return 'bg-green-400 dark:bg-green-700';
    if (ratio <= 0.75) return 'bg-orange-400 dark:bg-orange-700';
    return 'bg-red-500 dark:bg-red-700';
  };

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Spending Heatmap
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setYear(y => y - 1)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold w-12 text-center">{year}</span>
          <button
            onClick={() => setYear(y => y + 1)}
            disabled={year >= new Date().getFullYear()}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="relative overflow-x-auto -mx-2 px-2">
          {/* Month labels */}
          <div className="flex ml-8 mb-1">
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="text-[10px] text-gray-400 absolute"
                style={{ left: `${m.col * 14 + 32}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-0.5 mt-5 relative">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1 flex-shrink-0">
              {dayLabels.map((label, i) => (
                <div key={i} className="h-[12px] flex items-center">
                  <span className="text-[9px] text-gray-400 w-6 text-right">{label}</span>
                </div>
              ))}
            </div>

            {/* Grid */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className={`w-[12px] h-[12px] rounded-[2px] ${getColor(day)} ${day ? 'cursor-pointer hover:ring-1 hover:ring-primary' : ''}`}
                    onMouseEnter={(e) => {
                      if (day && dayMap[day]) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({ x: rect.left, y: rect.top - 40, day: dayMap[day] });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-[10px] text-gray-400">Less</span>
            <div className="w-[12px] h-[12px] rounded-[2px] bg-gray-100 dark:bg-gray-800" />
            <div className="w-[12px] h-[12px] rounded-[2px] bg-green-200 dark:bg-green-900" />
            <div className="w-[12px] h-[12px] rounded-[2px] bg-green-400 dark:bg-green-700" />
            <div className="w-[12px] h-[12px] rounded-[2px] bg-orange-400 dark:bg-orange-700" />
            <div className="w-[12px] h-[12px] rounded-[2px] bg-red-500 dark:bg-red-700" />
            <span className="text-[10px] text-gray-400">More</span>
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="fixed z-50 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <div className="font-semibold">{tooltip.day.date}</div>
              <div>{fmt(tooltip.day.amount)} · {tooltip.day.count} txn{tooltip.day.count > 1 ? 's' : ''}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
