import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, ResumeData, AuthContextType, SectionKey, UserResumeProfile } from '../types';
import { v4 as uuidv4 } from 'uuid';

const USERS_KEY = 'resume_fire_users';
const RESUMES_KEY = 'resume_fire_resumes';
const MAX_HISTORY_LENGTH = 3;

const getMockData = <T,>(key: string): Record<string, T> => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const setMockData = <T,>(key: string, data: Record<string, T>) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createNewResume = (userId: string, username: string): ResumeData => ({
  versionId: uuidv4(),
  createdAt: new Date().toISOString(),
  userId,
  username,
  templateId: 'modern',
  isPublished: false,
  personalInfo: {
    name: username,
    title: 'Professional Title',
    phone: '',
    email: '',
    linkedin: '',
    website: '',
  },
  summary: '',
  experience: [],
  education: [],
  projects: [],
  skills: [],
  sectionOrder: ['summary', 'experience', 'projects', 'education', 'skills'],
});

const createNewUserProfile = (userId: string, username: string): UserResumeProfile => ({
    active: createNewResume(userId, username),
    history: [],
});


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('resume_fire_currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem('resume_fire_currentUser');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string): Promise<void> => {
    setLoading(true);
    const users = getMockData<User>(USERS_KEY);
    const existingUser = Object.values(users).find(u => u.email === email);
    
    if (existingUser) {
      setUser(existingUser);
      localStorage.setItem('resume_fire_currentUser', JSON.stringify(existingUser));
    } else {
        setLoading(false);
        throw new Error("User not found. Please sign up.");
    }
    setLoading(false);
  };

  const signup = async (email: string, username: string): Promise<void> => {
    setLoading(true);
    const users = getMockData<User>(USERS_KEY);
    if (Object.values(users).some(u => u.email === email)) {
      setLoading(false);
      throw new Error("Email already exists.");
    }
    if (Object.values(users).some(u => u.username.toLowerCase() === username.toLowerCase())) {
      setLoading(false);
      throw new Error("Username is already taken.");
    }
    
    const newUser: User = { id: uuidv4(), email, username };
    users[newUser.id] = newUser;
    setMockData(USERS_KEY, users);

    const resumes = getMockData<UserResumeProfile>(RESUMES_KEY);
    resumes[newUser.id] = createNewUserProfile(newUser.id, newUser.username);
    setMockData(RESUMES_KEY, resumes);

    setUser(newUser);
    localStorage.setItem('resume_fire_currentUser', JSON.stringify(newUser));
    setLoading(false);
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('resume_fire_currentUser');
  };

  const updateResume = useCallback(async (newResumeData: ResumeData) => {
    if (!user) throw new Error("Not authenticated");
    const resumes = getMockData<UserResumeProfile>(RESUMES_KEY);
    const userProfile = resumes[user.id];
    if (!userProfile) throw new Error("Resume profile not found for user.");

    // The current active resume becomes the latest history item
    const oldActiveResume = userProfile.active;
    
    // Create new active resume with new version ID and timestamp
    const newActiveResume = {
        ...newResumeData,
        versionId: uuidv4(),
        createdAt: new Date().toISOString()
    };
    
    // Prepend old active resume to history and truncate
    const newHistory = [oldActiveResume, ...userProfile.history];
    if (newHistory.length > MAX_HISTORY_LENGTH) {
        newHistory.length = MAX_HISTORY_LENGTH;
    }
    
    resumes[user.id] = { active: newActiveResume, history: newHistory };
    setMockData(RESUMES_KEY, resumes);
  }, [user]);

  const getActiveResume = useCallback((): ResumeData | null => {
    if (!user) return null;
    const resumes = getMockData<UserResumeProfile>(RESUMES_KEY);
    return resumes[user.id]?.active || null;
  }, [user]);

  const getResumeHistory = useCallback((): ResumeData[] => {
    if (!user) return [];
    const resumes = getMockData<UserResumeProfile>(RESUMES_KEY);
    return resumes[user.id]?.history || [];
  }, [user]);

  const restoreFromHistory = useCallback(async (versionId: string) => {
    if (!user) throw new Error("Not authenticated");
    const resumes = getMockData<UserResumeProfile>(RESUMES_KEY);
    const userProfile = resumes[user.id];
    if (!userProfile) throw new Error("Resume profile not found.");

    const historyItemToRestore = userProfile.history.find(h => h.versionId === versionId);
    if (!historyItemToRestore) throw new Error("History version not found.");

    // The current active becomes the newest history item
    const newHistory = [userProfile.active, ...userProfile.history.filter(h => h.versionId !== versionId)];
     if (newHistory.length > MAX_HISTORY_LENGTH) {
        newHistory.length = MAX_HISTORY_LENGTH;
    }
    
    resumes[user.id] = { active: historyItemToRestore, history: newHistory };
    setMockData(RESUMES_KEY, resumes);
  }, [user]);

  const deleteFromHistory = useCallback(async (versionId: string) => {
    if (!user) throw new Error("Not authenticated");
    const resumes = getMockData<UserResumeProfile>(RESUMES_KEY);
    const userProfile = resumes[user.id];
    if (!userProfile) throw new Error("Resume profile not found.");

    userProfile.history = userProfile.history.filter(h => h.versionId !== versionId);
    resumes[user.id] = userProfile;
    setMockData(RESUMES_KEY, resumes);
  }, [user]);


  const value = { user, loading, login, signup, logout, updateResume, getActiveResume, getResumeHistory, restoreFromHistory, deleteFromHistory };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};