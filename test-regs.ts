import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const snap = await getDocs(collection(db, 'registrations'));
  console.log(`TOTAL_REGS:${snap.size}`);
  snap.forEach(doc => {
    const d = doc.data();
    console.log(`REG:${d.username}|VIP:${d.vipLevel}|REF:${d.invitedBy}|STATUS:${d.status}|DATE:${d.date}`);
  });
  
  const snapUsers = await getDocs(collection(db, 'users'));
  console.log(`TOTAL_USERS:${snapUsers.size}`);
  snapUsers.forEach(doc => {
    const d = doc.data();
    console.log(`USER:${d.username}|VIP:${d.vipLevel}|REF:${d.invitedBy}|STATUS:${d.status}`);
  });
  
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
