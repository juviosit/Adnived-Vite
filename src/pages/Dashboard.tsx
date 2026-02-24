import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SitesTab from "@/components/dashboard/SitesTab";
import PlanTab from "@/components/dashboard/PlanTab";
import SettingsTab from "@/components/dashboard/SettingsTab";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("sites");

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {{
        sites: <SitesTab />,
        plan: <PlanTab />,
        settings: <SettingsTab />,
      }}
    </DashboardLayout>
  );
};

export default Dashboard;
