import React from 'react';
import { MortgageCalculator } from '../components/MortgageCalculator';

export function MortgagePage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Estimate Your Monthly Payments</h1>
                    <p className="text-lg text-gray-600">
                        Use our mortgage calculator to understand your potential monthly payments, including principal, interest, taxes, and insurance.
                    </p>
                </div>

                <MortgageCalculator propertyPrice={50000000} />
            </div>
        </div>
    );
}
