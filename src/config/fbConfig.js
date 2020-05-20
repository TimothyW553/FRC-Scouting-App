import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

// Replace this with your own config details
var config = {
  apiKey: "AIzaSyAvQvZk-kSfCdphxw1U775GMEXBG5kD_lU",
  authDomain: "timothy-scoutingapp.firebaseapp.com",
  databaseURL: "https://timothy-scoutingapp.firebaseio.com",
  projectId: "timothy-scoutingapp",
  storageBucket: "timothy-scoutingapp.appspot.com",
  messagingSenderId: "283807375591",
  appId: "1:283807375591:web:aa58051441617e8fc9c242",
  measurementId: "G-W702XMZYSM"
};

firebase.initializeApp(config);
require("firebase/firestore");
require("firebase/database");
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });

db.collection("match_forms")
  .get()
  .then(snap => {
    var avg1 = 0;
    snap.docs.forEach(doc => {
      avg1 += doc.data().balls_scored;
    });
    avg1 /= snap.docs.length;
  });

export default firebase;
