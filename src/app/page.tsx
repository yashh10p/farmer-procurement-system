"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store";
import { FarmerApp } from "@/components/farmer/FarmerApp";
import { CentreDashboard } from "@/components/centre/CentreDashboard";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { GateGuardApp } from "@/components/guard/GateGuardApp";
import { QualityLabApp } from "@/components/quality/QualityLabApp";
import { PublicDisplayApp } from "@/components/public/PublicDisplayApp";

export default function Home() {
  useEffect(() => {
    useAppStore.getState().initSync();
  }, []);

  const currentRole = useAppStore((state) => state.currentRole);

  switch (currentRole) {
    case "Farmer":
      return <FarmerApp />;
    case "CentreManager":
      return <CentreDashboard />;
    case "DistrictOfficer":
      return <AdminDashboard />;
    case "GateGuard":
      return <GateGuardApp />;
    case "QualityLab":
      return <QualityLabApp />;
    case "PublicDisplay":
      return <PublicDisplayApp />;
    default:
      return <div>Select a role</div>;
  }
}
