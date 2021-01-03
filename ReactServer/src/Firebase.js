import firebase from 'firebase';

const config = {
  apiKey: "AIzaSyBty39GwB91gMyUZbAYHDK3OR-x6ZrcT9E",
  authDomain: "rebis-9aeb6.firebaseapp.com",
  databaseURL: "https://rebis-9aeb6-default-rtdb.firebaseio.com",
  projectId: "rebis-9aeb6",
  storageBucket: "rebis-9aeb6.appspot.com",
  messagingSenderId: "627613124461",
  appId: "1:627613124461:web:9e7490e23b48ed0aa6fc64"
};
firebase.initializeApp(config);

export default firebase;
