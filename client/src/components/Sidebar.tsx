import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Search, 
  Shield, 
  AlertTriangle, 
  Sun, 
  Zap,
  FileText, 
  Settings, 
  User, 
  LogOut 
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const sidebarItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Search, label: "Scanner", path: "/scanner" },
    { icon: Sun, label: "Solar Assessment", path: "/solar" },
    { icon: Sun, label: "Solar Production", path: "/solar/production" },
    { icon: AlertTriangle, label: "Threat Intelligence", path: "/threats" },
    { icon: FileText, label: "Reports", path: "/reports" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transform border-r border-secondary-700 bg-secondary-900 transition-transform duration-300 ease-in-out",
        isOpen ? "w-64 lg:w-72 translate-x-0" : "w-64 -translate-x-full"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-white">SecuritySentinel</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-1">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link key={index} href={item.path}>
                  <a
                    className={cn(
                      "flex items-center rounded-md px-4 py-3 text-sm transition-colors",
                      isActive(item.path)
                        ? "bg-primary-900/20 text-primary"
                        : "text-gray-400 hover:bg-secondary-800 hover:text-white"
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <span>{item.label}</span>
                    {item.label === "Threat Intelligence" && (
                      <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-semibold">
                        3
                      </span>
                    )}
                  </a>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="border-t border-secondary-700 p-4">
          <button className="flex w-full items-center rounded-md px-4 py-2 text-gray-400 hover:bg-secondary-800 hover:text-white">
            <LogOut className="mr-2 h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}