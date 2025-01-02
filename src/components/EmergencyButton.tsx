import React from "react";
import { Phone } from "lucide-react";

const EmergencyButton: React.FC = () => {
  const handleEmergencyClick = () => {
    // In a real app, this would trigger the emergency flow
    window.location.href = "tel:108"; // Indian emergency number
  };

  return (
    <button
      onClick={handleEmergencyClick}
      className="fixed top-4 right-4 bg-red-500 text-white p-2 rounded-full 
                 shadow-lg hover:bg-red-600 transition-colors duration-200"
      aria-label="Emergency Contact"
    >
      <Phone className="w-6 h-6" />
    </button>
  );
};

export default EmergencyButton;