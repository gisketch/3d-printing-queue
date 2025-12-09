import PocketBase from 'pocketbase';

// Create and export a singleton PocketBase instance
const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

// Enable auto-refresh of auth token
pb.autoCancellation(false);

export default pb;
