import React, { useEffect, useRef, useState } from "react";
import { validateToken } from "../services/swiftlineService";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
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
          // Optionally store token or response details as needed
          localStorage.setItem("user", JSON.stringify(token));
          localStorage.setItem("userEmail", response.data.data.email);
          localStorage.setItem("userId", response.data.data.userId);
          navigator("/", {
            state: {
              userId: response.data.data.userId,
              email: response.data.data.email,
              isInLine: response.data.data.isInLine,
            },
          });
        })
        .catch((error) => {
          toast.error(error.response.data.data.message);
        })
    } else {
      toast.error("Couldn't extract token.");
    }
  }, [navigator]);
  // Optionally render something else if not loading; otherwise, null is fine.
  return null;
};

export default VerifyTokenPage;
