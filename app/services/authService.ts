import { UserPrefs } from "../types/user";
import { account, appwriteClient } from "./appwriteClient";
import { clearAppwriteSession, saveAppwriteSession } from "./sessionStorage";

export async function signUpWithEmail({ name, email, password }: any) {
  await account.create("unique()", email, password, name);
  return signInWithEmail({ email, password });
}

export async function signInWithEmail({ email, password }: any) {
  const session = await account.createEmailPasswordSession(email, password);
  appwriteClient.setSession(session.$id);
  await saveAppwriteSession(session.$id);
  return account.get<UserPrefs>();
}

/**
 * CLEAN LOGOUT LOGIC
 * Just handles the server and local cleanup.
 */
export async function signOut() {
  try {
    // 1. Delete session from Appwrite server
    await account.deleteSession("current");
  } catch (error) {
    console.warn("Session already cleared on server", error);
  } finally {
    // 2. Always clear local session storage
    await clearAppwriteSession();
  }
}

export async function getCurrentUser() {
  return await account.get<UserPrefs>();
}

export async function restoreSessionUser() {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

export async function updateUserPreferences(prefs: UserPrefs) {
  return await account.updatePrefs(prefs);
}
