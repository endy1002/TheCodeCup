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
      return false;
    }
  }

  async getItem(key) {
    try {
      return this.storage.get(key) || null;
    } catch (error) {
      return null;
    }
  }

  async removeItem(key) {
    try {
      this.storage.delete(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  async multiRemove(keys) {
    try {
      keys.forEach(key => this.storage.delete(key));
      return true;
    } catch (error) {
      return false;
    }
  }

  async clear() {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default MemoryStorage;
