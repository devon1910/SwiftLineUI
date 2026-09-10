import React, { useEffect, useRef } from "react";
import { validateToken } from "../services/swiftlineService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LoaderCircle } from "lucide-react";
import { storeAuthTokens } from "../services/authStorage";
const VerifyTokenPage = () => {
  const navigator = useNavigate();
  const alreadyCalledRef = useRef(false);

  function getTokenFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("token");
  }

  useEffect(() => {
    // Prevent duplicate calls by checking the ref
    if (alreadyCalledRef.current) return;
    alreadyCalledRef.current = true;
    const token = getTokenFromUrl();
    if (token) {
      validateToken(token)
        .then((response) => {
          storeAuthTokens(response.data.data.accessToken, response.data.data.refreshToken);
          localStorage.setItem("userEmail", response.data.data.email);
          localStorage.setItem("userName", response.data.data.userName);
          localStorage.setItem("userId", response.data.data.userId);
          navigator("/", {
            state: {
              userId: response.data.data.userId,
              email: response.data.data.email,
              isInLine: response.data.data.isInLine,
              userName: response.data.data.userName,
            },
          });
        })
        .catch((error) => {
          toast.error(error?.response?.data?.message ?? "That verification link is invalid or expired.");
          navigator("/auth");
        });
    } else {
      toast.error("Couldn't extract token.");
    }
  }, [navigator]);
  // Optionally render something else if not loading; otherwise, null is fine.
  return (
    <div className="flex items-center justify-center p-40">
      <LoaderCircle className="animate-spin h-15 w-15 color-sage-500 align-center" />
    </div>
  );
};

export default VerifyTokenPage;
