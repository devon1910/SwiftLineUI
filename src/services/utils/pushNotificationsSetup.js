import { subscribe } from "../api/swiftlineService";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_PUBLIC_VAPID_KEY;

export async function subscribeToPush() {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const permission = await Notification.requestPermission();

  if (permission !== "granted") return;
  const key = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

  //check if sub is already registered
  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) {
    return;
  }
  await registration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: key,
    })
    .then((response) => {
      const registrationResponse = JSON.stringify(response);
      subscribe(registrationResponse)
        .then(() => {})
        .catch((error) => {
          console.error("Error subscribing to push notifications:", error);
        });
    })
    .catch((error) => {
      console.error("Error during service worker registration:", error);
    });
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}
