import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Bell, 
  Menu, 
  Search,
  Shield
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-secondary-700 bg-secondary-900 px-4">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          <div className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-64 rounded-full bg-secondary-800 pl-10 text-sm"
              />
            </div>
          </div>
          
          {/* Mobile search toggle */}
          <div className="md:hidden ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </div>
        
        {/* Mobile logo */}
        <div className="flex md:hidden items-center">
          <Shield className="h-7 w-7 text-primary mr-2" />
          <span className="font-semibold">SecuritySentinel</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start py-2">
                  <div className="font-medium">New vulnerability detected</div>
                  <div className="text-xs text-muted-foreground">
                    Critical vulnerability found in IoT device
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    10 minutes ago
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start py-2">
                  <div className="font-medium">Scan completed</div>
                  <div className="text-xs text-muted-foreground">
                    Network scan completed with 3 devices found
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    2 hours ago
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start py-2">
                  <div className="font-medium">New threat intelligence</div>
                  <div className="text-xs text-muted-foreground">
                    New solar-specific vulnerability CVE-2025-1234
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Yesterday
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="default" size="sm" className="hidden md:inline-flex">
            <Search className="h-4 w-4 mr-2" />
            Quick Scan
          </Button>
        </div>
      </div>
      
      {/* Mobile search bar */}
      {showMobileSearch && (
        <div className="md:hidden py-2 px-4 border-t border-secondary-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-secondary-800 pl-10 text-sm"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}