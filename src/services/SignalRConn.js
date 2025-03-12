import { HubConnectionBuilder } from "@microsoft/signalr";

const apiUrl =  import.meta.env.VITE_API_SIGNALR_URL

//"https://swiftline-cvbsdhauepbcambe.canadacentral-01.azurewebsites.net/queueHub"
export const connection = new HubConnectionBuilder()
  .withUrl(apiUrl+"queueHub")
  
  .build();
    connection
    .start()
    .then(() => console.log("Connected to SignalR hub"))
    .catch((err) => console.error("Error connecting to hub:", err));
