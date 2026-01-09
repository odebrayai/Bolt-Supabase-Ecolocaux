import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { EvolutionData } from '../../types/statistics';

interface EvolutionLineChartProps {
  data: EvolutionData[];
}

export function EvolutionLineChart({ data }: EvolutionLineChartProps) {
  const formattedData = data.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="date"
          stroke="#94a3b8"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#94a3b8"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#12121a',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            color: '#f1f5f9'
          }}
          labelStyle={{ color: '#94a3b8' }}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
        />
        <Line
          type="monotone"
          dataKey="devis_signe"
          stroke="#10b981"
          strokeWidth={2}
          name="Devis Signés"
          dot={{ fill: '#10b981', r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="rdv_pris"
          stroke="#3b82f6"
          strokeWidth={2}
          name="RDV pris"
          dot={{ fill: '#3b82f6', r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="relance"
          stroke="#f59e0b"
          strokeWidth={2}
          name="Relances"
          dot={{ fill: '#f59e0b', r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="a_contacter"
          stroke="#64748b"
          strokeWidth={2}
          name="À contacter"
          dot={{ fill: '#64748b', r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="perdu"
          stroke="#ef4444"
          strokeWidth={2}
          name="Perdus"
          dot={{ fill: '#ef4444', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
