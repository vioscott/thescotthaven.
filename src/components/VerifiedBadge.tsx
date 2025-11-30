import React from 'react';
import { CheckCircle } from 'lucide-react';

interface VerifiedBadgeProps {
    size?: 'small' | 'medium' | 'large';
    verificationType?: 'identity' | 'property' | 'business';
    showTooltip?: boolean;
    className?: string;
}

export function VerifiedBadge({
    size = 'medium',
    verificationType = 'identity',
    showTooltip = true,
    className = ''
}: VerifiedBadgeProps) {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-5 h-5',
        large: 'w-6 h-6'
    };

    const tooltipText = {
        identity: 'Identity Verified',
        property: 'Property Ownership Verified',
        business: 'Business License Verified'
    };

    return (
        <div className={`inline-flex items-center ${className}`} title={showTooltip ? tooltipText[verificationType] : undefined}>
            <CheckCircle className={`${sizeClasses[size]} text-blue-600 fill-blue-100`} />
        </div>
    );
}
