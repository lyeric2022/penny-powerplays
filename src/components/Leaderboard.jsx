import React from 'react';
import "./Leaderboards.css";

function Player({ player }) {
  // Helper function to generate the hearts
  const generateHearts = (numHearts) => {
    const heartIcon = "❤️";
    return heartIcon.repeat(numHearts);
  };

  return (

    <div className="player" key={player.id}>

      {player.profilePictureUrl && <img className="profile-picture" src={player.profilePictureUrl} alt="Profile" />}
      <div className="player-details">
        <div className="name">{player.name}</div>
        <div className="lives-left">{generateHearts(player.livesLeft)}</div>
        <div className="status">Status: {player.status}</div>
      </div>
      <div className="player-stats">
        <div className="money">Bank: ${player.money}</div>
        <div className="contribution">Contribution: ${player.lastContributionAmount}</div>
      </div>
    </div>
  );
}

export default function Leaderboard({ leaderboard }) {
  return (

    <div className="leaderboard">
      <h2 id="leaderboards-text">Leaderboards</h2>
      {leaderboard.map((player) => (
        <Player key={player.id} player={player} />
      ))}
    </div>
  );
}
