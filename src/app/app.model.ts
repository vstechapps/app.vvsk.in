export interface AppUser {
    id: string;
    uid: string;
    email: string | null;
    name: string | null;
    pic: string | null;
    role: string;
    laScore?: number;
    emailVerified?: boolean;
    gender?: string | null;
    dateOfBirth?: string | null;
    phoneNumber?: string | null;
}

export enum DeviceType {
    MOBILE, DESKTOP, UNKNOWN
}


export enum AppMode {
    STANDALONE, BROWSER, UNKNOWN
}

export interface Device {
    type: DeviceType;
    mode: AppMode;
    online: boolean;
}

export const DEFAULT_DEVICE: Device = { online: false, type: DeviceType.UNKNOWN, mode: AppMode.UNKNOWN };

