import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AnalyticsCardProps {
    title: string;
    value: string | number;
    icon?: ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    subtitle?: string;
    className?: string;
}

export function AnalyticsCard({
    title,
    value,
    icon,
    trend,
    subtitle,
    className = ''
}: AnalyticsCardProps) {
    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                    {trend && (
                        <div className="flex items-center mt-2">
                            {trend.isPositive ? (
                                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                            )}
                            <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {Math.abs(trend.value)}%
                            </span>
                            <span className="text-sm text-gray-500 ml-1">vs average</span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className="ml-4 p-3 bg-blue-50 rounded-lg">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
