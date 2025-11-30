import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { VerificationStatus as Status } from '../utils/VerificationService';

interface VerificationStatusProps {
    status: Status | null;
    verificationType?: string;
    rejectionReason?: string;
}

export function VerificationStatus({ status, verificationType, rejectionReason }: VerificationStatusProps) {
    if (!status) {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Not Submitted</span>
            </div>
        );
    }

    const statusConfig = {
        pending: {
            icon: Clock,
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-700',
            label: 'Pending Review'
        },
        approved: {
            icon: CheckCircle,
            bgColor: 'bg-green-100',
            textColor: 'text-green-700',
            label: 'Verified'
        },
        rejected: {
            icon: XCircle,
            bgColor: 'bg-red-100',
            textColor: 'text-red-700',
            label: 'Rejected'
        },
        expired: {
            icon: AlertCircle,
            bgColor: 'bg-orange-100',
            textColor: 'text-orange-700',
            label: 'Expired'
        }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <div className="space-y-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1 ${config.bgColor} ${config.textColor} rounded-full text-sm font-medium`}>
                <Icon className="w-4 h-4" />
                <span>{config.label}</span>
            </div>

            {status === 'rejected' && rejectionReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                        <span className="font-semibold">Reason: </span>
                        {rejectionReason}
                    </p>
                </div>
            )}

            {status === 'expired' && (
                <p className="text-sm text-orange-600">
                    Your verification has expired. Please submit a new verification request.
                </p>
            )}
        </div>
    );
}
