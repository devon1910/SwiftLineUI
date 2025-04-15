import { toast } from "react-toastify";
// Helper function to create stylized toasts
export const showToast = {
    success: (message) => {
      toast.success( '🍃 ' + message,{
        icon: false,
        className: 'custom-toast-success',
      });
    },
    error: (message) => {
      toast.error('❌ ' +message, {
        icon: false,
        className: 'custom-toast-error',

      });
    }
};
