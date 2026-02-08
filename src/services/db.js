// Database Service using Native IndexedDB (The "SQLite of the Browser")
const DB_NAME = 'HeroOS_DB';
const DB_VERSION = 2; // Incremented for schema updates

class DatabaseService {
    constructor() {
        this.db = null;
        this.initPromise = this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error("Database error:", event.target.error);
                reject('Database failed to open');
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log("Database opened successfully");
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const txn = event.target.transaction;

                // Create Users Object Store
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
                    userStore.createIndex('username', 'username', { unique: true });

                    // Add default admin
                    const defaultAdmin = {
                        username: 'admin',
                        password: 'password',
                        role: 'admin',
                        name: 'System Administrator',
                        email: 'admin@heroos.com',
                        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
                        storagePath: '/storage/admin',
                        settings: {
                            theme: 'dark',
                            wallpaper: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop",
                            volume: 80,
                            wifi: true,
                            brightness: 100
                        }
                    };
                    userStore.add(defaultAdmin);
                }

                // Create Files Object Store
                let fileStore;
                if (!db.objectStoreNames.contains('files')) {
                    fileStore = db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
                    fileStore.createIndex('ownerId', 'ownerId', { unique: false });
                } else {
                    fileStore = txn.objectStore('files');
                }

                // V2 Updates: Add Path Index for file system structure
                if (!fileStore.indexNames.contains('path')) {
                    fileStore.createIndex('path', 'path', { unique: false });
                }
                // Composite index to ensure a user cannot have duplicate paths
                if (!fileStore.indexNames.contains('user_path')) {
                    fileStore.createIndex('user_path', ['ownerId', 'path'], { unique: false });
                }
            };
        });
    }

    // --- User Operations ---

    async getAllUsers() {
        await this.initPromise;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getUser(username) {
        await this.initPromise;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const index = store.index('username');
            const request = index.get(username);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async createUser(userData) {
        await this.initPromise;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');

            // Default settings for new user
            const newUser = {
                ...userData,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
                storagePath: `/storage/${userData.username}`, // dedicated storage path
                settings: {
                    theme: 'dark',
                    wallpaper: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop",
                    volume: 60,
                    wifi: true,
                    brightness: 100
                }
            };

            const request = store.add(newUser);
            request.onsuccess = () => resolve({ ...newUser, id: request.result });
            request.onerror = () => reject('Username likely exists');
        });
    }

    async updateUser(userId, updates) {
        await this.initPromise;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            const getReq = store.get(userId);

            getReq.onsuccess = () => {
                const user = getReq.result;
                if (!user) {
                    reject('User not found');
                    return;
                }

                const updatedUser = { ...user, ...updates };
                const putReq = store.put(updatedUser);

                putReq.onsuccess = () => resolve(updatedUser);
                putReq.onerror = () => reject(putReq.error);
            };
        });
    }

    async deleteUser(userId) {
        await this.initPromise;
        // Transaction to delete user AND their files
        const transaction = this.db.transaction(['users', 'files'], 'readwrite');

        return new Promise((resolve, reject) => {
            const userStore = transaction.objectStore('users');
            const fileStore = transaction.objectStore('files');
            const fileIndex = fileStore.index('ownerId');

            // 1. Delete User
            userStore.delete(userId);

            // 2. Delete User's Files
            const fileRequest = fileIndex.getAllKeys(userId);
            fileRequest.onsuccess = () => {
                const fileIds = fileRequest.result;
                fileIds.forEach(fid => fileStore.delete(fid));
            };

            transaction.oncomplete = () => resolve(true);
            transaction.onerror = () => reject(transaction.error);
        });
    }

    // --- File Operations ---

    async getUserFiles(userId) {
        if (!userId) return [];
        await this.initPromise;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');
            const index = store.index('ownerId');
            const request = index.getAll(userId);

            request.onsuccess = () => {
                // Return files, ensuring consistent path structure
                const files = request.result.map(f => ({
                    ...f,
                    // Fallback for migrated data: ensure path exists
                    path: f.path || `/storage/${userId}/${f.name}`
                }));
                resolve(files);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async saveFile(file) {
        await this.initPromise;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');

            // Security Check: Ensure file has ownerId
            if (!file.ownerId) {
                reject("Security Error: File must have an owner");
                return;
            }

            const request = store.put(file);

            request.onsuccess = () => resolve(file);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteFile(fileId) {
        await this.initPromise;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');
            const request = store.delete(fileId);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    // --- Session Management ---

    setSession(user) {
        localStorage.setItem('heroos_session_id', user.username);
    }

    clearSession() {
        localStorage.removeItem('heroos_session_id');
    }

    async getSessionUser() {
        const username = localStorage.getItem('heroos_session_id');
        if (!username) return null;
        return await this.getUser(username);
    }
}

export const dbService = new DatabaseService();
