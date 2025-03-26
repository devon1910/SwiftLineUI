import { HubConnectionBuilder } from "@microsoft/signalr";
import { useContext } from "react";
import { LoadingContext } from "./LoadingContext";
import { useLoading } from "./useLoader";

const apiUrl = import.meta.env.VITE_API_SIGNALR_URL;

export const connection = new HubConnectionBuilder()
  .withUrl(apiUrl + "queueHub")
  .build();
  
connection
  .start()
  .then(() => console.log("Connected to SignalR hub"))
  .catch((err) => console.error("Error connecting to hub:", err));

export const useSignalRWithLoading = () => {
  const { startOperation, endOperation } = useLoading();

  const invokeWithLoading = async (connection, methodName, ...args) => {
    startOperation();
    try {
      return await connection.invoke(methodName, ...args);
    } finally {
      endOperation();
    }
  };

  return { invokeWithLoading };
};
