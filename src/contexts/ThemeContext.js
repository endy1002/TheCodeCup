import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const lightTheme = {
  // Background colors
  background: '#f8f8f8',
  surface: '#ffffff',
  card: '#ffffff',
  
  // Text colors
  text: '#333333',
  textSecondary: '#666666',
  textMuted: '#999999',
  
  // Primary colors
  primary: '#6B4E3D',
  primaryLight: '#8B6F56',
  primaryDark: '#4A3428',
  
  // Accent colors
  accent: '#2E8B57',
  accentLight: '#4CAF50',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#FF4444',
  
  // Border and shadow
  border: '#e0e0e0',
  shadow: '#000000',
  
  // Free drink theme
  freeBackground: '#E8F5E8',
  freeBorder: '#4CAF50',
  freeText: '#2E7D32',
  
  // Button colors
  buttonBackground: '#8B4513',
  buttonText: '#ffffff',
  
  // Input colors
  inputBackground: '#f5f5f5',
  inputBorder: '#ddd',
  
  // Status bar
  statusBarStyle: 'dark-content',
};

export const darkTheme = {
  // Background colors
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2D2D2D',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textMuted: '#808080',
  
  // Primary colors
  primary: '#8B6F56',
  primaryLight: '#A68B73',
  primaryDark: '#6B4E3D',
  
  // Accent colors
  accent: '#4CAF50',
  accentLight: '#66BB6A',
  success: '#4CAF50',
  warning: '#FFB74D',
  error: '#EF5350',
  
  // Border and shadow
  border: '#404040',
  shadow: '#000000',
  
  // Free drink theme
  freeBackground: '#1B4332',
  freeBorder: '#4CAF50',
  freeText: '#66BB6A',
  
  // Button colors
  buttonBackground: '#8B6F56',
  buttonText: '#ffffff',
  
  // Input colors
  inputBackground: '#2D2D2D',
  inputBorder: '#404040',
  
  // Status bar
  statusBarStyle: 'light-content',
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const theme = isDarkMode ? darkTheme : lightTheme;

  // Load theme preference from storage
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@CodeCup:theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      // Failed to load theme preference silently
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('@CodeCup:theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      // Failed to save theme preference silently
    }
  };

  const value = {
    theme,
    isDarkMode,
    toggleTheme,
    isLoading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
