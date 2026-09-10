import { HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { getStoredAccessToken } from "./authStorage";
import { useLoading } from "./useLoader";

const signalRBaseUrl = `${String(import.meta.env.VITE_API_SIGNALR_URL ?? "").replace(/\/+$/, "")}/`;

export const connection = new HubConnectionBuilder()
  .withUrl(`${signalRBaseUrl}queueHub`, {
    accessTokenFactory: () => getStoredAccessToken() ?? "",
  })
  .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
  .configureLogging(LogLevel.Warning)
  .build();

let connectionPromise = null;
let connectedToken = null;

const waitForStableState = async (timeoutMs = 15000) => {
  const startedAt = Date.now();
  while (
    connection.state === HubConnectionState.Connecting ||
    connection.state === HubConnectionState.Reconnecting ||
    connection.state === HubConnectionState.Disconnecting
  ) {
    if (Date.now() - startedAt >= timeoutMs) {
      throw new Error(`SignalR connection did not stabilize from ${connection.state}.`);
    }
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }
};

const connectWithCurrentToken = async () => {
  const currentToken = getStoredAccessToken() ?? "";
  await waitForStableState();

  if (connection.state === HubConnectionState.Connected && connectedToken === currentToken) return connection;
  if (connection.state === HubConnectionState.Connected) {
    await connection.stop();
  }
  await waitForStableState();

  if (connection.state === HubConnectionState.Disconnected) {
    await connection.start();
    connectedToken = currentToken;
  }

  return connection;
};

export const ensureSignalRConnected = async () => {
  if (!connectionPromise) {
    connectionPromise = connectWithCurrentToken().finally(() => {
      connectionPromise = null;
    });
  }

  await connectionPromise;

  if (connectedToken !== (getStoredAccessToken() ?? "")) {
    return ensureSignalRConnected();
  }

  return connection;
};

connection.onreconnecting(() => { connectedToken = null; });
connection.onreconnected(() => { connectedToken = getStoredAccessToken() ?? ""; });
connection.onclose(() => { connectedToken = null; });

ensureSignalRConnected().catch((error) => {
  console.warn("SignalR connection is unavailable; realtime updates will retry.", error);
});

export const useSignalRWithLoading = () => {
  const { startOperation, endOperation } = useLoading();
  const invokeWithLoading = async (hubConnection, methodName, ...args) => {
    startOperation();
    try {
      await ensureSignalRConnected();
      return await hubConnection.invoke(methodName, ...args);
    } finally {
      endOperation();
    }
  };
  return { invokeWithLoading };
};
