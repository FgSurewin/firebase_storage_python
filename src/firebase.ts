// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref } from "firebase/storage";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import dotenv from "dotenv";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
dotenv.config();

const firebaseConfig = {
	apiKey: process.env.apiKey,
	authDomain: process.env.authDomain,
	projectId: process.env.projectId,
	storageBucket: process.env.storageBucket,
	messagingSenderId: process.env.messagingSenderId,
	appId: process.env.appId,
	measurementId: process.env.measurementId,
};

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
// 	apiKey: "AIzaSyDzTRdoOMnCtqdYpRThfity0wE6WTNlufw",
// 	authDomain: "sidewalkproject-cb352.firebaseapp.com",
// 	projectId: "sidewalkproject-cb352",
// 	storageBucket: "sidewalkproject-cb352.appspot.com",
// 	messagingSenderId: "1030671248440",
// 	appId: "1:1030671248440:web:a50a7614077e3783898acd",
// 	measurementId: "G-C7FB4CSHBX",
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const storage = getStorage(app);
// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
// export const db = initializeFirestore(app, {
// 	experimentalForceLongPolling: true, // this line
// 	// useFetchStreams: false, // and this line
// });
