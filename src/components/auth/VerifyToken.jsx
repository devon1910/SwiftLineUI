import React, { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader, LoaderCircle } from "lucide-react";
import { validateToken } from "../../services/api/swiftlineService";
const VerifyTokenPage = () => {
  const navigator = useNavigate();
  const alreadyCalledRef = useRef(false);
  const from = location.state?.from || "/";

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
          localStorage.setItem("user", JSON.stringify(token));
          localStorage.setItem("userEmail", response.data.data.email);
          localStorage.setItem("userName", response.data.data.userName);
          localStorage.setItem("userId", response.data.data.userId);
          if(from)
            {
              window.location.href=from
            }
            else{
              navigator(from, {
                state: {
                  userId: response.data.data.userId,
                  email: response.data.data.email,
                  isInLine: response.data.data.isInLine,
                  userName: response.data.data.userName,
                },
              });
            }
          
        })
        .catch((error) => {
          toast.error(error.response.data.data.message);
          navigator("/auth");
        });
    } else {
      toast.error("Couldn't extract token.");
    }
  }, [navigator]);
  // Optionally render something else if not loading; otherwise, null is fine.
  return (
    <div class="flex items-center justify-center p-40">
      <LoaderCircle className="animate-spin h-15 w-15 color-sage-500 align-center" />
    </div>
  );
};

export default VerifyTokenPage;
