import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  User,
  UserRole,
  AuthCredentials,
  SignupFormData,
  NetworkState,
  LanguageCode,
} from '../types/auth';
import { TRANSLATIONS, TranslationDictionary } from '../utils/translations';

// 3 Core Clinical Demo Profiles (with healthcare-worker mapped to hospital for backward compatibility)
export const DEMO_USERS: Record<UserRole, User> = {
  hospital: {
    id: 'usr-hsp-004',
    name: 'Shirur Health Center & Hospital',
    email: 'hospital@retinafusion.ai',
    mobile: '+91 98220 99001',
    role: 'hospital',
    verificationStatus: 'verified',
    createdAt: '2023-05-10T11:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&auto=format&fit=crop&q=80',
    hospitalDetails: {
      hospitalName: 'Shirur Community Health Center',
      area: 'Shirur Rural Sector',
      healthCenterName: 'Shirur Primary Health Sub-Centre',
      officialEmail: 'hospital@retinafusion.ai',
      verificationDetails: 'Ayushman Bharat NCD Center Reg: MH-PHC-2024-8841',
      organizationName: 'Shirur Rural Health Center & Hospital',
      organizationType: 'Community Health Centre',
      registrationId: 'MH-PHC-2024-8841',
      contactPerson: 'Ananya Deshmukh (Lead Health Officer)',
      phone: '+91 98220 99001',
      address: 'Main Road, Shirur Rural Block',
      district: 'Pune District',
      state: 'Maharashtra',
      verificationDocumentName: 'Govt_Health_Accreditation_Certificate.pdf',
    },
  },
  doctor: {
    id: 'usr-doc-003',
    name: 'Dr. Arvind Natarajan',
    email: 'doctor@retinafusion.ai',
    mobile: '+91 98450 77889',
    role: 'doctor',
    verificationStatus: 'verified',
    createdAt: '2023-08-20T14:40:00Z',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    doctorDetails: {
      fullName: 'Dr. Arvind Natarajan',
      registrationNumber: 'MCI-2012-08492',
      qualification: 'MBBS, MS (Ophthalmology), DNB, FVR',
      specialization: 'Vitreo-Retinal Specialist & Tele-Ophthalmologist',
      hospital: 'District Hospital Pune & e-Sanjeevani Tele-Consultant',
      hospitalClinic: 'District Hospital Pune & e-Sanjeevani Tele-Consultant',
      city: 'Pune',
      district: 'Pune District',
      cityDistrict: 'Pune District',
      yearsOfExperience: 14,
      verificationDocumentName: 'MCI_State_Registration_Natarajan.pdf',
    },
  },
  patient: {
    id: 'usr-pat-001',
    name: 'Ramesh Patel',
    email: 'patient@retinafusion.ai',
    mobile: '+91 98231 45678',
    role: 'patient',
    verificationStatus: 'verified',
    createdAt: '2024-02-14T09:30:00Z',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    patientDetails: {
      age: 52,
      gender: 'Male',
      village: 'Example Village',
      talukaBlock: 'Shirur Block',
      district: 'Pune District',
      state: 'Maharashtra',
      pinCode: '412210',
      bloodGroup: 'B+',
      diabetesStatus: 'Yes',
      diabetesDuration: '5 Years',
      emergencyContactName: 'Suman Patel',
      emergencyContactNumber: '+91 98231 99887',
      languagePreference: 'en',
      previousEyeExam: '14 Months Ago',
      knownEyeCondition: 'Occasional evening blurriness',
      abhaId: '91-4820-8192-3841',
    },
  },
  'healthcare-worker': {
    id: 'usr-hsp-004',
    name: 'Shirur Health Center & Hospital',
    email: 'hospital@retinafusion.ai',
    mobile: '+91 98220 99001',
    role: 'hospital',
    verificationStatus: 'verified',
    createdAt: '2023-05-10T11:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&auto=format&fit=crop&q=80',
    hospitalDetails: {
      hospitalName: 'Shirur Community Health Center',
      area: 'Shirur Rural Sector',
      healthCenterName: 'Shirur Primary Health Sub-Centre',
      officialEmail: 'hospital@retinafusion.ai',
      verificationDetails: 'Ayushman Bharat NCD Center Reg: MH-PHC-2024-8841',
      organizationName: 'Shirur Rural Health Center & Hospital',
      organizationType: 'Community Health Centre',
      registrationId: 'MH-PHC-2024-8841',
      contactPerson: 'Ananya Deshmukh (Lead Health Officer)',
      phone: '+91 98220 99001',
      address: 'Main Road, Shirur Rural Block',
      district: 'Pune District',
      state: 'Maharashtra',
      verificationDocumentName: 'Govt_Health_Accreditation_Certificate.pdf',
    },
  },
};

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  networkStatus: NetworkState;
  language: LanguageCode;
  t: TranslationDictionary;
  login: (credentials: AuthCredentials) => Promise<User>;
  loginAsDemo: (role: UserRole) => Promise<User>;
  signup: (data: SignupFormData) => Promise<User>;
  resetPassword: (identifier: string, newPassword: string) => Promise<boolean>;
  logout: () => void;
  setLanguage: (lang: LanguageCode) => void;
  toggleNetworkStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'retina_fusion_user_session';
const REGISTERED_USERS_KEY = 'retina_fusion_registered_users';
const LANG_STORAGE_KEY = 'retina_fusion_language';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [networkStatus, setNetworkStatus] = useState<NetworkState>('online');
  const [language, setLanguageState] = useState<LanguageCode>('en');

  // Load language preference
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANG_STORAGE_KEY) as LanguageCode | null;
      if (savedLang && (savedLang === 'en' || savedLang === 'gu' || savedLang === 'hi')) {
        setLanguageState(savedLang);
        document.documentElement.lang = savedLang;
      } else {
        document.documentElement.lang = 'en';
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      document.documentElement.lang = lang;
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Initialize session from storage on page load / reload (preserves login across refresh)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.role) {
          setUser(parsed);
        }
      }
    } catch (err) {
      console.warn('Error reading saved session', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save or clear user session in memory during active session
  const saveSession = useCallback((newUser: User | null) => {
    setUser(newUser);
    try {
      if (newUser) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      } else {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Standard Login with strict credential verification & smart role auto-detection
  const login = useCallback(
    async (credentials: AuthCredentials): Promise<User> => {
      // Small simulated latency for medical security feel
      await new Promise((r) => setTimeout(r, 650));

      const rawInput = credentials.identifier || credentials.email || '';
      const cleanId = rawInput.trim().toLowerCase();
      const cleanDigits = rawInput.replace(/\D/g, '');

      if (!cleanId && !cleanDigits) {
        throw new Error('Please enter your email or registered 10-digit mobile number.');
      }

      if (!credentials.password) {
        throw new Error('Please enter your account password.');
      }

      // 1. Check registered users in storage
      let registeredUsers: User[] = [];
      try {
        const regRaw = localStorage.getItem(REGISTERED_USERS_KEY);
        if (regRaw) {
          registeredUsers = JSON.parse(regRaw);
        }
      } catch (err) {
        console.warn('Error reading registered users', err);
      }

      const foundReg = registeredUsers.find((u) => {
        const emailMatch = u.email && u.email.toLowerCase() === cleanId;
        const uDigits = (u.mobile || '').replace(/\D/g, '');
        const phoneMatch =
          cleanDigits.length >= 10 &&
          uDigits.length >= 10 &&
          (uDigits === cleanDigits || uDigits.slice(-10) === cleanDigits.slice(-10));
        return emailMatch || phoneMatch;
      });

      if (foundReg) {
        // Verify password
        if (foundReg.password && foundReg.password !== credentials.password) {
          throw new Error('Incorrect password. Please enter the valid password for this account.');
        }

        saveSession(foundReg);
        return foundReg;
      }

      // 2. Check against Demo Clinical Accounts
      const demoList = Object.values(DEMO_USERS);
      const foundDemo = demoList.find((u) => {
        const emailMatch = u.email.toLowerCase() === cleanId;
        const uDigits = u.mobile.replace(/\D/g, '');
        const phoneMatch =
          cleanDigits.length >= 10 &&
          uDigits.length >= 10 &&
          (uDigits === cleanDigits || uDigits.slice(-10) === cleanDigits.slice(-10));
        return emailMatch || phoneMatch;
      });

      if (foundDemo) {
        // Check if user set a custom password for demo account
        const updatedReg = registeredUsers.find((u) => u.email.toLowerCase() === foundDemo.email.toLowerCase());
        if (updatedReg && updatedReg.password && updatedReg.password !== credentials.password) {
          throw new Error('Incorrect password. Please enter the valid password for this account.');
        }

        saveSession(foundDemo);
        return foundDemo;
      }

      // 3. If no account matches, DO NOT allow login! Throw explicit error.
      throw new Error(
        'No account found with this email or mobile number. Please check your details or create a new account by clicking "Create Account".'
      );
    },
    [saveSession]
  );

  // Fast 1-Click Demo Login
  const loginAsDemo = useCallback(
    async (targetRole: UserRole): Promise<User> => {
      await new Promise((r) => setTimeout(r, 450));
      const demo = DEMO_USERS[targetRole];
      saveSession(demo);
      return demo;
    },
    [saveSession]
  );

  // Multi-step Registration
  const signup = useCallback(
    async (data: SignupFormData): Promise<User> => {
      await new Promise((r) => setTimeout(r, 800));

      const isVerified = data.role === 'patient'; // Only patients start pre-verified; doctors/workers require verification
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: data.name.trim(),
        email: data.email.trim(),
        mobile: data.mobile.trim(),
        password: data.password, // Persist password for login verification
        role: data.role,
        verificationStatus: isVerified ? 'verified' : 'pending',
        createdAt: new Date().toISOString(),
        patientDetails: data.patientDetails,
        workerDetails: data.workerDetails,
        doctorDetails: data.doctorDetails,
        hospitalDetails: data.hospitalDetails,
      };

      // Save to registered users array
      try {
        const regRaw = localStorage.getItem(REGISTERED_USERS_KEY);
        const registeredUsers: User[] = regRaw ? JSON.parse(regRaw) : [];
        // Prevent duplicate emails or replace previous entry
        const existingIdx = registeredUsers.findIndex(
          (u) => u.email.toLowerCase() === newUser.email.toLowerCase()
        );
        if (existingIdx >= 0) {
          registeredUsers[existingIdx] = newUser;
        } else {
          registeredUsers.push(newUser);
        }
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
      } catch (err) {
        console.warn('Error storing registered user', err);
      }

      saveSession(newUser);
      return newUser;
    },
    [saveSession]
  );

  // Password Recovery & Reset
  const resetPassword = useCallback(
    async (identifier: string, newPassword: string): Promise<boolean> => {
      await new Promise((r) => setTimeout(r, 600));
      const cleanId = identifier.trim().toLowerCase();
      const cleanDigits = identifier.replace(/\D/g, '');

      if (!cleanId && !cleanDigits) {
        throw new Error('Please enter an email address or mobile number.');
      }
      if (!newPassword || newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long.');
      }

      // 1. Check existing registered users
      try {
        const regRaw = localStorage.getItem(REGISTERED_USERS_KEY);
        const registeredUsers: User[] = regRaw ? JSON.parse(regRaw) : [];
        const userIdx = registeredUsers.findIndex((u) => {
          const emailMatch = u.email && u.email.toLowerCase() === cleanId;
          const uDigits = (u.mobile || '').replace(/\D/g, '');
          const phoneMatch =
            cleanDigits.length >= 10 &&
            uDigits.length >= 10 &&
            (uDigits === cleanDigits || uDigits.slice(-10) === cleanDigits.slice(-10));
          return emailMatch || phoneMatch;
        });

        if (userIdx >= 0) {
          registeredUsers[userIdx].password = newPassword;
          localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
          return true;
        }
      } catch (err) {
        console.warn('Error updating registered user password', err);
      }

      // 2. Check demo users and create override entry in registered users
      const demoList = Object.values(DEMO_USERS);
      const foundDemo = demoList.find((u) => {
        const emailMatch = u.email.toLowerCase() === cleanId;
        const uDigits = u.mobile.replace(/\D/g, '');
        const phoneMatch =
          cleanDigits.length >= 10 &&
          uDigits.length >= 10 &&
          (uDigits === cleanDigits || uDigits.slice(-10) === cleanDigits.slice(-10));
        return emailMatch || phoneMatch;
      });

      if (foundDemo) {
        try {
          const regRaw = localStorage.getItem(REGISTERED_USERS_KEY);
          const registeredUsers: User[] = regRaw ? JSON.parse(regRaw) : [];
          const updatedDemoUser: User = {
            ...foundDemo,
            password: newPassword,
          };
          const existingIdx = registeredUsers.findIndex(
            (u) => u.email.toLowerCase() === updatedDemoUser.email.toLowerCase()
          );
          if (existingIdx >= 0) {
            registeredUsers[existingIdx] = updatedDemoUser;
          } else {
            registeredUsers.push(updatedDemoUser);
          }
          localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
          return true;
        } catch (err) {
          console.warn('Error saving updated demo user password', err);
        }
      }

      // 3. Fallback: register new recovered user profile
      try {
        const regRaw = localStorage.getItem(REGISTERED_USERS_KEY);
        const registeredUsers: User[] = regRaw ? JSON.parse(regRaw) : [];
        const isEmail = cleanId.includes('@');
        const newUser: User = {
          id: `usr-${Date.now()}`,
          name: isEmail ? cleanId.split('@')[0] : 'Recovered User',
          email: isEmail ? cleanId : `${cleanDigits}@patient.retinafusion.ai`,
          mobile: cleanDigits.length >= 10 ? `+91 ${cleanDigits.slice(-10)}` : '+91 98231 45678',
          role: 'patient',
          password: newPassword,
          verificationStatus: 'verified',
          createdAt: new Date().toISOString(),
        };
        registeredUsers.push(newUser);
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
        return true;
      } catch (err) {
        console.warn('Error creating recovered user', err);
      }

      return true;
    },
    []
  );

  // Logout
  const logout = useCallback(() => {
    saveSession(null);
  }, [saveSession]);

  // Toggle Network State (Prototype Offline/Online demonstration)
  const toggleNetworkStatus = useCallback(() => {
    setNetworkStatus((prev) => (prev === 'online' ? 'offline' : 'online'));
  }, []);

  const t = useMemo(() => TRANSLATIONS[language] || TRANSLATIONS.en, [language]);

  const value = useMemo(
    () => ({
      user,
      role: user?.role || null,
      isAuthenticated: !!user,
      isLoading,
      networkStatus,
      language,
      t,
      login,
      loginAsDemo,
      signup,
      resetPassword,
      logout,
      setLanguage,
      toggleNetworkStatus,
    }),
    [
      user,
      isLoading,
      networkStatus,
      language,
      t,
      login,
      loginAsDemo,
      signup,
      resetPassword,
      logout,
      setLanguage,
      toggleNetworkStatus,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
