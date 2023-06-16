
import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, onDisconnect, remove } from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

import { createName } from './components/functions';

// Firebase configuration
const firebaseConfig = {
  // Your Firebase configuration
  apiKey: "AIzaSyBgjtQU9Kdw1v1ZgY0iHL9WfV8ao8RCMfg",
  authDomain: "penny-powerplays.firebaseapp.com",
  projectId: "penny-powerplays",
  storageBucket: "penny-powerplays.appspot.com",
  messagingSenderId: "91939738441",
  appId: "1:91939738441:web:8a1216a1430a1457690098",
  measurementId: "G-ZWS3GQ0JCE"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [nameInput, setNameInput] = useState('');
  const [contributionInput, setContributionInput] = useState('');

  useEffect(() => {
    const handleAuthStateChanged = (user) => {
      console.log('Auth state changed:', user);

      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        set(userRef, {
          anonymous: true,
          name: createName(),
          money: 10000,
          hasContributed: "Unready",
          isAlive: "Alive",
        })
          .then(() => {
            console.log('User reference added to the database');
          })
          .catch((error) => {
            console.log('Error adding user reference:', error);
          });
      } else {
        console.log("User failed to sign in anonymously.");
      }
    };

    const handleLeaderboardData = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const leaderboardData = Object.entries(data).map(([userId, userData]) => ({
          id: userId,
          name: userData.name,
          money: userData.money,
          hasContributed: userData.hasContributed,
          isAlive: userData.isAlive,
        }));
        setLeaderboard(leaderboardData);
      }
    };

    const handleDisconnect = () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        onDisconnect(userRef).remove()
          .then(() => {
            console.log('User reference removed on disconnect');
          })
          .catch((error) => {
            console.log('Error removing user reference on disconnect:', error);
          });
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, handleAuthStateChanged);
    const leaderboardRef = ref(database, 'users');
    const unsubscribeLeaderboard = onValue(leaderboardRef, handleLeaderboardData);

    return () => {
      unsubscribeAuth();
      unsubscribeLeaderboard();
      handleDisconnect();
    };
  }, [auth, database]);

  const handleNameChange = () => {
    if (nameInput.trim() !== '') {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        set(userRef, { ...leaderboard.find((player) => player.id === user.uid), name: nameInput })
          .then(() => {
            console.log('User name updated in the database');
          })
          .catch((error) => {
            console.log('Error updating user name:', error);
          });
      }
    }
  };

  const handleContributionChange = () => {
    if (contributionInput.trim() !== '') {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        set(userRef, {
          ...leaderboard.find((player) => player.id === user.uid),
          money: leaderboard.find((player) => player.id === user.uid).money - parseInt(contributionInput, 10),
        })
          .then(() => {
            console.log('User money updated in the database');
          })
          .catch((error) => {
            console.log('Error updating user money:', error);
          });
      }
    }
  };

  return (
    <div>
      <h2>Leaderboard</h2>
      <ul>
        {leaderboard.map((player) => (
          <p key={player.id}>
            {player.name} | {player.isAlive} | ${player.money} | {player.hasContributed}
          </p>
        ))}
      </ul>
      <div>
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Enter your name"
        />
        <button onClick={handleNameChange}>Change Name</button>
      </div>
      <div>
        <input
          type="number"
          min="0"
          value={contributionInput}
          onChange={(e) => setContributionInput(e.target.value)}
          placeholder="Enter your contributions"
        />
        <button onClick={handleContributionChange}>Submit Contributions</button>
      </div>
    </div>
  );
}

export default App;
