// Enhanced storage diagnostics and recovery utilities
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export class StorageDiagnostics {
  static async runDiagnostics() {
    const results = {
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
      tests: {},
      recommendations: []
    };

    // Test 1: Basic AsyncStorage availability
    try {
      const testKey = '@Diagnostics:basic_test';
      const testValue = 'diagnostic_test_' + Date.now();
      
      await AsyncStorage.setItem(testKey, testValue);
      const retrieved = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);
      
      results.tests.basicTest = {
        passed: retrieved === testValue,
        error: null
      };
    } catch (error) {
      results.tests.basicTest = {
        passed: false,
        error: error.message
      };
    }

    // Test 2: Large data storage (test for storage limits)
    try {
      const largeData = 'x'.repeat(1024 * 100); // 100KB string
      const testKey = '@Diagnostics:large_test';
      
      await AsyncStorage.setItem(testKey, largeData);
      const retrieved = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);
      
      results.tests.largeDataTest = {
        passed: retrieved === largeData,
        size: largeData.length,
        error: null
      };
    } catch (error) {
      results.tests.largeDataTest = {
        passed: false,
        error: error.message
      };
    }

    // Test 3: Multiple concurrent operations
    try {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        const key = `@Diagnostics:concurrent_${i}`;
        const value = `test_value_${i}`;
        promises.push(AsyncStorage.setItem(key, value));
      }
      
      await Promise.all(promises);
      
      const retrievePromises = [];
      for (let i = 0; i < 5; i++) {
        retrievePromises.push(AsyncStorage.getItem(`@Diagnostics:concurrent_${i}`));
      }
      
      const values = await Promise.all(retrievePromises);
      const allCorrect = values.every((val, i) => val === `test_value_${i}`);
      
      // Cleanup
      const cleanupKeys = Array.from({length: 5}, (_, i) => `@Diagnostics:concurrent_${i}`);
      await AsyncStorage.multiRemove(cleanupKeys);
      
      results.tests.concurrentTest = {
        passed: allCorrect,
        error: null
      };
    } catch (error) {
      results.tests.concurrentTest = {
        passed: false,
        error: error.message
      };
    }

    // Generate recommendations
    if (!results.tests.basicTest.passed) {
      results.recommendations.push({
        type: 'critical',
        message: 'AsyncStorage is not functional. App will use memory storage fallback.',
        action: 'Check device storage permissions and available space.'
      });
    }

    if (!results.tests.largeDataTest.passed) {
      results.recommendations.push({
        type: 'warning',
        message: 'Large data storage may be limited.',
        action: 'Consider data compression or chunking for large datasets.'
      });
    }

    if (!results.tests.concurrentTest.passed) {
      results.recommendations.push({
        type: 'warning',
        message: 'Concurrent storage operations may be unreliable.',
        action: 'Implement operation queuing for better reliability.'
      });
    }

    if (Platform.OS === 'ios' && __DEV__) {
      results.recommendations.push({
        type: 'info',
        message: 'Running on iOS simulator in development mode.',
        action: 'Test on real device for accurate storage behavior.'
      });
    }

    return results;
  }

  static async clearDiagnosticData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const diagnosticKeys = keys.filter(key => key.startsWith('@Diagnostics:'));
      if (diagnosticKeys.length > 0) {
        await AsyncStorage.multiRemove(diagnosticKeys);
      }
      return true;
    } catch (error) {
      console.error('Failed to clear diagnostic data:', error);
      return false;
    }
  }

  static formatDiagnosticsReport(results) {
    let report = `Storage Diagnostics Report\n`;
    report += `Platform: ${results.platform}\n`;
    report += `Timestamp: ${results.timestamp}\n\n`;
    
    report += `Test Results:\n`;
    Object.entries(results.tests).forEach(([testName, result]) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      report += `- ${testName}: ${status}\n`;
      if (result.error) {
        report += `  Error: ${result.error}\n`;
      }
    });
    
    if (results.recommendations.length > 0) {
      report += `\nRecommendations:\n`;
      results.recommendations.forEach((rec, index) => {
        const icon = rec.type === 'critical' ? '🚨' : rec.type === 'warning' ? '⚠️' : 'ℹ️';
        report += `${index + 1}. ${icon} ${rec.message}\n`;
        report += `   Action: ${rec.action}\n`;
      });
    }
    
    return report;
  }
}

export default StorageDiagnostics;
