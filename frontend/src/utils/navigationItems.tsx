import React from "react";
import {
  FileTextIcon,
  CalendarIcon,
  MessagesSquareIcon,
  FolderIcon,
  CreditCardIcon,
  UserIcon,
  ClockIcon,
  BriefcaseIcon,
  ScaleIcon,
  FileIcon,
  BarChart3Icon,
  SearchIcon,
  PhoneIcon,
  HelpCircleIcon,
  Settings2Icon,
  NewspaperIcon,
  AlertCircleIcon,
} from "lucide-react";
export interface NavItem {
  label: string;
  path: string;
  icon: JSX.Element;
  type?: "divider" | "section";
  sectionName?: string;
}
export const clientNavItems: NavItem[] = [
  // Case Management
  {
    type: "section",
    sectionName: "Case Management",
  } as NavItem,
  {
    label: "Report New Case",
    path: "/client/report",
    icon: <AlertCircleIcon className="h-5 w-5" />,
  },
  {
    label: "Find a Lawyer",
    path: "/client/find-lawyer",
    icon: <SearchIcon className="h-5 w-5" />,
  },
  {
    label: "My Active Cases",
    path: "/client/cases",
    icon: <BriefcaseIcon className="h-5 w-5" />,
  },
  {
    type: "divider",
  } as NavItem,
  // Communications
  {
    type: "section",
    sectionName: "Communications",
  } as NavItem,
  {
    label: "Consultations",
    path: "/client/schedule",
    icon: <PhoneIcon className="h-5 w-5" />,
  },
  {
    label: "Messages",
    path: "/client/messages",
    icon: <MessagesSquareIcon className="h-5 w-5" />,
  },
  {
    type: "divider",
  } as NavItem,
  // Resources
  {
    type: "section",
    sectionName: "Resources",
  } as NavItem,
  {
    label: "Documents",
    path: "/client/documents",
    icon: <FileTextIcon className="h-5 w-5" />,
  },

  {
    label: "Settings",
    path: "/client/settings",
    icon: <Settings2Icon className="h-5 w-5" />,
  },
];
export const lawyerNavItems: NavItem[] = [
  // Case Management
  {
    type: "section",
    sectionName: "Cases",
  } as NavItem,

  {
    label: "My Assigned Cases",
    path: "/lawyer/assigned",
    icon: <BriefcaseIcon className="h-5 w-5" />,
  },
  {
    label: "Available Cases",
    path: "/lawyer/available",
    icon: <SearchIcon className="h-5 w-5" />,
  },
  {
    label: "Case Archive",
    path: "/lawyer/archive",
    icon: <FolderIcon className="h-5 w-5" />,
  },
  {
    type: "divider",
  } as NavItem,
  // Schedule
  {
    type: "section",
    sectionName: "Schedule",
  } as NavItem,
  {
    label: "Calendar",
    path: "/lawyer/calendar",
    icon: <CalendarIcon className="h-5 w-5" />,
  },
  {
    label: "Court Dates",
    path: "/lawyer/court-dates",
    icon: <ScaleIcon className="h-5 w-5" />,
  },
  {
    type: "divider",
  } as NavItem,
  // Client Management
  {
    type: "section",
    sectionName: "Clients",
  } as NavItem,
  {
    label: "Client Directory",
    path: "/lawyer/clients",
    icon: <UserIcon className="h-5 w-5" />,
  },
  {
    label: "Messages",
    path: "/lawyer/communications",
    icon: <MessagesSquareIcon className="h-5 w-5" />,
  },
  {
    type: "divider",
  } as NavItem,
  // Documents
  {
    type: "section",
    sectionName: "Documents",
  } as NavItem,
  {
    label: "Case Documents",
    path: "/lawyer/documents",
    icon: <FileTextIcon className="h-5 w-5" />,
  },
];
