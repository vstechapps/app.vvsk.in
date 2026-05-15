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
    MOBILE = "MOBILE", DESKTOP = "DESKTOP", UNKNOWN = "UNKNOWN"
}


export enum AppMode {
    STANDALONE = "STANDALONE", BROWSER = "BROWSER", UNKNOWN = "UNKNOWN"
}

export interface Device {
    type: DeviceType;
    mode: AppMode;
    online: boolean;
}

export const DEFAULT_DEVICE: Device = { online: false, type: DeviceType.UNKNOWN, mode: AppMode.UNKNOWN };

