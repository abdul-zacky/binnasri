// src/components/wallet/FlowChart.tsx
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
  timePeriod: 'week' | 'month' | 'year';
  periodOffset: number;
}

export default function FlowChart({ dateFlows, timePeriod, periodOffset }: FlowChartProps) {
  // Format data for chart based on selected time period
  const chartData = useMemo(() => {
    const now = new Date();
    let filteredFlows: DateFlow[] = [];
    
    if (timePeriod === 'week') {
      // Calculate start of week (Sunday)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() - (7 * periodOffset));
      startOfWeek.setHours(0, 0, 0, 0);
      
      // Calculate end of week (Saturday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      // Filter flows within this week
      filteredFlows = dateFlows.filter(flow => {
        const flowDate = new Date(flow.date);
        return flowDate >= startOfWeek && flowDate <= endOfWeek;
      });
      
      // Format for display (daily)
      return filteredFlows.map(flow => {
        const flowDate = new Date(flow.date);
        return {
          date: flowDate.toLocaleDateString('en-US', { weekday: 'short' }),
          income: flow.amount,
          expense: flow.negAmount,
          net: flow.amount - flow.negAmount
        };
      });
    } 
    else if (timePeriod === 'month') {
      // Calculate start of month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - periodOffset, 1);
      
      // Calculate end of month
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - periodOffset + 1, 0);
      
      // Filter flows within this month
      filteredFlows = dateFlows.filter(flow => {
        const flowDate = new Date(flow.date);
        return flowDate >= startOfMonth && flowDate <= endOfMonth;
      });
      
      // Group by week of month
      const weeklyData: Record<number, { income: number; expense: number; net: number }> = {};
      filteredFlows.forEach(flow => {
        const flowDate = new Date(flow.date);
        const weekOfMonth = Math.ceil(flowDate.getDate() / 7);
        
        if (!weeklyData[weekOfMonth]) {
          weeklyData[weekOfMonth] = { income: 0, expense: 0, net: 0 };
        }
        
        weeklyData[weekOfMonth].income += flow.amount;
        weeklyData[weekOfMonth].expense += flow.negAmount;
        weeklyData[weekOfMonth].net += (flow.amount - flow.negAmount);
      });
      
      return Object.entries(weeklyData).map(([week, data]) => ({
        date: `Week ${week}`,
        income: data.income,
        expense: data.expense,
        net: data.net
      }));
    }
    else {
      // Year view
      const year = now.getFullYear() - periodOffset;
      
      // Filter flows within this year
      filteredFlows = dateFlows.filter(flow => {
        const flowDate = new Date(flow.date);
        return flowDate.getFullYear() === year;
      });
      
      // Group by month
      const monthlyData: Record<number, { income: number; expense: number; net: number }> = {};
      for (let i = 0; i < 12; i++) {
        monthlyData[i] = { income: 0, expense: 0, net: 0 };
      }
      
      filteredFlows.forEach(flow => {
        const flowDate = new Date(flow.date);
        const month = flowDate.getMonth();
        
        monthlyData[month].income += flow.amount;
        monthlyData[month].expense += flow.negAmount;
        monthlyData[month].net += (flow.amount - flow.negAmount);
      });
      
      return Object.entries(monthlyData).map(([month, data]) => ({
        date: new Date(2000, parseInt(month)).toLocaleDateString('en-US', { month: 'short' }),
        income: data.income,
        expense: data.expense,
        net: data.net
      }));
    }
  }, [dateFlows, timePeriod, periodOffset]);

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
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
        <XAxis dataKey="date" axisLine={false} tickLine={false} />
        <YAxis 
          tickFormatter={(value) => (value > 1000000 ? `${value / 1000000}M` : value > 1000 ? `${value/1000}K` : value)}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip 
          formatter={(value: number) => formatCurrency(value)}
          labelFormatter={(label) => `${label}`}
        />
        <Area
          type="monotone"
          dataKey="income"
          stroke="#1E40AF"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#incomeGradient)"
          name="Income"
        />
        <Area
          type="monotone"
          dataKey="expense"
          stroke="#EF4444"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#expenseGradient)"
          name="Expense"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}