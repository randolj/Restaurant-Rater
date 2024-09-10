import { FaHome, FaPlus, FaUser } from "react-icons/fa";
import { ReactNode } from "react";
import { useNavigate, useLocation } from "@remix-run/react";

export function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <div className="fixed top-0 left-0 h-screen w-32 m-0 flex flex-col bg-secondary text-white shadow-lg">
      <div className="mt-2">
        <NavBarIcon
          label={"Home"}
          icon={<FaHome size="28" />}
          onClick={() => navigate("/home")}
          isActive={currentPath === "/home"}
        />
        <NavBarIcon
          label={"Create"}
          icon={<FaPlus size="28" />}
          onClick={() => navigate("/newRating")}
          isActive={currentPath === "/newRating"}
        />
        <NavBarIcon
          label={"Profile"}
          icon={<FaUser size="28" />}
          onClick={() => navigate("/profile")}
          isActive={currentPath === "/profile"}
        />
      </div>
    </div>
  );
}

type NavBarIconProps = {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  isActive?: boolean;
};

const NavBarIcon = ({ label, icon, onClick, isActive }: NavBarIconProps) => (
  <div
    className={`sidebar-icon ${isActive ? "text-white" : "text-gray-400"}`}
    onClick={onClick}
  >
    {icon}
    <span className="ml-2 text-lg">{label}</span>
  </div>
);
