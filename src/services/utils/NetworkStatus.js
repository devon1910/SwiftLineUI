import { useEffect } from "react";
import { showToast } from "./ToastHelper";

export const useNetworkStatus = () => {
  useEffect(() => {
    const handleOffline = () => showToast.error("You are offline. Check your connection.");
    const handleOnline = () => showToast.success("You're back online!");

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);
};