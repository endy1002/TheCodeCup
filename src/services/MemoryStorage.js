// Simple in-memory storage fallback for development
class MemoryStorage {
  constructor() {
    this.storage = new Map();
  }

  async setItem(key, value) {
    try {
      this.storage.set(key, value);
      return true;
    } catch (error) {
      console.error('MemoryStorage setItem failed:', error);
      return false;
    }
  }

  async getItem(key) {
    try {
      return this.storage.get(key) || null;
    } catch (error) {
      console.error('MemoryStorage getItem failed:', error);
      return null;
    }
  }

  async removeItem(key) {
    try {
      this.storage.delete(key);
      return true;
    } catch (error) {
      console.error('MemoryStorage removeItem failed:', error);
      return false;
    }
  }

  async multiRemove(keys) {
    try {
      keys.forEach(key => this.storage.delete(key));
      return true;
    } catch (error) {
      console.error('MemoryStorage multiRemove failed:', error);
      return false;
    }
  }

  async clear() {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error('MemoryStorage clear failed:', error);
      return false;
    }
  }
}

export default MemoryStorage;
