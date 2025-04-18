"use client";

import { Home, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ActivitySummaryProps {
  occupancyRate: number;
  occupiedRooms: number;
  totalRooms: number;
  checkIns: number;
  checkOuts: number;
}

export default function ActivitySummary({ 
  occupancyRate, 
  occupiedRooms, 
  totalRooms,
  checkIns,
  checkOuts
}: ActivitySummaryProps) {
  const cards = [
    {
      title: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      description: `${occupiedRooms}/${totalRooms} rooms occupied`,
      icon: <Home size={24} />,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      title: 'Today Check-ins',
      value: checkIns,
      description: 'New arrivals today',
      icon: <ArrowDownRight size={24} />,
      color: 'bg-green-100 text-green-700'
    },
    {
      title: 'Today Check-outs',
      value: checkOuts,
      description: 'Departures today',
      icon: <ArrowUpRight size={24} />,
      color: 'bg-amber-100 text-amber-700'
    }
  ];

  return (
    <>
      {cards.map((card, index) => (
        <div key={index} className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm">{card.title}</p>
              <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
              <p className="text-gray-500 text-sm mt-1">{card.description}</p>
            </div>
            <div className={`p-3 rounded-full ${card.color}`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}