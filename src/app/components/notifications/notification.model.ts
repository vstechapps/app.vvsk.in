export interface NotificationModel {
    id?: string;              // Firestore doc id
    user: string;             // User uid who created the notification
    title: string;            // reminder title
    repeat: 'Daily' | 'Weekly' | 'Monthly';
    day: 'Everyday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    time: string;             // "HH:mm" 24-hour format
    createdAt?: any;          // Firestore timestamp (optional)
}
