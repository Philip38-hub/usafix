/**
 * Enhanced user storage that provides cross-browser persistence
 * even in development mode using localStorage as a backup
 */

import { DATABASE_TYPE, USE_ENHANCED_LOCAL_STORAGE } from '@/config';

export interface StoredUserData {
  userType: 'client' | 'provider';
  fullName: string;
  email?: string;
  updatedAt: string;
}

/**
 * Store user data with enhanced persistence
 */
export const storeUserData = (civicAuthId: string, userData: StoredUserData) => {
  if (USE_ENHANCED_LOCAL_STORAGE) {
    // Store in localStorage for cross-browser access in development
    localStorage.setItem(`civic_user_${civicAuthId}`, JSON.stringify(userData));
    
    // Also store a global registry of all users for development
    const userRegistry = getUserRegistry();
    userRegistry[civicAuthId] = {
      ...userData,
      lastSeen: new Date().toISOString()
    };
    localStorage.setItem('civic_user_registry', JSON.stringify(userRegistry));
  }
};

/**
 * Retrieve user data with fallback mechanisms
 */
export const retrieveUserData = (civicAuthId: string): StoredUserData | null => {
  if (USE_ENHANCED_LOCAL_STORAGE) {
    // Try direct lookup first
    const directData = localStorage.getItem(`civic_user_${civicAuthId}`);
    if (directData) {
      try {
        return JSON.parse(directData);
      } catch (error) {
        console.warn('Failed to parse stored user data:', error);
      }
    }
    
    // Try registry lookup as fallback
    const userRegistry = getUserRegistry();
    if (userRegistry[civicAuthId]) {
      return {
        userType: userRegistry[civicAuthId].userType,
        fullName: userRegistry[civicAuthId].fullName,
        email: userRegistry[civicAuthId].email,
        updatedAt: userRegistry[civicAuthId].updatedAt
      };
    }
  }
  
  return null;
};

/**
 * Get the user registry (development helper)
 */
const getUserRegistry = (): Record<string, StoredUserData & { lastSeen: string }> => {
  try {
    const registry = localStorage.getItem('civic_user_registry');
    return registry ? JSON.parse(registry) : {};
  } catch (error) {
    console.warn('Failed to parse user registry:', error);
    return {};
  }
};

/**
 * Clear user data
 */
export const clearUserData = (civicAuthId: string) => {
  localStorage.removeItem(`civic_user_${civicAuthId}`);
  
  if (USE_ENHANCED_LOCAL_STORAGE) {
    const userRegistry = getUserRegistry();
    delete userRegistry[civicAuthId];
    localStorage.setItem('civic_user_registry', JSON.stringify(userRegistry));
  }
};

/**
 * Development helper: List all stored users
 */
export const listStoredUsers = (): Array<{ civicAuthId: string; userData: StoredUserData & { lastSeen: string } }> => {
  if (!USE_ENHANCED_LOCAL_STORAGE) return [];
  
  const userRegistry = getUserRegistry();
  return Object.entries(userRegistry).map(([civicAuthId, userData]) => ({
    civicAuthId,
    userData
  }));
};

/**
 * Development helper: Clear all user data
 */
export const clearAllUserData = () => {
  const keys = Object.keys(localStorage).filter(key => key.startsWith('civic_user_'));
  keys.forEach(key => localStorage.removeItem(key));
  localStorage.removeItem('civic_user_registry');
};
