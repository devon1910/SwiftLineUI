import React from "react";
import Turnstile, { useTurnstile } from "react-turnstile";
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
        // The token is verified once, server-side, as part of login/signup.
        setTurnstileToken(turnstileToken);
      }}
    />
  );
};

export default TurnstileWidget;
