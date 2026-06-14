import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const userRef = doc(db, 'users', 'fershu');
  const d = await getDoc(userRef);
  if (d.exists()) {
    console.log('Fershu before:', d.data());
    await updateDoc(userRef, {
      inviteCount: 0,
      inviteCommissionsEarned: 0
    });
    console.log('Fershu updated successfully to 0 commissions and 0 invite count.');
    
    // Check if updated
    const updated = await getDoc(userRef);
    console.log('Fershu after:', updated.data());
  } else {
    console.log('Fershu not found!');
  }
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
