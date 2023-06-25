import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, onDisconnect, remove, update, get } from 'firebase/database';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';

import Leaderboard from './components/Leaderboard';

import HowToPlay from './components/HowToPlay';

import { createName } from './components/functions';

import ImageContainer from './components/ImageContainer';

import './App.css'; // Import the fonts.css file

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
  const [joinClicked, setJoinClicked] = useState(false); // State to track if the join button is clicked
  const [isGameLocked, setIsGameLocked] = useState(false); // State to track if the game is locked
  const [passwordInput, setPasswordInput] = useState('');

  const [nameInput, setNameInput] = useState(createName());
  const [contributionInput, setContributionInput] = useState('');

  const [leaderboard, setLeaderboard] = useState([]);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');

  const [currentPlayer, setCurrentPlayer] = useState(null);

  const [canChangeName, setCanChangeName] = useState(false);

  const [isFullWidth, setIsFullWidth] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {

    // Function to handle authentication state changes
    const handleAuthStateChanged = (user) => {
      console.log('Auth state changed:', user);

      if (user) {
        setIsSignedIn(true);
        const userRef = ref(database, `users/${user.uid}`);

        if (joinClicked && !isGameLocked) {
          // Add the user to the database only if the join button is clicked and the game is not locked
          set(userRef, {
            name: user.displayName || '',
            money: 10000,
            status: "✘",
            contributionAmount: 0,
            lastContributionAmount: 0,
            livesLeft: 3,
            isAlive: "alive",
            profilePictureUrl: user.photoURL || '',
          })
            .then(() => {
              console.log('User reference added to the database');
            })
            .catch((error) => {
              console.log('Error adding user reference:', error);
            });
        }

        setProfilePictureUrl(user.photoURL || '');
        setCurrentPlayer(user);
        setNameInput(user.displayName || '');
      } else {
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
          profilePictureUrl: userData.profilePictureUrl,
        }));
        // Sort leaderboardData array in descending order based on 'money' property
        leaderboardData.sort((a, b) => b.money - a.money);

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

    // Function to handle game lock status
    const handleGameLockStatus = (snapshot) => {
      const isLocked = snapshot.val() === true;
      setIsGameLocked(isLocked);
    };

    // Subscribe to game lock status changes
    const gameLockRef = ref(database, 'game/lock');
    const unsubscribeGameLock = onValue(gameLockRef, handleGameLockStatus);


    // Subscribe to authentication state changes
    const unsubscribeAuth = onAuthStateChanged(auth, handleAuthStateChanged);
    // Subscribe to leaderboard data changes
    const leaderboardRef = ref(database, 'users');
    const unsubscribeLeaderboard = onValue(leaderboardRef, handleLeaderboardData);

    // Clean up functions
    return () => {
      unsubscribeGameLock();
      unsubscribeAuth();
      unsubscribeLeaderboard();
      handleDisconnect();
    };
  }, [auth, database, joinClicked, isGameLocked]);

  const handleStartClick = () => {
    const readyPlayers = leaderboard.filter((player) => player.status === '✔');
    console.log(readyPlayers.length);
    console.log(leaderboard.length);

    if (readyPlayers.length === leaderboard.length) {
      const sortedPlayers = [...leaderboard].sort((a, b) => a.contributionAmount - b.contributionAmount);
      const lowestContributor = sortedPlayers[0];

      const updates = {};

      leaderboard.forEach((player) => {
        const userRef = ref(database, `users/${player.id}`);
        const updatedData = {
          ...player,
          money: player.money - player.contributionAmount,
          status: '✘',
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

  const handleLockClick = () => {
    const password = 'iloveher'; // Set your desired password here

    if (passwordInput === password) {
      const lockRef = ref(database, 'game/lock');
      get(lockRef)
        .then((snapshot) => {
          const currentLockStatus = snapshot.val();
          const newLockStatus = !currentLockStatus;
          set(lockRef, newLockStatus)
            .then(() => {
              console.log(`The game is ${newLockStatus ? 'locked' : 'unlocked'}.`);
            })
            .catch((error) => {
              console.log('Error updating the game lock status:', error);
            });
        })
        .catch((error) => {
          console.log('Error fetching the game lock status:', error);
        });
    } else {
      console.log('Incorrect password.');
    }
  };

  // Function to handle name change
  const handleNameChange = () => {
    if (canChangeName && nameInput.trim() !== '') {
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
          status: "✔",
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
    handleStartClick();

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

  const handleJoinClick = () => {
    const lockRef = ref(database, 'game/lock');
    get(lockRef)
      .then((snapshot) => {
        const isLocked = snapshot.val() === true;
        if (isLocked) {
          console.log('The game is locked. Players cannot join at the moment.');
        } else {
          setJoinClicked(true);
          setCanChangeName(true); // Set canChangeName to true after the user joins
        }
      })
      .catch((error) => {
        console.log('Error fetching game lock status:', error);
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
          <div>
            <h1>Payday Purgatory</h1>
          </div>
          <div className={`game-container ${isFullWidth ? 'full-width' : ''} ${!isGameLocked ? 'fade-in' : 'fade-out'}`}>
            <div className={`user-controls ${isFullWidth ? 'full-width' : ''}`}>
              <h2 id="game-status">{isGameLocked ? 'Game is in session' : 'Game is open'}</h2>

              <div>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter name"
                />
                <button onClick={handleNameChange} disabled={!canChangeName}>
                  Change Name
                </button>
                <button onClick={handleJoinClick} disabled={isGameLocked}>
                  {isGameLocked ? 'Game Locked' : 'Join Game'}
                </button>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  value={contributionInput}
                  onChange={(e) => setContributionInput(e.target.value)}
                  placeholder="Enter Contributions"
                />
                <button onClick={handleContributionChange} disabled={!joinClicked}>
                  Submit Money
                </button>
              </div>

              <div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password"
                />
                <button onClick={handleDeleteUsers}>Resetter</button>
                <button onClick={handleLockClick}>Locker</button>

              </div>

            </div>

            <div className={`leaderboard ${isFullWidth ? 'full-width' : ''}`}>
              <Leaderboard leaderboard={leaderboard} />
            </div>
          </div>
          <div>
            <button onClick={() => setIsFullWidth(!isFullWidth)} style={{ fontWeight: 'bold', marginTop: '-40px', marginLeft: '0px' }}>
              {isFullWidth ? 'Game View: Column' : 'Game View: Row'}
            </button>
            <button
              onClick={() => setShowHowToPlay(!showHowToPlay)}
              className={`toggle-button ${showHowToPlay ? 'rotate' : ''}`}
              style={{ fontWeight: 'bold', marginTop: '-40px', marginLeft: '0px' }}>
              {showHowToPlay ? 'Hide How to Play' : 'Show How to Play'}
            </button>
          </div>
          <div className={`container ${showHowToPlay ? "slide-in" : "slide-out"}`}>
            {showHowToPlay ? <HowToPlay /> : <ImageContainer />}
          </div>
        </div>

      ) : (
        // If user is signed out
        <div>
          <h2>Please sign in with Google:</h2>
          <button onClick={handleSignInWithGoogle}>Sign In with Google</button>
        </div>
      )}
    </div>
  );
}

export default App;