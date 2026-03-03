import { UserPrefs } from "../types/user";
import { account, appwriteClient } from "./appwriteClient";
import { clearAppwriteSession, saveAppwriteSession } from "./sessionStorage";

export async function signUpWithEmail(userData: any) {
  // Extract base credentials and group the rest into 'prefs'
  const { name, email, password, ...prefs } = userData;

  // 1. Create the base account
  await account.create("unique()", email, password, name);

  // 2. Sign in immediately to establish a session (required to update prefs)
  const user = await signInWithEmail({ email, password });

  // 3. Save all the extra form data to the user's preferences
  await updateUserPreferences({
    ...user.prefs,
    ...prefs,
    isOnboarded: true // Automatically mark them as onboarded
  });

  return await getCurrentUser();
}

export async function signInWithEmail({ email, password }: any) {
  const session = await account.createEmailPasswordSession(email, password);
  appwriteClient.setSession(session.$id);
  await saveAppwriteSession(session.$id);
  return account.get<UserPrefs>();
}

// ... rest of the file stays the same

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
