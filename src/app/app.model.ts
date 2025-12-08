export interface AppUser {
    id: string;
    uid: string;
    email: string | null;
    name: string | null;
    pic: string | null;
    role: string;
    laScore?: number;
    emailVerified?: boolean;
}
