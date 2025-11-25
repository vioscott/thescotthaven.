import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

interface ViewsChartProps {
    data: { date: string; count: number }[];
    loading?: boolean;
}

type DateRange = '7d' | '30d' | '90d' | 'all';

export function ViewsChart({ data, loading = false }: ViewsChartProps) {
    const [dateRange, setDateRange] = useState<DateRange>('30d');

    const filterDataByRange = (range: DateRange) => {
        if (range === 'all') return data;

        const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
        const cutoffDate = subDays(new Date(), days).toISOString().split('T')[0];

        return data.filter(item => item.date >= cutoffDate);
    };

    const filteredData = filterDataByRange(dateRange);

    const formatXAxis = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return format(date, 'MMM d');
        } catch {
            return dateStr;
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-64 bg-gray-100 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Property Views Over Time</h3>
                <div className="flex gap-2">
                    {(['7d', '30d', '90d', 'all'] as DateRange[]).map(range => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${dateRange === range
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {range === 'all' ? 'All' : range.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {filteredData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-500">
                    <p>No view data available for this period</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={filteredData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatXAxis}
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '8px 12px'
                            }}
                            labelFormatter={(label) => {
                                try {
                                    return format(new Date(label), 'MMM d, yyyy');
                                } catch {
                                    return label;
                                }
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#2563eb"
                            strokeWidth={2}
                            dot={{ fill: '#2563eb', r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Views"
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
