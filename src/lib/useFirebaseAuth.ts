'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, COLLECTIONS, UserProfile, UserPreferences, isFirebaseConfigured } from './firebase';

/**
 * Custom hook for Firebase authentication
 * Provides methods for sign in, sign up, sign out, and auth state
 */
export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create or update user profile in Firestore
   */
  const createUserProfile = useCallback(async (firebaseUser: User): Promise<UserProfile> => {
    if (!isFirebaseConfigured || !db) {
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'User',
        photoURL: firebaseUser.photoURL || undefined,
        role: 'user',
        createdAt: new Date(),
        lastLogin: new Date(),
        wishlist: [],
        cartItems: [],
        orderHistory: [],
        preferences: {
          notifications: true,
          newsletter: false,
          darkMode: false,
          favoriteCategories: [],
        },
      };
    }

    const userDocRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    const baseProfile: UserProfile = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || 'User',
      photoURL: firebaseUser.photoURL || undefined,
      role: 'user',
      createdAt: new Date(),
      lastLogin: new Date(),
      wishlist: [],
      cartItems: [],
      orderHistory: [],
      preferences: {
        notifications: true,
        newsletter: false,
        darkMode: false,
        favoriteCategories: [],
      },
    };

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        ...baseProfile,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
    } else {
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp(),
      });
    }

    return baseProfile;
  }, []);

  /**
   * Fetch user profile from Firestore
   */
  const fetchUserProfile = useCallback(async (uid: string): Promise<UserProfile | null> => {
    if (!isFirebaseConfigured || !db) {
      return null;
    }

    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate() || new Date(),
        } as UserProfile;
      }
      return null;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  }, []);

  /**
   * Sign in with email and password
   */
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      const err = new Error('Firebase is not configured');
      setError(err.message);
      throw err;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchUserProfile(result.user.uid);
      setUserProfile(profile);
      return result.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  /**
   * Sign up with email and password
   */
  const signUpWithEmail = useCallback(async (email: string, password: string, displayName: string) => {
    if (!isFirebaseConfigured || !auth) {
      const err = new Error('Firebase is not configured');
      setError(err.message);
      throw err;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      await createUserProfile(result.user);
      return result.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createUserProfile]);

  /**
   * Sign in with Google
   */
  const signInWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured || !auth) {
      const err = new Error('Firebase is not configured');
      setError(err.message);
      throw err;
    }

    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createUserProfile(result.user);
      const profile = await fetchUserProfile(result.user.uid);
      setUserProfile(profile);
      return result.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createUserProfile, fetchUserProfile]);

  /**
   * Sign out
   */
  const logout = useCallback(async () => {
    if (!isFirebaseConfigured || !auth) {
      setUser(null);
      setUserProfile(null);
      return;
    }

    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Send password reset email
   */
  const resetPassword = useCallback(async (email: string) => {
    if (!isFirebaseConfigured || !auth) {
      const err = new Error('Firebase is not configured');
      setError(err.message);
      throw err;
    }

    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update user profile
   */
  const updateUserProfile = useCallback(async (uid: string, data: Partial<UserProfile>) => {
    if (!isFirebaseConfigured || !db) {
      setUserProfile(prev => (prev ? { ...prev, ...data } : prev));
      return;
    }

    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, uid);
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      const updated = await fetchUserProfile(uid);
      setUserProfile(updated);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [fetchUserProfile]);

  // Listen to auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  return {
    user,
    userProfile,
    loading,
    error,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
  };
};

/**
 * Hook for checking if user is authenticated
 */
export const useAuth = () => {
  const { user, loading } = useFirebaseAuth();
  return { user, loading, isAuthenticated: !!user };
};

/**
 * Hook for checking if user is admin
 */
export const useAdmin = () => {
  const { userProfile, loading } = useFirebaseAuth();
  return {
    isAdmin: userProfile?.role === 'admin' || userProfile?.role === 'moderator',
    loading,
  };
};

/**
 * Example usage of useFirebaseAuth hook
 * 
 * const { 
 *   user, 
 *   userProfile, 
 *   loading, 
 *   error,
 *   signInWithEmail,
 *   signUpWithEmail,
 *   signInWithGoogle,
 *   logout,
 *   resetPassword,
 *   updateUserProfile
 * } = useFirebaseAuth();
 */
