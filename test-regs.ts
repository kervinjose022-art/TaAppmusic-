import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const snapUsers = await getDocs(collection(db, 'users'));
  console.log(`TOTAL_USERS:${snapUsers.size}`);
  snapUsers.forEach(doc => {
    const d = doc.data();
    console.log(`username: ${d.username}, inviteCount: ${d.inviteCount}, commissions: ${d.inviteCommissionsEarned}, status: ${d.status}, invitedBy: ${d.invitedBy}`);
  });
  
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
