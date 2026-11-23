export interface NavigationItem {
  title: string;
  description: string;
  href: string;
  icon: string;
}

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    description: "Business command center",
    href: "/",
    icon: "🏠",
  },
  {
    title: "AI Tasks",
    description: "Submit requests and view your results",
    href: "/ai-tasks",
    icon: "✦",
  },
  {
    title: "Print HQ",
    description: "Orders and production",
    href: "/print-hq",
    icon: "🖨️",
  },
  {
    title: "Catalog",
    description: "Products, pricing, images, and print files",
    href: "/products",
    icon: "📦",
  },
  {
    title: "Customer Requests",
    description: "Quotes and custom requests",
    href: "/customer-requests",
    icon: "📨",
  },
  {
    title: "Customers",
    description: "Profiles and order history",
    href: "/customers",
    icon: "👥",
  },
  {
    title: "Inventory",
    description: "Filament and supplies",
    href: "/inventory",
    icon: "🧵",
  },
  {
    title: "Files",
    description: "Images and print assets",
    href: "/files",
    icon: "📁",
  },
  {
    title: "Analytics",
    description: "Revenue and performance",
    href: "/analytics",
    icon: "📊",
  },
  {
    title: "Finances",
    description: "Income, costs, and profit",
    href: "/finances",
    icon: "💰",
  },
  {
    title: "Settings",
    description: "Workspace configuration",
    href: "/settings",
    icon: "⚙️",
  },
];
