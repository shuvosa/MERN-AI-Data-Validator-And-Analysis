import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart2, LineChart as LineIcon, PieChart as PieIcon, ScatterChart as ScatterIcon } from 'lucide-react';

interface SQLQueryVisualizerProps {
  data: any[];
  query: string;
}

const CHART_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#0088fe',
  '#00c49f',
  '#ffbb28',
  '#ff8042',
];

const SQLQueryVisualizer: React.FC<SQLQueryVisualizerProps> = ({ data, query }) => {
  const chartType = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    
    // Detect aggregation
    const hasAggregation = /count|sum|avg|min|max/i.test(lowerQuery);
    
    // Detect grouping
    const hasGroupBy = /group by/i.test(lowerQuery);
    
    // Detect time series
    const hasTimeField = /date|timestamp|time/i.test(lowerQuery);
    
    // Detect relationships
    const hasJoin = /join/i.test(lowerQuery);
    
    if (hasTimeField && !hasGroupBy) {
      return 'line';
    } else if (hasAggregation && hasGroupBy) {
      return data.length <= 8 ? 'pie' : 'bar';
    } else if (hasJoin || data.length > 20) {
      return 'scatter';
    }
    return 'bar';
  }, [query, data]);

  const chartData = useMemo(() => {
    if (!data.length) return [];
    
    const keys = Object.keys(data[0]);
    const numericKeys = keys.filter(key => 
      typeof data[0][key] === 'number'
    );
    
    if (chartType === 'scatter') {
      return data.map(item => ({
        x: item[numericKeys[0]] || 0,
        y: item[numericKeys[1]] || 0,
        name: item[keys.find(k => typeof item[k] === 'string') || keys[0]]
      }));
    }
    
    return data;
  }, [data, chartType]);

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <div className="relative">
            <LineIcon className="absolute top-2 right-2 text-gray-400" size={20} />
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={Object.keys(data[0])[0]} />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(data[0])
                  .filter(key => typeof data[0][key] === 'number')
                  .map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'pie':
        return (
          <div className="relative">
            <PieIcon className="absolute top-2 right-2 text-gray-400" size={20} />
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey={Object.keys(data[0]).find(key => typeof data[0][key] === 'number')}
                  nameKey={Object.keys(data[0])[0]}
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#8884d8"
                  label
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case 'scatter':
        return (
          <div className="relative">
            <ScatterIcon className="absolute top-2 right-2 text-gray-400" size={20} />
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" name="X" />
                <YAxis dataKey="y" name="Y" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter
                  name="Data Points"
                  data={chartData}
                  fill="#8884d8"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return (
          <div className="relative">
            <BarChart2 className="absolute top-2 right-2 text-gray-400" size={20} />
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={Object.keys(data[0])[0]} />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(data[0])
                  .filter(key => typeof data[0][key] === 'number')
                  .map((key, index) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
    }
  };

  if (!data.length) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Query Visualization</h3>
      {renderChart()}
    </div>
  );
};

export default SQLQueryVisualizer;