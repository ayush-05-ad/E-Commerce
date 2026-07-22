import { DollarSign, ShoppingBag, Users, ArrowUpRight } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    users: number;
    stores: number;
    orders: number;
    totalRevenue: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      trend: "+12.5%",
      icon: DollarSign,
    },
    {
      title: "Active Stores",
      value: `${stats.stores}`,
      trend: "+8.2%",
      icon: ShoppingBag,
    },
    {
      title: "Total Users",
      value: `${stats.users}`,
      trend: "+4.1%",
      icon: Users,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{card.title}</h3>
              <div className="p-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                <Icon className="w-4 h-4 text-neutral-900 dark:text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
                {card.value}
              </span>
              <span className="flex items-center text-xs font-bold text-emerald-600">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {card.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
