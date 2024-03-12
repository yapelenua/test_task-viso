
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAonIdxQyZgJhkwzVjrlKIEztjCzgMJMZs",
  authDomain: "test-task-viso-2ca0a-5d7dc.firebaseapp.com",
  projectId: "test-task-viso-2ca0a",
  storageBucket: "test-task-viso-2ca0a.appspot.com",
  messagingSenderId: "537769224536",
  appId: "1:537769224536:web:852b06be1dc5e501691d2d"
};

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

export { firestore };