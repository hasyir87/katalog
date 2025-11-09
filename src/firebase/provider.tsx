'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'
import { Skeleton } from '@/components/ui/skeleton';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  user: User | null;
  isUserLoading: boolean; 
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    if (!auth) { 
      console.log("FirebaseProvider: Auth service not available.");
      setUser(null);
      setIsUserLoading(false);
      return;
    }
    
    console.log("FirebaseProvider: Subscribing to onAuthStateChanged.");
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => { 
        console.log("FirebaseProvider: onAuthStateChanged triggered.", { hasUser: !!firebaseUser });
        setUser(firebaseUser);
        setIsUserLoading(false);
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUser(null);
        setIsUserLoading(false);
      }
    );
    return () => {
      console.log("FirebaseProvider: Unsubscribing from onAuthStateChanged.");
      unsubscribe();
    }
  }, [auth]); 

  // Memoize the context value
  const contextValue = useMemo((): FirebaseContextState => ({
      firebaseApp,
      firestore,
      auth,
      user,
      isUserLoading,
  }), [firebaseApp, firestore, auth, user, isUserLoading]);

  if (isUserLoading && contextValue.isUserLoading) {
     console.log("FirebaseProvider: Render loading skeleton.");
     return (
      <div className="flex flex-col min-h-screen">
        <header className="flex items-center h-20 px-4 border-b shrink-0 md:px-6 container">
           <div className="mr-6 flex items-center space-x-2">
             <Skeleton className="h-10 w-24" />
           </div>
           <div className="flex-1 items-center space-x-6 text-sm font-medium hidden md:flex">
             <Skeleton className="h-6 w-20" />
             <Skeleton className="h-6 w-28" />
           </div>
          <div className="ml-auto flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </header>
        <main className="flex-1 p-6">
          <Skeleton className="h-[80vh] w-full" />
        </main>
      </div>
    );
  }
  
  console.log("FirebaseProvider: Rendering children.", { isUserLoading: contextValue.isUserLoading, hasUser: !!contextValue.user });
  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};


/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
export const useFirebase = (): FirebaseContextState => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  return context;
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth | null => {
  const { auth } = useFirebase();
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore | null => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp | null => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 */
export const useUser = (): { user: User | null; isUserLoading: boolean } => {
  const { user, isUserLoading } = useFirebase();
  return { user, isUserLoading };
};
