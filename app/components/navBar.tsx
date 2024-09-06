import { FaHome, FaPlus, FaUser } from "react-icons/fa";
import { ReactNode } from "react";
import { useNavigate, useLocation } from "@remix-run/react";

export function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <div className="fixed bottom-0 left-0 w-full h-16 flex flex-row bg-gray-900 text-white shadow-lg sm:top-0 sm:left-0 sm:h-screen sm:w-16 sm:flex-col">
      <NavBarIcon
        icon={<FaHome size="28" />}
        onClick={() => navigate("/home")}
        isActive={currentPath === "/home"}
      />
      <NavBarIcon
        icon={<FaPlus size="28" />}
        onClick={() => navigate("/newRating")}
        isActive={currentPath === "/newRating"}
      />
      <NavBarIcon
        icon={<FaUser size="28" />}
        onClick={() => navigate("/profile")}
        isActive={currentPath === "/profile"}
      />
    </div>
  );
}

type NavBarIconProps = {
  icon: ReactNode;
  onClick?: () => void;
  isActive?: boolean;
};

const NavBarIcon = ({ icon, onClick, isActive }: NavBarIconProps) => (
  <div
    className={`sidebar-icon ${isActive ? "text-white" : "text-gray-400"}`}
    onClick={onClick}
  >
    {icon}
  </div>
);
