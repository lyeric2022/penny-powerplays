import React from 'react';
import './HowToPlay.css'; // Import the CSS file

const HowToPlay = () => {
    const paragraphs = `
    Payday Purgatory: a game that tests your survival instincts and requires cunning, strategy, and resource management.

    Join the Game: Click the "Join Game" button to participate. Ensure that the game is not locked before joining.

    Contribute Money: Enter the amount of money you want to contribute and click "Submit Money". Your contribution will be deducted from your total money.

    Leaderboard: The leaderboard shows player rankings based on their money. Aim to maintain the highest bank balance to stay safe near the top.

    Elimination and Lives: Each round, the player with the lowest contributions will lose a heart. Losing all hearts will remove them from the game.

    Strategy and Alliances: Form alliances, strategize, and manipulate other players to increase your chances of survival and success.
  `.trim().split('\n\n').map((paragraph, index) => {
        const [title, description] = paragraph.split(":");
        return (
            <p className="HowToPlayParagraph" key={index}>
                <strong>{title}:</strong>
                {description}
            </p>
        );
    });

    return (
        <div className="HowToPlayContainer">
            {paragraphs}
        </div>
    );
};

export default HowToPlay;
