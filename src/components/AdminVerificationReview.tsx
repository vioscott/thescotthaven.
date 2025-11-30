import React, { useState, useEffect } from 'react';
import { VerificationService, Verification, VerificationDocument } from '../utils/VerificationService';
import { CheckCircle, XCircle, FileText, ExternalLink, Shield, Building, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function AdminVerificationReview() {
    const { user } = useAuth();
    const [verifications, setVerifications] = useState<Verification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
    const [documents, setDocuments] = useState<VerificationDocument[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadVerifications();
    }, []);

    const loadVerifications = async () => {
        try {
            const data = await VerificationService.adminGetPendingVerifications();
            setVerifications(data);
        } catch (error) {
            console.error('Error loading verifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectVerification = async (verification: Verification) => {
        setSelectedVerification(verification);
        setLoadingDocs(true);
        try {
            const result = await VerificationService.getVerificationWithDocuments(verification.id);
            if (result) {
                setDocuments(result.documents);
            }
        } catch (error) {
            console.error('Error loading documents:', error);
        } finally {
            setLoadingDocs(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedVerification || !user) return;

        if (!window.confirm('Are you sure you want to approve this verification?')) return;

        setProcessing(true);
        try {
            await VerificationService.adminApproveVerification(selectedVerification.id, user.id);

            // If it's a property verification, we might want to link it to a property
            // But for now, the trigger handles the status update if it's already linked

            alert('Verification approved successfully');
            setSelectedVerification(null);
            loadVerifications();
        } catch (error) {
            console.error('Error approving verification:', error);
            alert('Failed to approve verification');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedVerification || !user) return;
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        if (!window.confirm('Are you sure you want to reject this verification?')) return;

        setProcessing(true);
        try {
            await VerificationService.adminRejectVerification(
                selectedVerification.id,
                user.id,
                rejectionReason
            );

            alert('Verification rejected');
            setSelectedVerification(null);
            setRejectionReason('');
            loadVerifications();
        } catch (error) {
            console.error('Error rejecting verification:', error);
            alert('Failed to reject verification');
        } finally {
            setProcessing(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'identity': return <Shield className="w-5 h-5 text-blue-500" />;
            case 'property_ownership': return <Building className="w-5 h-5 text-green-500" />;
            case 'business_license': return <FileText className="w-5 h-5 text-purple-500" />;
            default: return <Shield className="w-5 h-5" />;
        }
    };

    const formatType = (type: string) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List of Verifications */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-semibold text-gray-900">Pending Requests ({verifications.length})</h2>
                </div>
                <div className="overflow-y-auto max-h-[600px]">
                    {verifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No pending verifications</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {verifications.map((verification) => (
                                <button
                                    key={verification.id}
                                    onClick={() => handleSelectVerification(verification)}
                                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${selectedVerification?.id === verification.id ? 'bg-blue-50 hover:bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">{getTypeIcon(verification.verification_type)}</div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {(verification as any).user?.name || 'Unknown User'}
                                            </p>
                                            <p className="text-sm text-gray-500 mb-1">
                                                {formatType(verification.verification_type)}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Submitted: {new Date(verification.submitted_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail View */}
            <div className="lg:col-span-2">
                {selectedVerification ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">Verification Details</h2>
                                    <p className="text-gray-500">
                                        Request ID: <span className="font-mono text-xs">{selectedVerification.id}</span>
                                    </p>
                                </div>
                                <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    Pending Review
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Applicant</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        {(selectedVerification as any).user?.name}
                                    </p>
                                    <p className="text-sm text-gray-500 ml-6">{(selectedVerification as any).user?.email}</p>
                                    <p className="text-xs text-gray-400 ml-6 mt-1">Role: {(selectedVerification as any).user?.role}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Verification Type</p>
                                    <p className="font-medium flex items-center gap-2">
                                        {getTypeIcon(selectedVerification.verification_type)}
                                        {formatType(selectedVerification.verification_type)}
                                    </p>
                                    <p className="text-sm text-gray-500 ml-7">
                                        Submitted {new Date(selectedVerification.submitted_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-500" />
                                Submitted Documents
                            </h3>

                            {loadingDocs ? (
                                <div className="flex justify-center p-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                </div>
                            ) : documents.length === 0 ? (
                                <p className="text-gray-500 italic">No documents found.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {documents.map((doc) => (
                                        <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                            <div className="flex items-start justify-between mb-2">
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                                                    {formatType(doc.document_type)}
                                                </span>
                                                <a
                                                    href={doc.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Open document"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 truncate mb-1">{doc.file_name}</p>
                                            <p className="text-xs text-gray-500">
                                                {(doc.file_size ? (doc.file_size / 1024 / 1024).toFixed(2) : '0')} MB
                                            </p>

                                            {/* Preview for images */}
                                            {['jpg', 'jpeg', 'png', 'webp'].some(ext => doc.file_name.toLowerCase().endsWith(ext)) && (
                                                <div className="mt-3 h-32 bg-gray-100 rounded overflow-hidden">
                                                    <img src={doc.file_url} alt="Document preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-gray-50">
                            <h3 className="font-semibold text-gray-900 mb-4">Review Decision</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rejection Reason (Required for rejection)
                                    </label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Enter reason for rejection..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleApprove}
                                        disabled={processing}
                                        className="flex-1 py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Approve Verification
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={processing || !rejectionReason.trim()}
                                        className="flex-1 py-2 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Reject Verification
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center h-full flex flex-col items-center justify-center text-gray-500">
                        <Shield className="w-16 h-16 text-gray-200 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Select a Request</h3>
                        <p>Select a verification request from the list to review documents and make a decision.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
