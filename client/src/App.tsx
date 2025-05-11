import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Scanner from "@/pages/Scanner";
import ScanDetails from "@/pages/ScanDetails";
import DeviceDetails from "@/pages/DeviceDetails";
import SolarAssessment from "@/pages/SolarAssessment";
import SolarProduction from "@/pages/SolarProduction";
import ThreatIntelligence from "@/pages/ThreatIntelligence";
import Profile from "@/pages/Profile";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useState } from "react";

function Router() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-secondary-900">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className={`flex flex-col flex-1 ${sidebarOpen ? 'md:ml-64 lg:ml-72' : ''}`}>
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/scanner" component={() => <Scanner />} />
            <Route path="/scan/:id">
              {params => <ScanDetails id={params.id} />}
            </Route>
            <Route path="/device/:id">
              {params => <DeviceDetails id={params.id} />}
            </Route>
            <Route path="/solar" component={SolarAssessment} />
            <Route path="/solar/production" component={SolarProduction} />
            <Route path="/threats" component={ThreatIntelligence} />
            <Route path="/profile" component={Profile} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
