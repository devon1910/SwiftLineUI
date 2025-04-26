
import axios from "axios";
import { useLoading } from "../utils/useLoader";
import { HubConnectionBuilder, HubConnectionState,  LogLevel } from "@microsoft/signalr";
import API from "./APIService";

const apiUrl = import.meta.env.VITE_API_SIGNALR_URL;
export const connection = new HubConnectionBuilder()
  .withUrl(apiUrl + "queueHub")
  .configureLogging(
    import.meta.env.MODE === "development"
      ? LogLevel.Information
      : LogLevel.Warning
  )
  .withAutomaticReconnect()
  .build();

  export async function ensureConnection() {
    switch (connection.state) {
      case HubConnectionState.Disconnected:
        await connection.start();
        console.log("SignalR connected");
        break;
      case HubConnectionState.Connecting:
        // wait until either connected or closed
        await new Promise((resolve, reject) => {
          const handleReconnect = () => {
            connection.offreconnected(handleReconnect);
            resolve(null);
          };
          const handleClose = (err) => {
            connection.offclose(handleClose);
            reject(err);
          };
          connection.onreconnected(handleReconnect);
          connection.onclose(handleClose);
        });
        break;
      // if Connected or Reconnecting, proceed
      default:
        break;
    }
  }
export const useSignalRWithLoading = () => {
  const { startOperation, endOperation } = useLoading();

  const invokeWithLoading = async (connection, methodName, ...args) => {
    startOperation();
    try {
      // Auto-reconnect if idle disconnected
      if (connection.state ===  HubConnectionState.Disconnected) {
        await connection.start();
      }

      return await connection.invoke(methodName, ...args);
    } finally {
      endOperation();
    }
  };

  return { invokeWithLoading };
};



// {
//   accessTokenFactory: () => {
//     const token = localStorage.getItem("user");
//     return token ? JSON.parse(token) : null;
//   },
// }
// export const startSignalRConnection = async (navigate) => {
  //   try {
  //     await connection.start();
  //     console.log("✅ Connected to SignalR hub");
  //   } catch (err) {
  //     console.log("❌ SignalR start failed:", err?.message || err);
  
  //     if (connection.state === HubConnectionState.Connecting || connection.state === HubConnectionState.Reconnecting || connection.state === HubConnectionState.Connected) {
  //       return
  //     }
  //     if (connection.state=== HubConnectionState.Disconnected || connection.state === HubConnectionState.Disconnecting) {
  //       const refreshToken = JSON.parse(localStorage.getItem("refreshToken"));
  //       const accessToken = JSON.parse(localStorage.getItem("user"));
  
  //       if (!refreshToken || !accessToken) {
  //         return redirectToLogin(navigate);
  //       }
  
  //       try {
  //         const { data } = await axios.post(`${apiUrl}api/v1/Auth/RefreshToken`, {
  //           accessToken,
  //           refreshToken,
  //         });
  
  //         localStorage.setItem("user", JSON.stringify(data.data.accessToken));
  //         localStorage.setItem("refreshToken", JSON.stringify(data.data.refreshToken));
  //         connection.accessTokenFactory = () => {
  //           const token = localStorage.getItem("user");
  //           return token ? JSON.parse(token) : null;
  //         }
  //         //update global headers
  //         API.defaults.headers.common['Authorization'] = `Bearer ${data.data.accessToken}`;
  //         // Retry connection with new token
  //         await connection.start();

  //         console.log("✅ Reconnected to SignalR after refresh");
  //       } catch (refreshError) {
  //         console.log("❌ Token refresh failed:", refreshError);
  //         redirectToLogin(navigate);
  //       }
  //     }
  //   }
  // };
  
  // const redirectToLogin = (navigate) => {
  //   localStorage.clear();
  //   localStorage.setItem("from", location.href)
  //   navigate("/auth");
  // };
  