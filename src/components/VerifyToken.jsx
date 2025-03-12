import React, { useEffect, useState } from "react";
import { validateToken } from "../services/swiftlineService";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const VerifyTokenPage = () => {
  const navigator = useNavigate();
  const [isLoading, setLoading] = useState(true);
  function getTokenFromUrl() {
    // Get the current URL's query parameters
    const urlParams = new URLSearchParams(window.location.search);
    // Extract the token parameter
    const token = urlParams.get("token");
    return token;
  }

  useEffect(() => {
    const token = getTokenFromUrl();
    if (token) {
      validateToken(token)
        .then((response) => {
          setLoading(false);
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
          setLoading(false);
          console.log("error: ", error.message);
          toast.error(error.data.message);
        });
    } else {
      alert("Couldn't extract token.");
    }
  }, []);
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
};

export default VerifyTokenPage;
