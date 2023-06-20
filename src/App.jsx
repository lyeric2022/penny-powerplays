import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, onDisconnect, remove, update } from 'firebase/database';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';

import { createName } from './components/functions';

import StoryTheme from './components/StoryTheme';

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

let userIsReferenced = false;

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  const [nameInput, setNameInput] = useState(createName());
  const [contributionInput, setContributionInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {

    // Function to handle authentication state changes
    const handleAuthStateChanged = (user) => {

      console.log('Auth state changed:', user);

      if (user) {
        // If user is signed in
        setIsSignedIn(true);
        const userRef = ref(database, `users/${user.uid}`);

        set(userRef, {
          name: nameInput,
          money: 10000,
          status: "unready",
          contributionAmount: 0,
          lastContributionAmount: 0,
          livesLeft: 2,
          isAlive: "alive",
        })
          .then(() => {
            console.log('User reference added to the database');
          })
          .catch((error) => {
            console.log('Error adding user reference:', error);
          });
      } else {
        // If user is signed out
        setIsSignedIn(false);
        console.log("User is not signed in.");
      }
    };

    // Function to handle leaderboard data
    const handleLeaderboardData = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const leaderboardData = Object.entries(data).map(([userId, userData]) => ({
          id: userId,
          name: userData.name,
          money: userData.money,
          status: userData.status,
          contributionAmount: userData.contributionAmount,
          lastContributionAmount: userData.lastContributionAmount,
          livesLeft: userData.livesLeft,
          isAlive: userData.isAlive,
        }));
        setLeaderboard(leaderboardData);
      }
    };

    // Function to remove user reference on disconnect
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

    // Subscribe to authentication state changes
    const unsubscribeAuth = onAuthStateChanged(auth, handleAuthStateChanged);
    // Subscribe to leaderboard data changes
    const leaderboardRef = ref(database, 'users');
    const unsubscribeLeaderboard = onValue(leaderboardRef, handleLeaderboardData);

    // // Log the user every 5 seconds
    // const interval = setInterval(() => {
    //   const user = auth.currentUser;
    //   console.log('Current user:', user);
    // }, 10000);

    // Clean up functions
    return () => {
      // clearInterval(interval);
      unsubscribeAuth();
      unsubscribeLeaderboard();
      handleDisconnect();
    };
  }, [auth, database]);

  const handleStartClick = () => {
    const readyPlayers = leaderboard.filter((player) => player.status === 'ready');

    if (readyPlayers.length === leaderboard.length) {
      const sortedPlayers = [...leaderboard].sort((a, b) => a.contributionAmount - b.contributionAmount);
      const lowestContributor = sortedPlayers[0];

      const updates = {};

      leaderboard.forEach((player) => {
        const userRef = ref(database, `users/${player.id}`);
        const updatedData = {
          ...player,
          money: player.money - player.contributionAmount,
          status: 'unready',
          lastContributionAmount: player.contributionAmount,
          livesLeft: player === lowestContributor ? player.livesLeft - 1 : player.livesLeft,
        };

        if (updatedData.livesLeft > 0) {
          updates[`/${player.id}`] = updatedData;
        } else {
          // Remove the player from the database and leaderboards
          remove(userRef)
            .then(() => {
              console.log('Player removed:', player.name);
            })
            .catch((error) => {
              console.log('Error removing player:', error);
            });
        }
      });

      const leaderboardRef = ref(database, 'users');
      update(leaderboardRef, updates)
        .then(() => {
          console.log('Contributions deducted and statuses reset');
        })
        .catch((error) => {
          console.log('Error deducting contributions and resetting statuses:', error);
        });
    } else {
      console.log('Not all players are ready.');
    }
  };



  // Function to handle name change
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
  // Function to handle contribution change
  const handleContributionChange = () => {
    if (contributionInput.trim() !== '') {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        let contribution = parseInt(contributionInput, 10);

        // Check if contribution is greater than user's income
        const userIncome = leaderboard.find((player) => player.id === user.uid).money;
        if (contribution > userIncome) {
          contribution = userIncome;
        }

        // Check if contribution is less than 0
        if (contribution < 0) {
          contribution = 0;
        }

        set(userRef, {
          ...leaderboard.find((player) => player.id === user.uid),
          status: "ready",
          contributionAmount: contribution,
        })
          .then(() => {
            console.log('User contribution updated in the database');
          })
          .catch((error) => {
            console.log('Error updating user contribution:', error);
          });
      }
    }
  };

  // Function to handle sign in with Google
  const handleSignInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log('Successfully signed in with Google:', result.user);
      })
      .catch((error) => {
        console.log('Error signing in with Google:', error);
      });
  };

  // Function to handle deleting all users
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

      window.location.reload(false);

    } else {
      console.log('Incorrect password');
    }
  };

  return (
    <div>
      {isSignedIn ? (
        // If user is signed in
        <div>
          <h2>Leaderboard</h2>
          <ul>
            {leaderboard.map((player) => (
              <p key={player.id}>
                {player.name} | Lives: {player.livesLeft} | Previous Contribution: ${player.lastContributionAmount} | ${player.money} | {player.status}
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
          <button onClick={handleStartClick}>Start</button>

          <div>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter the password"
            />
            <button onClick={handleDeleteUsers}>Restart Game</button>
          </div>

          <div>
            <h1>Story Theme</h1>
            {StoryTheme}
          </div>
        </div>

      ) : (
        // If user is signed out
        <div>
          <h2>Please sign in with Google:</h2>
          <button onClick={handleSignInWithGoogle}>Sign In with Google</button>
          {/* <p>btw im also accepting gf applications on a rolling basis. expiring soon!! </p> */}
        </div>
      )}
    </div>
  );
}

export default App;
