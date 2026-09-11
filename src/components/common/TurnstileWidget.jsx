import React from "react";
import Turnstile, { useTurnstile } from "react-turnstile";
import { VerifyTurnstileToken } from "../../services/api/swiftlineService";
import { showToast } from "../../services/utils/ToastHelper";
import { BotCheck_Error_Message } from "../../services/utils/constants";

const TurnstileWidget = ({ setTurnstileToken }) => {
  const turnstile = useTurnstile();
  const turnstile_siteKey =  import.meta.env.VITE_TURNSTILE_SITE_KEY
  return (
    <Turnstile
      sitekey={turnstile_siteKey} 
      theme="auto"
      refreshExpired="auto"
      onError={(error) => {
        showToast.error(BotCheck_Error_Message);
        turnstile.reset();
      }}
      onVerify={(turnstileToken) => {
        VerifyTurnstileToken({ turnstileToken }).then((response) => {
          if (!response.data.data.success) {
            showToast.error(BotCheck_Error_Message);
            turnstile.reset();
          }else{
            // Keep the one-time token so the login/signup endpoint can verify it
            // as part of the same security-sensitive request.
            setTurnstileToken(turnstileToken);
          }   
        });
      }}
    />
  );
};

export default TurnstileWidget;
