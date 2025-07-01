import React from 'react';

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id:string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    liveLink?: string;
    repoLink?: string;
}

export type SectionKey = 'summary' | 'experience' | 'projects' | 'education' | 'skills';

export interface ResumeData {
  versionId: string;
  createdAt: string;
  userId: string;
  username: string;
  templateId: string;
  isPublished: boolean;
  personalInfo: {
    name: string;
    title: string;
    phone: string;
    email: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
  skills: string[];
  sectionOrder: SectionKey[];
}

export interface UserResumeProfile {
    active: ResumeData;
    history: ResumeData[];
}

export interface Template {
  id: string;
  name: string;
  thumbnailUrl: string;
  component: React.FC<{ data: ResumeData }>;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  signup: (email: string, username: string) => Promise<void>;
  logout: () => void;
  updateResume: (resumeData: ResumeData) => Promise<void>;
  getActiveResume: () => ResumeData | null;
  getResumeHistory: () => ResumeData[];
  restoreFromHistory: (versionId: string) => Promise<void>;
  deleteFromHistory: (versionId: string) => Promise<void>;
}