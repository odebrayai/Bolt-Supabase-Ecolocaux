import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  evolution?: number;
  icon: React.ReactNode;
  color: 'cyan' | 'green' | 'orange' | 'purple';
}

const colorClasses = {
  cyan: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-500',
    border: 'border-cyan-500/20'
  },
  green: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    border: 'border-emerald-500/20'
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-500',
    border: 'border-orange-500/20'
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
    border: 'border-purple-500/20'
  }
};

export function KPICard({ title, value, evolution, icon, color }: KPICardProps) {
  const colors = colorClasses[color];
  
  const renderEvolution = () => {
    if (evolution === undefined || evolution === 0) {
      return (
        <div className="flex items-center gap-1 text-[#64748b]">
          <Minus className="w-3 h-3" />
          <span className="text-xs">Stable</span>
        </div>
      );
    }

    const isPositive = evolution > 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span className="text-xs font-medium">{Math.abs(evolution)}%</span>
      </div>
    );
  };

  return (
    <div className={`bg-[#12121a] rounded-lg border ${colors.border} p-6 hover:border-opacity-40 transition-all`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`${colors.bg} ${colors.text} p-3 rounded-lg`}>
          {icon}
        </div>
        {renderEvolution()}
      </div>
      
      <div>
        <p className="text-[#64748b] text-sm mb-1">{title}</p>
        <p className="text-[#f1f5f9] text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
}