#!/bin/bash

echo "▶ Creating Plasmic loader integration…"

# Ensure folders exist
mkdir -p components

# Write plasmic-init.js file
cat << 'EOF' > components/plasmic-init.js
import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";

// ─────────────────────────────────────
//  INITIALIZE PLASMIC LOADER
// ─────────────────────────────────────
export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: "kom9pjXFQGjyBNuxy7ERXZ",
      token: "VqEPrBZcR9euQrzInsHc8pvA5ajcjiikAnANDsucal6zgj9VNycMBoKHxSZHxHr72sAkZ1LXxuvq7untg"
    }
  ],
  preview: false
});

// ─────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────
const registerLayout = (Component, name, slots) => {
  PLASMIC.registerComponent(Component, {
    name,
    props: Object.fromEntries(Object.keys(slots).map((key) => [key, "slot"]))
  });
};

const registerWidget = (Component, name) => {
  PLASMIC.registerComponent(Component, { name, props: {} });
};

// ─────────────────────────────────────
//  IMPORT YOUR COMPONENTS
// (adjust paths as needed)
// ─────────────────────────────────────
import DashboardLayout from "@/components/DashboardLayout";
import DashboardLayoutHome from "@/components/DashboardLayoutHome";
import DashboardLayoutCompanies from "@/components/DashboardLayoutCompanies";
import DashboardLayoutStartups from "@/components/DashboardLayoutStartups";
import DashboardLayoutTargets from "@/components/DashboardLayoutTargets";
import DashboardLayoutStocklist from "@/components/DashboardLayoutStocklist";
import DashboardLayoutPlanning from "@/components/DashboardLayoutPlanning";
import DashboardLayoutTasks from "@/components/DashboardLayoutTasks";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

import Counter from "@/components/Counter";
import LoginForm from "@/components/LoginForm";
import LoginBackground from "@/components/LoginBackground";
import MovingLoginBackground from "@/components/MovingLoginBackground";
import LoginEntryBox from "@/components/LoginEntryBox";
import SocialLoginButton from "@/components/SocialLoginButton";

import MetricCard from "@/components/MetricCard";
import BottomMetricCard from "@/components/BottomMetricCard";

import MagicBento from "@/components/MagicBento";

import WidgetCalendar from "@/components/WidgetCalendar";
import WidgetRevenue from "@/components/WidgetRevenue";
import WidgetAnalytics from "@/components/WidgetAnalytics";
import WidgetTaskStatus from "@/components/WidgetTaskStatus";
import WidgetTimeline from "@/components/WidgetTimeline";
import WidgetPendingTasks from "@/components/WidgetPendingTasks";
import WidgetActiveProjects from "@/components/WidgetActiveProjects";
import WidgetNewCustomers from "@/components/WidgetNewCustomers";

import WidgetKanbanBoard from "@/components/WidgetKanbanBoard";
import WidgetMeetingsActivities from "@/components/WidgetMeetingsActivities";
import WidgetRecentLeads from "@/components/WidgetRecentLeads";
import WidgetProjectManagement from "@/components/WidgetProjectManagement";
import WidgetTaskList from "@/components/WidgetTaskList";
import WidgetNotifications from "@/components/WidgetNotifications";

// ─────────────────────────────────────
//  REGISTER COMPONENTS WITH PLASMIC
// ─────────────────────────────────────

// LAYOUTS
registerLayout(DashboardLayout, "DashboardLayout", {
  topMetric1: "slot",
  topMetric2: "slot",
  topMetric3: "slot",
  topMetric4: "slot",
  loginEntry: "slot",
  bottomMetric1: "slot",
  bottomMetric2: "slot",
  magicBento: "slot",
  halfLeft: "slot",
  halfRight: "slot",
  fullWidth2: "slot"
});
registerLayout(DashboardLayoutHome, "DashboardLayoutHome", {
  slot1: "slot",
  slot2: "slot",
  slot3: "slot",
  slot4: "slot",
  slot5: "slot",
  slot6: "slot",
  slot7: "slot",
  slot8: "slot",
  slot9: "slot"
});
registerLayout(DashboardLayoutCompanies, "DashboardLayoutCompanies", {
  widget9: "slot",
  widget10: "slot",
  widget11: "slot",
  widget12: "slot"
});
registerLayout(DashboardLayoutStartups, "DashboardLayoutStartups", {
  widget24: "slot",
  widget25: "slot"
});
registerLayout(DashboardLayoutTargets, "DashboardLayoutTargets", {
  widget35: "slot",
  widget36: "slot",
  widget37: "slot",
  widget38: "slot"
});
registerLayout(DashboardLayoutStocklist, "DashboardLayoutStocklist", {
  widget13: "slot",
  widget14: "slot",
  widget15: "slot",
  widget16: "slot",
  widget17: "slot",
  widget18: "slot",
  widget19: "slot",
  widget20: "slot"
});
registerLayout(DashboardLayoutPlanning, "DashboardLayoutPlanning", {
  widget21: "slot",
  widget22: "slot",
  widget23: "slot",
  widget24: "slot",
  widget25: "slot",
  widget26: "slot",
  widget27: "slot",
  widget28: "slot",
  widget29: "slot",
  widget30: "slot"
});
registerLayout(DashboardLayoutTasks, "DashboardLayoutTasks", {
  widget31: "slot",
  widget32: "slot",
  widget33: "slot",
  widget34: "slot"
});

// BASIC COMPONENTS
PLASMIC.registerComponent(Sidebar, { name: "Sidebar" });
PLASMIC.registerComponent(Header, {
  name: "Header",
  props: { pageName: "slot" }
});
PLASMIC.registerComponent(Counter, { name: "Counter" });
PLASMIC.registerComponent(LoginForm, { name: "LoginForm" });
PLASMIC.registerComponent(LoginBackground, { name: "LoginBackground", props: { children: "slot" } });
PLASMIC.registerComponent(MovingLoginBackground, {
  name: "MovingLoginBackground",
  props: {
    hueShift: "number",
    noiseIntensity: "number",
    scanlineIntensity: "number",
    speed: "number"
  }
});
PLASMIC.registerComponent(LoginEntryBox, { name: "LoginEntryBox" });
PLASMIC.registerComponent(SocialLoginButton, { name: "SocialLoginButton" });

PLASMIC.registerComponent(MetricCard, { name: "MetricCard" });
PLASMIC.registerComponent(BottomMetricCard, { name: "BottomMetricCard" });
PLASMIC.registerComponent(MagicBento, { name: "MagicBento" });

// ORIGINAL WIDGETS
[
  WidgetCalendar,
  WidgetRevenue,
  WidgetAnalytics,
  WidgetTaskStatus,
  WidgetTimeline,
  WidgetPendingTasks,
  WidgetActiveProjects,
  WidgetNewCustomers
].forEach((C) => PLASMIC.registerComponent(C, { name: C.name }));

// INTERACTIVE WIDGETS
[
  WidgetKanbanBoard,
  WidgetMeetingsActivities,
  WidgetRecentLeads,
  WidgetProjectManagement,
  WidgetTaskList,
  WidgetNotifications
].forEach((C) => PLASMIC.registerComponent(C, { name: C.name }));
EOF

echo "✔ Plasmic loader written to components/plasmic-init.js"
echo "Run: npm run dev"
