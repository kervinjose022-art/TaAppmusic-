import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import * as fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, config.firestoreDatabaseId || "(default)");

async function main() {
  const docRef = doc(db, "users", "abdiel");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log("FIRESTORE DATA FOR abdiel:");
    console.log(JSON.stringify(docSnap.data(), null, 2));
  } else {
    console.log("Document users/abdiel does not exist in Firestore!");
  }
}

main().catch(console.error);
