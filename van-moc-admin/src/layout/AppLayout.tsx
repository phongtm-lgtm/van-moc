import { SidebarProvider } from "@/context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";

const LayoutContent: React.FC = () => {
  return (
    <div className="admin-shell">
      <AppSidebar />
      <Backdrop />

      <div className="admin-workspace">
        <AppHeader />
        <main className="admin-main" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
