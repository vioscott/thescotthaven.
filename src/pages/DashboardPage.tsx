import { useAuth } from '../contexts/AuthContext';
import { TenantDashboard } from './TenantDashboard';
import { ProfessionalDashboard } from './ProfessionalDashboard';

export function DashboardPage() {
    const { user, loading } = useAuth();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Please log in to view your dashboard</p>
                </div>
            </div>
        );
    }

    // Route to appropriate dashboard based on user role
    // Professionals: landlord, agent, admin
    // Regular users: tenant
    const isProfessional = user.role === 'landlord' || user.role === 'agent' || user.role === 'admin';

    return isProfessional ? <ProfessionalDashboard /> : <TenantDashboard />;
}
