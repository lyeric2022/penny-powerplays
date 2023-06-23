import React from 'react';
import "./Leaderboards.css";

function Player({ player }) {
  // Helper function to generate the hearts
  const generateHearts = (numHearts) => {
    const heartIcon = "❤️";
    return heartIcon.repeat(numHearts);
  };

  // Helper function to truncate the player name if it exceeds 15 characters
  const truncateName = (name, maxLength) => {
    if (name.length <= maxLength) {
      return name;
    }
    return name.substring(0, maxLength) + "...";
  };

  return (

    <div className="player" key={player.id}>

      {player.profilePictureUrl && <img className="profile-picture" src={player.profilePictureUrl} alt="Profile" />}
      <div className="player-details">
      <div className="name">{truncateName(player.name, 15)}</div>
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
  // Sort players by livesLeft in descending order
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.livesLeft - a.livesLeft);

  return (

    <div className="leaderboard">
      <h2 id="leaderboards-text">Leaderboards</h2>
      {leaderboard.map((player) => (
        <Player key={player.id} player={player} />
      ))}
    </div>
  );
}
