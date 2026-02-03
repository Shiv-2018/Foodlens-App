import { Account, Client, Databases } from "react-native-appwrite";

const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const platform = process.env.EXPO_PUBLIC_APPWRITE_PLATFORM;

if (!endpoint || !projectId || !platform) {
    console.warn(
        "[Appwrite] Missing configuration. Ensure EXPO_PUBLIC_APPWRITE_ENDPOINT, EXPO_PUBLIC_APPWRITE_PROJECT_ID, and EXPO_PUBLIC_APPWRITE_PLATFORM are set."
    );
}

const client = new Client();

if (endpoint) {
    client.setEndpoint(endpoint);
}
if (projectId) {
    client.setProject(projectId);
}
if (platform) {
    client.setPlatform(platform);
}

export const appwriteClient = client;
export const account = new Account(client);
export const databases = new Databases(client);