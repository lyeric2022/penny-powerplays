import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, onDisconnect, remove } from 'firebase/database';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';

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
const provider = new GoogleAuthProvider();

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [nameInput, setNameInput] = useState('');
  const [contributionInput, setContributionInput] = useState('');

  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    const handleAuthStateChanged = (user) => {
      console.log('Auth state changed:', user);

      if (user) {
        setIsSignedIn(true);
        const userRef = ref(database, `users/${user.uid}`);
        set(userRef, {
          anonymous: false,
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
        setIsSignedIn(false);
        console.log("User is not signed in.");
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

    // Log the user every 5 seconds
    const interval = setInterval(() => {
      const user = auth.currentUser;
      console.log('Current user:', user);
    }, 5000);

    return () => {
      clearInterval(interval);
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

  const handleSignInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log('Successfully signed in with Google:', result.user);
      })
      .catch((error) => {
        console.log('Error signing in with Google:', error);
      });
  };

  const handleDeleteUsers = () => {
    const password = 'iloveher'; // Set the correct password here
    if (passwordInput === password) {
      const userRef = ref(database, 'users');
      remove(userRef)
        .then(() => {
          console.log('All users deleted from the database');
        })
        .catch((error) => {
          console.log('Error deleting users:', error);
        });
    } else {
      console.log('Incorrect password');
    }
  };

  return (
    <div>
      {isSignedIn ? (
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
          <div>
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter the password"
              />
              <button onClick={handleDeleteUsers}>Delete All Users</button>
            </div>
          </div>
        </div>

      ) : (
        <div>
          <h2>Please sign in with Google:</h2>
          <button onClick={handleSignInWithGoogle}>Sign In with Google</button>
        </div>
      )}
    </div>
  );
}

export default App;