import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { PerformanceParType } from '../../types/statistics';

interface TypeDistributionProps {
  data: PerformanceParType[];
}

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function TypeDistribution({ data }: TypeDistributionProps) {
  const chartData = data.map(item => ({
    name: item.type_etablissement,
    value: item.total,
    percentage: 0 // Sera calculé
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  chartData.forEach(item => {
    item.percentage = Math.round((item.value / total) * 100);
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-3 shadow-xl">
          <p className="text-[#f1f5f9] font-medium mb-1">{data.name}</p>
          <p className="text-[#94a3b8] text-sm">
            {data.value} commerces ({data.payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[#94a3b8] text-sm">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
      <h3 className="text-[#f1f5f9] text-lg font-semibold mb-6">
        Répartition par Type d'Établissement
      </h3>

      {chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-2 gap-4">
            {data.slice(0, 4).map((item, index) => (
              <div 
                key={index}
                className="p-3 bg-[#0a0a0f] rounded-lg border border-[#1e293b]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <p className="text-[#f1f5f9] text-sm font-medium">
                    {item.type_etablissement}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[#64748b]">Total</p>
                    <p className="text-[#f1f5f9] font-medium">{item.total}</p>
                  </div>
                  <div>
                    <p className="text-[#64748b]">Conv.</p>
                    <p className="text-[#f1f5f9] font-medium">{item.taux_conversion}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-[#64748b]">Aucune donnée disponible</p>
        </div>
      )}
    </div>
  );
}