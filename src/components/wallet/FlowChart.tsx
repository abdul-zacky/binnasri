"use client";

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DateFlow } from '@/models/dateFlow';
import { formatCurrency } from '@/lib/utils';

interface FlowChartProps {
  dateFlows: DateFlow[];
}

export default function FlowChart({ dateFlows }: FlowChartProps) {
  // Format data for chart
  const chartData = useMemo(() => {
    // Only take the last 7 days of data for the chart
    const lastFlows = dateFlows.slice(-7);
    
    return lastFlows.map((flow) => ({
      date: new Date(flow.date).getDate().toString(), // Just the day number
      income: flow.amount,
      expense: flow.negAmount,
    }));
  }, [dateFlows]);

  if (dateFlows.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No data to display
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#1E40AF" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
        <XAxis dataKey="date" axisLine={false} tickLine={false} />
        <YAxis 
          tickFormatter={(value) => (value > 1000000 ? `${value / 1000000}M` : value)}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip 
          formatter={(value: number) => formatCurrency(value)}
          labelFormatter={(label) => `Day ${label}`}
        />
        <Area
          type="monotone"
          dataKey="income"
          stroke="#1E40AF"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#incomeGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}