import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface PriceComparisonChartProps {
    yourPrice: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    similarProperties: {
        id: string;
        title: string;
        price: number;
    }[];
    loading?: boolean;
}

export function PriceComparisonChart({
    yourPrice,
    averagePrice,
    minPrice,
    maxPrice,
    similarProperties,
    loading = false
}: PriceComparisonChartProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-64 bg-gray-100 rounded"></div>
                </div>
            </div>
        );
    }

    const chartData = [
        { name: 'Your Property', price: yourPrice, isYours: true },
        ...similarProperties.slice(0, 5).map(prop => ({
            name: prop.title.length > 20 ? prop.title.substring(0, 20) + '...' : prop.title,
            price: prop.price,
            isYours: false
        }))
    ];

    const formatPrice = (value: number) => {
        return `₦${(value / 1000).toFixed(0)}k`;
    };

    const priceComparison = yourPrice > averagePrice
        ? `${((yourPrice - averagePrice) / averagePrice * 100).toFixed(1)}% above average`
        : `${((averagePrice - yourPrice) / averagePrice * 100).toFixed(1)}% below average`;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Price Comparison</h3>
                <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Your Price: </span>
                        <span className="font-semibold text-gray-900">₦{yourPrice.toLocaleString()}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Average: </span>
                        <span className="font-semibold text-gray-900">₦{averagePrice.toLocaleString()}</span>
                    </div>
                    <div>
                        <span className={`font-semibold ${yourPrice > averagePrice ? 'text-orange-600' : 'text-green-600'
                            }`}>
                            {priceComparison}
                        </span>
                    </div>
                </div>
            </div>

            {chartData.length === 1 ? (
                <div className="h-64 flex items-center justify-center text-gray-500">
                    <p>No similar properties found for comparison</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                            angle={-45}
                            textAnchor="end"
                            height={100}
                        />
                        <YAxis
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                            tickFormatter={formatPrice}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '8px 12px'
                            }}
                            formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Price']}
                        />
                        <ReferenceLine
                            y={averagePrice}
                            stroke="#f59e0b"
                            strokeDasharray="3 3"
                            label={{ value: 'Average', position: 'right', fill: '#f59e0b' }}
                        />
                        <Bar
                            dataKey="price"
                            fill="#2563eb"
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-600 mb-1">Lowest Price</p>
                    <p className="text-lg font-semibold text-gray-900">₦{minPrice.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-600 mb-1">Highest Price</p>
                    <p className="text-lg font-semibold text-gray-900">₦{maxPrice.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}
