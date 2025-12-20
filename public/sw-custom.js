importScripts('./ngsw-worker.js');

const DB_NAME = 'PwaStore';
const STORE_NAME = 'notifications';

// Open IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Save notifications to IndexedDB
async function saveNotifications(notifications) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Clear old ones
    await new Promise((resolve, reject) => {
        const req = store.clear();
        req.onsuccess = resolve;
        req.onerror = reject;
    });

    // Add new ones
    for (const n of notifications) {
        if (!n.id) n.id = Math.random().toString(36).substr(2, 9);
        store.add(n);
    }

    return new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

// Get all notifications from IndexedDB
async function getNotifications() {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = reject;
    });
}

// Logic to check if a notification is within the next hour
function isUpcoming(n, now) {
    if (!n.time) return false;

    const [hours, minutes] = n.time.split(':').map(Number);
    const target = new Date(now);
    target.setHours(hours, minutes, 0, 0);

    // If repeat is Daily/Everyday, just check time
    // If target time has already passed today, it might be for tomorrow, 
    // but the user said "within next 1 hour", so we only care about upcoming in this hour.

    const diffMs = target.getTime() - now.getTime();
    const oneHourMs = 60 * 60 * 1000;

    // Check if within next 1 hour (0 to 60 mins)
    if (diffMs > 0 && diffMs <= oneHourMs) {
        // Now check day logic
        if (n.day === 'Everyday' || n.repeat === 'Daily') return true;

        const daysMap = {
            'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
            'Thursday': 4, 'Friday': 5, 'Saturday': 6
        };
        const currentDay = now.getDay();
        if (daysMap[n.day] === currentDay) return true;
    }

    return false;
}

async function checkAndNotify() {
    const now = new Date();
    const notifications = await getNotifications();

    for (const n of notifications) {
        if (isUpcoming(n, now)) {
            self.registration.showNotification('Lifestyle Reminder', {
                body: `${n.title} at ${n.time}`,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-192x192.png',
                vibrate: [200, 100, 200],
                data: { url: '/notifications' }
            });
        }
    }
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SYNC_NOTIFICATIONS') {
        event.waitUntil(saveNotifications(event.data.notifications));
    }
});

// Periodic Sync registration
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'notification-check') {
        event.waitUntil(checkAndNotify());
    }
});

// Fallback: Check on push or other events if needed
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
