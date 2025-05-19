import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

// Register service worker with update handling
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Handle when a new service worker is available
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
  onRegistered(registration) {
    if (registration) {
      console.log('Service Worker registered successfully');
      
      // Set up message handling
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Received message from service worker:', event?.data);
        
        if (event.data && event.data.type) {
          switch (event.data.type) {
            case 'PONG':
              console.log('Received PONG from service worker:', event.data.timestamp);
              break;
            case 'MESSAGE_RECEIVED':
              console.log('Service worker confirmed message receipt:', event.data.originalMessage);
              break;
            case 'UPDATE_AVAILABLE':
              console.log('Update available from service worker');
              break;
            default:
              console.log('Unhandled message type:', event.data.type);
          }
        }
      });

      console.log('Service worker message listener added: ', navigator.serviceWorker);

      // Test the service worker connection
      if (navigator.serviceWorker.controller) {
        console.log('Service worker controller is ready');
        // Send a test message
        navigator.serviceWorker.controller.postMessage({
          type: 'PING',
          timestamp: Date.now()
        });
      } else {
        console.log('Waiting for service worker controller...');
        navigator.serviceWorker.ready.then(() => {
          console.log('Service worker is ready');
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'PING',
              timestamp: Date.now()
            });
          }
        });
      }
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
