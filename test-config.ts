import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const docRef = doc(db, 'config', 'withdrawals');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    console.log('CONFIG:', snap.data());
  } else {
    console.log('CONFIG NOT FOUND!');
  }
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
