import React, { useEffect, useState } from "react";
import { validateToken } from "../services/swiftlineService";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
const VerifyTokenPage = () => {
  const navigator = useNavigate();
  const [isLoading, setLoading] = useState(true);
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
          navigator("/LandingPage", {
            state: {
              userId: response.data.data.userId,
              email: response.data.data.email,
              isInLine: response.data.data.isInLine,
            },
          });
        })
        .catch((error) => {
          console.error("Verification error:", error);
          // Check for error response structure and fallback to error.message
          const errMsg =
            error.response && error.response.data && error.response.data.message
              ? error.response.data.message
              : error.message;
          toast.error(errMsg);
          // Optionally redirect to login on failure
          navigator("/login");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      alert("Couldn't extract token.");
      setLoading(false);
    }
  }, [navigator]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LoadingSpinner message="Loading..." />
      </motion.div>
    );
  }

  // Optionally render something else if not loading; otherwise, null is fine.
  return null;
};

export default VerifyTokenPage;
