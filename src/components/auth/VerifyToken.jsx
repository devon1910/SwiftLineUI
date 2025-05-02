import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../services/utils/ToastHelper";
import { LoaderCircle } from "lucide-react";
import { validateToken } from "../../services/api/swiftlineService";
import { saveAuthTokens, handleAuthSuccess } from "../../services/utils/authUtils";

const VerifyTokenPage = () => {
  const navigate = useNavigate();
  const alreadyCalledRef = useRef(false);
  const from = location.state?.from || "/";

  const getTokenFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("token");
  };

  useEffect(() => {
    if (alreadyCalledRef.current) return;
    alreadyCalledRef.current = true;

    const token = getTokenFromUrl();
    if (!token) {
      showToast.error("Couldn't extract token.");
      navigate("/auth");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await validateToken(token);
        saveAuthTokens(response);
        handleAuthSuccess(response, navigate, from);
      } catch (error) {
        showToast.error(error.response?.data?.data?.message || "Token validation failed");
        navigate("/auth");
      }
    };

    verifyToken();
  }, [navigate, from]);

  return (
    <div className="flex items-center justify-center p-40">
      <LoaderCircle className="animate-spin h-15 w-15 color-sage-500 align-center" />
    </div>
  );
};

export default VerifyTokenPage;
