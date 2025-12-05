export interface NotificationModel {
    id?: string;              // Firestore doc id
    title: string;            // reminder title
    repeat: 'Daily' | 'Weekly' | 'Monthly';
    day: 'Everyday' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
    time: string;             // "HH:mm" 24-hour format
    createdAt?: any;          // Firestore timestamp (optional)
}
