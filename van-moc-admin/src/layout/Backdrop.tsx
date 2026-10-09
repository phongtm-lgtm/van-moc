import { useSidebar } from "../context/SidebarContext";

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <button
      type="button"
      aria-label="Đóng điều hướng"
      className="admin-sidebar-backdrop"
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;
