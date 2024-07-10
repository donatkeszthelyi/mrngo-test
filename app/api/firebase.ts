// firebase.js
import { initializeApp } from '@firebase/app';
import { getDatabase } from '@firebase/database';
import { getStorage } from '@firebase/storage';
import { ref } from '@firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyC7I9a-Xq2Aq65cHq6fwvF3vrcOTaOsY4A',
  authDomain: 'mrngo-test.firebaseapp.com',
  databaseURL:
    'https://mrngo-test-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'mrngo-test',
  storageBucket: 'mrngo-test.appspot.com',
  messagingSenderId: '205500868217',
  appId: '1:205500868217:web:21f062fd2ffd32ad3d16a8',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let ref2 = ref;

// Get a reference to the database service
const database = getDatabase(app);
const storage = getStorage(app);

export { database, firebaseConfig, storage, ref2 };
