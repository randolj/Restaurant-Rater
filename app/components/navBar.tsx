import { FaHome, FaPlus, FaUser } from "react-icons/fa";
import { ReactNode } from "react";
import { useNavigate } from "@remix-run/react";

export function NavBar() {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 h-screen w-16 m-0 flex flex-col bg-gray-900 text-white shadow-lg">
      <NavBarIcon
        icon={<FaHome size="28" />}
        onClick={() => navigate("/home")}
      />
      <NavBarIcon
        icon={<FaPlus size="28" />}
        onClick={() => navigate("/newRating")}
      />
      <NavBarIcon
        icon={<FaUser size="28" />}
        onClick={() => navigate("/profile")}
      />
    </div>
  );
}

type NavBarIconProps = {
  icon: ReactNode;
  onClick?: () => void;
};

const NavBarIcon = ({ icon, onClick }: NavBarIconProps) => (
  <div className="sidebar-icon" onClick={onClick}>
    {icon}
  </div>
);
