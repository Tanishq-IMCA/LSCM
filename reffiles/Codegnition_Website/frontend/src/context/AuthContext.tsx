"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  name: string;
  email: string;
  address: {
    line1: string;
    city: string;

    postalCode: string;
    country: string;
  };
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (email?: string, password?: string) => boolean;
  signup: (payload: { name: string; email: string; password: string }) => { ok: boolean; message?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type StoredAccount = {
  name: string;
  email: string;
  password: string;
  address: User["address"];
};

const DEFAULT_ACCOUNT: StoredAccount = {
  name: "T. Anis",
  email: "tanis@example.com",
  password: "demo1234",
  address: {
    line1: "123 Futuristic Way",
    city: "Neo-Cyberia",
    postalCode: "90210",
    country: "Digital Realm",
  },
};

const STORAGE_KEYS = {
  accounts: "codegnition_accounts",
  session: "codegnition_session",
};

function toUser(account: StoredAccount): User {
  return {
    name: account.name,
    email: account.email,
    address: account.address,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawAccounts = localStorage.getItem(STORAGE_KEYS.accounts);
    if (!rawAccounts) {
      localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify([DEFAULT_ACCOUNT]));
    }

    const sessionEmail = localStorage.getItem(STORAGE_KEYS.session);
    if (!sessionEmail) return;

    const accounts: StoredAccount[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.accounts) || "[]"
    );
    const matchedAccount = accounts.find((account) => account.email === sessionEmail);
    if (matchedAccount) {
      setUser(toUser(matchedAccount));
    }
  }, []);

  const login = (email?: string, password?: string) => {
    if (typeof window === "undefined") return false;

    const accounts: StoredAccount[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.accounts) || "[]"
    );

    if (!email || !password) {
      setUser(toUser(DEFAULT_ACCOUNT));
      localStorage.setItem(STORAGE_KEYS.session, DEFAULT_ACCOUNT.email);
      return true;
    }

    const matchedAccount = accounts.find(
      (account) =>
        account.email.toLowerCase() === email.toLowerCase() && account.password === password
    );

    if (!matchedAccount) {
      return false;
    }

    setUser(toUser(matchedAccount));
    localStorage.setItem(STORAGE_KEYS.session, matchedAccount.email);
    return true;
  };

  const signup = ({ name, email, password }: { name: string; email: string; password: string }) => {
    if (typeof window === "undefined") {
      return { ok: false, message: "Sign up is unavailable right now." };
    }

    const accounts: StoredAccount[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.accounts) || "[]"
    );
    const exists = accounts.some(
      (account) => account.email.toLowerCase() === email.toLowerCase()
    );

    if (exists) {
      return { ok: false, message: "An account with that email already exists." };
    }

    const newAccount: StoredAccount = {
      name,
      email,
      password,
      address: {
        line1: "Address pending",
        city: "City pending",
        postalCode: "000000",
        country: "Country pending",
      },
    };

    localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify([...accounts, newAccount]));
    localStorage.setItem(STORAGE_KEYS.session, newAccount.email);
    setUser(toUser(newAccount));
    return { ok: true };
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.session);
    }
    setUser(null);
  };

  const isLoggedIn = !!user;

  const value = {
    isLoggedIn,
    user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
