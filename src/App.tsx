import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import PromoShareCard from './components/PromoShareCard';
import BrainLogo from './components/BrainLogo';
import VipTasks from './components/VipTasks';
import VipReels from './components/VipReels';
import { UserProfile, VipLevel, Reel } from './types';
import { 
  Sparkles, ShieldCheck, Share2, CircleAlert, Globe, X, 
  Check, Copy, MessageSquare, Send, Trophy, Flame, UserCheck, Play, ArrowRight, Lock, Eye, EyeOff, Users, CreditCard, Volume2, Film, PlusCircle, Trash2, Edit2
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, onSnapshot, setDoc, getDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { REELS_DATABASE } from './data';

export default function App() {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedModalLink, setCopiedModalLink] = useState(false);
  const [isVipSelectorOpen, setIsVipSelectorOpen] = useState(false);
  
  // Track if we have synced the active user profile with Firestore in this page session
  const hasSyncedWithFirestore = useRef(false);

  // App URLs & Constants
  const sharedUrl = 'https://ais-pre-efepkfwykzkok6uvpgwtks-582716975968.us-east1.run.app';

  // User profile state persistent in React state (initially unregistered or registered)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('tappmusic_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      username: 'usuario_vip',
      email: '',
      password: '',
      vipLevel: 'VIP PLATA 10$',
      earnings: 25.50,
      completedTaskIds: ['task_1'],
      isRegistered: false // prompts registration card first
    };
  });

  // Master users list for login & referral commission routing
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('tappmusic_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(u => u.username !== 'cristiano_vip' && u.username !== 'fe_y_abundancia' && u.username !== 'mentalidad_oro');
        }
      } catch (e) {}
    }
    return [
      {
        username: 'admin_tapp',
        email: 'admin@tappmusic.com',
        password: '7340',
        vipLevel: 'VIP CORONA IMPERIAL 1000$',
        earnings: 1545.00,
        completedTaskIds: ['task_1', 'task_2'],
        isRegistered: true,
        status: 'active',
        inviteCount: 4,
        inviteCommissionsEarned: 6.00
      }
    ];
  });

  // Persist master users pool & Listen to Firestore in Real-Time
  useEffect(() => {
    localStorage.setItem('tappmusic_users', JSON.stringify(allUsers));
  }, [allUsers]);

  // Real-Time Syncing Loop with Firestore Databases
  useEffect(() => {
    // Background seeder function designed to run unconditionally and make sure collections exist
    const checkAndSeed = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        if (usersSnap.empty) {
          const adminSeed: UserProfile = {
            username: 'admin_tapp',
            email: 'admin@tappmusic.com',
            password: '7340',
            vipLevel: 'VIP CORONA IMPERIAL 1000$',
            earnings: 1545.00,
            completedTaskIds: ['task_1', 'task_2'],
            isRegistered: true,
            status: 'active',
            inviteCount: 4,
            inviteCommissionsEarned: 6.00
          };
          await setDoc(doc(db, 'users', 'admin_tapp'), adminSeed);
        }

        // 4 Users Yesterday Progress Migration V3: Set 367 coins once and track it on each user's document
        if (!usersSnap.empty) {
          const todayDateStr = new Date().toLocaleDateString('es-ES');
          for (const uDoc of usersSnap.docs) {
            const u = uDoc.data() as any;
            if (u.username && u.username.toLowerCase() !== 'admin_tapp' && !u.migratedV3) {
              const migratedUser: any = {
                ...u,
                earnings: 367.0,
                completedTaskIds: [],
                lastResetDate: todayDateStr,
                migratedV3: true
              };
              await setDoc(doc(db, 'users', u.username.toLowerCase().trim()), migratedUser);
              
              // If the current logged-in user matches, update their active profile state
              const savedProfileStr = localStorage.getItem('tappmusic_profile');
              if (savedProfileStr) {
                try {
                  const savedObj = JSON.parse(savedProfileStr) as UserProfile;
                  if (savedObj.username && savedObj.username.toLowerCase() === u.username.toLowerCase()) {
                    setUserProfile(migratedUser);
                    localStorage.setItem('tappmusic_profile', JSON.stringify(migratedUser));
                  }
                } catch (e) {}
              }
            }
          }
        }

        const latestVoices = [
          {
            id: 'jesus',
            key: 'jesus',
            speaker: 'Jesucristo Salvador',
            avatar: '✝️',
            description: 'Voz Sagrada de Redención y Amor',
            intro: 'Hijo mío, recibe mi paz protectora. Anda, contempla esta promesa y compártela: ',
            color: 'border-purple-500/30 text-purple-300 bg-purple-500/5',
            badgeColor: 'bg-purple-950/40 text-purple-300 border-purple-500/30',
            shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]',
            pitch: 1.02,
            rate: 0.82
          },
          {
            id: 'dios',
            key: 'dios',
            speaker: 'Dios Padre Celestial',
            avatar: '🌿',
            description: 'Voz Omnipotente, Calma y Solemne',
            intro: 'Yo soy tu refugio en la tormenta. Escucha con reverencia mi mensaje sagrado para ti: ',
            color: 'border-amber-500/30 text-amber-300 bg-amber-500/5',
            badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-500/30',
            shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
            pitch: 0.84,
            rate: 0.75
          },
          {
            id: 'espiritu_santo',
            key: 'espiritu_santo',
            speaker: 'Espíritu Santo Consolador',
            avatar: '🕊️',
            description: 'Paz Absoluta y Unción Celestial',
            intro: 'Siente mi dulce presencia llenándote de fe y de abundancia celestial. Escucha esta palabra eterna: ',
            color: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/5',
            badgeColor: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30',
            shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
            pitch: 1.08,
            rate: 0.74
          },
          {
            id: 'angel',
            key: 'angel',
            speaker: 'Ángel de la Revelación',
            avatar: '🌟',
            description: 'Mensajero Divino de Nuevas de Fe',
            intro: '¡Gloria a Dios en las alturas! Recibe la maravillosa promesa que tengo revelada para ti hoy: ',
            color: 'border-sky-500/30 text-sky-300 bg-sky-500/5',
            badgeColor: 'bg-sky-950/40 text-sky-300 border-sky-500/30',
            shadow: 'shadow-[0_0_15px_rgba(14,165,233,0.3)]',
            pitch: 1.15,
            rate: 0.85
          },
          {
            id: 'familia',
            key: 'familia',
            speaker: 'La Voz de la Familia',
            avatar: '🏠',
            description: 'Unión, Pureza y Valores Sagrados',
            intro: 'Edifica tu bendito hogar sobre la roca del amor. Este es el consejo protector para tu mesa: ',
            color: 'border-pink-500/30 text-pink-300 bg-pink-500/5',
            badgeColor: 'bg-pink-950/40 text-pink-300 border-pink-500/30',
            shadow: 'shadow-[0_0_15px_rgba(236,72,153,0.3)]',
            pitch: 1.14,
            rate: 0.88
          },
          {
            id: 'mentalidad',
            key: 'mentalidad',
            speaker: 'Mentalidad de Reino',
            avatar: '💎',
            description: 'Éxito, Fuerza y Provisión Divina',
            intro: '¡Declara abundancia en el nombre del Creador! Rompe la escasez y recibe tu prosperidad: ',
            color: 'border-[#39FF14]/30 text-[#39FF14] bg-[#39FF14]/5',
            badgeColor: 'bg-zinc-900 text-[#39FF14] border-[#39FF14]/40',
            shadow: 'shadow-[0_0_15px_rgba(57,255,20,0.3)]',
            pitch: 1.0,
            rate: 0.94
          }
        ];
        for (const v of latestVoices) {
          await setDoc(doc(db, 'voices', v.id), v, { merge: true });
        }

        // Seed Reels if collection is empty
        const reelsSnap = await getDocs(collection(db, 'reels'));
        if (reelsSnap.empty) {
          for (const reel of REELS_DATABASE) {
            await setDoc(doc(db, 'reels', reel.id), reel);
          }
        }
      } catch (err) {
        console.warn("Background database seed warning:", err);
      }
    };

    // Run seeder immediately in an unconditional way
    checkAndSeed();

    // 1. Authenticate anonymously to enable secure database access (non-blocking fallback)
    signInAnonymously(auth).then(() => {
      // Re-run seeder as authenticated in case of security rules constraints
      checkAndSeed();
    }).catch(err => {
      console.warn("Firebase Anonymous Auth warning:", err);
    });

    // 2. Setup real-time listener for registrations collection
    const unsubRegistrations = onSnapshot(collection(db, 'registrations'), (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data());
      });
      // Merge with registrations state to avoid clearing out newer local elements
      setRegistrations(prev => {
        const merged = [...prev];
        items.forEach(item => {
          const index = merged.findIndex(r => r.id === item.id);
          if (index !== -1) {
            merged[index] = item;
          } else {
            merged.push(item);
          }
        });
        return merged;
      });
    }, (error) => {
      console.error("Firestore listening registrations error:", error);
    });

    // 3. Setup real-time listener for withdrawals collection
    const unsubWithdrawals = onSnapshot(collection(db, 'withdrawals'), (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data());
      });
      // Merge with withdrawals history state
      setWithdrawHistory(prev => {
        const merged = [...prev];
        items.forEach(item => {
          const index = merged.findIndex(w => w.id === item.id);
          if (index !== -1) {
            merged[index] = item;
          } else {
            merged.push(item);
          }
        });
        return merged;
      });
    }, (error) => {
      console.error("Firestore listening withdrawals error:", error);
    });

    // 4. Setup real-time listener for users collection
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const items: UserProfile[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as UserProfile);
      });
      if (items.length > 0) {
        setAllUsers(prev => {
          // Merge local master users pool with Firestore users so offline-registered users are kept
          const merged = [...prev];
          items.forEach(item => {
            const index = merged.findIndex(u => u.username && item.username && u.username.toLowerCase().trim() === item.username.toLowerCase().trim());
            if (index !== -1) {
              merged[index] = {
                ...merged[index],
                ...item
              };
            } else {
              merged.push(item);
            }
          });
          return merged;
        });
        
        // Also sync profile in active session
        const currentLocal = localStorage.getItem('tappmusic_profile');
        if (currentLocal) {
          try {
            const parsed = JSON.parse(currentLocal) as UserProfile;
            const updatedProfile = items.find(u => u.username && parsed.username && u.username.toLowerCase().trim() === parsed.username.toLowerCase().trim());
            if (updatedProfile) {
              hasSyncedWithFirestore.current = true;
              setUserProfile(prevProfile => {
                const earningsChanged = prevProfile.earnings !== updatedProfile.earnings;
                const vipLevelChanged = prevProfile.vipLevel !== updatedProfile.vipLevel;
                const statusChanged = prevProfile.status !== updatedProfile.status;
                const inviteCountChanged = prevProfile.inviteCount !== updatedProfile.inviteCount;
                const inviteCommissionsChanged = prevProfile.inviteCommissionsEarned !== updatedProfile.inviteCommissionsEarned;
                
                const prevTasksStr = [...(prevProfile.completedTaskIds || [])].sort().join(',');
                const updatedTasksStr = [...(updatedProfile.completedTaskIds || [])].sort().join(',');
                const tasksChanged = prevTasksStr !== updatedTasksStr;

                if (earningsChanged || vipLevelChanged || statusChanged || inviteCountChanged || inviteCommissionsChanged || tasksChanged) {
                  return {
                    ...prevProfile,
                    ...updatedProfile
                  };
                }
                return prevProfile;
              });
            }
          } catch (e) {}
        }
      }
    }, (error) => {
      console.error("Firestore listening users error:", error);
    });

    // 5. Setup real-time listener for voices collection
    const unsubVoices = onSnapshot(collection(db, 'voices'), (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      if (items.length > 0) {
        setVoiceThemes(prev => {
          const merged = [...prev];
          items.forEach(item => {
            const index = merged.findIndex(v => v.id === item.id);
            if (index !== -1) {
              merged[index] = item;
            } else {
              merged.push(item);
            }
          });
          return merged;
        });
      }
    }, (error) => {
      console.error("Firestore listening voices error:", error);
    });

    // 6. Setup real-time listener for reels collection
    const unsubReels = onSnapshot(collection(db, 'reels'), (snapshot) => {
      const items: Reel[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Reel);
      });
      if (items.length > 0) {
        setReels(items);
      }
    }, (error) => {
      console.error("Firestore listening reels error:", error);
    });

    return () => {
      unsubRegistrations();
      unsubWithdrawals();
      unsubUsers();
      unsubVoices();
      unsubReels();
    };
  }, []);

  // Referral hook: detects ?ref=username in address bar
  const [referredBy, setReferredBy] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('ref') || '';
    }
    return '';
  });

  // Login Mode and Secure Admin Protection States
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isAdminVerified, setIsAdminVerified] = useState(() => {
    // If they already have Kervin's email loaded, auto-verify
    const cur = localStorage.getItem('tappmusic_profile');
    if (cur) {
      try {
        const u = JSON.parse(cur);
        if (u.email === 'admin@tappmusic.com' || u.username === 'admin_tapp') return true;
      } catch (e) {}
    }
    return false;
  });
  const [showAdminCodePrompt, setShowAdminCodePrompt] = useState(false);
  const [adminUnlockCode, setAdminUnlockCode] = useState('');

  // VIP Upgrade Request States
  const [upgradeVipLevel, setUpgradeVipLevel] = useState<VipLevel | null>(null);
  const [upgradePayMethod, setUpgradePayMethod] = useState<'Pago Móvil' | 'USDT BEP-20'>('Pago Móvil');
  const [upgradeReferenceNo, setUpgradeReferenceNo] = useState('');
  const [upgradeFileName, setUpgradeFileName] = useState('');
  const [upgradeFileBlob, setUpgradeFileBlob] = useState('');

  const handleUpgradeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUpgradeFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.6);
            setUpgradeFileBlob(compressed);
          } else {
            setUpgradeFileBlob(event.target?.result as string || '');
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Login Fields
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Automated persistence whenever userProfile updates
  useEffect(() => {
    localStorage.setItem('tappmusic_profile', JSON.stringify(userProfile));
    
    // Also sync the changed userProfile back into the master users pool
    if (userProfile && userProfile.isRegistered) {
      setAllUsers(prev => {
        const exists = prev.some(u => u.username && userProfile.username && u.username.toLowerCase() === userProfile.username.toLowerCase());
        let updatedList;
        if (exists) {
          updatedList = prev.map(u => u.username && userProfile.username && u.username.toLowerCase() === userProfile.username.toLowerCase() ? userProfile : u);
        } else {
          updatedList = [...prev, userProfile];
        }
        return updatedList;
      });

      // Synchronize in real-time with Firestore so coins/tasks are never lost on updates or refresh
      // Only write to firestore if we have synced with Firestore at least once in this session.
      // This prevents local stale state on start-up from overwriting updated database values (e.g. status approvals).
      if (hasSyncedWithFirestore.current && userProfile.username && userProfile.username.toLowerCase().trim() !== 'usuario_vip') {
        const userDocRef = doc(db, 'users', userProfile.username.toLowerCase().trim());
        setDoc(userDocRef, userProfile).catch(err => {
          console.warn("Background setDoc failed for userProfile:", err);
        });
      }
    }
  }, [userProfile]);

  // Automatic Daily Task Reset Engine
  useEffect(() => {
    if (userProfile && userProfile.isRegistered && userProfile.username && userProfile.username.toLowerCase().trim() !== 'usuario_vip') {
      const todayDateStr = new Date().toLocaleDateString('es-ES');
      if (userProfile.lastResetDate !== todayDateStr) {
        setUserProfile(prev => ({
          ...prev,
          completedTaskIds: [],
          lastResetDate: todayDateStr
        }));
      }
    }
  }, [userProfile]);

  // Save profile to local storage helper & live Firestore database
  const saveProfile = (newProfile: UserProfile) => {
    hasSyncedWithFirestore.current = true;
    setUserProfile(newProfile);
    localStorage.setItem('tappmusic_profile', JSON.stringify(newProfile));
    if (newProfile && newProfile.username && newProfile.username !== 'usuario_vip') {
      setDoc(doc(db, 'users', newProfile.username.toLowerCase().trim()), newProfile).catch(err => {
        // Background sync fail silent
      });
    }
  };

  // 15% VIP Commission Payout engine
  const addCommissionToReferrer = (referrerUsername: string, level: VipLevel) => {
    const priceUsd = getLevelPriceInUsd(level);
    const commissionUsd = priceUsd * 0.15;
    
    setAllUsers(prev => {
      const updatedList = prev.map(u => {
        if (u.username && u.username.toLowerCase() === referrerUsername.toLowerCase()) {
          const currentCommissions = u.inviteCommissionsEarned || 0;
          const currentCount = u.inviteCount || 0;
          const updatedUser = {
            ...u,
            earnings: u.earnings + commissionUsd,
            inviteCommissionsEarned: currentCommissions + commissionUsd,
            inviteCount: currentCount + 1
          };
          
          // Live update active session if the referrer is currently logged in!
          if (userProfile.username && userProfile.username.toLowerCase() === referrerUsername.toLowerCase()) {
            setTimeout(() => {
              setUserProfile(updatedUser);
            }, 60);
          }
          return updatedUser;
        }
        return u;
      });
      return updatedList;
    });
  };

  // Simulated registration fields
  const [inputUsername, setInputUsername] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedInitialVip, setSelectedInitialVip] = useState<VipLevel>('VIP PLATA 10$');

  // New registration payment fields
  const [registrationPayMethod, setRegistrationPayMethod] = useState<'Pago Móvil' | 'USDT BEP-20'>('Pago Móvil');
  const [inputReferenceNo, setInputReferenceNo] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');
  const [previewBlob, setPreviewBlob] = useState('');
  const [copiedAddressFeedback, setCopiedAddressFeedback] = useState(false);

  // Admin section states
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'activaciones' | 'retiros' | 'voces' | 'usuarios' | 'videos'>('activaciones');
  const [adminUserSearch, setAdminUserSearch] = useState('');

  // Voice database state (initialized with default voices for instant local fallback)
  const [voiceThemes, setVoiceThemes] = useState<any[]>([
    {
      id: 'jesus',
      key: 'jesus',
      speaker: 'Jesucristo Salvador',
      avatar: '✝️',
      description: 'Voz Sagrada de Redención y Amor',
      intro: 'Hijo mío, recibe mi paz protectora. Anda, contempla esta promesa y compártela: ',
      color: 'border-purple-500/30 text-purple-300 bg-purple-500/5',
      badgeColor: 'bg-purple-950/40 text-purple-300 border-purple-500/30',
      shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]',
      pitch: 1.02,
      rate: 0.82
    },
    {
      id: 'dios',
      key: 'dios',
      speaker: 'Dios Padre Celestial',
      avatar: '🌿',
      description: 'Voz Omnipotente, Calma y Solemne',
      intro: 'Yo soy tu refugio en la tormenta. Escucha con reverencia mi mensaje sagrado para ti: ',
      color: 'border-amber-500/30 text-amber-300 bg-amber-500/5',
      badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-500/30',
      shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
      pitch: 0.84,
      rate: 0.75
    },
    {
      id: 'espiritu_santo',
      key: 'espiritu_santo',
      speaker: 'Espíritu Santo Consolador',
      avatar: '🕊️',
      description: 'Paz Absoluta y Unción Celestial',
      intro: 'Siente mi dulce presencia llenándote de fe y de abundancia celestial. Escucha esta palabra eterna: ',
      color: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/5',
      badgeColor: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30',
      shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      pitch: 1.08,
      rate: 0.74
    },
    {
      id: 'angel',
      key: 'angel',
      speaker: 'Ángel de la Revelación',
      avatar: '🌟',
      description: 'Mensajero Divino de Nuevas de Fe',
      intro: '¡Gloria a Dios en las alturas! Recibe la maravillosa promesa que tengo revelada para ti hoy: ',
      color: 'border-sky-500/30 text-sky-300 bg-sky-500/5',
      badgeColor: 'bg-sky-950/40 text-sky-300 border-sky-500/30',
      shadow: 'shadow-[0_0_15px_rgba(14,165,233,0.3)]',
      pitch: 1.15,
      rate: 0.85
    },
    {
      id: 'familia',
      key: 'familia',
      speaker: 'La Voz de la Familia',
      avatar: '🏠',
      description: 'Unión, Pureza y Valores Sagrados',
      intro: 'Edifica tu bendito hogar sobre la roca del amor. Este es el consejo protector para tu mesa: ',
      color: 'border-pink-500/30 text-pink-300 bg-pink-500/5',
      badgeColor: 'bg-pink-950/40 text-pink-300 border-pink-500/30',
      shadow: 'shadow-[0_0_15px_rgba(236,72,153,0.3)]',
      pitch: 1.14,
      rate: 0.88
    },
    {
      id: 'mentalidad',
      key: 'mentalidad',
      speaker: 'Mentalidad de Reino',
      avatar: '💎',
      description: 'Éxito, Fuerza y Provisión Divina',
      intro: '¡Declara abundancia en el nombre del Creador! Rompe la escasez y recibe tu prosperidad: ',
      color: 'border-[#39FF14]/30 text-[#39FF14] bg-[#39FF14]/5',
      badgeColor: 'bg-zinc-900 text-[#39FF14] border-[#39FF14]/40',
      shadow: 'shadow-[0_0_15px_rgba(57,255,20,0.3)]',
      pitch: 1.0,
      rate: 0.94
    }
  ]);

  // Voice editing / creation admin form states
  const [isEditingVoice, setIsEditingVoice] = useState<boolean>(false);
  const [editingVoiceId, setEditingVoiceId] = useState<string>('');
  const [voiceFormKey, setVoiceFormKey] = useState<string>('');
  const [voiceFormSpeaker, setVoiceFormSpeaker] = useState<string>('');
  const [voiceFormAvatar, setVoiceFormAvatar] = useState<string>('');
  const [voiceFormDescription, setVoiceFormDescription] = useState<string>('');
  const [voiceFormIntro, setVoiceFormIntro] = useState<string>('');
  const [voiceFormPitch, setVoiceFormPitch] = useState<number>(1.0);
  const [voiceFormRate, setVoiceFormRate] = useState<number>(0.8);

  // Reels state representing dynamic videos from Firestore
  const [reels, setReels] = useState<Reel[]>([]);
  const [isEditingReel, setIsEditingReel] = useState<boolean>(false);
  const [editingReelId, setEditingReelId] = useState<string>('');
  const [reelFormTitle, setReelFormTitle] = useState<string>('');
  const [reelFormCaption, setReelFormCaption] = useState<string>('');
  const [reelFormArtist, setReelFormArtist] = useState<string>('');
  const [reelFormCoverUrl, setReelFormCoverUrl] = useState<string>('');
  const [reelFormVideoUrl, setReelFormVideoUrl] = useState<string>('');
  const [reelFormVipLevel, setReelFormVipLevel] = useState<VipLevel>('VIP PLATA 10$');
  const [reelFormCategory, setReelFormCategory] = useState<'Video de Fe' | 'Familia' | 'Mentalidad' | 'Video Musical'>('Video de Fe');

  // Registrations Pool to sync approvals
  const [registrations, setRegistrations] = useState<any[]>(() => {
    const saved = localStorage.getItem('tappmusic_registrations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((r: any) => r.username !== 'cristiano_vip' && r.username !== 'fe_y_abundancia' && r.username !== 'mentalidad_oro');
        }
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('tappmusic_registrations', JSON.stringify(registrations));
  }, [registrations]);

  // Shared withdraw history state to prevent sibling desyncs
  const [withdrawHistory, setWithdrawHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('tappmusic_withdrawals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((w: any) => w.id !== 'TAPP-WD-8290');
        }
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('tappmusic_withdrawals', JSON.stringify(withdrawHistory));
  }, [withdrawHistory]);

  const getLevelPriceInUsd = (lvl: VipLevel): number => {
    switch (lvl) {
      case 'VIP PLATA 10$': return 10;
      case 'VIP ORO 20$': return 20;
      case 'VIP RUBÍ 40$': return 40;
      case 'VIP DIAMANTE 120$': return 120;
      case 'VIP PLATINO 420$': return 420;
      case 'VIP CORONA IMPERIAL 1000$': return 1000;
      default: return 10;
    }
  };

  const getLevelPriceInBs = (lvl: VipLevel): number => {
    switch (lvl) {
      case 'VIP PLATA 10$': return 7340;
      case 'VIP ORO 20$': return 14680;
      case 'VIP RUBÍ 40$': return 29360;
      case 'VIP DIAMANTE 120$': return 88080;
      case 'VIP PLATINO 420$': return 308280;
      case 'VIP CORONA IMPERIAL 1000$': return 734000;
      default: return 7340;
    }
  };

  const getInviteCount = (): number => {
    const referredUsers = allUsers.filter(u => u.invitedBy && userProfile.username && u.invitedBy.toLowerCase().trim() === userProfile.username.toLowerCase().trim());
    let count = Math.max(userProfile.inviteCount || 0, referredUsers.length);
    if (userProfile.username && userProfile.username.toLowerCase() === 'admin_tapp' && count < 4) {
      count = 4;
    }
    return count;
  };

  const getInviteCommissions = (): number => {
    const referredActiveUsers = allUsers.filter(u => 
      u.invitedBy && 
      userProfile.username && 
      u.invitedBy.toLowerCase().trim() === userProfile.username.toLowerCase().trim() &&
      u.status === 'active'
    );
    
    let totalCommissions = 0;
    referredActiveUsers.forEach(u => {
      const priceUsd = getLevelPriceInUsd(u.vipLevel);
      totalCommissions += priceUsd * 0.15;
    });

    let earned = Math.max(userProfile.inviteCommissionsEarned || 0, totalCommissions);
    if (userProfile.username && userProfile.username.toLowerCase() === 'admin_tapp' && earned < 6.00) {
      earned = 6.00;
    }
    return earned;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.6);
            setPreviewBlob(compressed);
          } else {
            setPreviewBlob(event.target?.result as string || '');
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const name = inputUsername.trim().toLowerCase() || 'invitado_vip';
      const emailLower = inputEmail.trim().toLowerCase();

      // Prevent overwriting existing user data by checking duplicate username or email
      const nameExists = allUsers.some(u => u.username && u.username.toLowerCase() === name);
      const emailExists = allUsers.some(u => u.email && u.email.toLowerCase() === emailLower);

      if (nameExists || emailExists) {
        alert("❌ Este nombre de usuario o correo ya está registrado en Tappmusic.com. Por favor, inicia sesión con tu cuenta actual usando la opción de abajo.");
        return;
      }

      let startEarnings = 10.00;
      if (selectedInitialVip === 'VIP ORO 20$') startEarnings = 20.00;
      else if (selectedInitialVip === 'VIP RUBÍ 40$') startEarnings = 40.00;
      else if (selectedInitialVip === 'VIP DIAMANTE 120$') startEarnings = 120.00;
      else if (selectedInitialVip === 'VIP PLATINO 420$') startEarnings = 420.00;
      else if (selectedInitialVip === 'VIP CORONA IMPERIAL 1000$') startEarnings = 1000.00;

      const usdPrice = getLevelPriceInUsd(selectedInitialVip);
      const bsPrice = getLevelPriceInBs(selectedInitialVip);
      const regId = `REG-${Math.floor(1000 + Math.random() * 9000)}`;

      const newReg = {
        id: regId,
        username: name,
        email: emailLower,
        vipLevel: selectedInitialVip,
        paymentMethodUsed: registrationPayMethod,
        amountUsd: usdPrice,
        amountBs: bsPrice,
        referenceNo: inputReferenceNo || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        proofFileName: attachedFileName || 'boceto_captura.png',
        proofFileBlob: previewBlob || '',
        date: new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'pending',
        ...(referredBy ? { invitedBy: referredBy } : {})
      };

      const updated: UserProfile = {
        username: name,
        email: emailLower,
        password: inputPassword,
        vipLevel: selectedInitialVip,
        earnings: startEarnings,
        completedTaskIds: [],
        isRegistered: true,
        status: 'pending', // Starts in pending verification
        paymentMethodUsed: registrationPayMethod,
        proofFileName: newReg.proofFileName,
        proofFileBlob: newReg.proofFileBlob,
        referenceNo: newReg.referenceNo,
        inviteCommissionsEarned: 0,
        inviteCount: 0,
        ...(referredBy ? { invitedBy: referredBy } : {})
      };

      // 1. Store in admin live Firestore registrations queue (non-blocking)
      setDoc(doc(db, 'registrations', regId), newReg).catch(err => {
        console.warn("Could not save to registrations Firestore (using offline mode):", err);
      });

      // 2. Push directly to master user list for cloud synchronization (non-blocking)
      setDoc(doc(db, 'users', name), updated).catch(err => {
        console.warn("Could not save to users Firestore (using offline mode):", err);
      });

      // 3. Update local react states immediately so registration card advances!
      setRegistrations(prev => [newReg, ...prev]);
      setAllUsers(prev => [...prev, updated]);
      saveProfile(updated);

      // Clear inputs
      setInputUsername('');
      setInputEmail('');
      setInputPassword('');
      setInputReferenceNo('');
      setAttachedFileName('');
      setPreviewBlob('');
      
      setIsVipSelectorOpen(false);
      alert("⚡ ¡Registro de Membresía VIP Enviado! Tu solicitud de depósito está siendo verificada por el propietario (Hermanito Kervin) para activar tu casilla VIP.");
    } catch (err) {
      console.error("Critical error in handleRegister:", err);
      alert("⚠️ Error al registrarse: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const inputVal = loginInput.trim().toLowerCase();
    const passVal = loginPassword.trim();

    if (!inputVal || !passVal) {
      setLoginError('❌ Por favor, llena todos los campos.');
      return;
    }

    let foundUser: UserProfile | undefined;
    
    try {
      const userSnap = await getDoc(doc(db, 'users', inputVal));
      if (userSnap.exists()) {
        foundUser = userSnap.data() as UserProfile;
      } else {
        // Fallback to checking by email or in allUsers state
        foundUser = allUsers.find(u => (u.username && u.username.toLowerCase() === inputVal) || (u.email && u.email.toLowerCase() === inputVal));
      }
    } catch (err) {
      foundUser = allUsers.find(u => (u.username && u.username.toLowerCase() === inputVal) || (u.email && u.email.toLowerCase() === inputVal));
    }

    if (!foundUser) {
      if (inputVal === 'admin_tapp' || inputVal === 'admin@tappmusic.com') {
        const adminSeed: UserProfile = {
          username: 'admin_tapp',
          email: 'admin@tappmusic.com',
          password: passVal || '7340',
          vipLevel: 'VIP CORONA IMPERIAL 1000$',
          earnings: 1545.00,
          completedTaskIds: [],
          isRegistered: true,
          status: 'active',
          inviteCount: 4,
          inviteCommissionsEarned: 6.00
        };
        try {
          await setDoc(doc(db, 'users', 'admin_tapp'), adminSeed);
        } catch (e) {}
        setAllUsers(prev => [...prev, adminSeed]);
        saveProfile(adminSeed);
        setIsAdminVerified(true);
        setIsLoginMode(false);
        return;
      }
      setLoginError('❌ Usuario o Correo electrónico no encontrado.');
      return;
    }

    const isAdminUser = (foundUser.username && foundUser.username.toLowerCase() === 'admin_tapp') || (foundUser.email && foundUser.email.toLowerCase() === 'admin@tappmusic.com');

    if (foundUser.password !== passVal && !(isAdminUser && (passVal === '7340' || passVal === '26394421'))) {
      setLoginError('❌ Contraseña incorrecta.');
      return;
    }

    // Ensure status is active and update password preferred choice
    if (isAdminUser) {
      foundUser.password = passVal;
      foundUser.status = 'active';
      foundUser.vipLevel = 'VIP CORONA IMPERIAL 1000$';
    }

    // Save updated profile state
    saveProfile(foundUser);
    
    // Also save in users list update
    setAllUsers(prev => prev.map(u => u.username && foundUser!.username && u.username.toLowerCase() === foundUser!.username.toLowerCase() ? foundUser! : u));

    setLoginInput('');
    setLoginPassword('');
    
    if (isAdminUser) {
      setIsAdminVerified(true);
    }
  };

  const handleApproveUser = async (regUsername: string, regAmountUsd: number, regVipLevel?: string) => {
    const targetName = regUsername.toLowerCase().trim();
    
    try {
      const userRef = doc(db, 'users', targetName);
      const userSnap = await getDoc(userRef);
      
      let userData: UserProfile | null = null;
      if (userSnap.exists()) {
        userData = userSnap.data() as UserProfile;
      } else {
        // Fallback to local react state allUsers
        const localUser = allUsers.find(u => u.username && u.username.toLowerCase().trim() === targetName);
        if (localUser) {
          userData = localUser;
        }
      }
      
      if (userData) {
        // 1. Activate approved user and promote tier if specified
        const targetVip = regVipLevel ? (regVipLevel as VipLevel) : userData.vipLevel;
        const activatedTarget = { 
          ...userData, 
          status: 'active' as const,
          vipLevel: targetVip
        };
        await setDoc(userRef, activatedTarget);

        // Update allUsers local state for reactive display updates
        setAllUsers(prev => prev.map(u => u.username && u.username.toLowerCase() === targetName ? activatedTarget : u));
        
        // 2. Pay 15% commission if referrer exists
        if (userData.invitedBy) {
          const referrerName = userData.invitedBy.toLowerCase().trim();
          const referrerRef = doc(db, 'users', referrerName);
          const referrerSnap = await getDoc(referrerRef);
          
          let referrerUser: UserProfile | null = null;
          if (referrerSnap.exists()) {
            referrerUser = referrerSnap.data() as UserProfile;
          } else {
            const localReferrer = allUsers.find(u => u.username && u.username.toLowerCase().trim() === referrerName);
            if (localReferrer) {
              referrerUser = localReferrer;
            }
          }
          
          if (referrerUser) {
            const commissionEarned = Number((regAmountUsd * 0.15).toFixed(2));
            const updatedReferrer = {
              ...referrerUser,
              earnings: Number((referrerUser.earnings + commissionEarned).toFixed(2)),
              inviteCommissionsEarned: Number(((referrerUser.inviteCommissionsEarned || 0) + commissionEarned).toFixed(2)),
              inviteCount: (referrerUser.inviteCount || 0) + 1
            };
            await setDoc(referrerRef, updatedReferrer);
            setAllUsers(prev => prev.map(u => u.username && u.username.toLowerCase() === referrerName ? updatedReferrer : u));
          }
        }
      }
    } catch (err) {
      console.error("handleApproveUser error:", err);
    }
  };

  const handleUpgradeVip = (lvl: VipLevel) => {
    // Admin/propietario can instantly upgrade for easy tests
    const isAdmin = (userProfile.username && userProfile.username.toLowerCase() === 'admin_tapp') || userProfile.email === 'admin@tappmusic.com';
    if (isAdmin) {
      const backup = { ...userProfile, vipLevel: lvl };
      saveProfile(backup);
      setIsVipSelectorOpen(false);
      alert(`⚡ Rango VIP cambiado instantáneamente a ${lvl} (Cuenta de Propietario).`);
      return;
    }

    // Standard user opens checkout overlay inside drawers
    setUpgradeVipLevel(lvl);
  };

  const submitUpgradeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upgradeVipLevel) return;

    const usdPrice = getLevelPriceInUsd(upgradeVipLevel);
    const bsPrice = getLevelPriceInBs(upgradeVipLevel);
    const regId = `UPGRADE-${userProfile.username.toLowerCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const upgradeReg = {
      id: regId,
      username: userProfile.username,
      email: userProfile.email || '',
      vipLevel: upgradeVipLevel,
      paymentMethodUsed: upgradePayMethod,
      amountUsd: usdPrice,
      amountBs: bsPrice,
      referenceNo: upgradeReferenceNo || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      proofFileName: upgradeFileName || 'comprobante_mejora.png',
      proofFileBlob: upgradeFileBlob || '',
      date: new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending'
    };

    // Store in registrations Firestore queue (non-blocking)
    setDoc(doc(db, 'registrations', regId), upgradeReg).catch(err => {
      console.warn("Could not save upgrade registration in Firestore (using offline local fallback):", err);
    });

    setRegistrations(prev => [upgradeReg, ...prev]);

    // Clear upgrade inputs
    setUpgradeVipLevel(null);
    setUpgradeReferenceNo('');
    setUpgradeFileName('');
    setUpgradeFileBlob('');
    setIsVipSelectorOpen(false);

    alert(`⚡ Solicitud de Cambio VIP a ${upgradeVipLevel} enviada con éxito. El administrador (Hermanito Kervin) validará tu depósito para activar el rango.`);
  };

  const handleLogout = () => {
    // Reset all form inputs to clean blank fields for registration
    setInputUsername('');
    setInputEmail('');
    setInputPassword('');
    setInputReferenceNo('');
    setAttachedFileName('');
    setPreviewBlob('');
    setIsAdminVerified(false);
    setIsLoginMode(false);
    
    const updated: UserProfile = {
      username: 'usuario_vip',
      email: '',
      password: '',
      vipLevel: 'VIP PLATA 10$',
      earnings: 25.50,
      completedTaskIds: [],
      isRegistered: false
    };
    saveProfile(updated);
    localStorage.removeItem('tappmusic_profile');
  };

  const copyModalLink = async () => {
    try {
      const inviteLink = userProfile.isRegistered && userProfile.username !== 'usuario_vip'
        ? `${sharedUrl}/?ref=${userProfile.username}`
        : sharedUrl;
      await navigator.clipboard.writeText(inviteLink);
      setCopiedModalLink(true);
      setTimeout(() => setCopiedModalLink(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#39FF14] pb-16 antialiased selection:bg-[#39FF14] selection:text-black">
      {/* Dynamic Administrator floating check bar */}
      {isAdminVerified && (
        <div className="sticky top-0 z-50 bg-[#121214] border-b border-[#39FF14]/30 py-2.5 px-6 flex flex-col sm:flex-row gap-2 justify-between items-center text-xs font-mono animate-fade-in shadow-[0_0_15px_rgba(57,255,20,0.1)]">
          <div className="flex items-center gap-2 text-zinc-400 text-center sm:text-left">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] leading-tight select-none text-zinc-355 text-zinc-300">
              SESIÓN DE HERMANITO ACTIVA • <strong className="text-emerald-400 font-bold uppercase tracking-widest">PROPIETARIO ORIGINAL</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveAdminTab('activaciones');
                setIsAdminOpen(true);
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-900 to-zinc-950 border border-emerald-500/50 hover:border-emerald-400 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider cursor-pointer text-emerald-300 transition-all active:scale-95 whitespace-nowrap uppercase"
              title="Abrir Panel del Dueño para aprobar activaciones y retiros"
            >
              ⚙️ panel de control admin ({registrations.filter(r => r.status === 'pending').length} pend)
            </button>
            <button
              onClick={() => setIsAdminVerified(false)}
              className="text-[9px] text-zinc-500 hover:text-red-400 transition-all font-mono uppercase bg-zinc-900 hover:bg-black border border-white/5 px-2 py-1 rounded-lg"
              title="Cerrar panel de control"
            >
              Ocultar Panel ✕
            </button>
          </div>
        </div>
      )}

      {/* Visual background ambient LED glows of Violet & Gold */}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-12 left-1/3 h-[400px] w-[400px] rounded-full bg-yellow-500/10 blur-[130px] pointer-events-none" />

      {/* Main Navigation Header */}
      <Header 
        userProfile={userProfile} 
        onOpenShareModal={() => setIsShareModalOpen(true)} 
        onOpenVipSelector={() => setIsVipSelectorOpen(true)}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-8 text-center">
        
        {/* CENTERED BRANDING LOGO & LED SLOGAN AREA */}
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-4 max-w-xl mx-auto">
          {/* Centered Golden & Purple rotating brain with headphones logo */}
          <BrainLogo size="md" />

          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-widest text-white uppercase select-all">
              Tappmusic<span className="text-[#39FF14] text-neon-green font-black">.com</span>
            </h1>
            <p className="text-gray-400 text-xs tracking-wider max-w-md mx-auto leading-relaxed">
              El portal definitivo de fe, familia, mentalidad de éxito y tareas VIP remuneradas con los mejores Reels inspiradores.
            </p>
          </div>
        </div>

        {/* REGISTRATION GUARDIAN CARD (If unregistered, users register to unlock full board) */}
        {!userProfile.isRegistered ? (
          /* LOGIN CARD */
          <div className="max-w-xl mx-auto rounded-3xl border-2 border-dashed border-purple-500/40 bg-zinc-950 p-6 sm:p-8 shadow-[0_0_50px_rgba(168,85,247,0.15)] relative text-left animate-fade-in">
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-purple-950/45 text-purple-300 border border-purple-500/35 font-mono text-[9px] px-2.5 py-0.5 rounded-full uppercase font-black animate-pulse">
                Acceso Miembros 🔑
              </div>

              <div className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-400">
                    <Lock className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-wider">Iniciar Sesión</h3>
                  <p className="text-xs text-zinc-400 max-w-sm">
                    Ingresa tu usuario o correo electrónico registrado y contraseña para ingresar a tu portal de tareas.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Login Account Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-[#39FF14] font-black block">
                      Usuario o Correo Electrónico *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. melodia_tapp o admin_tapp"
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      className="w-full text-xs font-semibold bg-black border border-white/10 rounded-xl px-4 py-2.5 text-[#39FF14] placeholder-zinc-800 focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-black block">
                      Contraseña de Acceso *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full text-xs font-semibold bg-black border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-white placeholder-zinc-805 focus:outline-none focus:border-[#39FF14]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#39FF14] transition-all cursor-pointer focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <div className="text-xs text-red-400 font-mono text-center font-bold bg-red-950/20 border border-red-500/20 p-2.5 rounded-lg">
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-black uppercase text-white font-sans tracking-widest transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.3)] border-none"
                  >
                    <Lock className="h-4 w-4 text-white" />
                    <span>Entrar y Hacer Tareas</span>
                  </button>
                </form>

                {/* Back to registration toggle */}
                <div className="pt-5 text-center border-t border-white/5 mt-4 space-y-3.5">
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    ¿Aún no tienes una membresía VIP en Tappmusic? <br />
                    <button 
                      type="button"
                      onClick={() => setIsVipSelectorOpen(true)}
                      className="text-[#39FF14] hover:underline font-extrabold uppercase tracking-widest text-xs mt-1 cursor-pointer bg-transparent border-none"
                    >
                      REGISTRARME Y ACTIVAR CASILLA VIP ⚡
                    </button>
                  </p>
                  <div className="pt-1.5 text-center">
                    <button
                      onClick={() => setShowAdminCodePrompt(true)}
                      className="text-[10px] text-zinc-650 hover:text-purple-400 transition-all uppercase font-mono font-bold tracking-tight bg-transparent border-none pointer-events-auto"
                    >
                      🛠️ Acceso Propietario (Hermanito Kervin)
                    </button>
                  </div>
                </div>
              </div>
            </div>
        ) : (
          /* FULL BOARD LAYOUT (Unlocked upon registration) */
          <div className="space-y-8">
            
            {userProfile.status === 'pending' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto animate-fade-in text-left">
                {/* Yellow Notice Block */}
                <div className="p-5 rounded-2xl border border-yellow-500/20 bg-zinc-950/90 shadow-[0_0_20px_rgba(234,179,8,0.05)] space-y-3 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                    </span>
                    <span className="text-xs uppercase font-mono font-black tracking-wider">Modo Exploratorio Gratuito Activo</span>
                  </div>
                  <h3 className="text-md font-black text-white uppercase font-sans">Sintoniza de forma Gratuita 🎧</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    ¡Bienvenido a <strong>Tappmusic.com</strong>! Tienes acceso gratuito para navegar en la plataforma, disfrutar de reels motivacionales de fe, sintonizar sermones y poner a prueba los sistemas.
                  </p>
                  <p className="text-[#39FF14] text-[11px] leading-relaxed font-mono font-bold">
                    ⚠️ NOTA: El cobro y realización de tareas VIP remuneradas se activará una vez que el propietario (Hermanito Kervin) verifique tu depósito.
                  </p>
                </div>

                {/* Compact Receipt Box */}
                <div className="p-5 rounded-2xl border border-purple-500/15 bg-zinc-950 font-mono text-[11px] space-y-2.5">
                  <h4 className="text-[10px] tracking-wider font-extrabold text-white uppercase border-b border-white/5 pb-2 flex items-center gap-1.5">
                    ⌛ DETALLE DE TU ACTIVACIÓN PENDIENTE:
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Usuario:</span>
                    <span className="text-[#39FF14] font-black">@{userProfile.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Membresía Elegida:</span>
                    <span className="text-white font-extrabold">{userProfile.vipLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Métodos / Referencia:</span>
                    <span className="text-yellow-500 font-extrabold">{userProfile.paymentMethodUsed} - {userProfile.referenceNo}</span>
                  </div>
                  {userProfile.proofFileBlob && (
                    <div className="pt-1.5 border-t border-white/5 flex items-center gap-3">
                      <span className="text-zinc-500 text-[10px]">Capture:</span>
                      <div className="rounded-lg overflow-hidden bg-zinc-950 p-0.5 border border-white/10">
                        <img 
                          src={userProfile.proofFileBlob} 
                          alt="Capture de pago" 
                          className="h-8 w-auto object-cover rounded"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  )}
                  <div className="pt-2 border-t border-white/5 text-center text-zinc-500">
                    <button
                      onClick={handleLogout}
                      className="text-red-400 hover:underline hover:text-red-300 font-sans font-bold text-[10px] uppercase cursor-pointer bg-transparent border-none"
                    >
                      Cerrar Sesión / Ir al inicio
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* INFORMATIVE GREEN PROMO DECK */}
            <div className="relative overflow-hidden rounded-2xl border border-[#39FF14]/30 bg-zinc-950/50 p-6 md:p-8 backdrop-blur-sm shadow-2xl text-left">
              <div className="absolute inset-0 bg-[#39FF14]/[0.01] pointer-events-none" />
              
              <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded bg-[#39FF14]/10 border border-[#39FF14]/30 px-2.5 py-0.5 text-[9px] font-black text-[#39FF14] uppercase tracking-widest">
                      Misión, Visión y Objetivo
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-yellow-400">
                      ✨ Mentalidad Millonaria de Dios
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase font-sans">
                    NUESTROS SUEÑOS SE HACEN REALIDAD 🙏🏽🌞
                  </h2>
                  <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed font-sans font-medium">
                    <strong className="text-[#39FF14] block mb-1">Tappmusic.com — Mensaje del Liderazgo:</strong>
                    "Tappmusic. Mentalidad millonaria, los sueños se hacen realidad con esfuerzo y dedicación todo agarrado de la mano de Dios, pon tus proyectos en él. Él te ayudará☝🏼🙏🏽🌞 No importa que creas que es imposible, él lo hace posible. Con fe."
                  </p>
                </div>

                {/* Quick copy widget for deployment link */}
                <div className="w-full lg:w-auto shrink-0 bg-black border border-[#39FF14]/20 rounded-2xl p-4 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-start gap-4">
                  <div className="text-left">
                    <p className="text-[9px] font-bold text-[#39FF14] tracking-wider uppercase">Link de Lanzamiento</p>
                    <p className="text-xs font-mono text-zinc-300 truncate max-w-[180px] select-all lowercase">{sharedUrl}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={copyModalLink}
                      className={`flex-1 sm:flex-initial flex h-9 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold transition-all cursor-pointer ${
                        copiedModalLink 
                          ? 'bg-emerald-600 text-white border-none' 
                          : 'bg-black border border-[#39FF14]/40 hover:bg-[#39FF14]/15 text-[#39FF14] active:scale-95'
                      }`}
                    >
                      {copiedModalLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span>{copiedModalLink ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#39FF14]/5 hover:bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/20 transition-all cursor-pointer"
                      title="Difundir plataforma"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* STUNNING BENTO REFERRAL PANEL WIDGET */}
            <div className="max-w-xl mx-auto rounded-3xl border border-dashed border-purple-500/30 bg-[#0c0c0e] p-5 text-left space-y-4 shadow-xl">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-wider text-white uppercase font-sans">🔗 Sistema de Comisión por Invitación (15%)</h3>
                  <p className="text-[10px] text-zinc-500 font-mono">¡Gana el 15% del valor de activación de cada amigo que invites!</p>
                </div>
              </div>

              {/* Stats bento layout */}
              <div className="grid grid-cols-2 gap-3.5 pt-1">
                {/* Stat 1: Total invites */}
                <div className="p-3.5 rounded-2xl bg-black border border-white/5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-550 block font-bold">Invitados Registrados</p>
                    <p className="text-lg font-black text-[#39FF14] leading-none mt-0.5 font-sans">
                      {getInviteCount()} <span className="text-xs text-zinc-500 font-normal">personas</span>
                    </p>
                  </div>
                </div>

                {/* Stat 2: Referral Commissions */}
                <div className="p-3.5 rounded-2xl bg-black border border-white/5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center shrink-0">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-550 block font-bold">Comisiones Ganadas</p>
                    <p className="text-lg font-black text-yellow-400 leading-none mt-0.5 font-sans">
                      ${getInviteCommissions().toFixed(2)} <span className="text-[10px] text-zinc-500 font-normal select-none uppercase">USDT</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Personalized Link display box */}
              <div className="p-3 rounded-2xl bg-zinc-950 border border-white/5 font-mono text-[11px] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest block">Tu Enlace Personal De Invitación:</span>
                  <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-black">Activo • 15% Comisión</span>
                </div>
                <div className="flex items-center gap-2 bg-black border border-white/5 rounded-xl px-3 py-2">
                  <span className="text-zinc-400 truncate flex-1 leading-tight lowercase font-medium">
                    {sharedUrl}/?ref={userProfile.username}
                  </span>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(`${sharedUrl}/?ref=${userProfile.username}`);
                        alert("✅ ¡Enlace de invitación personalizado copiado con éxito! Compártelo para ganar 15% de comisión.");
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="h-7 px-2.5 rounded-lg bg-purple-950 text-purple-300 border border-purple-500/30 hover:border-purple-400 hover:text-white transition-all text-[9.5px] uppercase font-black shrink-0 tracking-wide cursor-pointer active:scale-95"
                  >
                    Copiar Enlace
                  </button>
                </div>
              </div>
            </div>

            {/* SINGLE COLUMN FOCUSED TASK BOARD */}
            <div className="max-w-xl mx-auto space-y-4">
              <div className="text-left pl-1">
                <h3 className="text-sm font-black tracking-widest text-purple-400 uppercase">💼 Hacer Tareas Diarias</h3>
                <p className="text-zinc-500 text-[11px]">Completa misiones inspiradoras de fe para recibir regalías automáticas en tu billetera.</p>
              </div>
              <VipTasks 
                userProfile={userProfile} 
                setUserProfile={setUserProfile} 
                withdrawHistory={withdrawHistory}
                setWithdrawHistory={setWithdrawHistory}
                voiceThemes={voiceThemes}
                reels={reels}
              />
            </div>

            {/* Support instructions container */}
            <div className="rounded-2xl border border-white/5 bg-zinc-950/30 p-5 text-left max-w-5xl mx-auto">
              <div className="flex items-start gap-3.5">
                <CircleAlert className="h-5 w-5 text-purple-500 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <h3 className="text-xs font-black tracking-wider text-white uppercase">Información general del servidor</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-mono">
                    Tappmusic.com ha sincronizado su base de datos con enlaces CDN de fe, familia y mentalidad de abundancia. El botón de "Hacer Tareas" calcula y liquida pagos directamente en tiempo real en la billetera local de tu navegador. Sube de VIP haciendo click en tu medalla del menú de arriba en cualquier momento para poner a prueba nuestro sistema.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* SHARE MODAL DIALOG */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm rounded-2xl border border-[#39FF14]/30 bg-black p-6 shadow-2xl overflow-hidden relative text-center">
            <div className="absolute top-4 right-4 animate-led-flash">
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/20 text-[#39FF14]">
                <Share2 className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-md font-black tracking-widest text-white uppercase">Compartir plataforma</h3>
                <p className="text-[11px] text-zinc-400">Copia el link de lanzamiento de Tappmusic.com para enviar a tu gente.</p>
              </div>

              <div className="rounded-xl bg-black border border-white/10 p-3 flex items-center justify-between font-mono text-xs">
                <span className="text-zinc-300 truncate max-w-[170px] select-all lowercase">{sharedUrl}</span>
                <button
                  onClick={copyModalLink}
                  className={`flex h-8 items-center gap-1 rounded-lg px-3 text-[10px] font-black transition-all cursor-pointer uppercase ${
                    copiedModalLink 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-[#39FF14]/10 text-[#39FF14] hover:bg-[#39FF14]/20 border border-[#39FF14]/20'
                  }`}
                >
                  {copiedModalLink ? 'Copiado' : 'Copiar'}
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    const encoded = encodeURIComponent(`🔥 ¡Hermano, ya está activa nuestra plataforma Tappmusic.com! Escucha el mejor flow dominicano, Reels VIP y gana regalías con tareas aquí: ${sharedUrl}`);
                    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
                  }}
                  className="w-full flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all cursor-pointer border-none"
                >
                  <MessageSquare className="h-4 w-4 text-white" />
                  <span>Compartir por WhatsApp</span>
                </button>
                <button
                  onClick={() => {
                    window.open(`https://t.me/share/url?url=${encodeURIComponent(sharedUrl)}&text=${encodeURIComponent('🔥 ¡Ya está activa Tappmusic.com! Reels latinos y tareas remuneradas en vivo.')}`, '_blank');
                  }}
                  className="w-full flex h-10 items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition-all cursor-pointer border-none"
                >
                  <Send className="h-4 w-4 text-white" />
                  <span>Compartir por Telegram</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK SELECTOR VIP DRAWER (For demo flexibility changing tiers instantly with payment request flow) */}
      {isVipSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
          <div className={`relative w-full ${!userProfile.isRegistered ? 'max-w-xl' : 'max-w-sm'} rounded-3xl border border-purple-500/30 bg-zinc-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden max-h-[95vh] overflow-y-auto`}>
            
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => {
                  setIsVipSelectorOpen(false);
                  setUpgradeVipLevel(null);
                }}
                className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all cursor-pointer border-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!userProfile.isRegistered ? (
              /* MODAL REGISTRATION FORM */
              <form onSubmit={handleRegister} className="space-y-6 text-left">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#39FF14]/10 to-purple-500/10 border border-[#39FF14]/30 text-[#39FF14]">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-wider">Registro de Miembro VIP</h3>
                  <p className="text-xs text-zinc-400">
                    Crea tu cuenta VIP y envía el comprobante de activación de tu membresía para activar tu casilla remunerada en Tappmusic.com
                  </p>
                </div>

                {referredBy && (
                  <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-center gap-2 text-xs text-purple-300 text-center">
                    <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                    <span className="font-sans leading-tight">
                      Invitado especial por: <strong className="text-white">@{referredBy}</strong>
                    </span>
                  </div>
                )}

                {/* Paso 1: Datos */}
                <div className="space-y-4 rounded-2xl border border-white/5 bg-black/60 p-4">
                  <h4 className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-[#39FF14] border-b border-white/5 pb-2">
                    🔑 Paso 1: Datos de tu Nueva Cuenta
                  </h4>
                  
                  {/* Account Nickname */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-[#39FF14] font-black block">
                      Nombre de Usuario (Nickname) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. melodia_tapp"
                      value={inputUsername}
                      onChange={(e) => setInputUsername(e.target.value)}
                      className="w-full text-xs font-semibold bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-[#39FF14] placeholder-zinc-800 focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  {/* Account email & password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-405 text-zinc-400 font-bold block">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="ejemplo@correo.com"
                        value={inputEmail}
                        onChange={(e) => setInputEmail(e.target.value)}
                        className="w-full text-xs font-semibold bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-800 focus:outline-none focus:border-[#39FF14]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-405 text-zinc-400 font-bold block">
                        Contraseña de Acceso *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={inputPassword}
                          onChange={(e) => setInputPassword(e.target.value)}
                          className="w-full text-xs font-semibold bg-zinc-950 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-white placeholder-zinc-800 focus:outline-none focus:border-[#39FF14]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#39FF14] transition-all cursor-pointer focus:outline-none bg-transparent border-none"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paso 2: Membresia VIP */}
                <div className="space-y-4 rounded-2xl border border-white/5 bg-black/60 p-4">
                  <h4 className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-[#39FF14] border-b border-white/5 pb-2">
                    👑 Paso 2: Elige tu Membresía VIP
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {([
                      { name: 'VIP PLATA 10$', price: '$10 USD' },
                      { name: 'VIP ORO 20$', price: '$20 USD' },
                      { name: 'VIP RUBÍ 40$', price: '$40 USD' },
                      { name: 'VIP DIAMANTE 120$', price: '$120 USD' },
                      { name: 'VIP PLATINO 420$', price: '$420 USD' },
                      { name: 'VIP CORONA IMPERIAL 1000$', price: '$1000 USD' }
                    ]).map(v => (
                      <button
                        key={v.name}
                        type="button"
                        onClick={() => setSelectedInitialVip(v.name as VipLevel)}
                        className={`p-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer border flex flex-col items-center justify-center gap-1 uppercase ${
                          selectedInitialVip === v.name
                            ? 'bg-purple-950/45 text-white border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                            : 'bg-zinc-950 text-gray-500 border-zinc-900 hover:border-zinc-800'
                        }`}
                      >
                        <span className="font-extrabold tracking-tight text-center">{v.name.split(' ')[1]}</span>
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded leading-none ${
                          selectedInitialVip === v.name
                            ? 'bg-purple-900/60 text-purple-200 font-bold'
                            : 'bg-zinc-900 text-zinc-650'
                        }`}>
                          {v.price}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paso 3: Pago */}
                <div className="p-4 rounded-2xl bg-black border border-white/5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-2.5 gap-2">
                    <h4 className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-white">
                      💳 Paso 3: Realizar el Depósito Asociado
                    </h4>
                    <div className="text-[10px] font-mono text-left sm:text-right">
                      <strong className="text-[#39FF14] font-black">${getLevelPriceInUsd(selectedInitialVip)} USD</strong>
                      <span className="text-zinc-500"> / </span>
                      <span className="text-yellow-500 font-black">{getLevelPriceInBs(selectedInitialVip).toLocaleString()} Bs</span>
                    </div>
                  </div>

                  {/* Pago Movil vs USDT BEP20 */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      key="registration_pago_movil"
                      type="button"
                      onClick={() => setRegistrationPayMethod('Pago Móvil')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold font-sans border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        registrationPayMethod === 'Pago Móvil'
                          ? 'bg-yellow-950/40 text-yellow-500 border-yellow-500/50'
                          : 'bg-black border-zinc-900 text-zinc-500 hover:text-zinc-400'
                      }`}
                    >
                      🇻🇪 Pago Móvil (Bs)
                    </button>
                    <button
                      key="registration_usdt"
                      type="button"
                      onClick={() => setRegistrationPayMethod('USDT BEP-20')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold font-sans border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        registrationPayMethod === 'USDT BEP-20'
                          ? 'bg-purple-950/40 text-purple-400 border-purple-500/50'
                          : 'bg-black border-zinc-900 text-zinc-500 hover:text-zinc-400'
                      }`}
                    >
                      🪙 USDT BEP-20
                    </button>
                  </div>

                  {registrationPayMethod === 'Pago Móvil' ? (
                    <div className="p-3 rounded-xl bg-zinc-950 border border-yellow-500/10 space-y-2 text-[11px] font-mono leading-relaxed text-zinc-350">
                      <p className="text-zinc-400 uppercase text-[9px] tracking-wider font-extrabold text-yellow-500">Datos Pago Móvil Venezuela:</p>
                      <div>Banco: <strong className="text-white font-black">Consulte al Administrador</strong></div>
                      <div>Cédula: <strong className="text-white font-black">V-00000000</strong></div>
                      <div>Teléfono BDV: <strong className="text-white font-black">Verifique en el Soporte</strong></div>
                      <div className="pt-1 border-t border-white/5 text-[9px] text-zinc-550">
                        * Tasa Calculada: 1 USDT = 734 Bs. Transfiera <strong className="text-yellow-500 font-extrabold">{getLevelPriceInBs(selectedInitialVip).toLocaleString()} Bs</strong>.
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-zinc-950 border border-purple-500/10 space-y-2 text-[11px] font-mono leading-normal text-zinc-350">
                      <p className="text-zinc-400 uppercase text-[9px] tracking-wider font-extrabold text-purple-400">Datos Depósito USDT BEP-20 (Binance):</p>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-zinc-500 block leading-none">Dirección de Destino:</span>
                        <div className="flex items-center gap-1.5 bg-black p-2 rounded-lg border border-white/5">
                          <code className="text-[10px] text-purple-300 break-all select-all font-mono">0x29f0f1edd5258ee3b7553bff665df4d1dd811af0</code>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('0x29f0f1edd5258ee3b7553bff665df4d1dd811af0');
                              setCopiedAddressFeedback(true);
                              setTimeout(() => setCopiedAddressFeedback(false), 2000);
                            }}
                            className="p-1 rounded bg-zinc-900 border border-white/5 text-purple-400 hover:text-white hover:bg-purple-900/40 transition-all cursor-pointer select-none"
                            title="Copiar billetera"
                          >
                            {copiedAddressFeedback ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                      <div className="pt-1 border-t border-white/5 text-[9px] text-zinc-550">
                        * Envíe exactamente <strong className="text-purple-400">${getLevelPriceInUsd(selectedInitialVip)}.00 USDT</strong> a la red <strong className="text-white">BNB Smart Chain (BEP20)</strong>.
                      </div>
                    </div>
                  )}
                </div>

                {/* Paso 4: Referencia */}
                <div className="space-y-4 rounded-2xl border border-white/5 bg-black/60 p-4">
                  <h4 className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-white border-b border-white/5 pb-2">
                    📝 Paso 4: Registrar Datos de Verificación
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-[#39FF14] font-black block">
                      Número de Referencia o Teléfono Emisor *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={registrationPayMethod === 'Pago Móvil' ? 'Ej. Ref: 8295' : 'Ej. Hash de Binance'}
                      value={inputReferenceNo}
                      onChange={(e) => setInputReferenceNo(e.target.value)}
                      className="w-full text-xs font-semibold bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-[#39FF14] placeholder-zinc-850 focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-bold block">
                      Capture de Pago Voucher (Opcional)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex h-10 px-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 hover:border-[#39FF14] hover:bg-[#39FF14]/5 text-zinc-400 hover:text-white transition-all cursor-pointer items-center justify-center text-xs">
                        <span>📁 Cargar Voucher</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                      {attachedFileName && (
                        <span className="text-xs text-white truncate max-w-[200px] font-mono block">
                          {attachedFileName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsVipSelectorOpen(false)}
                    className="w-1/2 flex h-12 items-center justify-center rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#39FF14] text-black hover:bg-white text-xs font-black uppercase tracking-widest transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(57,255,20,0.3)] border-none"
                  >
                    <Send className="h-4 w-4 text-black" />
                    <span>Registrarme</span>
                  </button>
                </div>
              </form>
            ) : !upgradeVipLevel ? (
              <div className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <Trophy className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-md font-black text-white uppercase tracking-wider">Cambiar Rango VIP</h3>
                  <p className="text-[11px] text-zinc-400">Prueba los diferentes niveles para ver tareas y Reels asociados.</p>
                </div>

                <div className="space-y-2 pt-2 text-left max-h-[350px] overflow-y-auto pr-1">
                  {[
                    { lvl: 'VIP PLATA 10$', desc: '5 Videos/Día | Recompensa: 367 monedas diarias', bonus: 'Bono x1.0', col: 'text-zinc-400' },
                    { lvl: 'VIP ORO 20$', desc: '7 Videos/Día | Recompensa: 734 monedas diarias', bonus: 'Bono x1.5', col: 'text-yellow-400' },
                    { lvl: 'VIP RUBÍ 40$', desc: '10 Videos/Día | Recompensa: 1468 monedas diarias', bonus: 'Bono x2.2', col: 'text-red-400' },
                    { lvl: 'VIP DIAMANTE 120$', desc: '15 Videos/Día | Recompensa: 4404 monedas diarias', bonus: 'Bono x3.5', col: 'text-sky-400 border border-sky-500/20 px-1 rounded' },
                    { lvl: 'VIP PLATINO 420$', desc: '17 Videos/Día | Recompensa: 15414 monedas diarias', bonus: 'Bono x5.0', col: 'text-purple-400 border border-purple-500/20 px-1 rounded' },
                    { lvl: 'VIP CORONA IMPERIAL 1000$', desc: '20 Videos/Día | Recompensa: 36700  monedas diarias', bonus: 'Bono x8.0', col: 'text-emerald-400 font-extrabold border border-emerald-500/35 px-1 rounded' }
                  ].map((item) => (
                    <button
                      key={item.lvl}
                      onClick={() => handleUpgradeVip(item.lvl as VipLevel)}
                      className="w-full p-2.5 rounded-xl border border-white/5 bg-black hover:border-purple-500/50 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div className="pr-2">
                        <p className={`text-[11px] font-black uppercase ${item.col}`}>{item.lvl}</p>
                        <p className="text-[9px] text-zinc-500 leading-tight">{item.desc}</p>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-white/5 px-2 py-0.5 rounded text-white shrink-0">
                        {item.bonus}
                      </span>
                    </button>
                  ))}
                </div>
                
                <div className="pt-2">
                  <button 
                    onClick={() => setIsVipSelectorOpen(false)}
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 font-bold bg-transparent border-none cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              /* VIP UPGRADE CHECKOUT FLOW FORM */
              <form onSubmit={submitUpgradeRequest} className="space-y-4">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <CreditCard className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">Pagar Cambio VIP</h3>
                  <p className="text-[10px] text-zinc-400 leading-tight">Completa tu pago e ingresa la referencia para mejorar a <strong className="text-purple-400">{upgradeVipLevel}</strong></p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5 text-left space-y-3">
                  <div className="flex justify-between text-[11px] border-b border-white/5 pb-2">
                    <span className="text-zinc-400 font-mono font-extrabold">Monto Fijo:</span>
                    <span className="text-white font-black">${getLevelPriceInUsd(upgradeVipLevel)} USD / {getLevelPriceInBs(upgradeVipLevel).toLocaleString()} Bs</span>
                  </div>

                  {/* Payment switcher inside upgrade selector */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setUpgradePayMethod('Pago Móvil')}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        upgradePayMethod === 'Pago Móvil'
                          ? 'bg-yellow-950/40 text-yellow-500 border-yellow-500/50'
                          : 'bg-black border-zinc-900 text-zinc-500 hover:text-zinc-400'
                      }`}
                    >
                      🇻🇪 Pago Móvil
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpgradePayMethod('USDT BEP-20')}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        upgradePayMethod === 'USDT BEP-20'
                          ? 'bg-purple-950/40 text-purple-400 border-purple-500/50'
                          : 'bg-black border-zinc-900 text-zinc-550 hover:text-zinc-400'
                      }`}
                    >
                      🪙 USDT BEP-20
                    </button>
                  </div>

                  {/* Payment details content info */}
                  {upgradePayMethod === 'Pago Móvil' ? (
                    <div className="p-2.5 rounded-xl bg-black border border-yellow-500/10 space-y-1 font-mono text-[10px] leading-relaxed text-zinc-350">
                      <div>Banco: <strong className="text-white">Consulte al Administrador</strong></div>
                      <div>Cédula: <strong className="text-white">V-00000000</strong></div>
                      <div>Teléfono: <strong className="text-white">Verifique en el Soporte</strong></div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-black border border-purple-500/10 space-y-1.5 font-mono text-[9px] leading-normal text-zinc-350 font-sans">
                      <span className="text-zinc-500 block leading-none font-sans">Dirección USDT BEP-20 (BNB Chain):</span>
                      <code className="text-purple-300 break-all select-all block py-1 px-1.5 rounded bg-zinc-950 border border-white/5 font-mono text-[8px]">0x29f0f1edd5258ee3b7553bff665df4d1dd811af0</code>
                    </div>
                  )}

                  {/* Upgrade reference input */}
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] uppercase font-mono tracking-widest text-zinc-400 font-bold block">
                      Número de Referencia Emisora *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={upgradePayMethod === 'Pago Móvil' ? 'Ej. Ref: 8295' : 'Ej. Hash de Binance'}
                      value={upgradeReferenceNo}
                      onChange={(e) => setUpgradeReferenceNo(e.target.value)}
                      className="w-full text-[11px] font-semibold bg-black border border-white/10 rounded-xl px-3 py-2 text-[#39FF14] placeholder-zinc-800 focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  {/* Upgrade File Uploder Capture */}
                  <div className="space-y-1.5 pt-0.5 text-left font-sans">
                    <label className="text-[9px] uppercase font-mono tracking-widest text-zinc-400 font-bold block">
                      Capture de Pago (Opcional)
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="flex h-9 px-3 rounded-lg border border-dashed border-zinc-700 bg-black hover:border-purple-500 hover:bg-purple-950/20 text-gray-400 hover:text-white transition-all cursor-pointer items-center justify-center text-[10px]">
                        <span>📁 Voucher Imagen</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleUpgradeFileChange}
                        />
                      </label>
                      {upgradeFileName && <span className="text-[9px] text-white truncate max-w-[120px] font-mono">{upgradeFileName}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUpgradeVipLevel(null)}
                    className="w-1/2 flex h-10 items-center justify-center rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white text-xs font-bold transition-all cursor-pointer border-none"
                  >
                    Volver Listado
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 flex h-10 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-xs font-black uppercase text-white transition-all cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.4)] border-none"
                  >
                    <Send className="h-3 w-3 text-white" />
                    <span>Enviar Pago</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* DEDICATED ADMINISTRATOR CONTROL CENTER MODAL */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-purple-500/40 bg-zinc-950 p-5 sm:p-7 shadow-2xl space-y-5 my-8">
            
            {/* Modal corner close button */}
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setIsAdminOpen(false)}
                className="h-9 w-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all cursor-pointer"
                title="Cerrar Panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Header branding & Clean Database Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-mono font-bold animate-pulse text-lg shrink-0">
                  🛠️
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                    <span>Panel de Control de Kervin</span>
                    <span className="text-[9px] font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 lowercase">propietario</span>
                  </h3>
                  <p className="text-[11px] text-zinc-500 leading-normal">Manejo centralizado de verificaciones, cobros y voces reales.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm("⚠️ ¿Estás seguro de que quieres limpiar toda la base de datos de prueba? Esto reiniciará las invitaciones, activaciones y retiros a cero en Firestore para que el portal quede listo en tiempo real para producción con 0 registrados.")) {
                    try {
                      // 1. Clear registrations in Firestore
                      for (const r of registrations) {
                        try {
                          await deleteDoc(doc(db, 'registrations', r.id));
                        } catch (e) {}
                      }
                      // 2. Clear withdrawals in Firestore
                      for (const w of withdrawHistory) {
                        try {
                          if (w.id) {
                            await deleteDoc(doc(db, 'withdrawals', w.id));
                          }
                        } catch (e) {}
                      }
                      // 3. Clear users from Firestore (except admin_tapp)
                      for (const u of allUsers) {
                        if (u.username && u.username.toLowerCase() !== 'admin_tapp') {
                          try {
                            await deleteDoc(doc(db, 'users', u.username.toLowerCase()));
                          } catch (e) {}
                        }
                      }
                      
                      // 4. Reset admin_tapp's counts locally and in Firestore
                      const resetAdmin = {
                        username: 'admin_tapp',
                        email: 'admin@tappmusic.com',
                        password: '7340',
                        vipLevel: 'VIP CORONA IMPERIAL 1000$' as VipLevel,
                        earnings: 1545.00,
                        completedTaskIds: ['task_1', 'task_2'],
                        isRegistered: true,
                        status: 'active' as const,
                        inviteCount: 0,
                        inviteCommissionsEarned: 0
                      };
                      await setDoc(doc(db, 'users', 'admin_tapp'), resetAdmin);
                      
                      // Clear local react states & LocalStorage
                      setRegistrations([]);
                      setWithdrawHistory([]);
                      setAllUsers([resetAdmin]);
                      saveProfile(resetAdmin);
                      alert("🎉 ¡Base de datos limpia y lista para usar en producción real en tiempo real con 0 registrados!");
                    } catch (err: any) {
                      console.error(err);
                      alert("Error al limpiar base de datos: " + err.message);
                    }
                  }
                }}
                className="px-3 py-1.5 rounded-lg border border-red-500/35 text-red-400 hover:bg-red-500 hover:text-white transition-all font-sans font-bold text-[10px] uppercase shrink-0"
              >
                🧹 Limpiar Base De Datos
              </button>

              {/* Adjust coins of yesterday to 367 for the 4 registered users */}
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm("⚠️ ¿Estás seguro de restablecer el progreso de ayer para los 4 registros? Esto les pondrá 367 monedas de saldo, y limpiará sus misiones de hoy para que puedan volver a hacer las tareas y conseguir sus recompensas diarias.")) {
                    try {
                      let count = 0;
                      const todayDateStr = new Date().toLocaleDateString('es-ES');
                      // Fetch all user accounts directly from Firestore
                      const snap = await getDocs(collection(db, 'users'));
                      for (const uDoc of snap.docs) {
                        const u = uDoc.data() as any;
                        if (u.username && u.username.toLowerCase() !== 'admin_tapp') {
                          const updatedUser: any = {
                            ...u,
                            earnings: 367.0,
                            completedTaskIds: [],
                            lastResetDate: todayDateStr,
                            migratedV3: true
                          };
                          await setDoc(doc(db, 'users', u.username.toLowerCase().trim()), updatedUser);
                          count++;
                        }
                      }
                      
                      // Synchronize local states instantly
                      setAllUsers(prev => {
                        return prev.map(u => {
                          if (u.username && u.username.toLowerCase() !== 'admin_tapp') {
                            return {
                              ...u,
                              earnings: 367.0,
                              completedTaskIds: [],
                              lastResetDate: todayDateStr,
                              migratedV3: true
                            };
                          }
                          return u;
                        });
                      });

                      // If current active session is a registered user, update it
                      if (userProfile.username && userProfile.username.toLowerCase() !== 'admin_tapp') {
                        const activeMigrated = {
                          ...userProfile,
                          earnings: 367.0,
                          completedTaskIds: [],
                          lastResetDate: todayDateStr,
                          migratedV3: true
                        };
                        setUserProfile(activeMigrated);
                        localStorage.setItem('tappmusic_profile', JSON.stringify(activeMigrated));
                      }

                      alert(`🎉 ¡Éxito! Se han configurado 367 monedas de saldo y se ha reiniciado el progreso de tareas para ${count} usuarios en Firestore.`);
                    } catch (err: any) {
                      console.error(err);
                      alert("Error al restaurar saldo de ayer: " + err.message);
                    }
                  }
                }}
                className="px-3 py-1.5 rounded-lg border border-yellow-500/35 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all font-sans font-bold text-[10px] uppercase shrink-0"
              >
                ✨ Reestablecer 367 Monedas (Ayer)
              </button>
            </div>

            {/* Tab switch control */}
            <div className="grid grid-cols-5 gap-1 p-1 bg-black rounded-xl border border-white/5 font-sans">
              <button
                onClick={() => setActiveAdminTab('activaciones')}
                className={`py-2 px-1 rounded-lg text-[9px] sm:text-[11px] font-black uppercase text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeAdminTab === 'activaciones'
                    ? 'bg-purple-900/55 text-[#39FF14] border border-purple-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5 shrink-0 text-purple-400" />
                <span className="truncate">Activas ({registrations.filter(r => r.status === 'pending').length})</span>
              </button>
              
              <button
                onClick={() => setActiveAdminTab('retiros')}
                className={`py-2 px-1 rounded-lg text-[9px] sm:text-[11px] font-black uppercase text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeAdminTab === 'retiros'
                    ? 'bg-purple-900/55 text-[#39FF14] border border-purple-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Trophy className="h-3.5 w-3.5 shrink-0 text-yellow-500" />
                <span className="truncate">Retiros ({withdrawHistory.filter(w => w.status === 'pendiente' || w.status === 'Pendiente').length})</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('voces')}
                className={`py-2 px-1 rounded-lg text-[9px] sm:text-[11px] font-black uppercase text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeAdminTab === 'voces'
                    ? 'bg-purple-900/55 text-[#39FF14] border border-purple-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Volume2 className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                <span className="truncate">Voces ({voiceThemes.length})</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('videos')}
                className={`py-2 px-1 rounded-lg text-[9px] sm:text-[11px] font-black uppercase text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeAdminTab === 'videos'
                    ? 'bg-purple-900/55 text-[#39FF14] border border-purple-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Gestión de Reels/Vídeos de TikTok de la Base de Datos"
              >
                <Film className="h-3.5 w-3.5 shrink-0 text-[#39FF14]" />
                <span className="truncate">Vídeos ({reels.length})</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('usuarios')}
                className={`py-2 px-1 rounded-lg text-[9px] sm:text-[11px] font-black uppercase text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeAdminTab === 'usuarios'
                    ? 'bg-purple-900/55 text-[#39FF14] border border-purple-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <span className="truncate">Usuarios ({allUsers.length})</span>
              </button>
            </div>

            {/* TAB CONTENT: ACTIVATIONS */}
            {activeAdminTab === 'activaciones' && (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                <div className="bg-purple-950/20 rounded-xl p-3 border border-purple-500/15 flex items-center gap-3 text-xs text-purple-300">
                  <div className="h-5 w-5 bg-purple-500/10 rounded-full flex items-center justify-center font-bold shrink-0">i</div>
                  <p className="leading-normal font-sans">
                    Cuando un usuario se registra, sube su capture y queda "En Espera". Al presionar <strong className="text-white">Aprobar</strong>, su cuenta se activa automáticamente en tiempo real liberando su portal de tareas.
                  </p>
                </div>

                {registrations.filter(r => r.status === 'pending').length === 0 ? (
                  <p className="text-center py-8 text-xs font-mono text-zinc-500">No hay solicitudes de activación pendientes.</p>
                ) : (
                  <div className="space-y-3">
                    {registrations.filter(r => r.status === 'pending').map((reg) => (
                      <div 
                        key={reg.id} 
                        className={`p-4 rounded-2xl border bg-black font-mono text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                          reg.status === 'approved' 
                            ? 'border-emerald-500/20 opacity-70 bg-emerald-950/5' 
                            : 'border-white/5 shadow-md hover:border-white/10'
                        }`}
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-extrabold text-[13px]">@{reg.username}</span>
                            <span className="bg-purple-950/60 text-purple-400 border border-purple-500/30 font-sans font-black text-[9px] px-2 py-0.5 rounded uppercase">
                              {reg.vipLevel}
                            </span>
                            <span className={`text-[9px] font-sans px-2 py-0.5 rounded-full font-bold uppercase leading-none ${
                              reg.status === 'approved'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                : 'bg-yellow-950 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {reg.status === 'approved' ? 'Aprobado ✅' : 'Pendiente ⌛'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-zinc-400">
                            <div>Total: <strong className="text-white">${reg.amountUsd} USD ({reg.amountBs} Bs)</strong></div>
                            <div>Método: <strong className="text-yellow-500">{reg.paymentMethodUsed}</strong></div>
                            <div className="col-span-2 truncate">Ref: <code className="text-purple-300 font-bold select-all">{reg.referenceNo}</code></div>
                            <div className="col-span-2 text-[9px] text-zinc-650">{reg.date} • {reg.email}</div>
                          </div>

                          {/* Image receipt toggle view if uploaded */}
                          {reg.proofFileBlob ? (
                            <div className="pt-2">
                              <span className="text-zinc-600 text-[10px] block mb-1">Capture Adjunto:</span>
                              <div className="rounded-lg overflow-hidden bg-zinc-950 p-1 border border-white/5 w-24">
                                <a href={reg.proofFileBlob} target="_blank" rel="noopener noreferrer" title="Ampliar Imagen">
                                  <img 
                                    src={reg.proofFileBlob} 
                                    alt="Capture depósito" 
                                    className="h-14 w-auto object-cover rounded hover:scale-105 transition-all"
                                    referrerPolicy="no-referrer"
                                  />
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="pt-2 whitespace-nowrap">
                              <span className="text-zinc-600 text-[10px] block mb-1">Capture Adjunto:</span>
                              <span className="inline-flex items-center gap-1 bg-zinc-900 border border-white/5 px-2 py-1 rounded text-zinc-500 text-[10px]">
                                📁 {reg.proofFileName || 'comprobante_banco.png'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Approvals Action buttons */}
                        <div className="flex gap-2 w-full md:w-auto shrink-0 font-sans">
                          {reg.status === 'pending' ? (
                            <>
                              <button
                                onClick={async () => {
                                  // Update status in live registrations list
                                  try {
                                    await updateDoc(doc(db, 'registrations', reg.id), { status: 'approved' });
                                  } catch (err) {
                                    console.error("Error approving registration:", err);
                                  }
                                  // Call master approve solver for database-wide activation + commissions
                                  handleApproveUser(reg.username, reg.amountUsd, reg.vipLevel);
                                }}
                                className="flex-1 md:flex-initial h-9 px-3.5 rounded-xl bg-[#39FF14] text-black font-black text-xs uppercase hover:bg-[#34e512] transition-all cursor-pointer flex items-center justify-center gap-1"
                              >
                                <span>Aprobar</span>
                              </button>
                              
                              <button
                                onClick={async () => {
                                  // Reject/Remove registration request from Firestore
                                  try {
                                    await deleteDoc(doc(db, 'registrations', reg.id));
                                    
                                    // Reset target user's profile registration status
                                    const targetUser = allUsers.find(u => u.username && reg.username && u.username.toLowerCase() === reg.username.toLowerCase());
                                    if (targetUser) {
                                      const resetUser = { ...targetUser, isRegistered: false, status: 'pending' as const };
                                      await setDoc(doc(db, 'users', reg.username.toLowerCase()), resetUser);
                                      if (reg.username === userProfile.username) {
                                        saveProfile(resetUser);
                                      }
                                    }
                                  } catch (err) {
                                    console.error("Error rejecting registration:", err);
                                  }
                                }}
                                className="h-9 px-3.5 rounded-xl bg-red-950 text-red-400 border border-red-500/30 font-black text-xs uppercase hover:bg-red-900 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                              >
                                Rechazar
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-zinc-500 font-bold uppercase py-1 px-2.5 bg-zinc-900 rounded-lg">
                              Acreditado
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: WITHDRAWALS */}
            {activeAdminTab === 'retiros' && (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                <div className="bg-indigo-950/20 rounded-xl p-3 border border-indigo-500/15 flex items-center gap-3 text-xs text-indigo-300">
                  <div className="h-5 w-5 bg-indigo-500/10 rounded-full flex items-center justify-center font-bold shrink-0">i</div>
                  <p className="leading-normal font-sans">
                    Solicitudes de retiro solicitadas en USDT. Al presionar <strong className="text-white">Aprobar</strong> se simula la transferencia de red con TxID. Al hacer clic en <strong className="text-red-400">Rechazar</strong> se cancela el abono y se reembolsan las monedas al saldo del inversionista.
                  </p>
                </div>

                {withdrawHistory.filter(w => w.status === 'pendiente' || w.status === 'Pendiente').length === 0 ? (
                  <p className="text-center py-8 text-xs font-mono text-zinc-500">No hay solicitudes de retiro pendientes.</p>
                ) : (
                  <div className="space-y-3">
                    {withdrawHistory.filter(w => w.status === 'pendiente' || w.status === 'Pendiente').map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-4 rounded-2xl border bg-black font-mono text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                          item.status === 'Aprobado' 
                            ? 'border-emerald-500/20 opacity-70 bg-emerald-950/5' 
                            : item.status === 'Rechazado'
                            ? 'border-red-500/20 opacity-70'
                            : 'border-white/5 shadow-md hover:border-white/10'
                        }`}
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-extrabold text-[12px]">Retiro #{item.id.replace('TAPP-WD-', '')}</span>
                            <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded font-sans font-bold text-[10px]">
                              {item.amountCoins} Monedas (${item.amountUsdt.toFixed(2)} USDT)
                            </span>
                            
                            {/* status pill */}
                            <span className={`text-[9px] font-sans px-2 py-0.5 rounded-full font-bold uppercase leading-none ${
                              item.status === 'Aprobado'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                : item.status === 'Rechazado'
                                ? 'bg-red-950/40 text-red-400 border border-red-500/30'
                                : 'bg-yellow-950 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {item.status}
                            </span>
                          </div>

                          <div className="space-y-1 text-[11px] text-zinc-400 leading-normal">
                            <div>Destino: <strong className="text-purple-300 font-semibold select-all break-all">{item.address}</strong></div>
                            <div>Red: <code className="text-white uppercase font-bold">{item.network || 'BEP20'}</code> • Fecha: {item.date}</div>
                            {item.txid && (
                              <div className="text-[10px] truncate max-w-sm text-zinc-550 pt-0.5 bg-zinc-950 p-1.5 rounded border border-white/5">
                                TxID Blockchain: <code className="text-purple-400 text-[9px] select-all leading-none">{item.txid}</code>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Withdraw actions */}
                        <div className="flex gap-2 w-full md:w-auto shrink-0 font-sans">
                          {(item.status === 'pendiente' || item.status === 'Pendiente') ? (
                            <>
                              <button
                                onClick={async () => {
                                  // Approve withdrawal
                                  const generatedTx = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
                                  try {
                                    await updateDoc(doc(db, 'withdrawals', item.id), {
                                      status: 'Aprobado',
                                      txid: generatedTx
                                    });
                                  } catch (err) {
                                    console.error("Approve withdrawal error:", err);
                                  }
                                }}
                                className="flex-1 md:flex-initial h-9 px-3.5 rounded-xl bg-purple-600 text-white font-black text-xs uppercase hover:bg-purple-500 transition-all cursor-pointer flex items-center justify-center"
                              >
                                Aprobar Retiro
                              </button>
                              
                              <button
                                onClick={async () => {
                                  // Reject withdrawal and refund coins to the corresponding user profile in Firestore
                                  try {
                                    await updateDoc(doc(db, 'withdrawals', item.id), {
                                      status: 'Rechazado'
                                    });
                                    
                                    const ownerName = item.username || userProfile.username;
                                    const targetUser = allUsers.find(u => u.username && ownerName && u.username.toLowerCase() === ownerName.toLowerCase());
                                    if (targetUser) {
                                      const updatedUser = {
                                        ...targetUser,
                                        earnings: Number((targetUser.earnings + item.amountUsdt).toFixed(2))
                                      };
                                      await setDoc(doc(db, 'users', ownerName.toLowerCase()), updatedUser);
                                      
                                      if (userProfile.username && ownerName && userProfile.username.toLowerCase() === ownerName.toLowerCase()) {
                                        saveProfile(updatedUser);
                                      }
                                    }
                                  } catch (err) {
                                    console.error("Error denying withdrawal:", err);
                                  }
                                }}
                                className="h-9 px-3.5 rounded-xl bg-red-950 text-red-400 border border-red-500/30 font-black text-xs uppercase hover:bg-red-900 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                                title="Negar retiro y devolver fondos de manera inmediata"
                              >
                                Negar y Reembolsar
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-zinc-500 font-bold uppercase py-1 px-2.5 bg-zinc-900 rounded-lg whitespace-nowrap select-none">
                              Completado
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: GESTION DE VOCES REALES EN LA BASE DE DATOS */}
            {activeAdminTab === 'voces' && (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                <div className="bg-purple-950/20 rounded-xl p-3 border border-purple-500/15 flex items-center justify-between gap-3 text-xs text-purple-300">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-purple-500/10 rounded-full flex items-center justify-center font-bold shrink-0">i</div>
                    <p className="leading-normal font-sans">
                      Gestión de Voces de Oradores en la Base de Datos Real de Firestore.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditingVoice(true);
                      setEditingVoiceId('');
                      setVoiceFormKey('');
                      setVoiceFormSpeaker('');
                      setVoiceFormAvatar('🎙️');
                      setVoiceFormDescription('');
                      setVoiceFormIntro('');
                      setVoiceFormPitch(1.0);
                      setVoiceFormRate(0.8);
                    }}
                    className="h-8 px-3 rounded-lg bg-[#39FF14] text-black font-sans font-black text-xs uppercase hover:bg-[#34e512] transition-all cursor-pointer flex items-center justify-center shrink-0"
                  >
                    + Nueva Voz
                  </button>
                </div>

                {/* EDITING OR CREATION FORM CONTAINER */}
                {isEditingVoice && (
                  <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-950/10 space-y-3 font-sans">
                    <h4 className="text-xs font-black uppercase text-purple-400 tracking-wider">
                      {editingVoiceId ? '✏️ Editar Orador / Voz' : '🎙️ Registrar Nuevo Orador'}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs text-zinc-300">
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Clave Única (ID/Key):</label>
                        <input
                          type="text"
                          disabled={!!editingVoiceId}
                          placeholder="p.ej. pastor_juan"
                          value={voiceFormKey}
                          onChange={(e) => setVoiceFormKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-500 text-white disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Nombre del Orador:</label>
                        <input
                          type="text"
                          placeholder="p.ej. Pastor Juan"
                          value={voiceFormSpeaker}
                          onChange={(e) => setVoiceFormSpeaker(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-500 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Avatar / Emoji:</label>
                        <input
                          type="text"
                          placeholder="🎙️, ✝️, 🏠, 🌿"
                          value={voiceFormAvatar}
                          onChange={(e) => setVoiceFormAvatar(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-500 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Breve Descripción:</label>
                        <input
                          type="text"
                          placeholder="p.ej. Voz Profunda de Fe"
                          value={voiceFormDescription}
                          onChange={(e) => setVoiceFormDescription(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-500 text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Frase de Introducción Narrada:</label>
                        <textarea
                          placeholder="Frase que dice el orador antes de leer la tarea en vivo..."
                          value={voiceFormIntro}
                          onChange={(e) => setVoiceFormIntro(e.target.value)}
                          rows={2}
                          className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-500 text-white text-xs resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Tono de Voz (Pitch: {voiceFormPitch})</label>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.05"
                          value={voiceFormPitch}
                          onChange={(e) => setVoiceFormPitch(parseFloat(e.target.value))}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Velocidad (Rate: {voiceFormRate})</label>
                        <input
                          type="range"
                          min="0.5"
                          max="1.5"
                          step="0.05"
                          value={voiceFormRate}
                          onChange={(e) => setVoiceFormRate(parseFloat(e.target.value))}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-1 font-sans text-xs">
                      <button
                        onClick={async () => {
                          const k = voiceFormKey.trim();
                          const s = voiceFormSpeaker.trim();
                          if (!k || !s) {
                            return;
                          }
                          const newVoice = {
                            id: k,
                            key: k,
                            speaker: s,
                            avatar: voiceFormAvatar.trim() || '🎙️',
                            description: voiceFormDescription.trim() || 'Voz en vivo de Abundancia',
                            intro: voiceFormIntro.trim() || 'Escucha esta sagrada alianza de amor: ',
                            pitch: voiceFormPitch,
                            rate: voiceFormRate,
                            color: k === 'mentalidad' ? 'border-[#39FF14]/30 text-[#39FF14] bg-[#39FF14]/5' : k === 'jesus' ? 'border-purple-500/30 text-purple-300 bg-purple-500/5' : k === 'dios' ? 'border-amber-500/30 text-amber-300 bg-amber-500/5' : 'border-pink-500/30 text-pink-300 bg-pink-500/5',
                            badgeColor: k === 'mentalidad' ? 'bg-zinc-900 text-[#39FF14] border-[#39FF14]/40' : k === 'jesus' ? 'bg-purple-950/40 text-purple-300 border-purple-500/30' : k === 'dios' ? 'bg-amber-950/40 text-amber-300 border-amber-500/30' : 'bg-pink-950/40 text-pink-300 border-pink-500/30',
                            shadow: k === 'mentalidad' ? 'shadow-[0_0_15px_rgba(57,255,20,0.3)]' : k === 'jesus' ? 'shadow-[0_0_15px_rgba(168,85,247,0.3)]' : k === 'dios' ? 'shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'shadow-[0_0_15px_rgba(236,72,153,0.3)]',
                          };
                          try {
                            await setDoc(doc(db, 'voices', k), newVoice);
                            // Live update of state so it reflects instantly!
                            setVoiceThemes(prev => {
                              const exists = prev.some(v => v.id === k);
                              if (exists) {
                                return prev.map(v => v.id === k ? { id: k, ...newVoice } : v);
                              } else {
                                return [...prev, { id: k, ...newVoice }];
                              }
                            });
                            setIsEditingVoice(false);
                          } catch (err) {
                            console.error("Error saving voice:", err);
                          }
                        }}
                        className="flex-1 h-9 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold uppercase transition-all cursor-pointer"
                      >
                        {editingVoiceId ? 'Guardar Cambios' : 'Registrar'}
                      </button>
                      <button
                        onClick={() => setIsEditingVoice(false)}
                        className="px-4 h-9 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 font-bold uppercase hover:text-white transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* VOICES LIST TABLE */}
                <div className="space-y-3 font-mono text-xs">
                  {voiceThemes.length === 0 ? (
                    <p className="text-center py-8 text-zinc-500">Cargando la base de datos de voces...</p>
                  ) : (
                    voiceThemes.map((v) => (
                      <div 
                        key={v.id} 
                        className="p-3 rounded-xl border border-white/5 bg-zinc-950/40 flex items-center justify-between gap-3 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{v.avatar || '🎙️'}</span>
                          <div>
                            <h4 className="text-white font-black text-sm">{v.speaker}</h4>
                            <p className="text-[10px] text-zinc-500 leading-normal mb-0.5">{v.description}</p>
                            <p className="text-[10px] text-purple-400 italic font-sans truncate max-w-xs">{v.intro}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 font-sans">
                          <button
                            onClick={() => {
                              setIsEditingVoice(true);
                              setEditingVoiceId(v.id);
                              setVoiceFormKey(v.key);
                              setVoiceFormSpeaker(v.speaker);
                              setVoiceFormAvatar(v.avatar || '🎙️');
                              setVoiceFormDescription(v.description || '');
                              setVoiceFormIntro(v.intro || '');
                              setVoiceFormPitch(v.pitch || 1.0);
                              setVoiceFormRate(v.rate || 0.8);
                            }}
                            className="h-7 px-2.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-[10px] transition-all border border-white/5 cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await deleteDoc(doc(db, 'voices', v.id));
                                // Live update of state so it reflects instantly!
                                setVoiceThemes(prev => prev.filter(item => item.id !== v.id));
                                if (isEditingVoice && editingVoiceId === v.id) {
                                  setIsEditingVoice(false);
                                }
                              } catch (err) {
                                console.error("Error deleting voice:", err);
                              }
                            }}
                            className="h-7 px-2.5 rounded bg-red-950/30 text-red-400 border border-red-500/10 text-[10px] font-bold hover:bg-red-900 hover:text-white transition-all cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: GESTION DE VIDEOS/REELS EN LA BASE DE DATOS */}
            {activeAdminTab === 'videos' && (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 text-left">
                <div className="bg-purple-950/20 rounded-xl p-3.5 border border-purple-500/15 text-xs text-purple-300">
                  <h4 className="font-extrabold uppercase text-[#39FF14] tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 animate-pulse text-yellow-300" />
                    Guía de Enlaces de TikTok y Reels
                  </h4>
                  <p className="leading-relaxed font-sans">
                    Hermanito, para colocar videos de TikTok sin marca de agua: descarga el video en algún sitio como <strong className="text-white">ssstik.io</strong> o <strong className="text-white">snaptik.app</strong>, copia el enlace del botón de "Descargar sin marca de agua" (que termina en <code className="text-yellow-400 font-mono">.mp4</code> o es un CDN directo) y pégalo aquí abajo en <strong>Enlace de Video (MP4)</strong>. ¡Se reproducirá en tiempo real para todos los usuarios de ese nivel VIP!
                  </p>
                </div>

                {/* TOGGLE FORM BUTTON */}
                <div className="flex justify-between items-center bg-zinc-950/40 p-2 rounded-xl border border-white/5">
                  <span className="text-[11px] text-zinc-400 font-mono">Total de videos en la nube: <strong className="text-white">{reels.length}</strong></span>
                  <button
                    onClick={() => {
                      if (isEditingReel) {
                        setIsEditingReel(false);
                      } else {
                        setIsEditingReel(true);
                        setEditingReelId('');
                        setReelFormTitle('');
                        setReelFormCaption('');
                        setReelFormArtist('Tappmusic Divine');
                        setReelFormCoverUrl('https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=400&q=80');
                        setReelFormVideoUrl('');
                        setReelFormVipLevel('VIP PLATA 10$');
                        setReelFormCategory('Video de Fe');
                      }
                    }}
                    className="flex items-center gap-1 h-8 px-3 rounded-lg bg-[#39FF14]/10 hover:bg-[#39FF14]/20 border border-[#39FF14]/30 text-[#39FF14] text-[10px] font-black uppercase transition-all cursor-pointer"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>{isEditingReel && !editingReelId ? 'Cerrar Registro' : 'Nuevo Video / Reel'}</span>
                  </button>
                </div>

                {/* REEL REGISTRATION/EDIT FORM */}
                {isEditingReel && (
                  <div className="p-4 rounded-xl border border-purple-500/20 bg-zinc-950/80 space-y-4 animate-fade-in text-xs font-mono">
                    <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#39FF14] font-black border-b border-white/5 pb-2">
                      {editingReelId ? `✏️ EDITAR VIDEO VIP (ID: ${editingReelId})` : '✨ REGISTRAR ENLACE DE VIDEO TIKTOK'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Title */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold block">Título del Video / Mensaje</label>
                        <input
                          type="text"
                          placeholder="Ej. Fe Inquebrantable 🕊️"
                          value={reelFormTitle}
                          onChange={(e) => setReelFormTitle(e.target.value)}
                          className="w-full text-[11px] bg-black border border-white/10 rounded-lg px-3 py-2 text-[#39FF14] focus:outline-none focus:border-[#39FF14]"
                        />
                      </div>

                      {/* Artist */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold block">Creador / Predicador</label>
                        <input
                          type="text"
                          placeholder="Ej. Hermano Kervin"
                          value={reelFormArtist}
                          onChange={(e) => setReelFormArtist(e.target.value)}
                          className="w-full text-[11px] bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#39FF14]"
                        />
                      </div>
                    </div>

                    {/* Caption */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold block">Revelación del Video / Versículo / Subtítulo</label>
                      <input
                        type="text"
                        placeholder="Ej. Aunque pases por el fuego, yo estaré contigo. No temas, porque yo soy tu Dios."
                        value={reelFormCaption}
                        onChange={(e) => setReelFormCaption(e.target.value)}
                        className="w-full text-[11px] bg-black border border-white/10 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* VIP Required */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold block">Rango VIP Requerido</label>
                        <select
                          value={reelFormVipLevel}
                          onChange={(e) => setReelFormVipLevel(e.target.value as VipLevel)}
                          className="w-full h-8 px-2 bg-black border border-white/10 rounded-lg text-white font-sans text-xs focus:outline-none animate-none"
                        >
                          <option value="VIP PLATA 10$">VIP PLATA 10$</option>
                          <option value="VIP ORO 20$">VIP ORO 20$</option>
                          <option value="VIP RUBÍ 40$">VIP RUBÍ 40$</option>
                          <option value="VIP DIAMANTE 120$">VIP DIAMANTE 120$</option>
                          <option value="VIP PLATINO 420$">VIP PLATINO 420$</option>
                          <option value="VIP CORONA IMPERIAL 1000$">VIP CORONA IMPERIAL 1000$</option>
                        </select>
                      </div>

                      {/* Category */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold block">Categoría Vocal / Tema</label>
                        <select
                          value={reelFormCategory}
                          onChange={(e) => setReelFormCategory(e.target.value as any)}
                          className="w-full h-8 px-2 bg-black border border-white/10 rounded-lg text-white font-sans text-xs focus:outline-none animate-none"
                        >
                          <option value="Video de Fe">Video de Fe (Solemne / Dios)</option>
                          <option value="Familia">Familia (Hogar / Valores)</option>
                          <option value="Mentalidad">Mentalidad (Abundancia / Éxito)</option>
                          <option value="Video Musical">Video Musical (Alabanzas / Ritmos)</option>
                        </select>
                      </div>
                    </div>

                    {/* Image URL & Video URL */}
                    <div className="space-y-3">
                      {/* Cover URL */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold block">Enlace de Imagen de Portada (Miniatura)</label>
                        <input
                          type="text"
                          placeholder="Ej. https://images.unsplash.com/photo-..."
                          value={reelFormCoverUrl}
                          onChange={(e) => setReelFormCoverUrl(e.target.value)}
                          className="w-full text-[11px] bg-black border border-white/10 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none"
                        />
                      </div>

                      {/* Video URL */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono tracking-wider text-[#39FF14] font-black block">💡 Enlace de Video (URL Directa MP4 de TikTok)</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. https://v16-webapp-prime.tiktokcdn-us.com/video.mp4"
                          value={reelFormVideoUrl}
                          onChange={(e) => setReelFormVideoUrl(e.target.value)}
                          className="w-full text-[11px] bg-black border border-purple-500/50 rounded-lg px-3 py-2 text-[#39FF14] focus:outline-none focus:border-[#39FF14] font-bold"
                        />
                        <span className="text-[9px] text-zinc-500 font-sans block mt-1">
                          Pega aquí el enlace de descarga MP4 directo que obtienes al descargar sin marca de agua.
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!reelFormVideoUrl.trim() || !reelFormTitle.trim()) {
                            alert("Por favor rellene el título y el enlace directo de video (MP4).");
                            return;
                          }
                          const rId = editingReelId || `reel_${Date.now()}`;
                          const newReel: Reel = {
                            id: rId,
                            title: reelFormTitle.trim(),
                            caption: reelFormCaption.trim(),
                            artist: reelFormArtist.trim() || 'Tappmusic Divine',
                            coverUrl: reelFormCoverUrl.trim() || 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=400&q=80',
                            videoUrl: reelFormVideoUrl.trim(),
                            vipLevel: reelFormVipLevel,
                            category: reelFormCategory,
                            likes: 124,
                            commentsCount: 12,
                            duration: '0:30'
                          };
                          try {
                            await setDoc(doc(db, 'reels', rId), newReel);
                            setIsEditingReel(false);
                            setEditingReelId('');
                            alert("✅ ¡Éxito! El video/reel de TikTok ha sido guardado perfectamente en Firebase.");
                          } catch (err: any) {
                            console.error("Error saving reel:", err);
                            alert("Error al guardar reel: " + err.message);
                          }
                        }}
                        className="flex-1 h-9 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold uppercase transition-all cursor-pointer font-sans"
                      >
                        {editingReelId ? 'Guardar Cambios' : 'Registrar Nuevo Video'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingReel(false);
                          setEditingReelId('');
                        }}
                        className="px-4 h-9 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 font-bold uppercase hover:text-white transition-all cursor-pointer font-sans"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* REELS LIST TABLE */}
                <div className="space-y-3 font-mono text-xs">
                  {reels.length === 0 ? (
                    <p className="text-center py-8 text-zinc-500 font-sans">Cargando base de datos de videos...</p>
                  ) : (
                    reels.map((r) => (
                      <div 
                        key={r.id} 
                        className="p-3 rounded-xl border border-white/5 bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div 
                            className="h-10 w-10 rounded-lg bg-cover bg-center border border-white/10 shrink-0"
                            style={{ backgroundImage: `url(${r.coverUrl})` }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-white font-black text-xs truncate max-w-xs">{r.title}</h4>
                              <span className="text-[8px] bg-purple-950/80 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded-full font-sans font-bold">
                                {r.vipLevel}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 truncate max-w-sm">Texto de fe: {r.caption || 'Ninguno'}</p>
                            <p className="text-[8px] text-[#39FF14] truncate max-w-xs block select-all font-mono">Url: {r.videoUrl}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 font-sans self-end sm:self-auto">
                          <button
                            onClick={() => {
                              setIsEditingReel(true);
                              setEditingReelId(r.id);
                              setReelFormTitle(r.title);
                              setReelFormCaption(r.caption || '');
                              setReelFormArtist(r.artist || '');
                              setReelFormCoverUrl(r.coverUrl || '');
                              setReelFormVideoUrl(r.videoUrl);
                              setReelFormVipLevel(r.vipLevel);
                              setReelFormCategory(r.category || 'Video de Fe');
                            }}
                            className="h-7 px-2.5 rounded bg-zinc-950 hover:bg-zinc-900 text-zinc-300 font-bold text-[10px] transition-all border border-white/10 cursor-pointer flex items-center gap-1"
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>Editar Link</span>
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm("¿Estás seguro de que quieres eliminar este video/reel de la base de datos de la plataforma?")) {
                                try {
                                  await deleteDoc(doc(db, 'reels', r.id));
                                  alert("Video eliminado con éxito.");
                                } catch (err: any) {
                                  alert("Error: " + err.message);
                                }
                              }
                            }}
                            className="h-7 px-2.5 rounded bg-red-950/30 text-red-400 border border-red-500/10 text-[10px] font-bold hover:bg-red-900 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: GESTION DE USUARIOS EN LA BASE DE DATOS */}
            {activeAdminTab === 'usuarios' && (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 text-left">
                <div className="bg-emerald-950/20 rounded-xl p-3 border border-emerald-500/15 flex items-center gap-3 text-xs text-emerald-300">
                  <div className="h-5 w-5 bg-emerald-500/10 rounded-full flex items-center justify-center font-bold shrink-0">i</div>
                  <p className="leading-normal font-sans">
                    <strong>Panel de Control Directo de Usuarios:</strong> Modifica el nivel VIP, edita monedas manualmente, consulta las contraseñas, o elimina cuentas definitivamente de la base de datos de manera inmediata.
                  </p>
                </div>

                {/* SEARCH BAR */}
                <div className="relative font-sans">
                  <input
                    type="text"
                    placeholder="🔍 Buscar por username o correo..."
                    value={adminUserSearch}
                    onChange={(e) => setAdminUserSearch(e.target.value)}
                    className="w-full text-xs font-mono bg-zinc-950 border border-white/10 rounded-xl pl-4 pr-16 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#39FF14]"
                  />
                  {adminUserSearch && (
                    <button 
                      onClick={() => setAdminUserSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs select-none hover:underline cursor-pointer"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {allUsers.filter(u => {
                    if (!u.username) return false;
                    const query = adminUserSearch.toLowerCase().trim();
                    if (!query) return true;
                    return (
                      u.username.toLowerCase().includes(query) ||
                      (u.email && u.email.toLowerCase().includes(query))
                    );
                  }).length === 0 ? (
                    <p className="text-center py-8 text-xs text-zinc-500">Ningún usuario coincide con los criterios de búsqueda.</p>
                  ) : (
                    allUsers.filter(u => {
                      if (!u.username) return false;
                      const query = adminUserSearch.toLowerCase().trim();
                      if (!query) return true;
                      return (
                        u.username.toLowerCase().includes(query) ||
                        (u.email && u.email.toLowerCase().includes(query))
                      );
                    }).map((u) => {
                      const isOwner = u.username.toLowerCase().trim() === 'admin_tapp';
                      return (
                        <div 
                          key={u.username}
                          className="p-4 rounded-2xl border border-white/5 bg-black/45 space-y-3 hover:border-white/10 transition-all"
                        >
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div>
                              <span className="text-white font-extrabold text-[13px]">@{u.username}</span>
                              {u.invitedBy && (
                                <span className="text-[10px] text-zinc-500 ml-2 font-normal block sm:inline">
                                  Invitado por: <strong className="text-zinc-400">@{u.invitedBy}</strong>
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <span className={`text-[9px] font-sans px-2 py-0.5 rounded uppercase font-black ${
                                (u.isRegistered && u.status === 'active')
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' 
                                  : u.isRegistered
                                    ? 'bg-yellow-950 text-yellow-500 border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.15)]'
                                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                              }`}>
                                {(u.isRegistered && u.status === 'active')
                                  ? 'Aprobado/Activo'
                                  : u.isRegistered
                                    ? 'Pendiente de Activación ⌛'
                                    : 'Elegible/Registro'}
                              </span>
                              {isOwner && (
                                <span className="bg-purple-950 text-purple-400 border border-purple-500/30 text-[9px] font-sans px-2 py-0.5 rounded font-bold uppercase">
                                  Propietario
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-400 bg-zinc-950/40 p-2.5 rounded-lg border border-white/5">
                            <div>Email: <strong className="text-zinc-300 select-all">{u.email || 'N/A'}</strong></div>
                            <div>Contraseña: <strong className="text-yellow-500 select-all">{u.password || 'N/A'}</strong></div>
                            <div>VIP Actual: <strong className="text-purple-300 uppercase font-bold">{u.vipLevel}</strong></div>
                            <div>Comisiones: <strong className="text-[#39FF14]">{u.inviteCommissionsEarned || 0} USD</strong></div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 bg-zinc-950/80 p-3 rounded-xl border border-white/5 sm:items-end">
                            {/* VIP Select */}
                            <div className="flex-1 min-w-[130px]">
                              <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Cambiar Rango VIP</label>
                              <select
                                value={u.vipLevel || 'VIP PLATA 10$'}
                                disabled={isOwner}
                                onChange={async (e) => {
                                  const newLvl = e.target.value as VipLevel;
                                  const updatedUser = { 
                                    ...u, 
                                    vipLevel: newLvl,
                                    isRegistered: true,
                                    status: 'active' as const
                                  };
                                  try {
                                    await setDoc(doc(db, 'users', u.username.toLowerCase().trim()), updatedUser);
                                    setAllUsers(prev => prev.map(usr => usr.username.toLowerCase() === u.username.toLowerCase() ? updatedUser : usr));
                                    if (userProfile.username && u.username && userProfile.username.toLowerCase() === u.username.toLowerCase()) {
                                      saveProfile(updatedUser);
                                    }
                                    alert(`✅ ¡El rango VIP de @${u.username} ha sido cambiado a ${newLvl}!`);
                                  } catch (err: any) {
                                    alert("Error actualizando VIP: " + err.message);
                                  }
                                }}
                                className="w-full text-[11px] font-mono bg-black border border-white/10 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-purple-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <option value="VIP PLATA 10$">Cobros Plata (10$)</option>
                                <option value="VIP ORO 20$">Cobros Oro (20$)</option>
                                <option value="VIP RUBÍ 40$">Cobros Rubí (40$)</option>
                                <option value="VIP DIAMANTE 120$">Cobros Diamante (120$)</option>
                                <option value="VIP PLATINO 420$">Cobros Platino (420$)</option>
                                <option value="VIP CORONA IMPERIAL 1000$">Corona Imperial (1000$)</option>
                              </select>
                            </div>

                            {/* Coins Editor */}
                            <div className="flex-1 min-w-[140px]">
                              <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Editar Saldo Monedas</label>
                              <div className="flex gap-1.5">
                                <input
                                  type="number"
                                  step="0.1"
                                  className="w-full text-[11px] font-mono bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-purple-500"
                                  defaultValue={u.earnings}
                                  id={`coins-edit-${u.username.toLowerCase().trim()}`}
                                />
                                <button
                                  onClick={async () => {
                                    const el = document.getElementById(`coins-edit-${u.username.toLowerCase().trim()}`) as HTMLInputElement;
                                    if (el) {
                                      const newCoins = parseFloat(el.value);
                                      if (!isNaN(newCoins)) {
                                        const updatedUser = { ...u, earnings: newCoins };
                                        try {
                                          await setDoc(doc(db, 'users', u.username.toLowerCase().trim()), updatedUser);
                                          setAllUsers(prev => prev.map(usr => usr.username.toLowerCase() === u.username.toLowerCase() ? updatedUser : usr));
                                          if (userProfile.username && u.username && userProfile.username.toLowerCase() === u.username.toLowerCase()) {
                                            saveProfile(updatedUser);
                                          }
                                          alert(`✅ ¡Saldo de @${u.username} actualizado a ${newCoins} monedas!`);
                                        } catch (err: any) {
                                          alert("Error actualizando saldo: " + err.message);
                                        }
                                      }
                                    }
                                  }}
                                  className="h-8 px-3 bg-[#39FF14] text-black font-sans font-bold text-[10px] uppercase rounded-lg hover:bg-[#34e512] transition-all cursor-pointer whitespace-nowrap flex items-center justify-center font-sans font-bold text-[9px]"
                                >
                                  Guardar
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions (such as activation details or delete account) */}
                          <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-lg border border-white/5 gap-2 flex-wrap">
                            <span className="text-[10px] text-zinc-500">Acciones rápidas para este usuario:</span>
                            <div className="flex gap-2">
                              {(!u.isRegistered || u.status !== 'active') && (
                                <button
                                  onClick={async () => {
                                    const updatedUser = { 
                                      ...u, 
                                      isRegistered: true,
                                      status: 'active' as const
                                    };
                                    try {
                                      await setDoc(doc(db, 'users', u.username.toLowerCase().trim()), updatedUser);
                                      setAllUsers(prev => prev.map(usr => usr.username.toLowerCase() === u.username.toLowerCase() ? updatedUser : usr));
                                      alert(`✅ @${u.username} ha sido ACTIVADO exitosamente sin necesidad de comprobantes.`);
                                    } catch (err: any) {
                                      alert("Error de activación: " + err.message);
                                    }
                                  }}
                                  className="h-7 px-2.5 bg-[#39FF14] text-black font-extrabold text-[10px] uppercase rounded hover:bg-[#34e512] transition-all cursor-pointer flex items-center justify-center shadow-[0_0_10px_rgba(57,255,20,0.2)]"
                                >
                                  {u.isRegistered ? 'Activar Cuenta' : 'Activar Manualmente'}
                                </button>
                              )}
                              
                              {!isOwner && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm(`⚠️ ¿Estás COMPLETAMENTE seguro de ELIMINAR al usuario @${u.username}? Esta acción es irreversible y borrará su cuenta y sus datos de Firestore.`)) {
                                      if (window.confirm(`⚠️ Escribe el nombre del usuario ("${u.username}") para confirmar la eliminación definitiva:`)) {
                                        try {
                                          await deleteDoc(doc(db, 'users', u.username.toLowerCase().trim()));
                                          setAllUsers(prev => prev.filter(usr => usr.username.toLowerCase() !== u.username.toLowerCase()));
                                          alert(`✅ ¡Usuario @${u.username} eliminado de la base de datos!`);
                                        } catch (err: any) {
                                          alert("Error al eliminar usuario: " + err.message);
                                        }
                                      }
                                    }
                                  }}
                                  className="h-7 px-2.5 bg-red-950/20 text-red-400 border border-red-500/10 text-[9px] uppercase rounded font-bold hover:bg-red-900 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                                >
                                  Eliminar Cuenta
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Modal footer closing */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5 font-mono text-[10px] text-zinc-500">
              <span>Sincronizado vía LocalStorage</span>
              <button
                onClick={() => setIsAdminOpen(false)}
                className="text-white font-sans font-bold hover:underline"
              >
                Cerrar Panel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
