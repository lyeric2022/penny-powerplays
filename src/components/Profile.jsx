import React from 'react';

function ProfilePicture({ profilePictureUrl }) {
  return <img className="profile-picture" src={profilePictureUrl} alt="Profile" />;
}

export default function Profile({ player }) {
  return (
    <div className="player">
      {player.profilePictureUrl && <ProfilePicture profilePictureUrl={player.profilePictureUrl} />}
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
