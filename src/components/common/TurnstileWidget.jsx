import React from "react";
import Turnstile, { useTurnstile } from "react-turnstile";
import { VerifyTurnstileToken } from "../../services/api/swiftlineService";
import { showToast } from "../../services/utils/ToastHelper";

const TurnstileWidget = ({ setIsTurnstileVerified }) => {
  const turnstile = useTurnstile();
  const turnstile_siteKey =  import.meta.env.VITE_TURNSTILE_SITE_KEY
  return (
    <Turnstile
      sitekey={turnstile_siteKey} 
      theme="auto"
      refreshExpired="auto"
      onError={(error) => {
        showToast.error("Turnstile verification failed. Please try again.");
        turnstile.reset();
      }}
      onVerify={(turnstileToken) => {
        VerifyTurnstileToken({ turnstileToken }).then((response) => {
          if (!response.data.data.success) {
            showToast.error("Turnstile verification failed. Please try again.");
            turnstile.reset();
          }else{
            setIsTurnstileVerified(true);
          }   
        });
      }}
    />
  );
};

export default TurnstileWidget;
