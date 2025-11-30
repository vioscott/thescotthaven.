import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { VerificationService, VerificationType, DocumentType } from '../utils/VerificationService';
import { DocumentUpload } from '../components/DocumentUpload';
import { VerificationStatus } from '../components/VerificationStatus';
import { Shield, FileText, Building, CheckCircle } from 'lucide-react';

type TabType = 'identity' | 'property' | 'business';

export function VerificationPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('identity');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [documentType, setDocumentType] = useState<DocumentType>('id_card');
    const [verificationStatuses, setVerificationStatuses] = useState<{
        identity: any;
        property: any;
        business: any;
    }>({
        identity: null,
        property: null,
        business: null
    });

    useEffect(() => {
        if (user) {
            loadVerificationStatuses();
        }
    }, [user]);

    const loadVerificationStatuses = async () => {
        if (!user) return;

        const [identity, property, business] = await Promise.all([
            VerificationService.getVerificationStatus(user.id, 'identity'),
            VerificationService.getVerificationStatus(user.id, 'property_ownership'),
            VerificationService.getVerificationStatus(user.id, 'business_license')
        ]);

        setVerificationStatuses({ identity, property, business });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedFile) return;

        setSubmitting(true);
        setUploading(true);

        try {
            // Map tab to verification type
            const verificationTypeMap: Record<TabType, VerificationType> = {
                identity: 'identity',
                property: 'property_ownership',
                business: 'business_license'
            };

            // Create verification request
            const verification = await VerificationService.submitVerification(
                user.id,
                verificationTypeMap[activeTab]
            );

            // Upload document
            await VerificationService.uploadDocument(
                selectedFile,
                user.id,
                verification.id,
                documentType
            );

            // Reload statuses
            await loadVerificationStatuses();

            // Reset form
            setSelectedFile(null);
            setUploading(false);
            setSubmitting(false);

            alert('Verification submitted successfully! We will review your documents shortly.');
        } catch (error) {
            console.error('Error submitting verification:', error);
            alert('Failed to submit verification. Please try again.');
            setUploading(false);
            setSubmitting(false);
        }
    };

    const tabs = [
        {
            id: 'identity' as TabType,
            label: 'Identity Verification',
            icon: Shield,
            description: 'Verify your identity with a government-issued ID',
            documentTypes: [
                { value: 'id_card', label: 'ID Card' },
                { value: 'passport', label: 'Passport' },
                { value: 'drivers_license', label: "Driver's License" }
            ]
        },
        {
            id: 'property' as TabType,
            label: 'Property Ownership',
            icon: Building,
            description: 'Verify property ownership with official documents',
            documentTypes: [
                { value: 'property_deed', label: 'Property Deed' },
                { value: 'property_title', label: 'Property Title' },
                { value: 'tax_document', label: 'Tax Document' }
            ],
            roleRequired: 'landlord'
        },
        {
            id: 'business' as TabType,
            label: 'Business License',
            icon: FileText,
            description: 'Verify your business license and registration',
            documentTypes: [
                { value: 'business_license', label: 'Business License' },
                { value: 'business_registration', label: 'Business Registration' }
            ],
            roleRequired: 'agent'
        }
    ];

    const currentTab = tabs.find(t => t.id === activeTab)!;
    const currentStatus = verificationStatuses[activeTab];
    const canSubmit = !currentStatus || currentStatus === 'rejected' || currentStatus === 'expired';

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600">Please log in to access verification.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Verified</h1>
                    <p className="text-gray-600">
                        Build trust with verified badges on your profile and listings
                    </p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isDisabled = tab.roleRequired && user.role !== tab.roleRequired;

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => !isDisabled && setActiveTab(tab.id)}
                                        disabled={isDisabled}
                                        className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                                ? 'border-blue-600 text-blue-600'
                                                : isDisabled
                                                    ? 'border-transparent text-gray-400 cursor-not-allowed'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Icon className="w-5 h-5" />
                                            <span>{tab.label}</span>
                                            {verificationStatuses[tab.id] === 'approved' && (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                {currentTab.label}
                            </h2>
                            <p className="text-gray-600">{currentTab.description}</p>
                        </div>

                        {/* Current Status */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Current Status</h3>
                            <VerificationStatus status={currentStatus} />
                        </div>

                        {/* Submission Form */}
                        {canSubmit && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Document Type
                                    </label>
                                    <select
                                        value={documentType}
                                        onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {currentTab.documentTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Upload Document
                                    </label>
                                    <DocumentUpload
                                        selectedFile={selectedFile}
                                        onFileSelect={setSelectedFile}
                                        onFileRemove={() => setSelectedFile(null)}
                                        uploading={uploading}
                                    />
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-blue-900 mb-2">Important Notes:</h4>
                                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                                        <li>Documents must be clear and readable</li>
                                        <li>All information must be visible</li>
                                        <li>Documents must be valid and not expired</li>
                                        <li>Review typically takes 1-3 business days</li>
                                    </ul>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!selectedFile || submitting}
                                    className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {submitting ? 'Submitting...' : 'Submit for Verification'}
                                </button>
                            </form>
                        )}

                        {!canSubmit && currentStatus === 'pending' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm text-yellow-800">
                                    Your verification is currently under review. We'll notify you once it's been processed.
                                </p>
                            </div>
                        )}

                        {!canSubmit && currentStatus === 'approved' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-800">
                                    ✓ You are verified! Your verified badge is now displayed on your profile.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
