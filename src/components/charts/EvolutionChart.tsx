import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { EvolutionStatut } from '../../types/statistics';

interface EvolutionChartProps {
  data: EvolutionStatut[];
}

export function EvolutionChart({ data }: EvolutionChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-3 shadow-xl">
          <p className="text-[#f1f5f9] font-medium mb-2">{payload[0].payload.mois}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[#94a3b8]">{entry.name}:</span>
              <span className="text-[#f1f5f9] font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
      <h3 className="text-[#f1f5f9] text-lg font-semibold mb-6">Évolution des Statuts</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis 
            dataKey="mois" 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
            iconType="circle"
          />
          <Line 
            type="monotone" 
            dataKey="a_contacter" 
            name="À contacter"
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="rdv_pris" 
            name="RDV pris"
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="gagne" 
            name="Gagné"
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="perdu" 
            name="Perdu"
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}