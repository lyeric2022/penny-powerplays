import React from 'react';

function Player({ player }) {
  return (
    <div className="player" key={player.id}>
      {player.profilePictureUrl && <img className="profile-picture" src={player.profilePictureUrl} alt="Profile" />}
      <div className="player-details">
        <div className="name">{player.name}</div>
        <div className="lives-left">Lives: {player.livesLeft}</div>
        <div className="status">{player.status}</div>
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
      {leaderboard.map((player) => (
        <Player key={player.id} player={player} />
      ))}
    </div>
  );
}
