import SEO from "@/components/SEO";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SitesTab from "@/components/dashboard/SitesTab";
import PlanTab from "@/components/dashboard/PlanTab";
import ReferralTab from "@/components/dashboard/ReferralTab";
import SettingsTab from "@/components/dashboard/SettingsTab";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "sites";
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <>
    <SEO title="Dashboard" description="Manage your websites, view analytics, and track performance with adnivedAnalytics." path="/dashboard" noindex />
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {{
        sites: <SitesTab />,
        plan: <PlanTab />,
        referral: <ReferralTab />,
        settings: <SettingsTab />,
      }}
    </DashboardLayout>
    </>
  );
};

export default Dashboard;
