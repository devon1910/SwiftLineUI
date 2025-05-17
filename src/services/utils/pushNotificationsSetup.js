import { subscribe } from "../api/swiftlineService";

const VAPID_PUBLIC_KEY =  import.meta.env.VITE_PUBLIC_VAPID_KEY

export async function subscribeToPush() {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const permission = await Notification.requestPermission();

  if (permission !== 'granted') return;

  await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  }).then((response) => {
    subscribe(response).then((response) => {
        console.log(response);
      }).catch((error) => {
        console.error('Error subscribing to push notifications:', error);
      });
  }).catch((error) => {
    console.error('Error during service worker registration:', error);
  });

  
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}