import { account, appwriteClient } from "./appwriteClient";
import { saveAppwriteSession, clearAppwriteSession } from "./sessionStorage";
// Import the new types
import { UserPrefs, UserWithPrefs } from "../types/user";

export async function signUpWithEmail({ name, email, password }: any) {
    await account.create('unique()', email, password, name);
    return signInWithEmail({ email, password });
}

export async function signInWithEmail({ email, password }: any) {
    const session = await account.createEmailPasswordSession(email, password);
    appwriteClient.setSession(session.$id);
    await saveAppwriteSession(session.$id);
    return account.get<UserPrefs>();
}

export async function signOut() {
    try {
        await account.deleteSession('current');
    } finally {
        await clearAppwriteSession();
    }
}

// Update return type to use UserPrefs
export async function getCurrentUser() {
    return await account.get<UserPrefs>();
}

// Update return type to use UserPrefs
export async function restoreSessionUser() {
    try {
        return await account.get<UserPrefs>();
    } catch {
        return null;
    }
}

// NEW FUNCTION: Update User Preferences in Appwrite
export async function updateUserPreferences(prefs: UserPrefs) {
    return await account.updatePrefs(prefs);
}