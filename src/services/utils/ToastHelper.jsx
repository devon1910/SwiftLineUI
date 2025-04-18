import { Ban, CircleX, FastForward } from "lucide-react";
import { toast } from "react-toastify";
// Helper function to create stylized toasts
export const showToast = {
  success: (message) => {
    toast.success(
      <div className="flex items-center gap-2">
        <FastForward className="w-5 h-5 text-emerald-500" />{" "}
        {/* Ensure proper styling */}
        <span>{message}</span>
      </div>,
      {
        icon: false,
        className: "custom-toast-success",
      }
    );
  },
  error: (message) => {
    toast.error(
      <div className="flex items-center gap-2">
        <CircleX  className="w-auto h-auto text-red" />
        <span>{message}</span>
      </div>,
      {
        icon: false,
        className: "custom-toast-error",
      }
    );
  },
};
