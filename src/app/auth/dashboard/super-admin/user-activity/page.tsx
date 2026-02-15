import { UserBehaviorDashboard } from '@/components/admin/analytics/UserBehaviorDashboard';
import SuperAdminLayout from '@/components/layouts/super-admin-layout';

export default function UserActivityPage() {
    return (
        <SuperAdminLayout>
            <UserBehaviorDashboard />
        </SuperAdminLayout>
    );
}
