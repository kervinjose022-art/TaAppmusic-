import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import PromoShareCard from './components/PromoShareCard';
import BrainLogo from './components/BrainLogo';
import VipTasks from './components/VipTasks';
import VipReels from './components/VipReels';
import WithdrawalCalendar from './components/WithdrawalCalendar';
import P2PExchangePortal from './components/P2PExchangePortal';
import { UserProfile, VipLevel, Reel, RecoveryRequest } from './types';
import { 
  Sparkles, ShieldCheck, Share2, CircleAlert, Globe, X, 
  Check, Copy, MessageSquare, Send, Trophy, Flame, UserCheck, Play, ArrowRight, Lock, Eye, EyeOff, Users, CreditCard, Volume2, Film, PlusCircle, Trash2, Edit2,
  Smartphone, Download
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, onSnapshot, setDoc, getDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { REELS_DATABASE } from './data';
// @ts-ignore
import tappmusicLogo from './assets/images/logo_tappmusic_1781384373669.jpg';

export default function App() {
  const [authUser, setAuthUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return () => unsubscribe();
  }, []);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedModalLink, setCopiedModalLink] = useState(false);
  const [isVipSelectorOpen, setIsVipSelectorOpen] = useState(false);
  const [isP2PExchangeOpen, setIsP2PExchangeOpen] = useState(() => {
    return window.location.search.includes('p2p=true') || 
           window.location.hash === '#p2p' || 
           window.location.pathname === '/p2p' ||
           window.location.pathname.startsWith('/p2p');
  });
  const [guestTab, setGuestTab] = useState<'login' | 'register'>('login');
  
  // Track if we have synced the active user profile with Firestore in this page session
  const hasSyncedWithFirestore = useRef(false);

  // App URLs & Constants
  const sharedUrl = 'https://ais-pre-efepkfwykzkok6uvpgwtks-582716975968.us-east1.run.app';

  // User profile state persistent in React state (initially unregistered or registered)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('tappmusic_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username && parsed.username.toLowerCase().trim() !== 'usuario_vip' && parsed.username.toLowerCase().trim() !== 'visitante_tapp') {
          return parsed;
        }
      } catch (e) {
        // Fallback
      }
    }
    return {
      username: 'visitante_tapp',
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

  // State for real-time withdraw calendar configuration
  const [withdrawConfig, setWithdrawConfig] = useState<any>(() => {
    const saved = localStorage.getItem('tappmusic_withdraw_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch (e) {}
    }
    return {
      enabled: true,
      allowedDays: [], // empty by default to prevent weekday confusion
      allowedDates: [],
      allowedMonthDays: [10, 20, 30],
      apkDownloadUrl: 'https://drive.google.com/file/d/1TqGkx8aglLR2SyKsi6L-eOW-QBUeeHr5/view?usp=drivesdk'
    };
  });

  useEffect(() => {
    localStorage.setItem('tappmusic_withdraw_config', JSON.stringify(withdrawConfig));
  }, [withdrawConfig]);

  // Fail-safe State to handle Firestore daily free quota limit exceeded elegantly
  const [isQuotaExceeded, setIsQuotaExceeded] = useState<boolean>(() => {
    const saved = localStorage.getItem('tappmusic_quota_exceeded');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('tappmusic_quota_exceeded', isQuotaExceeded ? 'true' : 'false');
  }, [isQuotaExceeded]);

  // Zoom level state for responsive scale (acercar y alejar)
  const [zoomScale, setZoomScale] = useState<number>(() => {
    const saved = localStorage.getItem('tappmusic_zoom');
    if (saved) {
      const val = parseFloat(saved);
      if (!isNaN(val) && val >= 0.70 && val <= 1.40) {
        return val;
      }
    }
    return 1.0;
  });

  const [showApkGuide, setShowApkGuide] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('tappmusic_zoom', zoomScale.toString());
  }, [zoomScale]);

  useEffect(() => {
    (window as any).showVipFlyer = () => {
      setAdminZoomImage("/assets/tappmusic_vip_flyer.jpg");
    };
    return () => {
      delete (window as any).showVipFlyer;
    };
  }, []);

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
                  if (savedObj.username && savedObj.username.toLowerCase().trim() !== 'usuario_vip' && savedObj.username.toLowerCase().trim() !== 'visitante_tapp' && savedObj.username.toLowerCase() === u.username.toLowerCase()) {
                    setUserProfile(migratedUser);
                    localStorage.setItem('tappmusic_profile', JSON.stringify(migratedUser));
                  }
                } catch (e) {}
              }
            }
          }
        }

        // Commissions Integration Migration V4:
        // Add existing legacy inviteCommissionsEarned (in USD, multiplied by 734 to convert to coins)
        // directly to the user's main coin balance "earnings", and set commissionsMergedV4 to true.
        if (!usersSnap.empty) {
          for (const uDoc of usersSnap.docs) {
            const u = uDoc.data() as any;
            if (u.username && !u.commissionsMergedV4) {
              const legacyCommissionsUsd = u.inviteCommissionsEarned || 0;
              if (legacyCommissionsUsd > 0) {
                const commissionCoins = Number((legacyCommissionsUsd * 734).toFixed(2));
                const newEarnings = Number(((u.earnings || 0) + commissionCoins).toFixed(2));
                
                await setDoc(doc(db, 'users', u.username.toLowerCase().trim()), {
                  earnings: newEarnings,
                  commissionsMergedV4: true
                }, { merge: true });

                // Sync current active local profile if it matches
                const savedProfileStr = localStorage.getItem('tappmusic_profile');
                if (savedProfileStr) {
                  try {
                    const savedObj = JSON.parse(savedProfileStr) as UserProfile;
                    if (savedObj.username && savedObj.username.toLowerCase().trim() === u.username.toLowerCase().trim()) {
                      const updatedLocal = {
                        ...savedObj,
                        earnings: newEarnings,
                        commissionsMergedV4: true
                      };
                      setUserProfile(updatedLocal);
                      localStorage.setItem('tappmusic_profile', JSON.stringify(updatedLocal));
                    }
                  } catch (e) {}
                }
              } else {
                // No legacy commissions, just mark as merged
                await setDoc(doc(db, 'users', u.username.toLowerCase().trim()), {
                  commissionsMergedV4: true
                }, { merge: true });
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
      snapshot.forEach((docSnap) => {
        items.push({ ...docSnap.data(), id: docSnap.id });
      });
      // Direct assignment ensures deleted registrations are instantly cleared from local state
      setRegistrations(items);
    }, (error) => {
      console.error("Firestore listening registrations error:", error);
      setIsQuotaExceeded(true);
    });

    // 3. Setup real-time listener for withdrawals collection
    const unsubWithdrawals = onSnapshot(collection(db, 'withdrawals'), (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...docSnap.data(), id: docSnap.id });
      });
      // Direct assignment ensures deleted/completed withdrawals are perfectly in sync
      setWithdrawHistory(items);
    }, (error) => {
      console.error("Firestore listening withdrawals error:", error);
      setIsQuotaExceeded(true);
    });

    // 4. Setup real-time listener for users collection
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const items: UserProfile[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as UserProfile);
      });
      if (items.length > 0) {
        setAllUsers(prev => {
          // Filter local master users pool to keep only users that exist in the database (or the default admin_tapp)
          const filtered = prev.filter(u => {
            if (!u.username) return false;
            if (u.username.toLowerCase().trim() === 'admin_tapp') return true;
            return items.some(item => item.username && item.username.toLowerCase().trim() === u.username.toLowerCase().trim());
          });

          // Merge Firestore users' updated values
          const merged = [...filtered];
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
            if (parsed.username && parsed.username.toLowerCase().trim() !== 'usuario_vip' && parsed.username.toLowerCase().trim() !== 'visitante_tapp') {
              const updatedProfile = items.find(u => u.username && parsed.username && u.username.toLowerCase().trim() === parsed.username.toLowerCase().trim());
              if (updatedProfile) {
                hasSyncedWithFirestore.current = true;
                setUserProfile(prevProfile => {
                  const vipLevelChanged = prevProfile.vipLevel !== updatedProfile.vipLevel;
                  const statusChanged = prevProfile.status !== updatedProfile.status;
                  const inviteCountChanged = prevProfile.inviteCount !== updatedProfile.inviteCount;
                  const inviteCommissionsChanged = prevProfile.inviteCommissionsEarned !== updatedProfile.inviteCommissionsEarned;
                  const blockChanged = prevProfile.blockedTasksUntilDate !== updatedProfile.blockedTasksUntilDate;
                  
                  // For earnings and completedTaskIds, we only want to update them from the database
                  // if we haven't synced yet (initial sync), OR if the local state is empty/unset.
                  // This completely prevents the race condition/rollback loop when completing tasks!
                  const isInitialSync = !hasSyncedWithFirestore.current;
                  const localIsEmpty = !prevProfile.completedTaskIds || prevProfile.completedTaskIds.length === 0;
                  
                  const earningsChanged = isInitialSync || localIsEmpty ? (prevProfile.earnings !== updatedProfile.earnings) : false;
                  const prevTasksStr = [...(prevProfile.completedTaskIds || [])].sort().join(',');
                  const updatedTasksStr = [...(updatedProfile.completedTaskIds || [])].sort().join(',');
                  const tasksChanged = isInitialSync || localIsEmpty ? (prevTasksStr !== updatedTasksStr) : false;

                  if (earningsChanged || vipLevelChanged || statusChanged || inviteCountChanged || inviteCommissionsChanged || tasksChanged || blockChanged) {
                    return {
                      ...prevProfile,
                      status: updatedProfile.status,
                      vipLevel: updatedProfile.vipLevel,
                      blockedTasksUntilDate: updatedProfile.blockedTasksUntilDate,
                      inviteCount: updatedProfile.inviteCount !== undefined ? updatedProfile.inviteCount : prevProfile.inviteCount,
                      inviteCommissionsEarned: updatedProfile.inviteCommissionsEarned !== undefined ? updatedProfile.inviteCommissionsEarned : prevProfile.inviteCommissionsEarned,
                      earnings: (isInitialSync || localIsEmpty) ? updatedProfile.earnings : prevProfile.earnings,
                      completedTaskIds: (isInitialSync || localIsEmpty) ? (updatedProfile.completedTaskIds || []) : prevProfile.completedTaskIds,
                      ...(isInitialSync ? updatedProfile : {})
                    };
                  }
                  return prevProfile;
                });
              }
            }
          } catch (e) {}
        }
      }
    }, (error) => {
      console.error("Firestore listening users error:", error);
      setIsQuotaExceeded(true);
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
      setIsQuotaExceeded(true);
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
      setIsQuotaExceeded(true);
    });

    // 7. Setup real-time listener for withdrawals calendar configuration
    const unsubWithdrawalConfig = onSnapshot(doc(db, 'config', 'withdrawals'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let needsUpdate = false;
        
        // Auto-initialize the brand new Google Drive APK Link for real-time remote configuration
        if (!data.apkDownloadUrl) {
          data.apkDownloadUrl = 'https://drive.google.com/file/d/1TqGkx8aglLR2SyKsi6L-eOW-QBUeeHr5/view?usp=drivesdk';
          needsUpdate = true;
        }

        // Auto-initialize the secure deposit address
        if (!data.depositAddress) {
          data.depositAddress = '0x29f0f1edd5258ee3b7553bff665df4d1dd811af0';
          needsUpdate = true;
        }

        // Self-healing: If there are leftover weekdays or missing allowedMonthDays, automatically clear them
        // and set the standard 10, 20, and 30 of each month to avoid user confusion.
        if ((data.allowedDays && data.allowedDays.length > 0) || !data.hasOwnProperty('allowedMonthDays')) {
          data.allowedDays = [];
          data.allowedDates = data.allowedDates || [];
          data.allowedMonthDays = [10, 20, 30];
          needsUpdate = true;
        }

        if (needsUpdate) {
          setDoc(doc(db, 'config', 'withdrawals'), data).catch(err => {
            console.warn("Could not sync/repair withdrawals in Firestore:", err);
          });
        }
        setWithdrawConfig(data);
      } else {
        const defaultVal = {
          enabled: true,
          allowedDays: [], // Only month days 10, 20, 30
          allowedDates: [],
          allowedMonthDays: [10, 20, 30],
          apkDownloadUrl: 'https://drive.google.com/file/d/1TqGkx8aglLR2SyKsi6L-eOW-QBUeeHr5/view?usp=drivesdk',
          depositAddress: '0x29f0f1edd5258ee3b7553bff665df4d1dd811af0'
        };
        setDoc(doc(db, 'config', 'withdrawals'), defaultVal).catch(err => {
          console.warn("Could not seed config/withdrawals in Firestore:", err);
        });
        setWithdrawConfig(defaultVal);
      }
    }, (error) => {
      console.error("Firestore listening config/withdrawals error:", error);
      setIsQuotaExceeded(true);
    });

    // 8. Setup real-time listener for recovery_requests collection
    const unsubRecoveryRequests = onSnapshot(collection(db, 'recovery_requests'), (snapshot) => {
      const items: RecoveryRequest[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as RecoveryRequest);
      });
      setRecoveryRequests(items);
    }, (error) => {
      console.error("Firestore listening recovery_requests error:", error);
      setIsQuotaExceeded(true);
    });

    return () => {
      unsubRegistrations();
      unsubWithdrawals();
      unsubUsers();
      unsubVoices();
      unsubReels();
      unsubWithdrawalConfig();
      unsubRecoveryRequests();
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
    // If they already have administrator profile loaded, auto-verify
    const cur = localStorage.getItem('tappmusic_profile');
    if (cur) {
      try {
        const u = JSON.parse(cur);
        const emailLower = u.email ? u.email.toLowerCase().trim() : '';
        const userLower = u.username ? u.username.toLowerCase().trim() : '';
        if (
          emailLower === 'admin@tappmusic.com' || 
          userLower === 'admin_tapp' || 
          emailLower === 'socios@orinocop2p.com' || 
          userLower === 'orinoco_admin' ||
          emailLower === 'kervinjose022@gmail.com' ||
          userLower === 'kervin'
        ) return true;
      } catch (e) {}
    }
    return false;
  });
  const [showAdminCodePrompt, setShowAdminCodePrompt] = useState(false);
  const [adminUnlockCode, setAdminUnlockCode] = useState('');

  // Automatically synchronize active admin session UID in Firestore
  useEffect(() => {
    let active = true;
    if (isAdminVerified && authUser) {
      const savedProfile = localStorage.getItem('tappmusic_profile');
      let enteredPass = '7340';
      let currentAdminUsername = 'admin_tapp';
      if (savedProfile) {
        try {
          const u = JSON.parse(savedProfile);
          const isAdminUser = u && (
            (u.username && u.username.toLowerCase().trim() === 'admin_tapp') || 
            (u.email && u.email.toLowerCase().trim() === 'admin@tappmusic.com') ||
            (u.username && u.username.toLowerCase().trim() === 'orinoco_admin') ||
            (u.email && u.email.toLowerCase().trim() === 'socios@orinocop2p.com') ||
            (u.email && u.email.toLowerCase().trim() === 'kervinjose022@gmail.com') ||
            (u.username && u.username.toLowerCase().trim() === 'kervin')
          );
          if (isAdminUser) {
            if (u.username) {
              currentAdminUsername = u.username.toLowerCase().trim();
            }
            if (u.password && (u.password === '7340' || u.password === '26304421' || u.password === '7341')) {
              enteredPass = u.password;
            } else {
              enteredPass = '7340';
            }
          }
        } catch (e) {}
      }
      setDoc(doc(db, 'config', 'admin_session'), {
        uid: authUser.uid,
        adminPassword: enteredPass,
        updatedAt: new Date().toISOString()
      }).catch(err => {
        console.warn("Could not sync admin session to Firestore:", err);
      });

      // ALSO sync uid to the actual user document so we have a super robust fallback
      const cleanAdminName = currentAdminUsername.toLowerCase().trim();
      getDoc(doc(db, 'users', cleanAdminName)).then((snap) => {
        if (snap.exists()) {
          const uData = snap.data();
          if (uData.uid !== authUser.uid) {
            updateDoc(doc(db, 'users', cleanAdminName), {
              uid: authUser.uid
            }).catch(e => console.warn("Could not sync uid directly to user doc:", e));
          }
        } else {
          // If the admin user document doesn't exist, create it!
          setDoc(doc(db, 'users', cleanAdminName), {
            username: cleanAdminName,
            password: enteredPass,
            uid: authUser.uid,
            status: 'active',
            vipLevel: 'VIP CORONA IMPERIAL 1000$',
            earnings: 1000.00,
            isRegistered: true,
            createdAt: new Date().toISOString()
          }).catch(e => console.warn("Could not create admin user doc with uid:", e));
        }
      });
    }
    return () => {
      active = false;
    };
  }, [isAdminVerified, authUser]);

  // Synchronous and on-demand helper to force sync admin session before any sensitive write
  const ensureAdminSessionSync = async () => {
    if (!isAdminVerified) return;

    let currentAuthUser = authUser || auth.currentUser;
    if (!currentAuthUser) {
      try {
        const credential = await signInAnonymously(auth);
        currentAuthUser = credential.user;
        setAuthUser(currentAuthUser);
      } catch (err) {
        console.warn("Could not sign in anonymously on-demand:", err);
      }
    }

    if (currentAuthUser) {
      const savedProfile = localStorage.getItem('tappmusic_profile');
      let enteredPass = '7340';
      let currentAdminUsername = 'admin_tapp';
      if (savedProfile) {
        try {
          const u = JSON.parse(savedProfile);
          const isAdminUser = u && (
            (u.username && u.username.toLowerCase().trim() === 'admin_tapp') || 
            (u.email && u.email.toLowerCase().trim() === 'admin@tappmusic.com') ||
            (u.username && u.username.toLowerCase().trim() === 'orinoco_admin') ||
            (u.email && u.email.toLowerCase().trim() === 'socios@orinocop2p.com') ||
            (u.email && u.email.toLowerCase().trim() === 'kervinjose022@gmail.com') ||
            (u.username && u.username.toLowerCase().trim() === 'kervin')
          );
          if (isAdminUser) {
            if (u.username) {
              currentAdminUsername = u.username.toLowerCase().trim();
            }
            if (u.password && (u.password === '7340' || u.password === '26304421' || u.password === '7341')) {
              enteredPass = u.password;
            } else {
              enteredPass = '7340';
            }
          }
        } catch (e) {}
      }
      try {
        await setDoc(doc(db, 'config', 'admin_session'), {
          uid: currentAuthUser.uid,
          adminPassword: enteredPass,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Could not write config/admin_session:", err);
      }

      const cleanAdminName = currentAdminUsername.toLowerCase().trim();
      try {
        await setDoc(doc(db, 'users', cleanAdminName), {
          uid: currentAuthUser.uid
        }, { merge: true });
      } catch (e) {
        console.warn("Could not force sync uid to user doc:", e);
      }
    }
  };

  // VIP Upgrade Request States
  const [upgradeVipLevel, setUpgradeVipLevel] = useState<VipLevel | null>(null);
  const [upgradePayMethod, setUpgradePayMethod] = useState<'Pago Móvil' | 'USDT BEP-20'>('USDT BEP-20');
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

  // Password Recovery States
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const [recoverUsername, setRecoverUsername] = useState('');
  const [recoverEmailConfirm, setRecoverEmailConfirm] = useState('');
  const [foundRecoverUser, setFoundRecoverUser] = useState<UserProfile | null>(null);
  const [recoverStep, setRecoverStep] = useState(1); // 1 = input username, 2 = confirm email, 3 = show/reset password, 4 = complete
  const [recoverError, setRecoverError] = useState('');
  const [recoverSuccess, setRecoverSuccess] = useState('');
  const [newRecoverPassword, setNewRecoverPassword] = useState('');
  const [isRecoverSubmitting, setIsRecoverSubmitting] = useState(false);

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
      if (hasSyncedWithFirestore.current && userProfile.username && userProfile.username.toLowerCase().trim() !== 'usuario_vip' && userProfile.username.toLowerCase().trim() !== 'visitante_tapp') {
        const userDocRef = doc(db, 'users', userProfile.username.toLowerCase().trim());
        setDoc(userDocRef, userProfile).catch(err => {
          console.warn("Background setDoc failed for userProfile:", err);
        });
      }
    }
  }, [userProfile]);

  // Automatic Daily Task Reset Engine
  useEffect(() => {
    if (userProfile && userProfile.isRegistered && userProfile.username && userProfile.username.toLowerCase().trim() !== 'usuario_vip' && userProfile.username.toLowerCase().trim() !== 'visitante_tapp') {
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
    if (newProfile && newProfile.username && newProfile.username.toLowerCase().trim() !== 'usuario_vip' && newProfile.username.toLowerCase().trim() !== 'visitante_tapp') {
      setDoc(doc(db, 'users', newProfile.username.toLowerCase().trim()), newProfile).catch(err => {
        // Background sync fail silent
      });
    }
  };

  // $1.50 Flat VIP Commission Payout engine
  const addCommissionToReferrer = (referrerUsername: string, level: VipLevel) => {
    const commissionUsd = 1.50;
    
    setAllUsers(prev => {
      const updatedList = prev.map(u => {
        if (u.username && u.username.toLowerCase() === referrerUsername.toLowerCase()) {
          const currentCommissions = u.inviteCommissionsEarned || 0;
          const currentCount = u.inviteCount || 0;
          const commissionCoins = Number((commissionUsd * 734).toFixed(2));
          const updatedUser = {
            ...u,
            earnings: Number((u.earnings + commissionCoins).toFixed(2)),
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
  const [registrationPayMethod, setRegistrationPayMethod] = useState<'Pago Móvil' | 'USDT BEP-20'>('USDT BEP-20');
  const [inputReferenceNo, setInputReferenceNo] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');
  const [previewBlob, setPreviewBlob] = useState('');
  const [copiedAddressFeedback, setCopiedAddressFeedback] = useState(false);
  const [copiedPhoneFeedback, setCopiedPhoneFeedback] = useState(false);
  const [copiedIdFeedback, setCopiedIdFeedback] = useState(false);

  // Admin section states
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'activaciones' | 'retiros' | 'voces' | 'usuarios' | 'videos' | 'recuperaciones'>('activaciones');
  const [recoveryRequests, setRecoveryRequests] = useState<RecoveryRequest[]>(() => {
    const saved = localStorage.getItem('tappmusic_recovery_requests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('tappmusic_recovery_requests', JSON.stringify(recoveryRequests));
  }, [recoveryRequests]);
  const [adminUserSearch, setAdminUserSearch] = useState('');
  const [adminRegSearch, setAdminRegSearch] = useState('');
  const [adminUserFilter, setAdminUserFilter] = useState<'todos' | 'activos' | 'pendientes'>('todos');
  const [adminZoomImage, setAdminZoomImage] = useState<string | null>(null);

  // Voice database state (initialized with default voices for instant local fallback)
  const [voiceThemes, setVoiceThemes] = useState<any[]>(() => {
    const saved = localStorage.getItem('tappmusic_voices');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
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
  });

  useEffect(() => {
    localStorage.setItem('tappmusic_voices', JSON.stringify(voiceThemes));
  }, [voiceThemes]);

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
  const [reels, setReels] = useState<Reel[]>(() => {
    const saved = localStorage.getItem('tappmusic_reels');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('tappmusic_reels', JSON.stringify(reels));
  }, [reels]);
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

  // PNG Logo conversion for Android app icon (WebIntoApp compliance)
  const [processedPngUrl, setProcessedPngUrl] = useState<string>('');

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = tappmusicLogo;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 256, 256);
        ctx.drawImage(img, 0, 0, 256, 256);
        try {
          const pngData = canvas.toDataURL('image/png');
          setProcessedPngUrl(pngData);
        } catch (e) {
          console.error("Canvas export failed:", e);
        }
      }
    };
  }, []);

  const convertAndDownloadPng = () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = tappmusicLogo;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 256, 256);
        ctx.drawImage(img, 0, 0, 256, 256);
        try {
          const pngUrl = canvas.toDataURL('image/png');
          setProcessedPngUrl(pngUrl);
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = 'tappmusic_logo_256.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          alert("⚡ ¡Excelente hermanito! Hemos procesado y convertido el logo de TAPP MUSIC a formato PNG de 256x256 píxeles con un peso super ligero (15-20 KB). Se ha iniciado la descarga. ¡Ya puedes subir este archivo directamente a WebIntoApp sin ningún error! 🎉");
        } catch (err) {
          console.error("DataURL conversion error:", err);
          alert("❌ Error al convertir la imagen. Por favor mantén presionada la imagen para guardarla.");
        }
      }
    };
  };

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

  const getLevelPriceInUsd = (lvl: VipLevel | string): number => {
    if (!lvl) return 10;
    // Strip everything except numeric values first to see if a value was directly embedded
    // e.g. "VIP ORO (20 USDT)" -> "20", "VIP PLATA 10$" -> "10"
    const digitsOnly = lvl.toString().replace(/[^0-9]/g, '');
    const num = parseInt(digitsOnly, 10);
    if (!isNaN(num) && num > 0) {
      return num;
    }
    const s = lvl.toUpperCase();
    if (s.includes('PLATA')) return 10;
    if (s.includes('ORO')) return 20;
    if (s.includes('RUBÍ') || s.includes('RUBI')) return 40;
    if (s.includes('DIAMANTE')) return 120;
    if (s.includes('PLATINO')) return 420;
    if (s.includes('CORONA')) return 1000;
    return 10;
  };

  const getLevelPriceInBs = (lvl: VipLevel | string): number => {
    const usd = getLevelPriceInUsd(lvl);
    return usd * 734;
  };

  const getInviteCount = (): number => {
    const cleanProfileUser = userProfile.username ? userProfile.username.replace(/^@/, '').toLowerCase().trim() : '';
    const referredUsers = allUsers.filter(u => {
      if (!u.invitedBy || u.status !== 'active') return false; // Count ONLY accepted active referred users!
      const cleanInviter = u.invitedBy.replace(/^@/, '').toLowerCase().trim();
      return cleanInviter === cleanProfileUser;
    });
    let count = Math.max(userProfile.inviteCount || 0, referredUsers.length);
    if (userProfile.username && (userProfile.username.toLowerCase() === 'admin_tapp' || userProfile.username.toLowerCase() === 'orinoco_admin') && count < 4) {
      count = 4;
    }
    return count;
  };

  const getInviteCommissions = (): number => {
    const cleanProfileUser = userProfile.username ? userProfile.username.replace(/^@/, '').toLowerCase().trim() : '';
    const referredActiveUsers = allUsers.filter(u => {
      if (!u.invitedBy || u.status !== 'active') return false;
      const cleanInviter = u.invitedBy.replace(/^@/, '').toLowerCase().trim();
      return cleanInviter === cleanProfileUser;
    });
    
    let totalCommissions = 0;
    referredActiveUsers.forEach(u => {
      totalCommissions += 1.50;
    });

    let earned = Math.max(userProfile.inviteCommissionsEarned || 0, totalCommissions);
    if (userProfile.username && (userProfile.username.toLowerCase() === 'admin_tapp' || userProfile.username.toLowerCase() === 'orinoco_admin') && earned < 6.00) {
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

      // Block registering under system placeholder or protected accounts
      if (['usuario_vip', 'visitante_tapp', 'admin_tapp', 'invitado_vip'].includes(name)) {
        alert("❌ Este nombre de usuario es reservado o protegido. Por favor, elige otro nombre de usuario.");
        return;
      }

      // Prevent overwriting existing user data by checking duplicate username or email
      const nameExists = allUsers.some(u => u.username && u.username.toLowerCase() === name);
      const emailExists = allUsers.some(u => u.email && u.email.toLowerCase() === emailLower);

      if (nameExists || emailExists) {
        alert("❌ Este nombre de usuario o correo ya está registrado en Tappmusic.com. Por favor, inicia sesión con tu cuenta actual usando la opción de abajo.");
        return;
      }

      if (!attachedFileName || !previewBlob) {
        alert("⚠️ Por favor, carga el Capture de pago o Voucher para completar tu registro.");
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
        createdAt: new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        commissionsMergedV4: true,
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
      alert("⚡ ¡Registro de Membresía VIP Enviado! Tu solicitud de depósito está siendo verificada por el Administrador para activar tu casilla VIP.");
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

    if (['usuario_vip', 'visitante_tapp', 'invitado_vip'].includes(inputVal)) {
      setLoginError('❌ Esta cuenta es reservada/temporal y no se puede usar para iniciar sesión.');
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

    const isAdminUser = (foundUser.username && foundUser.username.toLowerCase().trim() === 'admin_tapp') || 
                        (foundUser.email && foundUser.email.toLowerCase().trim() === 'admin@tappmusic.com') ||
                        (foundUser.username && foundUser.username.toLowerCase().trim() === 'orinoco_admin') ||
                        (foundUser.email && foundUser.email.toLowerCase().trim() === 'socios@orinocop2p.com') ||
                        (foundUser.email && foundUser.email.toLowerCase().trim() === 'kervinjose022@gmail.com') ||
                        (foundUser.username && foundUser.username.toLowerCase().trim() === 'kervin');

    const isMasterPassword = passVal === '7340' || passVal === '7341' || passVal === '26304421';

    if (
      foundUser.password !== passVal && 
      !(isAdminUser && isMasterPassword)
    ) {
      setLoginError('❌ Contraseña incorrecta.');
      return;
    }

    // Ensure status is active and update password preferred choice ONLY for admin_tapp
    if (isAdminUser && foundUser.username.toLowerCase() === 'admin_tapp') {
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

  const handleVerifyRecoveryUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverError('');
    setIsRecoverSubmitting(true);
    
    const userKey = recoverUsername.toLowerCase().trim();
    if (!userKey) {
      setRecoverError('❌ Por favor, ingresa tu usuario o correo electrónico.');
      setIsRecoverSubmitting(false);
      return;
    }

    try {
      // Find in local react cached users first or fetch from Firestore
      let dbUser = allUsers.find(u => 
        (u.username && u.username.toLowerCase().trim() === userKey) || 
        (u.email && u.email.toLowerCase().trim() === userKey)
      );
      
      if (!dbUser) {
        // Fallback check Firestore directly by username
        const userSnap = await getDoc(doc(db, 'users', userKey));
        if (userSnap.exists()) {
          dbUser = userSnap.data() as UserProfile;
        }
      }
      
      if (!dbUser) {
        setRecoverError('❌ No se encontró ninguna cuenta con ese usuario o correo.');
      } else {
        setFoundRecoverUser(dbUser);
        setRecoverStep(2); // Move directly to validation & new password input
      }
    } catch (err) {
      console.error("Error retrieving user for recovery:", err);
      setRecoverError('❌ El servidor está ocupado. Inténtalo de nuevo en unos momentos.');
    } finally {
      setIsRecoverSubmitting(false);
    }
  };

  const handleConfirmEmailAndSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverError('');
    setRecoverSuccess('');
    setIsRecoverSubmitting(true);
    
    if (!foundRecoverUser) {
      setRecoverError('❌ Cuenta de usuario no cargada.');
      setIsRecoverSubmitting(false);
      return;
    }
    
    const enteredEmail = recoverEmailConfirm.trim().toLowerCase();
    const storedEmail = (foundRecoverUser.email || '').trim().toLowerCase();
    const desiredPass = newRecoverPassword.trim();
    
    if (!enteredEmail) {
      setRecoverError('❌ Por favor, ingresa el correo de la cuenta.');
      setIsRecoverSubmitting(false);
      return;
    }
    
    if (!desiredPass || desiredPass.length < 4) {
      setRecoverError('❌ La nueva clave debe tener al menos 4 caracteres.');
      setIsRecoverSubmitting(false);
      return;
    }
    
    if (enteredEmail !== storedEmail) {
      setRecoverError('❌ El correo electrónico ingresado no coincide con el registrado en esta cuenta.');
      setIsRecoverSubmitting(false);
      return;
    }

    try {
      const usernameLower = foundRecoverUser.username.toLowerCase().trim();
      const requestRef = doc(db, 'recovery_requests', usernameLower);
      const requestData = {
        id: usernameLower,
        username: foundRecoverUser.username,
        email: enteredEmail,
        requestedAt: new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'pending',
        requestedNewPassword: desiredPass,
        oldPassword: foundRecoverUser.password || 'N/A'
      };
      
      await setDoc(requestRef, requestData);
      setRecoverSuccess('⚡ ¡Solicitud enviada con éxito al Panel de Administración! Tu correo coincide con nuestros registros. Tan pronto como el equipo de soporte verifique y apruebe tu solicitud en su panel, tu nueva clave se activará al instante.');
      setRecoverStep(4);
    } catch (err) {
      console.error("Error creating recovery request:", err);
      setRecoverError('❌ Error al registrar solicitud. Comprueba tu conexión de red.');
    } finally {
      setIsRecoverSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverError('');
    setRecoverSuccess('');
    setIsRecoverSubmitting(true);
    
    if (!foundRecoverUser) return;
    
    const passwordToSet = newRecoverPassword.trim();
    if (!passwordToSet || passwordToSet.length < 4) {
      setRecoverError('❌ La contraseña debe tener al menos 4 caracteres.');
      setIsRecoverSubmitting(false);
      return;
    }

    try {
      const userKey = foundRecoverUser.username.toLowerCase().trim();
      const updatedUser: UserProfile = {
        ...foundRecoverUser,
        password: passwordToSet
      };
      
      // Clean any undefined fields before writing to Firestore
      Object.keys(updatedUser).forEach(key => {
        if ((updatedUser as any)[key] === undefined) {
          delete (updatedUser as any)[key];
        }
      });

      await setDoc(doc(db, 'users', userKey), updatedUser);
      
      // Update local react states
      setAllUsers(prev => prev.map(u => u.username && u.username.toLowerCase().trim() === userKey ? updatedUser : u));
      
      // If original logged in profile matches, update localstorage / profile state
      if (userProfile && userProfile.username.toLowerCase().trim() === userKey) {
        saveProfile(updatedUser);
      }
      
      setRecoverSuccess('🎉 ¡Contraseña actualizada con éxito! Ahora puedes iniciar sesión.');
      setRecoverStep(4); // completion screen
    } catch (err) {
      console.error("Error setting new password in Firestore:", err);
      setRecoverError('❌ Error al actualizar en la base de datos. Inténtalo de nuevo.');
    } finally {
      setIsRecoverSubmitting(false);
    }
  };

  const resetRecoveryStates = () => {
    setIsRecoveringPassword(false);
    setRecoverUsername('');
    setRecoverEmailConfirm('');
    setFoundRecoverUser(null);
    setRecoverStep(1);
    setRecoverError('');
    setRecoverSuccess('');
    setNewRecoverPassword('');
  };

  const handleRequestAdminRecovery = async () => {
    if (!foundRecoverUser) return;
    setRecoverError('');
    setIsRecoverSubmitting(true);
    
    try {
      const usernameLower = foundRecoverUser.username.toLowerCase().trim();
      const requestRef = doc(db, 'recovery_requests', usernameLower);
      const requestData = {
        id: usernameLower,
        username: foundRecoverUser.username,
        email: foundRecoverUser.email || 'N/A',
        requestedAt: new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'pending',
        oldPassword: foundRecoverUser.password || 'N/A'
      };
      
      await setDoc(requestRef, requestData);
      setRecoverSuccess('⚡ ¡Solicitud de ayuda enviada con éxito! Tu petición ha sido registrada en el panel del administrador. Él podrá visualizar tu clave actual o cambiarla por ti.');
      setRecoverStep(4);
    } catch (err) {
      console.error("Error creating recovery request:", err);
      setRecoverError('❌ Error del servidor al registrar la solicitud. Comunícate directamente con soporte.');
    } finally {
      setIsRecoverSubmitting(false);
    }
  };

  const handleResolveRecovery = async (username: string, newPass: string) => {
    if (!newPass.trim()) {
      alert("⚠️ Por favor ingresa una nueva contraseña válida.");
      return;
    }
    try {
      await ensureAdminSessionSync();
      const usernameLower = username.toLowerCase().trim();
      const userRef = doc(db, 'users', usernameLower);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const uData = userSnap.data() as UserProfile;
        const updatedUser = { ...uData, password: newPass.trim() };
        await setDoc(userRef, updatedUser);
        
        // Also remove the recovery request from queue
        await deleteDoc(doc(db, 'recovery_requests', usernameLower));
        
        // Update local users list state
        setAllUsers(prev => prev.map(u => u.username && u.username.toLowerCase().trim() === usernameLower ? updatedUser : u));
        
        alert(`✅ Contraseña de @${username} restablecida con éxito a "${newPass}" y solicitud resuelta.`);
      } else {
        alert("⚠️ El usuario no existe en la colección de perfiles.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error al restablecer la contraseña en Firestore: " + err.message);
    }
  };

  const handleApproveUser = async (regUsername: string, regAmountUsd: number, regVipLevel?: string) => {
    const targetName = regUsername.toLowerCase().trim();
    let dbSuccess = false;
    
    try {
      let userData: UserProfile | null = null;
      
      // Look up locally first to avoid database-blocking dependencies
      const localUser = allUsers.find(u => u.username && u.username.toLowerCase().trim() === targetName);
      if (localUser) {
        userData = { ...localUser };
      } else {
        // Fallback: Non-blocking attempt to read from Firestore
        try {
          await ensureAdminSessionSync();
          const userSnap = await getDoc(doc(db, 'users', targetName));
          if (userSnap.exists()) {
            userData = userSnap.data() as UserProfile;
          }
        } catch (dbErr) {
          console.warn("Could not read user profile from Firestore:", dbErr);
        }
      }
      
      // If user profile does not exist, reconstruct it from matched registration data
      if (!userData) {
        const matchedReg = registrations.find(r => r.username && r.username.toLowerCase().trim() === targetName);
        
        let startEarnings = 10.00;
        const targetVip = regVipLevel ? (regVipLevel as VipLevel) : ('VIP PLATA 10$' as VipLevel);
        if (targetVip === 'VIP ORO 20$') startEarnings = 20.00;
        else if (targetVip === 'VIP RUBÍ 40$') startEarnings = 40.00;
        else if (targetVip === 'VIP DIAMANTE 120$') startEarnings = 120.00;
        else if (targetVip === 'VIP PLATINO 420$') startEarnings = 420.00;
        else if (targetVip === 'VIP CORONA IMPERIAL 1000$') startEarnings = 1000.00;

        userData = {
          username: regUsername.trim(),
          email: matchedReg && matchedReg.email ? matchedReg.email : `${targetName}@gmail.com`,
          password: '12345', // Standard default password fallback
          vipLevel: targetVip,
          earnings: startEarnings,
          completedTaskIds: [],
          isRegistered: true,
          status: 'pending',
          paymentMethodUsed: matchedReg && matchedReg.paymentMethodUsed ? matchedReg.paymentMethodUsed : 'USDT BEP-20',
          proofFileName: matchedReg && matchedReg.proofFileName ? matchedReg.proofFileName : '',
          proofFileBlob: matchedReg && matchedReg.proofFileBlob ? matchedReg.proofFileBlob : '',
          referenceNo: matchedReg && matchedReg.referenceNo ? matchedReg.referenceNo : '',
          inviteCommissionsEarned: 0,
          inviteCount: 0,
          invitedBy: matchedReg && matchedReg.invitedBy ? matchedReg.invitedBy : '',
          createdAt: matchedReg && matchedReg.date ? matchedReg.date : new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      
      if (userData) {
        // 1. Activate approved user and promote tier if specified
        const targetVip = regVipLevel ? (regVipLevel as VipLevel) : userData.vipLevel;
        // Consider commission already paid if commissionPaid is true OR user was already active!
        const isAlreadyPaid = !!userData.commissionPaid || userData.status === 'active';
        
        // Detect if they had already completed tasks today and are upgrading/changing their VIP level
        const hasDoneTasksToday = userData.completedTaskIds && userData.completedTaskIds.length > 0;
        const isUpgrade = userData.vipLevel !== targetVip;
        const todayDateStr = new Date().toLocaleDateString('es-ES');

        const activatedTarget: UserProfile = { 
          ...userData, 
          status: 'active' as const,
          vipLevel: targetVip,
          commissionPaid: true,
          ...(hasDoneTasksToday && isUpgrade ? { blockedTasksUntilDate: todayDateStr } : {})
        };
        
        // Clean any undefined properties to satisfy Firestore setDoc constraints
        Object.keys(activatedTarget).forEach(key => {
          if ((activatedTarget as any)[key] === undefined) {
            delete (activatedTarget as any)[key];
          }
        });

        // Update allUsers local state immediately
        setAllUsers(prev => {
          const index = prev.findIndex(u => u.username && u.username.toLowerCase().trim() === targetName);
          if (index !== -1) {
            return prev.map((u, idx) => idx === index ? activatedTarget : u);
          } else {
            return [...prev, activatedTarget];
          }
        });

        // If currently logged in user is being approved, update session state
        if (userProfile.username && userProfile.username.toLowerCase().trim() === targetName) {
          setUserProfile(activatedTarget);
          localStorage.setItem('tappmusic_profile', JSON.stringify(activatedTarget));
        }

        // Attempt Firestore write
        try {
          await ensureAdminSessionSync();
          const userRef = doc(db, 'users', targetName);
          await setDoc(userRef, activatedTarget);
          dbSuccess = true;
        } catch (dbErr) {
          console.warn("Could not save approved user to Firestore (using offline fallback):", dbErr);
          setIsQuotaExceeded(true);
        }
        
        // 2. Pay 15% commission if referrer exists and was not already paid
        if (userData.invitedBy && !isAlreadyPaid) {
          const referrerName = userData.invitedBy.toLowerCase().trim();
          
          let referrerUser: UserProfile | null = null;
          const localReferrer = allUsers.find(u => u.username && u.username.toLowerCase().trim() === referrerName);
          if (localReferrer) {
            referrerUser = { ...localReferrer };
          } else {
            try {
              const referrerSnap = await getDoc(doc(db, 'users', referrerName));
              if (referrerSnap.exists()) {
                referrerUser = referrerSnap.data() as UserProfile;
              }
            } catch (dbErr) {
              console.warn("Could not read referrer from Firestore:", dbErr);
            }
          }
          
          if (referrerUser) {
            const commissionEarned = 1.50;
            const commissionEarnedCoins = Number((commissionEarned * 734).toFixed(2));
            const updatedReferrer = {
              ...referrerUser,
              earnings: Number((referrerUser.earnings + commissionEarnedCoins).toFixed(2)),
              inviteCommissionsEarned: Number(((referrerUser.inviteCommissionsEarned || 0) + commissionEarned).toFixed(2)),
              inviteCount: (referrerUser.inviteCount || 0) + 1
            };

            // Clean any undefined properties to satisfy Firestore setDoc constraints
            Object.keys(updatedReferrer).forEach(key => {
              if ((updatedReferrer as any)[key] === undefined) {
                delete (updatedReferrer as any)[key];
              }
            });

            // Local state updates for referrer immediately
            setAllUsers(prev => prev.map(u => u.username && u.username.toLowerCase().trim() === referrerName ? updatedReferrer : u));
            
            if (userProfile.username && userProfile.username.toLowerCase().trim() === referrerName) {
              setUserProfile(updatedReferrer);
              localStorage.setItem('tappmusic_profile', JSON.stringify(updatedReferrer));
            }

            try {
              await setDoc(doc(db, 'users', referrerName), updatedReferrer);
            } catch (dbErr) {
              console.warn("Could not save updated referrer to Firestore (using offline fallback):", dbErr);
              setIsQuotaExceeded(true);
            }
          }
        }
      }
    } catch (err) {
      console.error("handleApproveUser error:", err);
    }
    return dbSuccess;
  };

  // Self-healing check for approved registrations with missing/inactive user accounts in the master database
  useEffect(() => {
    let active = true;
    const healApprovedUsers = async () => {
      if (registrations.length === 0 || allUsers.length === 0) return;
      const approvedRegs = registrations.filter(r => r.status === 'approved' && r.username);
      for (const reg of approvedRegs) {
        if (!active) break;
        const targetLower = reg.username.toLowerCase().trim();
        const existing = allUsers.find(u => u.username && u.username.toLowerCase().trim() === targetLower);
        if (!existing || existing.status !== 'active') {
          console.log(`Auto-healing and activating profile for approved user: @${reg.username}`);
          await handleApproveUser(reg.username, reg.amountUsd || 10, reg.vipLevel);
        }
      }
    };
    healApprovedUsers();
    return () => {
      active = false;
    };
  }, [registrations, allUsers]);

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

    if (!upgradeFileName || !upgradeFileBlob) {
      alert("⚠️ Por favor, carga el Capture de pago o Voucher para completar tu solicitud de upgrade.");
      return;
    }

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

    alert(`⚡ Solicitud de Cambio VIP a ${upgradeVipLevel} enviada con éxito. El Equipo de Verificación de Tappmusic validará tu depósito para activar el rango.`);
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
      username: 'visitante_tapp',
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

  const robustCopyToClipboard = (text: string): boolean => {
    try {
      // Try standards API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      console.warn("navigator.clipboard failed, trying fallback:", e);
    }
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error("Fallback copy failed:", err);
      return false;
    }
  };

  const copyModalLink = () => {
    const inviteLink = userProfile.isRegistered && userProfile.username !== 'usuario_vip' && userProfile.username !== 'visitante_tapp'
      ? `${sharedUrl}/?ref=${userProfile.username}`
      : sharedUrl;
    const ok = robustCopyToClipboard(inviteLink);
    if (ok) {
      setCopiedModalLink(true);
      setTimeout(() => setCopiedModalLink(false), 2000);
    } else {
      alert(`Copia manual del enlace: ${inviteLink}`);
    }
  };

  const isCurrentlyStandalone = window.location.search.includes('p2p=true') || 
                                window.location.hash === '#p2p' || 
                                window.location.pathname === '/p2p' ||
                                window.location.pathname.startsWith('/p2p');

  if (isP2PExchangeOpen || isCurrentlyStandalone) {
    return (
      <P2PExchangePortal 
        onClose={() => {
          setIsP2PExchangeOpen(false);
          try {
            if (isCurrentlyStandalone) {
              window.history.pushState({}, '', window.location.origin);
            }
          } catch (e) {
            console.warn("Could not clean URL:", e);
          }
        }} 
        isStandalone={isCurrentlyStandalone}
      />
    );
  }

  return (
    <div className="min-h-screen bg-venezuela-sky text-[#39FF14] pb-16 antialiased selection:bg-[#39FF14] selection:text-black" style={{ zoom: zoomScale } as React.CSSProperties}>
      {/* Tricolor Cielo Banner - Venezuela Flag Glow */}
      <div className="w-full h-1 flex select-none sticky top-0 z-50">
        <div className="h-full bg-[#f8d117] shadow-[0_0_8px_#f8d117]" style={{ width: '33.33%' }} />
        <div className="h-full bg-[#0039a6] shadow-[0_0_8px_#0039a6]" style={{ width: '33.33%' }} />
        <div className="h-full bg-[#ce1126] shadow-[0_0_8px_#ce1126]" style={{ width: '33.34%' }} />
      </div>

      {/* Dynamic Administrator floating check bar */}
      {isAdminVerified && (
        <div className="sticky top-0 z-50 bg-[#121214] border-b border-[#39FF14]/30 py-2.5 px-6 flex flex-col sm:flex-row gap-2 justify-between items-center text-xs font-mono animate-fade-in shadow-[0_0_15px_rgba(57,255,20,0.1)]">
          <div className="flex items-center gap-2 text-zinc-400 text-center sm:text-left">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] leading-tight select-none text-zinc-355 text-zinc-300">
              SESIÓN DE ADMINISTRADOR ACTIVA • <strong className="text-emerald-400 font-bold uppercase tracking-widest">SOPORTE PRINCIPAL</strong>
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
              onClick={() => setIsP2PExchangeOpen(true)}
              className="flex items-center gap-1.5 bg-[#39FF14] text-neutral-950 hover:bg-[#39FF14]/80 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider cursor-pointer transition-all active:scale-95 whitespace-nowrap uppercase"
              title="Iniciar modulo P2P cambiario de prueba"
            >
              📈 CANAL MERCADO P2P ➔
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
        apkDownloadUrl={withdrawConfig?.apkDownloadUrl}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-8 text-center">
        
        {/* CENTERED BRANDING LOGO & LED SLOGAN AREA */}
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-4 max-w-xl mx-auto">
          {/* Centered Golden & Purple rotating brain with headphones logo */}
          <BrainLogo size="md" />

          {/* Glowing New Project P2P Announcement Badge */}
          {isAdminVerified && (
            <button 
              onClick={() => setIsP2PExchangeOpen(true)}
              className="inline-flex items-center gap-2 bg-[#39FF14]/10 hover:bg-[#39FF14]/25 border border-[#39FF14]/30 text-[#39FF14] text-[11px] font-black tracking-tight px-3.5 py-1.5 rounded-full transition-all duration-150 active:scale-95 shadow-[0_0_15px_rgba(57,255,20,0.15)] cursor-pointer"
            >
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#39FF14]"></span>
              </span>
              🤝 PROYECTO NUEVO EN DESARROLLO: MERCADO CAMBIARIO P2P ➔
            </button>
          )}

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
          <div className="max-w-xl mx-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-[0_0_50px_rgba(168,85,247,0.12)] relative text-left animate-fade-in">
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-purple-950/45 text-purple-300 border border-purple-500/35 font-mono text-[9px] px-2.5 py-0.5 rounded-full uppercase font-black">
                Acceso Miembros 🔑
              </div>

              {/* Seamless tab selectors */}
              <div className="flex border-b border-zinc-900 pb-3 mb-6 gap-2">
                <button
                  type="button"
                  onClick={() => setGuestTab('login')}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-black tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                    guestTab === 'login' 
                      ? 'bg-purple-950/40 text-[#39FF14] border border-purple-500/30 shadow-[0_0_12px_rgba(57,255,20,0.15)]' 
                      : 'text-zinc-500 hover:text-white bg-transparent border-none'
                  }`}
                >
                  🔑 Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => setGuestTab('register')}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-black tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                    guestTab === 'register' 
                      ? 'bg-emerald-950/40 text-[#39FF14] border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                      : 'text-zinc-500 hover:text-white bg-transparent border-none'
                  }`}
                >
                  ⚡ Registro Rápido Directo
                </button>
              </div>

              {guestTab === 'login' ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-400">
                      <Lock className="h-5 w-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider">Iniciar Sesión</h3>
                    <p className="text-xs text-zinc-405 text-zinc-400 max-w-sm">
                      Ingresa tu usuario y contraseña registrados para ingresar a tu portal.
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
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-black block">
                          Contraseña de Acceso *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setRecoverError('');
                            setRecoverSuccess('');
                            setRecoverStep(1);
                            setIsRecoveringPassword(true);
                          }}
                          className="text-[9px] uppercase font-mono tracking-widest text-[#39FF14] hover:underline font-extrabold cursor-pointer bg-transparent border-none outline-none focus:outline-none"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>
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

                  <div className="pt-5 text-center border-t border-white/5 mt-4">
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      ¿Aún no te has registrado en TappP2P / Tappmusic? <br />
                      <button 
                        type="button"
                        onClick={() => setGuestTab('register')}
                        className="text-[#39FF14] hover:underline font-extrabold uppercase tracking-widest text-[11px] mt-1 cursor-pointer bg-transparent border-none"
                      >
                        ⚡ Registrar Mi Cuenta Directo
                      </button>
                    </p>
                  </div>
                </div>
              ) : (
                /* DIRECT REGISTRATION FORM */
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="text-center space-y-1 pb-1">
                    <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center justify-center gap-1.5 select-none">
                      <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" /> Registro Directo de Miembros
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Crea tu cuenta directamente y activa tu membresía VIP en Bolívares o Cripto USDT.
                    </p>
                  </div>

                  <div className="space-y-3.5 rounded-2xl border border-white/5 bg-black/60 p-4">
                    {/* Username Input */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-widest text-[#39FF14] font-black block">
                        Nombre de Usuario (Nickname) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. maria_torres"
                        value={inputUsername}
                        onChange={(e) => setInputUsername(e.target.value)}
                        className="w-full text-xs font-semibold bg-black border border-white/10 rounded-xl px-4 py-2.5 text-[#39FF14] placeholder-zinc-800 focus:outline-none focus:border-[#39FF14]"
                      />
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-widest text-[#39FF14] font-black block">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="maria_torres@gmail.com"
                        value={inputEmail}
                        onChange={(e) => setInputEmail(e.target.value)}
                        className="w-full text-xs font-semibold bg-black border border-white/10 rounded-xl px-4 py-2.5 text-[#39FF14] placeholder-zinc-800 focus:outline-none focus:border-[#39FF14]"
                      />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-widest text-zinc-400 font-black block">
                        Contraseña *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        className="w-full text-xs font-semibold bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-800 focus:outline-none focus:border-[#39FF14]"
                      />
                    </div>

                    {/* VIP Level Select */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-widest text-zinc-400 font-extrabold block">
                        Membresía VIP a Activar *
                      </label>
                      <select
                        value={selectedInitialVip}
                        onChange={(e) => setSelectedInitialVip(e.target.value as any)}
                        className="w-full text-xs font-semibold bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#39FF14] cursor-pointer"
                      >
                        <option value="VIP PLATA 10$">VIP PLATA ($10 USDT)</option>
                        <option value="VIP ORO 20$">VIP ORO ($20 USDT)</option>
                        <option value="VIP RUBÍ 40$">VIP RUBÍ ($40 USDT)</option>
                        <option value="VIP DIAMANTE 120$">VIP DIAMANTE ($120 USDT)</option>
                        <option value="VIP PLATINO 420$">VIP PLATINO ($420 USDT)</option>
                        <option value="VIP CORONA IMPERIAL 1000$">VIP CORONA IMPERIAL ($1000 USDT)</option>
                      </select>
                    </div>

                     {/* DYNAMIC REGISTRATION COORDINATES VIEW */}
                     <div className="p-3 bg-zinc-950 rounded-xl border border-purple-500/20 space-y-2 text-[11.5px] font-mono leading-relaxed animate-fade-in text-left">
                       <span className="text-[9.5px] uppercase font-mono tracking-wider font-extrabold text-purple-400 block border-b border-white/5 pb-1">
                         💳 DIRECCIÓN DE DEPÓSITO USDT BEP-20
                       </span>
                       <div className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-white/5">
                         <span className="text-zinc-500 text-[10px]">Monto exacto:</span>
                         <strong className="text-white font-mono font-bold">${getLevelPriceInUsd(selectedInitialVip)} USDT</strong>
                       </div>
                       <div className="space-y-1">
                         <span className="text-[9px] text-zinc-500 block leading-tight">Dirección USDT BEP-20 (BNB Smart Chain):</span>
                         <div className="flex items-center gap-1.5 bg-black p-2 rounded-lg border border-white/5">
                           <code className="text-[9.5px] text-purple-300 break-all select-all flex-1 font-mono">{withdrawConfig?.depositAddress || '0x29f0f1edd5258ee3b7553bff665df4d1dd811af0'}</code>
                           <button
                             type="button"
                             onClick={() => {
                               navigator.clipboard.writeText(withdrawConfig?.depositAddress || '0x29f0f1edd5258ee3b7553bff665df4d1dd811af0');
                               setCopiedAddressFeedback(true);
                               setTimeout(() => setCopiedAddressFeedback(false), 2000);
                             }}
                             className="p-1 rounded bg-zinc-900 border border-white/5 text-purple-450 hover:text-white transition-all cursor-pointer select-none active:scale-90"
                             title="Copiar billetera"
                           >
                             {copiedAddressFeedback ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                           </button>
                         </div>
                       </div>
                       <span className="text-[8px] text-zinc-550 block leading-tight">
                         * Envía únicamente USDT a través de la red BNB Smart Chain (BEP20).
                       </span>
                     </div>

                    {/* Capture de Pago * (Obligatorio) */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-mono tracking-widest text-[#39FF14] font-black block">
                        Capture de Pago Voucher / Capture de Pantalla * (Obligatorio)
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex h-10 px-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 hover:border-[#39FF14] hover:bg-[#39FF14]/5 text-zinc-400 hover:text-white transition-all cursor-pointer items-center justify-center text-xs">
                          <span>📁 Cargar Voucher o Capture</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                        {attachedFileName && (
                          <span className="text-xs text-[#39FF14] truncate max-w-[200px] font-mono block">
                            {attachedFileName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-[#39FF14] hover:from-emerald-500 hover:to-[#39FF14] text-xs font-black uppercase text-neutral-950 font-sans tracking-wider transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(57,255,20,0.25)] border-none"
                  >
                    <Check className="h-4 w-4" />
                    <span>Concluir Registro Directo</span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setGuestTab('login')}
                      className="text-xs text-zinc-400 hover:text-white underline font-sans bg-transparent border-none cursor-pointer"
                    >
                      ◀ O prefiero Iniciar Sesión con mi cuenta
                    </button>
                  </div>
                </form>
              )}

              {/* General helper footer */}
              <div className="pt-5 text-center border-t border-white/5 mt-4 space-y-3.5">
                <p className="text-[10px] text-zinc-500 font-sans">
                  Soporte oficial integrado Casa De Cambio TappP2P libre de intermediarios.
                </p>
                <div className="pt-1 text-center flex flex-col items-center gap-1.5">
                  <button
                    onClick={() => setShowAdminCodePrompt(true)}
                    type="button"
                    className="text-[9px] text-zinc-900 hover:text-[#39FF14]/40 transition-all bg-transparent border-none pointer-events-auto cursor-pointer p-1 active:scale-90"
                    title="Acceso Administrador"
                  >
                    <ShieldCheck className="h-2.5 w-2.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRecoverError('');
                      setRecoverSuccess('');
                      setRecoverStep(1);
                      setIsRecoveringPassword(true);
                    }}
                    className="w-full flex h-10 items-center justify-center gap-2 rounded-xl bg-purple-950/10 border border-purple-500/35 hover:bg-purple-950/30 hover:border-[#39FF14] text-purple-400 hover:text-[#39FF14] text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(168,85,247,0.15)] mt-1.5"
                  >
                    🔑 Recuperar contraseña
                  </button>
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
                    ⚠️ NOTA: El cobro y realización de tareas VIP remuneradas se activará una vez que el Administrador verifique tu depósito.
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

                {/* Quick actions row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                  {/* Quick copy widget for deployment link */}
                  <div className="shrink-0 bg-black border border-white/10 rounded-2xl p-4 flex flex-col items-start gap-3">
                    <div className="text-left text-ellipsis overflow-hidden">
                      <p className="text-[9px] font-bold text-[#39FF14] tracking-wider uppercase">Link de Lanzamiento</p>
                      <p className="text-xs font-mono text-zinc-300 truncate max-w-[160px] select-all lowercase">{sharedUrl}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={copyModalLink}
                        className={`flex-1 flex h-8 items-center justify-center gap-1 rounded-xl px-3 text-[11px] font-bold transition-all cursor-pointer ${
                          copiedModalLink 
                            ? 'bg-emerald-600 text-white border-none' 
                            : 'bg-black border border-[#39FF14]/40 hover:bg-[#39FF14]/15 text-[#39FF14] active:scale-95'
                        }`}
                      >
                        {copiedModalLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedModalLink ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                      <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#39FF14]/5 hover:bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/20 transition-all cursor-pointer"
                        title="Difundir plataforma"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* APK Download helper widget with copy link for WebView app wrapper backup */}
                  <div className="shrink-0 bg-black border border-[#39FF14]/25 rounded-2xl p-4 flex flex-col items-start gap-3 w-full sm:w-auto">
                    <div className="text-left">
                      <p className="text-[9px] font-black text-neon-green tracking-wider uppercase flex items-center gap-1">
                        <Smartphone className="h-2.5 w-2.5 text-[#39FF14]" /> APP OFICIAL ANDROID
                      </p>
                      <p className="text-xs font-sans font-bold text-zinc-300">Tappmusic v1.0.apk</p>
                    </div>
                    
                    <div className="w-full flex flex-col gap-1.5">
                      <a
                        href={withdrawConfig?.apkDownloadUrl || "/assets/tappmusic.apk"}
                        onClick={(e) => {
                          const url = withdrawConfig?.apkDownloadUrl || "enlace_por_defecto";
                          console.log("Downloading APK:", url);
                        }}
                        className="w-full h-8 flex items-center justify-center gap-1.5 rounded-xl bg-[#39FF14] hover:bg-[#39FF14]/85 text-black text-[11px] font-extrabold transition-all cursor-pointer filter saturate-120 hover:scale-[1.02] active:scale-95 shadow-[0_0_10px_rgba(57,255,20,0.2)]"
                      >
                        <Download className="h-3.5 w-3.5 text-black" />
                        <span>DESCARGAR APK</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setShowApkGuide(true)}
                        className="w-full h-8 px-2.5 rounded-xl bg-gradient-to-r from-teal-950/40 to-black hover:from-teal-900/50 border border-[#39FF14]/35 text-[#39FF14] text-[10px] font-extrabold uppercase tracking-wide transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 select-none animate-pulse"
                      >
                        <span>🛡️ Guía de Confianza & Instalación</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const url = withdrawConfig?.apkDownloadUrl || "https://drive.google.com/file/d/1TqGkx8aglLR2SyKsi6L-eOW-QBUeeHr5/view?usp=drivesdk";
                          robustCopyToClipboard(url);
                          alert("📋 ¡Enlace de la aplicación copiado! Pégalo en Google Chrome o el navegador de tu celular para descargar.");
                        }}
                        className="w-full h-8 px-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-350 text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 select-none"
                      >
                        <Copy className="h-3 w-3 text-zinc-400" />
                        <span>Copiar Enlace Directo</span>
                      </button>
                    </div>

                    <p className="text-[9px] text-zinc-450 font-sans leading-tight mt-0.5 max-w-[180px]">
                      💡 <strong>¿Te sale aviso de peligro?</strong> Haz clic en <span className="text-[#39FF14] underline cursor-pointer font-bold" onClick={() => setShowApkGuide(true)}>Guía de Confianza</span> para instalar seguro en 3 clics descritos.
                    </p>
                  </div>

                  {/* VIP Flyer Promotion Widget with Zoom & Download Actions */}
                  <div className="shrink-0 bg-black border border-purple-500/25 rounded-2xl p-4 flex flex-col items-start gap-3 w-full sm:w-auto">
                    <div className="text-left">
                      <p className="text-[9px] font-black text-purple-400 tracking-wider uppercase flex items-center gap-1">
                        🖼️ TABLA DE RANGOS VIP
                      </p>
                      <p className="text-xs font-sans font-bold text-zinc-300">Flyer Oficial Tappmusic</p>
                    </div>

                    <div className="w-full flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setAdminZoomImage("/assets/tappmusic_vip_flyer.jpg")}
                        className="w-full flex h-8 items-center justify-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-extrabold transition-all cursor-pointer hover:scale-[1.02] active:scale-95 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                      >
                        <span>👁️ VER EN PANTALLA</span>
                      </button>

                      <a
                        href="/assets/tappmusic_vip_flyer.jpg?download=true"
                        download="tappmusic_flyer_vip.jpg"
                        className="w-full h-8 px-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-300 text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 select-none"
                      >
                        <span>📥 Descargar Flyer</span>
                      </a>
                    </div>
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
                  <h3 className="text-xs font-black tracking-wider text-white uppercase font-sans">🔗 Sistema de Comisión por Invitación ($1.50)</h3>
                  <p className="text-[10px] text-zinc-500 font-mono">¡Gana $1.50 USD exactos por cada amigo activo que invites!</p>
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
                  <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-black">Activo • $1.50 USD</span>
                </div>
                <div className="flex items-center gap-2 bg-black border border-white/5 rounded-xl px-3 py-2">
                  <span className="text-zinc-400 truncate flex-1 leading-tight lowercase font-medium">
                    {sharedUrl}/?ref={userProfile.username}
                  </span>
                  <button
                    onClick={() => {
                      robustCopyToClipboard(`${sharedUrl}/?ref=${userProfile.username}`);
                      alert("✅ ¡Enlace de invitación personalizado copiado con éxito! Compártelo para ganar $1.50 por cada invitado activo.");
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
                withdrawConfig={withdrawConfig}
                inviteCommissionsEarned={getInviteCommissions()}
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

      {/* PASSWORD RECOVERY DIALOG / MODAL */}
      {isRecoveringPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-[#39FF14]/30 bg-black p-6 shadow-2xl text-center">
            
            {/* Corner Close Button */}
            <div className="absolute top-4 right-4">
              <button 
                onClick={resetRecoveryStates}
                className="h-8 w-8 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 text-left font-sans">
              <div className="text-center space-y-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-[#39FF14]">
                  <Lock className="h-6 w-6 text-[#39FF14] animate-pulse" />
                </div>
                <h3 className="text-md font-black tracking-widest text-white uppercase">Recuperar Contraseña</h3>
                <p className="text-[11px] text-zinc-400">
                  Sigue los pasos para restablecer la contraseña de tu cuenta.
                </p>
              </div>

              {/* Steps Progress bar */}
              <div className="flex items-center justify-between gap-1 pb-2">
                {[1, 2, 3].map((step) => {
                  let stepLabel = '';
                  if (step === 1) stepLabel = 'Usuario';
                  if (step === 2) stepLabel = 'Validación';
                  if (step === 3) stepLabel = 'Nueva Clave';

                  const isActive = recoverStep >= step;
                  const isCurrent = recoverStep === step;

                  return (
                    <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className={`h-1 w-full rounded-full transition-all duration-300 ${
                        isActive ? 'bg-[#39FF14]' : 'bg-zinc-800'
                      }`} />
                      <span className={`text-[9px] font-mono tracking-wider transition-all uppercase ${
                        isCurrent ? 'text-[#39FF14] font-bold' : isActive ? 'text-zinc-300' : 'text-zinc-650'
                      }`}>
                        {stepLabel}
                      </span>
                    </div>
                  );
                })}
              </div>

              {recoverError && (
                <div className="text-[11px] text-red-400 font-mono text-center font-bold bg-red-950/20 border border-red-500/20 p-2.5 rounded-xl">
                  {recoverError}
                </div>
              )}

              {recoverSuccess && (
                <div className="text-[11px] text-[#39FF14] font-mono text-center font-bold bg-emerald-950/40 border border-[#39FF14]/20 p-2.5 rounded-xl">
                  {recoverSuccess}
                </div>
              )}

              {/* STEP 1: Username validation */}
              {recoverStep === 1 && (
                <form onSubmit={handleVerifyRecoveryUsername} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-mono tracking-widest text-zinc-400 font-bold block">
                      Ingresa tu Usuario o Correo Registrado *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. melodia_tapp o correo@ejemplo.com"
                      value={recoverUsername}
                      onChange={(e) => setRecoverUsername(e.target.value)}
                      className="w-full text-xs font-semibold bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-[#39FF14] placeholder-zinc-800 focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isRecoverSubmitting}
                    className="w-full flex h-10 items-center justify-center gap-2 rounded-xl bg-[#39FF14]/15 hover:bg-[#39FF14]/25 text-xs font-extrabold uppercase text-[#39FF14] border border-[#39FF14]/40 transition-all cursor-pointer active:scale-95 disabled:opacity-50 font-sans"
                  >
                    {isRecoverSubmitting ? 'Verificando...' : 'Comprobar Cuenta ⚡'}
                  </button>
                </form>
              )}

              {/* STEP 2: Unified Email confirmation & New Password choice */}
              {(recoverStep === 2 || recoverStep === 3) && foundRecoverUser && (
                <form onSubmit={handleConfirmEmailAndSubmitRequest} className="space-y-4">
                  <div className="bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-xl p-3 text-[10px] text-zinc-300 leading-normal font-sans">
                    👋 ¡Hola <strong className="text-white">@{foundRecoverUser.username}</strong>! Para enviar tu solicitud de recuperación, confirma tu correo y escribe tu nueva contraseña.
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-mono tracking-widest text-zinc-400 font-bold block">
                      Confirma tu Correo Registrado *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Ej. usuario@ejemplo.com"
                      value={recoverEmailConfirm}
                      onChange={(e) => setRecoverEmailConfirm(e.target.value)}
                      className="w-full text-xs font-semibold bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-800 focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-mono tracking-widest text-[#39FF14] font-bold block">
                      Nueva Contraseña Deseada * (Mín. 4 caracteres)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Escribe tu nueva clave favorita de ingreso"
                      value={newRecoverPassword}
                      onChange={(e) => setNewRecoverPassword(e.target.value)}
                      className="w-full text-xs font-semibold bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-[#39FF14] placeholder-zinc-800 focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRecoverStep(1)}
                      className="flex-1 h-10 rounded-xl bg-zinc-950 border border-white/5 hover:bg-zinc-900 text-xs text-zinc-400 font-bold transition-all cursor-pointer"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      disabled={isRecoverSubmitting}
                      className="flex-1 h-10 rounded-xl bg-[#39FF14] text-black hover:bg-[#34e512] text-xs font-black uppercase transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {isRecoverSubmitting ? 'Enviando...' : 'Pedir Recuperación 🔑'}
                    </button>
                  </div>

                  <div className="border-t border-white/5 pt-3 text-center">
                    <p className="text-[9.5px] text-zinc-500 font-sans leading-relaxed">
                      ¿Tienes problemas con tu usuario de registro? Escríbenos a nuestro Gmail de Soporte Técnico Oficial: <br />
                      <strong className="text-purple-300 font-semibold block mt-0.5">tappmusicsupport@gmail.com</strong>
                    </p>
                  </div>
                </form>
              )}

              {/* STEP 4: Success Completion */}
              {recoverStep === 4 && (
                <div className="space-y-4 pt-2">
                  <p className="text-xs text-zinc-300 leading-relaxed text-center font-sans">
                    Tu contraseña ha sido actualizada con éxito en la base de datos de <strong>Tappmusic.com</strong>. Ya puedes ingresar a tu cuenta de inmediato.
                  </p>

                  <button
                    type="button"
                    onClick={resetRecoveryStates}
                    className="w-full flex h-10 items-center justify-center gap-2 rounded-xl bg-[#39FF14] text-black hover:bg-[#39FF14]/90 text-xs font-black uppercase transition-all cursor-pointer active:scale-95"
                  >
                    Volver al Inicio de Sesión
                  </button>
                </div>
              )}

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

                {/* Paso 3: Realizar el Depósito Asociado */}
                <div className="p-4 rounded-2xl bg-black border border-white/5 space-y-4 text-left">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-2.5 gap-2">
                     <h4 className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-white">
                       💳 Paso 3: Realizar el Depósito Asociado
                     </h4>
                     <div className="text-[10px] font-mono text-left sm:text-right">
                       <strong className="text-[#39FF14] font-extrabold">${getLevelPriceInUsd(selectedInitialVip)} USDT</strong>
                       <span className="text-zinc-500"> (USDT BEP-20)</span>
                     </div>
                   </div>

                   <div className="p-3 bg-zinc-950 rounded-xl border border-purple-500/20 space-y-2 text-[11px] font-mono leading-relaxed text-zinc-350">
                     <span className="text-[9px] uppercase font-mono tracking-wider font-extrabold text-purple-400 block border-b border-white/10 pb-1">
                       Datos Depósito USDT BEP-20 (Binance / Wallet):
                     </span>
                     <div className="flex items-center justify-between bg-black/40 p-1.5 rounded border border-white/5">
                       <span className="text-zinc-500 text-[9px]">Monto exacto USDT:</span>
                       <strong className="text-white font-mono font-bold">${getLevelPriceInUsd(selectedInitialVip)} USDT</strong>
                     </div>
                     <div className="space-y-1">
                       <span className="text-[9px] text-zinc-550 block leading-none">Dirección de Destino BEP-20:</span>
                       <div className="flex items-center gap-1.5 bg-black p-2 rounded-lg border border-white/5">
                         <code className="text-[9.5px] text-purple-300 break-all select-all flex-1 font-mono">0x29f0f1edd5258ee3b7553bff665df4d1dd811af0</code>
                         <button
                           type="button"
                           onClick={() => {
                             navigator.clipboard.writeText(withdrawConfig?.depositAddress || '0x29f0f1edd5258ee3b7553bff665df4d1dd811af0');
                             setCopiedAddressFeedback(true);
                             setTimeout(() => setCopiedAddressFeedback(false), 2000);
                           }}
                           className="p-1 rounded bg-zinc-900 border border-white/5 text-purple-400 hover:text-white hover:bg-purple-900/40 transition-all cursor-pointer select-none"
                           title="Copiar billetera"
                         >
                           {copiedAddressFeedback ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                         </button>
                       </div>
                     </div>
                     <div className="pt-1 border-t border-white/5 text-[8.5px] text-zinc-500">
                       * Envíe exactamente <strong className="text-[#39FF14]">${getLevelPriceInUsd(selectedInitialVip)}.00 USDT</strong> a la red <strong className="text-white">BNB Smart Chain (BEP20)</strong>.
                     </div>
                   </div>
                 </div>

                {/* Paso 4: Referencia cripto */}
                <div className="space-y-4 rounded-2xl border border-white/5 bg-black/60 p-4">
                  <h4 className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-white border-b border-white/5 pb-2">
                    📝 Paso 4: Cargar Capture de Pago
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-[#39FF14] font-black block">
                      Capture de Pago Voucher / Capture de Pantalla * (Obligatorio)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex h-10 px-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 hover:border-[#39FF14] hover:bg-[#39FF14]/5 text-zinc-400 hover:text-white transition-all cursor-pointer items-center justify-center text-xs">
                        <span>📁 Cargar Voucher o Capture</span>
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

                <div className="flex flex-col gap-2 p-3 bg-gradient-to-r from-purple-950/20 to-black border border-purple-500/20 rounded-2xl text-left select-none">
                  <div className="flex items-center justify-between gap-1.5">
                    <div>
                      <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest leading-none">🖼️ TABLA DE RANGOS VIP EN HD</p>
                      <p className="text-[8.5px] text-zinc-500 font-sans leading-tight mt-1">Visualiza el flyer de inversión oficial con todos los rangos y ganancias.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsVipSelectorOpen(false);
                        setAdminZoomImage("/assets/tappmusic_vip_flyer.jpg");
                      }}
                      className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[9px] uppercase rounded-xl transition-all active:scale-95 shrink-0 cursor-pointer shadow-[0_0_8px_rgba(168,85,247,0.3)] border-none"
                    >
                      Ver Flyer 👑
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2 text-left max-h-[350px] overflow-y-auto pr-1">
                  {[
                    { lvl: 'VIP PLATA 10$', desc: '5 Videos/Día | Recompensa: 367 monedas diarias', bonus: 'Bono x1.0', col: 'text-zinc-400' },
                    { lvl: 'VIP ORO 20$', desc: '7 Videos/Día | Recompensa: 734 monedas diarias', bonus: 'Bono x1.5', col: 'text-yellow-400' },
                    { lvl: 'VIP RUBÍ 40$', desc: '10 Videos/Día | Recompensa: 1468 monedas diarias', bonus: 'Bono x2.2', col: 'text-red-400' },
                    { lvl: 'VIP DIAMANTE 120$', desc: '15 Videos/Día | Recompensa: 3670 monedas diarias', bonus: 'Bono x3.5', col: 'text-sky-400 border border-sky-500/20 px-1 rounded' },
                    { lvl: 'VIP PLATINO 420$', desc: '17 Videos/Día | Recompensa: 11744 monedas diarias', bonus: 'Bono x5.0', col: 'text-purple-400 border border-purple-500/20 px-1 rounded' },
                    { lvl: 'VIP CORONA IMPERIAL 1000$', desc: '20 Videos/Día | Recompensa: 29360  monedas diarias', bonus: 'Bono x8.0', col: 'text-emerald-400 font-extrabold border border-emerald-500/35 px-1 rounded' }
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
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">Sube de Nivel VIP</h3>
                  <p className="text-[10px] text-zinc-400 leading-tight">Completa tu pago y sube el capture del comprobante para actualizar a <strong className="text-purple-400">{upgradeVipLevel}</strong></p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5 text-left space-y-3">
                  <div className="flex justify-between text-[11px] border-b border-white/5 pb-2">
                    <span className="text-zinc-400 font-mono font-extrabold">Monto Fijo USDT:</span>
                    <span className="text-[#39FF14] font-black">${getLevelPriceInUsd(upgradeVipLevel)} USD</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black border border-purple-500/15 space-y-1.5 font-mono text-[9px] leading-normal text-zinc-350">
                    <span className="text-zinc-500 block font-bold">Dirección USDT BEP-20 (BNB Chain):</span>
                    <div className="flex items-center gap-1 bg-zinc-950 p-1.5 rounded border border-white/5">
                      <code className="text-purple-300 break-all select-all font-mono text-[8px] flex-1">{withdrawConfig?.depositAddress || '0x29f0f1edd5258ee3b7553bff665df4d1dd811af0'}</code>
                    </div>
                    <p className="text-[8px] text-zinc-500 pt-0.5">* Envíe la cantidad exacta usando la red BNB Smart Chain (BEP20).</p>
                  </div>

                  {/* Upgrade File Uploder Capture */}
                  <div className="space-y-1.5 pt-0.5 text-left font-sans">
                    <label className="text-[9px] uppercase font-mono tracking-widest text-[#39FF14] font-black block">
                      Capture de Pago * (Obligatorio)
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="flex h-9 px-3 rounded-lg border border-dashed border-zinc-700 bg-black hover:border-purple-500 hover:bg-purple-950/20 text-gray-400 hover:text-white transition-all cursor-pointer items-center justify-center text-[10px]">
                        <span>📁 Cargar Capture</span>
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
                    <span>Panel de Control de Administrador</span>
                    <span className="text-[9px] font-mono bg-[#39FF14]/10 text-[#39FF14] px-2 py-0.5 rounded-full border border-[#39FF14]/20 lowercase">administrador</span>
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

            {/* ⚙️ CONFIGURACIÓN GLOBAL: ENLACE DE DESCARGA APK */}
            <div className="bg-gradient-to-r from-purple-950/40 to-black p-4 rounded-2xl border border-purple-500/30 space-y-3 font-sans relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 right-0 h-16 w-16 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-[#39FF14] uppercase tracking-wider font-mono">
                  <Smartphone className="h-4 w-4 text-[#39FF14] animate-bounce" />
                  <span>⚙️ Configurar Enlace de Descarga de la APK</span>
                </div>
                {withdrawConfig?.apkDownloadUrl && (
                  <span className="text-[9px] font-bold text-[#39FF14] bg-[#39FF14]/10 border border-[#39FF14]/20 px-2 py-0.5 rounded-full uppercase animate-pulse">
                    Enlace Activo ⚡
                  </span>
                )}
              </div>
              
              <p className="text-[11px] text-zinc-300 leading-normal">
                Hermanito, por defecto el botón <strong>"DESCARGAR APK"</strong> intenta descargar un apk local vacío. Si tienes tu propia APK compilada y subida a <strong>Google Drive, Mediafire, Mega, Dropbox o cualquier servidor</strong>, pega ese enlace de descarga abajo. ¡Cualquier cambio se actualiza en tiempo real para todos los usuarios!
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="Pega aquí tu enlace (Ej. https://drive.google.com/file/d/... o enlace de Mediafire)"
                  value={withdrawConfig?.apkDownloadUrl || ''}
                  onChange={async (e) => {
                    let val = e.target.value.trim();
                    
                    // Auto-convert Google Drive viewing links to direct 1-click download links
                    if (val.includes('drive.google.com')) {
                      const driveIdMatch = val.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || val.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                      if (driveIdMatch && driveIdMatch[1]) {
                        const fileId = driveIdMatch[1];
                        val = `https://drive.google.com/uc?export=download&id=${fileId}`;
                        alert("⚡ ¡Detectamos un enlace de Google Drive! Lo hemos convertido automáticamente en Descarga Directa para que tus usuarios se la bajen en un solo click. No te olvides de poner el archivo de Drive como público (Cualquier persona con el enlace).");
                      }
                    }

                    const updated = {
                      ...withdrawConfig,
                      apkDownloadUrl: val
                    };
                    setWithdrawConfig(updated);
                    try {
                      await setDoc(doc(db, 'config', 'withdrawals'), updated);
                    } catch (err: any) {
                      console.error("Firestore update error:", err);
                    }
                  }}
                  className="flex-1 bg-black text-xs font-semibold border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-800 focus:outline-none focus:border-[#39FF14]"
                />
                {withdrawConfig?.apkDownloadUrl && (
                  <button
                    onClick={async () => {
                      const updated = {
                        ...withdrawConfig,
                        apkDownloadUrl: ''
                      };
                      setWithdrawConfig(updated);
                      try {
                        await setDoc(doc(db, 'config', 'withdrawals'), updated);
                        alert("⚠️ Enlace externo removido. Ahora el botón descargará el archivo local predeterminado de la plataforma.");
                      } catch (err) {}
                    }}
                    className="h-8 sm:h-auto px-3 bg-red-950/40 hover:bg-red-900 border border-red-500/20 text-red-400 hover:text-white text-[10px] uppercase font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Quitar Enlace
                  </button>
                )}
              </div>
              <span className="text-[9px] text-zinc-500 font-mono block border-b border-white/5 pb-2.5">
                {withdrawConfig?.apkDownloadUrl 
                  ? `👉 El botón ahora descarga desde: ${withdrawConfig.apkDownloadUrl}` 
                  : 'ℹ️ Estado actual: Descargando archivo local predeterminado de la plataforma.'}
              </span>

              {/* 🎨 SECCIÓN DE LOGO OPTIMIZADO PARA APK (COMPATIBILIDAD WEB_INTO_APP / PNG) */}
              <div className="pt-1 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-purple-400 uppercase tracking-wider font-mono">
                  <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                  <span>📥 Descargar Logo de Tappmusic Optimizado (Requisito PNG de WebIntoApp)</span>
                </div>
                
                <div className="bg-zinc-950/80 p-3 rounded-xl border border-purple-500/10 flex flex-col sm:flex-row gap-3 items-center">
                  <img 
                    src={processedPngUrl || tappmusicLogo} 
                    alt="Logo Tappmusic Optimizado" 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-purple-500/20 object-cover shadow-[0_0_15px_rgba(168,85,247,0.3)] shrink-0 select-all cursor-pointer"
                    referrerPolicy="no-referrer"
                    title="Si estás en celular, mantén presionada esta imagen para guardarla como logo PNG"
                  />
                  <div className="space-y-1 text-center sm:text-left flex-1">
                    <p className="text-[11px] font-bold text-white uppercase tracking-wider text-purple-300">¡Logo PNG Cuadrado Disponible! (Peso ~15-20 KB ⚡)</p>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      Hermanito, WebIntoApp <strong>solo acepta formato PNG</strong> y rechaza archvios de más de 256 KB. He convertido el logo circular a un formato PNG cuadrado de 256x256 px super ligero que cumple al 100% las reglas.
                    </p>
                    <p className="text-[9px] text-amber-400 font-bold leading-normal">
                      💡 TIP PARA CELULAR: Haz click en el botón de abajo. Si no inicia la descarga en tu móvil, simplemente <strong>deja presionada (mantén pulsada) la imagen de arriba</strong> y selecciona "Descargar imagen" o "Guardar imagen".
                    </p>
                    <div className="pt-1.5 flex flex-wrap gap-2 justify-center sm:justify-start">
                      <a 
                        href="/assets/logo.png" 
                        download="logo_tappmusic.png"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-[#39FF14] hover:bg-[#32e011] text-black border border-green-500/40 px-3.5 py-2 rounded-xl text-[10px] uppercase font-black tracking-wider transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(57,255,20,0.3)] font-mono"
                      >
                        <Download className="h-3.5 w-3.5 text-black animate-pulse" />
                        DESCARGAR PNG DIRECTO (1-CLICK)
                      </a>
                      <button 
                        onClick={convertAndDownloadPng}
                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 text-white border border-purple-500/40 px-3.5 py-2 rounded-xl text-[10px] uppercase font-black tracking-wider transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.3)] font-mono"
                      >
                        <Download className="h-3.5 w-3.5 text-purple-200" />
                        Convertir localmente
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab switch control */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1 bg-black rounded-xl border border-white/5 font-sans">
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

              <button
                onClick={() => setActiveAdminTab('recuperaciones')}
                className={`py-2 px-1 rounded-lg text-[9px] sm:text-[11px] font-black uppercase text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeAdminTab === 'recuperaciones'
                    ? 'bg-purple-900/55 text-[#39FF14] border border-purple-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Solicitudes de recuperación de contraseña de usuarios"
              >
                <Lock className="h-3.5 w-3.5 shrink-0 text-red-400" />
                <span className="truncate">Soporte ({recoveryRequests.filter(r => r.status === 'pending').length})</span>
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

                {/* SEARCH & FILTERS */}
                <div className="space-y-2">
                  <div className="relative font-sans">
                    <input
                      type="text"
                      placeholder="🔍 Buscar activación por usuario, referencia o patrocinador (fershu)..."
                      value={adminRegSearch}
                      onChange={(e) => setAdminRegSearch(e.target.value)}
                      className="w-full text-xs font-mono bg-zinc-950 border border-white/10 rounded-xl pl-4 pr-16 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#39FF14]"
                    />
                    {adminRegSearch && (
                      <button 
                        onClick={() => setAdminRegSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs select-none hover:underline cursor-pointer"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  
                  <div className="flex gap-2 flex-wrap items-center">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase font-sans">Ver por Patrocinador:</span>
                    <button
                      onClick={() => setAdminRegSearch('fershu')}
                      className={`px-2.5 py-1 rounded bg-purple-950/40 text-purple-305 border text-[10px] font-bold uppercase cursor-pointer hover:bg-purple-900/40 transition-all ${
                        adminRegSearch === 'fershu' ? 'border-[#39FF14] text-[#39FF14]' : 'border-purple-500/20 text-purple-300'
                      }`}
                    >
                      👤 Invitados por @fershu / fershot
                    </button>
                    <button
                      onClick={() => setAdminRegSearch('')}
                      className={`px-2.5 py-1 rounded bg-zinc-900 text-zinc-400 border text-[10px] font-bold uppercase cursor-pointer hover:bg-zinc-800 transition-all ${
                        adminRegSearch === '' ? 'border-zinc-500 text-white' : 'border-white/5'
                      }`}
                    >
                      Mostrar Todos
                    </button>
                  </div>
                </div>

                {(() => {
                  const pendingRegs = registrations.filter(r => r.status === 'pending');
                  const filteredRegs = pendingRegs.filter(reg => {
                    const query = adminRegSearch.toLowerCase().trim();
                    if (!query) return true;
                    
                    const usr = reg.username ? reg.username.toLowerCase() : '';
                    const email = reg.email ? reg.email.toLowerCase() : '';
                    const ref = reg.referenceNo ? reg.referenceNo.toLowerCase() : '';
                    const inv = reg.invitedBy ? reg.invitedBy.toLowerCase() : '';
                    
                    if (query === 'fershu' || query === 'fershot' || query === 'fersh') {
                      return (
                        inv.includes('fershu') ||
                        inv.includes('fershot') ||
                        inv.includes('fersh') ||
                        usr.includes(query) ||
                        email.includes(query)
                      );
                    }
                    
                    return (
                      usr.includes(query) ||
                      email.includes(query) ||
                      ref.includes(query) ||
                      inv.includes(query)
                    );
                  });

                  if (filteredRegs.length === 0) {
                    return (
                      <p className="text-center py-8 text-xs font-mono text-zinc-500">
                        No hay solicitudes de activación pendientes{adminRegSearch ? ' que coincidan con la búsqueda' : ''}.
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {filteredRegs.map((reg) => (
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
                              {reg.invitedBy && (
                                <span className="bg-zinc-900 text-zinc-400 border border-white/5 font-sans font-black text-[9px] px-2 py-0.5 rounded uppercase">
                                  Patrocinador: @{reg.invitedBy}
                                </span>
                              )}
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
                              <span className="text-zinc-500 font-bold text-[9px] uppercase tracking-wider block mb-1">📸 Capture de Pago Adjunto (clic para ampliar):</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setAdminZoomImage(reg.proofFileBlob)}
                                  className="rounded-lg overflow-hidden bg-zinc-950 p-1 border border-white/10 hover:border-[#39FF14] transition-all w-24 h-16 flex items-center justify-center cursor-zoom-in group select-none"
                                  title="Expandir captura de pago"
                                >
                                  <img 
                                    src={reg.proofFileBlob} 
                                    alt="Capture depósito" 
                                    className="max-h-full max-w-full object-contain rounded group-hover:scale-110 transition-all duration-305"
                                    referrerPolicy="no-referrer"
                                  />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAdminZoomImage(reg.proofFileBlob)}
                                  className="text-[10px] text-zinc-400 font-sans hover:text-[#39FF14] underline cursor-pointer select-none"
                                >
                                  🔍 Ampliar Capture
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="pt-2">
                              <span className="text-zinc-600 text-[9px] uppercase tracking-wider block mb-1">Capture Adjunto:</span>
                              <span className="inline-flex items-center gap-1.5 bg-zinc-950 border border-white/5 px-2.5 py-1 rounded text-zinc-500 text-[10px] font-mono">
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
                                  let regDbSuccess = false;
                                  try {
                                    await ensureAdminSessionSync();
                                    await updateDoc(doc(db, 'registrations', reg.id), { status: 'approved' });
                                    regDbSuccess = true;
                                  } catch (err) {
                                    console.error("Error approving registration:", err);
                                    setIsQuotaExceeded(true);
                                  }

                                  // Local State synchronization fallback
                                  setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, status: 'approved' } : r));

                                  // Call master approve solver for database-wide activation + commissions
                                  const userDbSuccess = await handleApproveUser(reg.username, reg.amountUsd, reg.vipLevel);

                                  if (regDbSuccess && userDbSuccess) {
                                    alert(`✅ Usuario @${reg.username} aprobado y activado exitosamente.`);
                                  } else {
                                    alert(`⚡ Usuario @${reg.username} aprobado y activado en modo local (sincronización en segundo plano activa).`);
                                  }
                                }}
                                className="flex-1 md:flex-initial h-9 px-3.5 rounded-xl bg-[#39FF14] text-black font-black text-xs uppercase hover:bg-[#34e512] transition-all cursor-pointer flex items-center justify-center gap-1"
                              >
                                <span>Aprobar</span>
                              </button>
                              
                              <button
                                onClick={async () => {
                                  // Reject/Remove registration request from Firestore
                                  let regDbSuccess = false;
                                  try {
                                    await ensureAdminSessionSync();
                                    await deleteDoc(doc(db, 'registrations', reg.id));
                                    regDbSuccess = true;
                                  } catch (err) {
                                    console.error("Error rejecting registration:", err);
                                    setIsQuotaExceeded(true);
                                  }

                                  // Local State Fallback
                                  setRegistrations(prev => prev.filter(r => r.id !== reg.id));
                                  
                                  const targetUser = allUsers.find(u => u.username && reg.username && u.username.toLowerCase() === reg.username.toLowerCase());
                                  if (targetUser) {
                                    const resetUser = { ...targetUser, isRegistered: false, status: 'pending' as const };
                                    
                                    try {
                                      await setDoc(doc(db, 'users', reg.username.toLowerCase()), resetUser);
                                    } catch (err) {
                                      console.warn("Could not reset user in Firestore:", err);
                                    }

                                    setAllUsers(prev => prev.map(u => u.username && reg.username && u.username.toLowerCase() === reg.username.toLowerCase() ? resetUser : u));

                                    if (reg.username === userProfile.username) {
                                      setUserProfile(resetUser);
                                      localStorage.setItem('tappmusic_profile', JSON.stringify(resetUser));
                                    }
                                  }

                                  if (regDbSuccess) {
                                    alert(`❌ Solicitud de @${reg.username} rechazada exitosamente.`);
                                  } else {
                                    alert(`❌ Solicitud de @${reg.username} rechazada en modo local.`);
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
                );
              })()}
              </div>
            )}

            {/* TAB CONTENT: WITHDRAWALS */}
            {activeAdminTab === 'retiros' && (
              <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                <div className="bg-indigo-950/20 rounded-xl p-3 border border-indigo-500/15 flex items-center gap-3 text-xs text-indigo-300">
                  <div className="h-5 w-5 bg-indigo-500/10 rounded-full flex items-center justify-center font-bold shrink-0">i</div>
                  <p className="leading-normal font-sans">
                    Solicitudes de retiro solicitadas en USDT. Al presionar <strong className="text-white">Aprobar</strong> se simula la transferencia de red con TxID. Al hacer clic en <strong className="text-red-400">Rechazar</strong> se cancela el abono y se reembolsan las monedas al saldo del inversionista.
                  </p>
                </div>

                {/* Real-time Withdrawal Calendar integrated beautifully for administrator */}
                <WithdrawalCalendar
                  mode="admin"
                  config={withdrawConfig}
                  onUpdateConfig={async (newConfig) => {
                    try {
                      await setDoc(doc(db, 'config', 'withdrawals'), newConfig);
                    } catch (err: any) {
                      console.error("Error updating config/withdrawals:", err);
                      alert("Error al actualizar calendario en Firestore: " + err.message);
                    }
                  }}
                />

                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-xs font-black tracking-widest text-[#39FF14] uppercase font-mono mb-3">📋 Listado de Solicitudes Pendientes</h4>
                  {withdrawHistory.filter(w => w.status === 'pendiente' || w.status === 'Pendiente').length === 0 ? (
                    <p className="text-center py-6 text-xs font-mono text-zinc-500 bg-zinc-950/20 border border-white/5 rounded-2xl">No hay solicitudes de retiro pendientes actualmente.</p>
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
                            {item.username && (
                              <span className="bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-extrabold tracking-wide">
                                👤 @{item.username}
                              </span>
                            )}
                             <div className="flex items-center gap-1.5 flex-wrap">
                               <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/25 px-2 py-0.5 rounded font-sans font-bold text-[10px]">
                                 {item.amountCoins} Monedas
                               </span>
                               <span className="bg-purple-500/10 text-purple-400 border border-purple-500/25 px-2 py-0.5 rounded font-sans font-medium text-[10px]">
                                 Bruto: {item.amountUsdt.toFixed(2)} USDT
                               </span>
                               <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded font-sans font-medium text-[10px]">
                                 Fee (0%): -{item.feeUsdt !== undefined ? item.feeUsdt.toFixed(2) : '0.00'} USDT
                               </span>
                               <span className="bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 px-2 py-0.5 rounded font-sans font-extrabold text-[10px] animate-pulse">
                                 A Pagar Neto: {item.netUsdt !== undefined ? item.netUsdt.toFixed(2) : item.amountUsdt.toFixed(2)} USDT
                               </span>
                             </div>
                            
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
                                  // Approve withdrawal and deduct coins in Firestore if they were not already deducted on submission (handles Massiel and other legacy requests)
                                  const generatedTx = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
                                  let dbSuccess = false;
                                  try {
                                    await ensureAdminSessionSync();
                                    await updateDoc(doc(db, 'withdrawals', item.id), {
                                      status: 'Aprobado',
                                      txid: generatedTx,
                                      deducted: true
                                    });
                                    dbSuccess = true;

                                    // Deduct from Firestore only if this request hasn't set the deducted flag (e.g. older legacy requests)
                                    if (!item.deducted) {
                                      const ownerName = item.username || userProfile.username;
                                      if (ownerName) {
                                        const cleanOwner = ownerName.toLowerCase().trim();
                                        const targetUser = allUsers.find(u => u.username && u.username.toLowerCase().trim() === cleanOwner);
                                        if (targetUser) {
                                          const updatedUser = {
                                            ...targetUser,
                                            earnings: Math.max(0, Number((targetUser.earnings - item.amountCoins).toFixed(2)))
                                          };
                                          await setDoc(doc(db, 'users', cleanOwner), updatedUser);
                                        }
                                      }
                                    }
                                  } catch (err: any) {
                                    console.error("Approve withdrawal Firestore write error:", err);
                                    setIsQuotaExceeded(true);
                                  }

                                  // Local State Synchronization Fallback (Allows flawless offline/quota-exceeded execution)
                                  setWithdrawHistory(prev => prev.map(w => w.id === item.id ? {
                                    ...w,
                                    status: 'Aprobado',
                                    txid: generatedTx,
                                    deducted: true
                                  } : w));

                                  if (!item.deducted) {
                                    const ownerName = item.username || userProfile.username;
                                    if (ownerName) {
                                      const cleanOwner = ownerName.toLowerCase().trim();
                                      const targetUser = allUsers.find(u => u.username && u.username.toLowerCase().trim() === cleanOwner);
                                      if (targetUser) {
                                        const updatedUser = {
                                          ...targetUser,
                                          earnings: Math.max(0, Number((targetUser.earnings - item.amountCoins).toFixed(2)))
                                        };
                                        
                                        setAllUsers(prev => prev.map(u => u.username && u.username.toLowerCase().trim() === cleanOwner ? updatedUser : u));
                                        
                                        if (userProfile.username && userProfile.username.toLowerCase().trim() === cleanOwner) {
                                          setUserProfile(updatedUser);
                                          localStorage.setItem('tappmusic_profile', JSON.stringify(updatedUser));
                                        }
                                      }
                                    }
                                  }

                                  if (dbSuccess) {
                                    alert("✅ Retiro aprobado exitosamente con TxID generado.");
                                  } else {
                                    alert("⚡ Retiro aprobado exitosamente en modo local (límite de cuota detectado, sincronización en segundo plano activa).");
                                  }
                                }}
                                className="flex-1 md:flex-initial h-9 px-3.5 rounded-xl bg-purple-600 text-white font-black text-xs uppercase hover:bg-purple-500 transition-all cursor-pointer flex items-center justify-center"
                              >
                                Aprobar Retiro
                              </button>
                              
                              <button
                                onClick={async () => {
                                  // Reject withdrawal and refund coins to the corresponding user profile in Firestore ONLY if they were deducted
                                  let dbSuccess = false;
                                  try {
                                    await ensureAdminSessionSync();
                                    await updateDoc(doc(db, 'withdrawals', item.id), {
                                      status: 'Rechazado'
                                    });
                                    dbSuccess = true;
                                    
                                    if (item.deducted) {
                                      const ownerName = item.username || userProfile.username;
                                      const targetUser = allUsers.find(u => u.username && ownerName && u.username.toLowerCase() === ownerName.toLowerCase());
                                      if (targetUser) {
                                        const updatedUser = {
                                          ...targetUser,
                                          earnings: Number((targetUser.earnings + item.amountCoins).toFixed(2))
                                        };
                                        await setDoc(doc(db, 'users', ownerName.toLowerCase()), updatedUser);
                                      }
                                    }
                                  } catch (err: any) {
                                    console.error("Error denying withdrawal in Firestore:", err);
                                    setIsQuotaExceeded(true);
                                  }

                                  // Local State Synchronization Fallback (Allows flawless offline/quota-exceeded execution)
                                  setWithdrawHistory(prev => prev.map(w => w.id === item.id ? {
                                    ...w,
                                    status: 'Rechazado'
                                  } : w));

                                  if (item.deducted) {
                                    const ownerName = item.username || userProfile.username;
                                    const targetUser = allUsers.find(u => u.username && ownerName && u.username.toLowerCase() === ownerName.toLowerCase());
                                    if (targetUser) {
                                      const updatedUser = {
                                        ...targetUser,
                                        earnings: Number((targetUser.earnings + item.amountCoins).toFixed(2))
                                      };
                                      
                                      setAllUsers(prev => prev.map(u => u.username && ownerName && u.username.toLowerCase() === ownerName.toLowerCase() ? updatedUser : u));
                                      
                                      if (userProfile.username && ownerName && userProfile.username.toLowerCase() === ownerName.toLowerCase()) {
                                        setUserProfile(updatedUser);
                                        localStorage.setItem('tappmusic_profile', JSON.stringify(updatedUser));
                                      }
                                    }
                                  }

                                  if (dbSuccess) {
                                    alert("❌ Retiro rechazado y monedas reembolsadas al usuario.");
                                  } else {
                                    alert("❌ Retiro rechazado y reembolsado exitosamente en modo local.");
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
                </div> {/* Close of border-t border-white/5 pt-4 */}
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
                          } catch (err) {
                            console.error("Error saving voice:", err);
                            setIsQuotaExceeded(true);
                          }
                          // Live update of state so it reflects instantly even in local fallback mode!
                          setVoiceThemes(prev => {
                            const exists = prev.some(v => v.id === k);
                            if (exists) {
                              return prev.map(v => v.id === k ? { id: k, ...newVoice } : v);
                            } else {
                              return [...prev, { id: k, ...newVoice }];
                            }
                          });
                          setIsEditingVoice(false);
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
                              } catch (err) {
                                console.error("Error deleting voice:", err);
                                setIsQuotaExceeded(true);
                              }
                              // Live update of state so it reflects instantly even in local fallback mode!
                              setVoiceThemes(prev => prev.filter(item => item.id !== v.id));
                              if (isEditingVoice && editingVoiceId === v.id) {
                                setIsEditingVoice(false);
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
                          placeholder="Ej. Tappmusic Oficial"
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
                            alert("✅ ¡Éxito! El video/reel de TikTok ha sido guardado perfectamente en Firebase.");
                          } catch (err: any) {
                            console.error("Error saving reel to Firestore:", err);
                            setIsQuotaExceeded(true);
                            alert("⚠️ Guardado en modo local (sin conexión/límite de cuota): El video se guardó de forma local en tu navegador para que puedas seguir trabajando.");
                          }
                          // Live update of state so it reflects instantly even in local fallback mode!
                          setReels(prev => {
                            const exists = prev.some(item => item.id === rId);
                            if (exists) {
                              return prev.map(item => item.id === rId ? newReel : item);
                            } else {
                              return [newReel, ...prev];
                            }
                          });
                          setIsEditingReel(false);
                          setEditingReelId('');
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
                                  console.error("Error deleting reel:", err);
                                  setIsQuotaExceeded(true);
                                  alert("✅ Eliminado en modo local (sin conexión/límite de cuota).");
                                }
                                // Live update of state so it reflects instantly even in local fallback mode!
                                setReels(prev => prev.filter(item => item.id !== r.id));
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

                {/* USER COUNTERS GRID */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 font-sans">
                  <button 
                    onClick={() => { setAdminUserFilter('todos'); setAdminUserSearch(''); }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      adminUserFilter === 'todos' && !adminUserSearch
                        ? 'border-[#39FF14] bg-[#39FF14]/5 text-white'
                        : 'border-white/5 bg-zinc-950/30 text-zinc-400 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-[9px] block text-zinc-500 uppercase font-black tracking-wider">Total Registrados</span>
                    <strong className="text-base font-black">{allUsers.length}</strong>
                  </button>
                  <button 
                    onClick={() => { setAdminUserFilter('activos'); setAdminUserSearch(''); }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      adminUserFilter === 'activos' && !adminUserSearch
                        ? 'border-[#39FF14] bg-[#39FF14]/5 text-white'
                        : 'border-white/5 bg-zinc-950/30 text-zinc-400 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-[9px] block text-emerald-500 uppercase font-black tracking-wider">Activos/Aprobados</span>
                    <strong className="text-base font-black text-emerald-450">
                      {allUsers.filter(u => u.status === 'active').length}
                    </strong>
                  </button>
                  <button 
                    onClick={() => { setAdminUserFilter('pendientes'); setAdminUserSearch(''); }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      adminUserFilter === 'pendientes' && !adminUserSearch
                        ? 'border-[#39FF14] bg-[#39FF14]/5 text-[#39FF14]'
                        : 'border-white/5 bg-zinc-950/30 text-zinc-400 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-[9px] block text-yellow-500 uppercase font-black tracking-wider">Pendientes Activación</span>
                    <strong className="text-base font-black text-yellow-505">
                      {allUsers.filter(u => u.status === 'pending' || u.status === 'pendiente' || !u.status || (u.isRegistered && u.status !== 'active')).length}
                    </strong>
                  </button>
                  <button 
                    onClick={() => setActiveAdminTab('retiros')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      withdrawHistory.filter(w => w.status === 'pendiente' || w.status === 'Pendiente').length > 0
                        ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400 hover:border-yellow-500/50'
                        : 'border-white/5 bg-zinc-950/30 text-zinc-400 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-[9px] block text-yellow-505 uppercase font-black tracking-wider">Solicitudes de Retiro</span>
                    <strong className="text-base font-black">
                      {withdrawHistory.filter(w => w.status === 'pendiente' || w.status === 'Pendiente').length}
                    </strong>
                  </button>
                </div>

                {/* SEARCH BAR */}
                <div className="relative font-sans">
                  <input
                    type="text"
                    placeholder="🔍 Buscar por username, correo o patrocinador (ej: fershu)..."
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

                <div className="space-y-2 font-sans flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Estado:</span>
                  <button 
                    onClick={() => setAdminUserFilter('todos')} 
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${adminUserFilter === 'todos' ? 'bg-[#39FF14] text-black' : 'bg-zinc-900 text-zinc-400'}`}
                  >
                    Todos
                  </button>
                  <button 
                    onClick={() => setAdminUserFilter('activos')} 
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${adminUserFilter === 'activos' ? 'bg-emerald-900 border border-emerald-500/20 text-emerald-300' : 'bg-zinc-900 text-zinc-400'}`}
                  >
                    Activos
                  </button>
                  <button 
                    onClick={() => setAdminUserFilter('pendientes')} 
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${adminUserFilter === 'pendientes' ? 'bg-yellow-950 border border-yellow-500/20 text-yellow-500' : 'bg-zinc-900 text-zinc-400'}`}
                  >
                    Pendientes
                  </button>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {(() => {
                    const filtered = allUsers.filter(u => {
                      if (!u.username) return false;
                      
                      // 1. Status filter
                      if (adminUserFilter === 'activos' && u.status !== 'active') return false;
                      if (adminUserFilter === 'pendientes') {
                        const isPending = u.status === 'pending' || u.status === 'pendiente' || !u.status || (u.isRegistered && u.status !== 'active');
                        if (!isPending) return false;
                      }

                      // 2. Search query filter
                      const query = adminUserSearch.toLowerCase().trim();
                      if (!query) return true;

                      const usrName = u.username.toLowerCase();
                      const email = u.email ? u.email.toLowerCase() : '';
                      const invitedBy = u.invitedBy ? u.invitedBy.toLowerCase() : '';

                      if (query === 'fershu' || query === 'fershot' || query === 'fersh') {
                        return (
                          invitedBy.includes('fershu') ||
                          invitedBy.includes('fershot') ||
                          invitedBy.includes('fersh') ||
                          usrName.includes(query) ||
                          email.includes(query)
                        );
                      }

                      return (
                        usrName.includes(query) ||
                        email.includes(query) ||
                        invitedBy.includes(query)
                      );
                    });

                    if (filtered.length === 0) {
                      return <p className="text-center py-8 text-xs text-zinc-500">Ningún usuario coincide con los criterios de búsqueda o filtro.</p>;
                    }

                    return filtered.map((u) => {
                      const isOwner = u.username.toLowerCase().trim() === 'admin_tapp' || u.username.toLowerCase().trim() === 'orinoco_admin';
                      return (
                        <div 
                          key={u.username}
                          className="p-4 rounded-2xl border border-white/5 bg-black/45 space-y-3 hover:border-white/10 transition-all"
                        >
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white font-extrabold text-[13px]">@{u.username}</span>
                                <span className="text-[10px] text-zinc-500 font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5">
                                  📅 {u.createdAt || registrations.find(r => r.username && r.username.toLowerCase().trim() === u.username.toLowerCase().trim())?.date || '11/06/2026'}
                                </span>
                              </div>
                              {u.invitedBy && (
                                <span className="text-[10px] text-zinc-500 font-normal block mt-1">
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

                          {(() => {
                            const cleanUsrName = u.username ? u.username.toLowerCase().trim() : '';
                            const actualReferred = allUsers.filter(refUser => {
                              if (!refUser.invitedBy || refUser.status !== 'active') return false;
                              return refUser.invitedBy.toLowerCase().trim() === cleanUsrName;
                            });
                            const actualCount = actualReferred.length;
                            const actualCommissions = actualReferred.reduce((total, refUser) => {
                              return total + 1.50;
                            }, 0);

                            return (
                              <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-400 bg-zinc-950/40 p-2.5 rounded-lg border border-white/5">
                                  <div>Email: <strong className="text-zinc-300 select-all">{u.email || 'N/A'}</strong></div>
                                  <div>Contraseña: <strong className="text-yellow-500 select-all">{u.password || 'N/A'}</strong></div>
                                  <div>VIP Actual: <strong className="text-purple-300 uppercase font-bold">{u.vipLevel}</strong></div>
                                  <div>Comisiones Guardadas: <strong className="text-[#39FF14]">{u.inviteCommissionsEarned || 0} USD</strong></div>
                                  <div>Invitados Guardados: <strong className="text-zinc-300">{u.inviteCount || 0}</strong></div>
                                  <div>Comisiones Reales: <strong className="text-emerald-400">{actualCommissions.toFixed(2)} USD</strong></div>
                                  <div>Invitados Reales: <strong className="text-emerald-400">{actualCount} activos (con depósito)</strong></div>
                                  {u.walletAddress && (
                                    <div className="sm:col-span-2 border-t border-white/5 pt-1.5 mt-0.5 text-zinc-400">
                                      Billetera o Pago de Retiro: <strong className="text-[#39FF14] select-all font-mono break-all">{u.walletAddress}</strong>
                                    </div>
                                  )}
                                  {u.proofFileBlob ? (
                                    <div className="sm:col-span-2 border-t border-white/5 pt-1.5 mt-0.5 flex items-center gap-2 flex-wrap">
                                      <span className="text-[10px] text-zinc-500 uppercase font-extrabold">Voucher de Pago:</span>
                                      <button
                                        type="button"
                                        onClick={() => setAdminZoomImage(u.proofFileBlob!)}
                                        className="inline-flex items-center gap-1 bg-purple-950/50 border border-purple-500/40 hover:border-[#39FF14] text-[#39FF14] px-2.5 py-0.5 rounded text-[10px] uppercase font-black hover:bg-purple-900/60 cursor-zoom-in transition-all active:scale-95"
                                      >
                                        👁️ Ver Capture de Pago 🔍
                                      </button>
                                    </div>
                                  ) : u.proofFileName ? (
                                    <div className="sm:col-span-2 border-t border-white/5 pt-1.5 mt-0.5 text-zinc-500 flex items-center gap-1 text-[10px]">
                                      <span>Archivo Capture:</span>
                                      <span className="font-mono text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-white/5">{u.proofFileName}</span>
                                    </div>
                                  ) : null}
                                  <div className="sm:col-span-2 text-zinc-500 border-t border-white/5 pt-1.5 mt-0.5">📅 Fecha de Ingreso: <strong className="text-zinc-300 font-mono">{u.createdAt || registrations.find(r => r.username && r.username.toLowerCase().trim() === u.username.toLowerCase().trim())?.date || '11/06/2026'}</strong></div>
                                </div>

                                {actualCount > 0 ? (
                                  <div className="text-[10px] bg-emerald-950/20 border border-emerald-500/10 p-2.5 rounded-xl text-emerald-400 font-sans space-y-1">
                                    <span className="font-bold flex items-center gap-1 text-[11px]">👥 Invitados Activos ({actualCount}):</span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {actualReferred.map(refUser => (
                                        <span key={refUser.username} className="bg-emerald-950/60 border border-emerald-500/25 px-2 py-0.5 rounded font-mono text-[9px] text-emerald-300">
                                          @{refUser.username} ({refUser.vipLevel})
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-[10px] bg-zinc-950/40 border border-white/5 p-2 rounded-xl text-zinc-550 font-sans">
                                    ℹ️ No tiene invitados activos con depósito aprobados en base de datos.
                                  </div>
                                )}

                                <div className="flex justify-start">
                                  <button
                                    onClick={async () => {
                                      if (window.confirm(`🔄 ¿Quieres ajustar las estadísticas guardadas de @${u.username} en la base de datos?\n\nActuales en DB:\n- Invitados: ${u.inviteCount || 0}\n- Comisiones: ${u.inviteCommissionsEarned || 0} USD\n\nNuevos Valores Reales:\n- Invitados: ${actualCount}\n- Comisiones: ${actualCommissions.toFixed(2)} USD`)) {
                                        try {
                                          await ensureAdminSessionSync();
                                          const userRef = doc(db, 'users', cleanUsrName);
                                          await updateDoc(userRef, {
                                            inviteCount: actualCount,
                                            inviteCommissionsEarned: actualCommissions
                                          });
                                          setAllUsers(prev => prev.map(usr => usr.username && usr.username.toLowerCase().trim() === cleanUsrName ? {
                                            ...usr,
                                            inviteCount: actualCount,
                                            inviteCommissionsEarned: actualCommissions
                                          } : usr));
                                          alert(`✅ ¡Estadísticas de @${u.username} sincronizadas de modo exacto!`);
                                        } catch (err: any) {
                                          alert(`Error al sincronizar: ${err.message}`);
                                        }
                                      }
                                    }}
                                    className="px-2.5 py-1.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/30 hover:border-purple-400 text-purple-300 hover:text-white transition-all text-[9.5px] font-black uppercase rounded-lg cursor-pointer flex items-center gap-1 active:scale-95"
                                  >
                                    🔄 Corregir/Sincronizar (Real vs Guardado)
                                  </button>
                                </div>
                              </>
                            );
                          })()}

                          <div className="flex flex-col sm:flex-row gap-3 bg-zinc-950/80 p-3 rounded-xl border border-white/5 sm:items-end">
                            {/* VIP Select */}
                            <div className="flex-1 min-w-[130px]">
                              <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Cambiar Rango VIP</label>
                              <select
                                value={u.vipLevel || 'VIP PLATA 10$'}
                                disabled={isOwner}
                                onChange={async (e) => {
                                  const newLvl = e.target.value as VipLevel;
                                  const price = getLevelPriceInUsd(newLvl);
                                  try {
                                    await ensureAdminSessionSync();
                                    await handleApproveUser(u.username, price, newLvl);
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
                                        // Clean any undefined properties to satisfy Firestore setDoc constraints
                                        Object.keys(updatedUser).forEach(key => {
                                          if ((updatedUser as any)[key] === undefined) {
                                            delete (updatedUser as any)[key];
                                          }
                                        });
                                        try {
                                          await ensureAdminSessionSync();
                                          await setDoc(doc(db, 'users', u.username.toLowerCase().trim()), updatedUser);
                                          setAllUsers(prev => prev.map(usr => usr.username && u.username && usr.username.toLowerCase() === u.username.toLowerCase() ? updatedUser : usr));
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
                                    const price = getLevelPriceInUsd(u.vipLevel || 'VIP PLATA 10$');
                                    try {
                                      await ensureAdminSessionSync();
                                      await handleApproveUser(u.username, price, u.vipLevel);
                                      alert(`✅ @${u.username} ha sido ACTIVADO exitosamente con sus comisiones calculadas y pagadas.`);
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
                                      if (window.confirm(`⚠️ Por favor, confirma nuevamente la eliminación definitiva de @${u.username}:`)) {
                                        try {
                                          await ensureAdminSessionSync();
                                          const targetUsernameClean = u.username.toLowerCase().trim();
                                          
                                          // 1. Delete user from 'users'
                                          await deleteDoc(doc(db, 'users', targetUsernameClean));
                                          
                                          // 2. Clear out any registrations matching this user to prevent auto-healing recreate loops
                                          const matchedRegs = registrations.filter(r => r.username && r.username.toLowerCase().trim() === targetUsernameClean);
                                          for (const reg of matchedRegs) {
                                            await deleteDoc(doc(db, 'registrations', reg.id));
                                          }
                                          
                                          setAllUsers(prev => prev.filter(usr => usr.username.toLowerCase() !== u.username.toLowerCase()));
                                          alert(`✅ ¡Usuario @${u.username} y sus registros de activación fueron eliminados de la base de datos!`);
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
                  })()}
                </div>
              </div>
            )}

            {/* TAB CONTENT: SOPORTE DE RECOVERY REQUESTS */}
            {activeAdminTab === 'recuperaciones' && (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 text-left font-sans">
                <div className="bg-purple-950/20 rounded-xl p-3 border border-purple-500/15 flex items-center gap-3 text-xs text-purple-300">
                  <div className="h-5 w-5 bg-purple-500/10 rounded-full flex items-center justify-center font-bold shrink-0">i</div>
                  <p className="leading-normal font-sans">
                    <strong>Solicitudes de Soporte (Recuperación de Claves):</strong> Aquí puedes ver los usuarios del sistema que han solicitado recuperar/cambiar su contraseña. Revisa su contraseña actual o escribe una nueva clave para activarla al instante.
                  </p>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {recoveryRequests.filter(r => r.status === 'pending').length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 space-y-2">
                      <p className="text-sm">🎉 ¡Todo controlado!</p>
                      <p className="text-[10px]">No hay solicitudes pendientes de recuperación de clave.</p>
                    </div>
                  ) : (
                    recoveryRequests.filter(r => r.status === 'pending').map((r) => {
                      return (
                        <div 
                          key={r.id}
                          className="p-4 rounded-2xl border border-[#39FF14]/25 bg-black/45 space-y-3 hover:border-[#39FF14]/40 transition-all font-mono animate-fade-in"
                        >
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[#39FF14] font-extrabold text-[13px]">@{r.username}</span>
                                <span className="text-[8px] uppercase bg-purple-950 text-purple-300 font-bold px-1.5 py-0.5 rounded border border-purple-500/20 animate-pulse">
                                  Pendiente
                                </span>
                              </div>
                              <p className="text-[9px] text-zinc-500 mt-1">📅 Solicitado: {r.requestedAt}</p>
                              <p className="text-[10px] text-zinc-400 mt-1">Correo Registrado: <strong className="text-white">{r.email}</strong></p>
                            </div>
                            
                            <div className="bg-zinc-950/80 px-2.5 py-1 rounded border border-white/5 text-[10px] text-right">
                              <span className="text-zinc-500 font-sans block text-[8px] uppercase">Contraseña actual:</span>
                              <span className="text-yellow-400 font-black tracking-widest">{r.oldPassword}</span>
                            </div>
                          </div>

                          {/* Quick Approval for Requested Password */}
                          {r.requestedNewPassword && (
                            <div className="bg-[#39FF14]/5 border border-[#39FF14]/15 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs my-2">
                              <div>
                                <span className="text-zinc-400 font-sans block text-[8.5px] uppercase tracking-wider">Nueva Contraseña Solicitada por el Usuario:</span>
                                <span className="text-[#39FF14] text-[14px] font-extrabold tracking-wide">{r.requestedNewPassword}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleResolveRecovery(r.username, r.requestedNewPassword!)}
                                className="h-8 px-4 rounded-xl bg-[#39FF14] text-black font-sans font-black text-[10px] uppercase hover:bg-[#34e512] transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-[0_0_15px_rgba(57,255,20,0.25)] border-none shrink-0"
                              >
                                Aprobar Nueva Clave ✅
                              </button>
                            </div>
                          )}

                          {/* Action Form */}
                          <div className="border-t border-white/5 pt-3 mt-2">
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const newPass = formData.get('newPass') as string;
                                handleResolveRecovery(r.username, newPass);
                              }}
                              className="flex gap-2 flex-wrap sm:flex-nowrap"
                            >
                              <input
                                name="newPass"
                                type="text"
                                required
                                placeholder="O escribe otra clave manualmente si deseas cambiarla..."
                                className="flex-1 text-xs font-semibold bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-[#39FF14] placeholder-zinc-700 focus:outline-none focus:border-[#39FF14]"
                              />
                              <div className="flex gap-1.5 shrink-0">
                                <button
                                  type="submit"
                                  className="h-8 px-3 rounded-lg bg-zinc-800 text-white font-sans font-black text-[9px] uppercase hover:bg-zinc-750 transition-all cursor-pointer whitespace-nowrap border border-white/10"
                                >
                                  Forzar Clave Alterna 🔑
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (window.confirm(`¿Seguro que deseas descartar la solicitud de recuperación de @${r.username}?`)) {
                                      try {
                                        await deleteDoc(doc(db, 'recovery_requests', r.id));
                                        alert("Solicitud eliminada con éxito.");
                                      } catch (err: any) {
                                        alert("Error al eliminar: " + err.message);
                                      }
                                    }
                                  }}
                                  className="h-8 px-2.5 rounded-lg bg-red-950/40 text-red-400 border border-red-500/10 hover:bg-red-900 hover:text-white transition-all text-[9px] uppercase cursor-pointer"
                                >
                                  Descartar
                                </button>
                              </div>
                            </form>
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

      {/* MODAL DE AUTENTICACIÓN RÁPIDA DE ADMINISTRADOR */}
      {showAdminCodePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-[24px] border border-purple-500/30 bg-zinc-950 p-6 shadow-[0_0_50px_rgba(168,85,247,0.2)] space-y-4 text-left animate-fade-in font-sans">
            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-400">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Código de Administrador</h3>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Ingresa la clave maestra para verificar tu acceso administrativo y habilitar las herramientas de control.
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="password"
                placeholder="Clave de 4 dígitos"
                value={adminUnlockCode}
                onChange={(e) => setAdminUnlockCode(e.target.value)}
                className="w-full text-center text-xs font-semibold bg-black border border-white/10 rounded-xl px-4 py-2.5 text-[#39FF14] tracking-widest focus:outline-none focus:border-[#39FF14]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (adminUnlockCode === '7340' || adminUnlockCode === '26304421' || adminUnlockCode === '7341') {
                      setIsAdminVerified(true);
                      setShowAdminCodePrompt(false);
                      setAdminUnlockCode('');
                      alert("🔓 ¡Sesión administrativa verificada exitosamente! El panel superior de control ha sido habilitado.");
                    } else {
                      alert("❌ Código incorrecto.");
                    }
                  }
                }}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminCodePrompt(false);
                    setAdminUnlockCode('');
                  }}
                  className="w-1/2 py-2.5 bg-zinc-900 border border-white/5 hover:bg-zinc-805 text-[10px] text-zinc-400 font-bold uppercase rounded-xl transition-all cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (adminUnlockCode === '7340' || adminUnlockCode === '26304421' || adminUnlockCode === '7341') {
                      setIsAdminVerified(true);
                      setShowAdminCodePrompt(false);
                      setAdminUnlockCode('');
                      alert("🔓 ¡Sesión administrativa verificada exitosamente! El panel superior de control ha sido habilitado.");
                    } else {
                      alert("❌ Código incorrecto.");
                    }
                  }}
                  className="w-1/2 py-2.5 bg-[#39FF14] text-black text-[10px] font-black uppercase rounded-xl transition-all cursor-pointer hover:bg-[#34e512] text-center"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for zooming in on payment captures */}
      {adminZoomImage && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in font-sans">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={() => {
                const w = window.open();
                if (w) {
                  w.document.write(`<img src="${adminZoomImage}" style="max-width:105%; margin:20px auto; display:block;" />`);
                  w.document.title = "Comprobante de Pago Tappmusic";
                } else {
                  alert("Por favor habilita las ventanas emergentes si deseas imprimir/descargar.");
                }
              }}
              className="px-3 py-1.5 bg-zinc-900 border border-white/10 hover:border-white/30 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all active:scale-95"
            >
              📥 Abrir en Ventana Nueva
            </button>
            <button
              onClick={() => setAdminZoomImage(null)}
              className="h-8 w-8 flex items-center justify-center rounded-xl bg-[#39FF14] text-black font-black text-sm hover:scale-105 active:scale-95 cursor-pointer transition-all shadow-[0_0_15px_rgba(57,255,20,0.4)]"
              title="Cerrar Imagen"
            >
              ✕
            </button>
          </div>

          <div className="relative w-full max-w-lg lg:max-w-2xl bg-zinc-950 p-2 border border-white/10 rounded-[28px] overflow-hidden flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="p-3 w-full text-center border-b border-white/5 text-zinc-400 text-xs font-mono">
              🔎 COMPROBANTE DE PAGO EN ALTA RESOLUCIÓN (VOUCHER)
            </div>
            
            <div className="p-2 overflow-auto max-h-[70vh] flex items-center justify-center">
              <img
                src={adminZoomImage}
                alt="Capture ampliado"
                className="max-w-full max-h-[60vh] object-contain rounded-2xl border border-white/5 shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-3 border-t border-white/5 w-full flex justify-between items-center text-[10px] text-zinc-500 font-mono">
              <span>Haga clic fuera para cerrar</span>
              <button
                onClick={() => setAdminZoomImage(null)}
                className="text-white hover:text-[#39FF14] transition-all font-sans font-bold"
              >
                CERRAR ✕
              </button>
            </div>
          </div>
          
          <div className="absolute inset-0 -z-10 cursor-zoom-out" onClick={() => setAdminZoomImage(null)} />
        </div>
      )}

      {/* MODAL: GUÍA DE FE, CONFIANZA E INSTALACIÓN SEGURA DE LA APK */}
      {showApkGuide && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto animate-fade-in font-sans">
          <div className="relative w-full max-w-lg bg-zinc-950 p-6 border border-[#39FF14]/30 rounded-[32px] shadow-[0_0_50px_rgba(57,255,20,0.2)]">
            
            {/* Close Button */}
            <button
              onClick={() => setShowApkGuide(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              ✕
            </button>

            <div className="space-y-5 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center text-xl">
                🛡️
              </div>

              <div>
                <h3 className="text-lg font-black tracking-widest text-[#39FF14] uppercase">
                  Tappmusic es 100% Seguro
                </h3>
                <p className="text-[10px] font-mono campo-guias text-zinc-500 mt-1">
                  Certificación de Confianza & Guía de Android Sideload
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-900/60 border border-white/5 p-4 text-left text-xs text-zinc-300 leading-relaxed space-y-3">
                <p className="text-[11px] text-zinc-400 font-mono leading-normal">
                  Hermanito, como nuestra aplicación oficial <strong className="text-white">Tappmusic v1.0.apk</strong> se descarga directamente desde nuestro servidor de confianza sin pasar primero por la tienda de Google Play Store, Android muestra mensajes genéricos de alerta como <strong className="text-yellow-400">"Permitir de esta fuente"</strong>, <strong className="text-yellow-400">"Peligro"</strong> o <strong className="text-yellow-400">"Daño de app desconocida"</strong>. ¡Es totalmente normal y seguro continuar!
                </p>

                <div className="border-t border-white/5 pt-3 space-y-2">
                  <p className="font-extrabold text-[#39FF14] uppercase tracking-wider text-[10px] font-mono">
                    Sigue estos sencillos pasos:
                  </p>
                  
                  <div className="flex gap-2">
                    <span className="h-5 w-5 rounded bg-[#39FF14]/15 border border-[#39FF14]/30 text-[#39FF14] font-black text-[10px] flex items-center justify-center shrink-0">1</span>
                    <p className="text-[11px] leading-normal text-zinc-300">
                      Haz clic en <strong>“Descargar APK”</strong>. Si te sale la ventana de instalación, haz clic en <strong className="text-white">CONFIGURACIÓN</strong> y activa <strong className="text-[#39FF14]">"Confiar en esta fuente"</strong>.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <span className="h-5 w-5 rounded bg-[#39FF14]/15 border border-[#39FF14]/30 text-[#39FF14] font-black text-[10px] flex items-center justify-center shrink-0">2</span>
                    <div className="text-[11px] leading-normal text-zinc-300">
                      <p className="font-bold text-yellow-400 flex items-center gap-1">🛡️ Sí sale "Play Protect Bloqueó la App":</p>
                      <p className="text-zinc-400 text-[10px] leading-normal">
                        Haz clic abajo en <strong className="text-white">"Más detalles" ⬇️</strong> y selecciona <strong className="text-[#39FF14] font-black">"Instalar de todas formas"</strong>. No le des a "Entendido", ya que eso aborta la instalación.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className="h-5 w-5 rounded bg-[#39FF14]/15 border border-[#39FF14]/30 text-[#39FF14] font-black text-[10px] flex items-center justify-center shrink-0">3</span>
                    <div className="text-[11px] leading-normal text-zinc-300">
                      <p className="font-bold text-yellow-400 flex items-center gap-1">❌ Sí sale "No se instaló la app":</p>
                      <p className="text-zinc-400 text-[10px] leading-normal">
                        Ocurre porque ya tienes una versión anterior o de prueba de Tappmusic en tu móvil. <strong className="text-red-400">Desinstala la versión vieja por completo</strong> antes de abrir el nuevo instalador.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className="h-5 w-5 rounded bg-[#39FF14]/15 border border-[#39FF14]/30 text-[#39FF14] font-black text-[10px] flex items-center justify-center shrink-0">4</span>
                    <p className="text-[11px] leading-normal text-zinc-400">
                      Si usas Xiaomi/Redmi, marca la casilla "Soy consciente de los riesgos" y dale <strong className="text-[#39FF14]">Aceptar</strong>.
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 text-center">
                  <span className="inline-block text-[9px] font-mono bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/25 px-2.5 py-1 rounded-full uppercase font-bold tracking-wider animate-pulse">
                    ✅ App Original Libre de Malware
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowApkGuide(false)}
                  className="w-full h-11 rounded-2xl bg-[#39FF14] text-black font-extrabold text-xs uppercase hover:bg-white transition-all cursor-pointer shadow-[0_0_15px_rgba(57,255,20,0.25)] active:scale-95"
                >
                  Entendido, deseo instalarla
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Control Ajustable de Zoom / Escala de Pantalla (Adaptable en tiempo real) */}
      <div className="fixed bottom-4 right-4 z-40 bg-zinc-950/90 border border-[#39FF14]/20 hover:border-[#39FF14]/50 px-3 py-1.5 rounded-2xl shadow-[0_0_20px_rgba(57,255,20,0.1)] transition-all font-mono flex items-center gap-2 select-none">
        <span className="text-[10px] uppercase font-black text-zinc-400 select-none tracking-wider flex items-center gap-1">
          <span>🔍</span> <span className="hidden sm:inline">Pantalla:</span>
        </span>
        <span className="text-[11px] font-bold text-[#39FF14] bg-black px-2 py-0.5 rounded-lg border border-[#39FF14]/15 min-w-[42px] text-center">
          {Math.round(zoomScale * 100)}%
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomScale(m => Math.max(0.70, m - 0.05))}
            className="text-xs bg-zinc-900 border border-white/5 hover:bg-[#39FF14] hover:text-black hover:scale-105 active:scale-95 text-zinc-300 font-bold w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer"
            title="Alejar pantalla (Zoom Out)"
          >
            -
          </button>
          <button
            onClick={() => setZoomScale(1.0)}
            className="text-[9px] bg-zinc-900 border border-white/5 hover:bg-[#39FF14] hover:text-black hover:scale-105 active:scale-95 text-zinc-300 px-2 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer font-black"
            title="Restaurar escala original (100%) font-black"
          >
            100%
          </button>
          <button
            onClick={() => setZoomScale(m => Math.min(1.40, m + 0.05))}
            className="text-xs bg-zinc-900 border border-white/5 hover:bg-[#39FF14] hover:text-black hover:scale-105 active:scale-95 text-zinc-300 font-bold w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer"
            title="Acercar pantalla (Zoom In)"
          >
            +
          </button>
        </div>
      </div>

    </div>
  );
}
