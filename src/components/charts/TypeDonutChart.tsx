import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { TypeRepartition } from '../../types/statistics';

interface TypeDonutChartProps {
  data: TypeRepartition[];
}

const COLORS = [
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#64748b',
  '#14b8a6'
];

export function TypeDonutChart({ data }: TypeDonutChartProps) {
  const chartData = data.map(d => ({
    name: d.type,
    value: d.count,
    percentage: d.percentage
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          fill="#8884d8"
          paddingAngle={2}
          dataKey="value"
          label={({ percentage }) => `${percentage}%`}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#12121a',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            color: '#f1f5f9'
          }}
          formatter={(value: number, name: string, props: any) => [
            `${value} (${props.payload.percentage}%)`,
            name
          ]}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
          formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
