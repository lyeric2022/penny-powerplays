const StoryTheme = `
Story Theme: Payday Purgatory

In a desolate and chaotic future, an oppressive megacorporation known as "Payday Corp" has taken control of society. They have established a dystopian world where money is the ultimate power, and the struggle for survival is waged through a deadly game called "Payday Purgatory."

The game takes place in a sprawling urban wasteland, where players, known as "Debtors," are thrown into a gritty arena. Each Debtor starts with a certain amount of dollars, which they must contribute to a central pot at regular intervals. Failure to contribute enough leads to dire consequences.

The Debtors fight against one another not with weapons, but with their cunning, strategy, and manipulation. They form alliances and betray each other, constantly trying to outwit and outmaneuver their opponents. The game is a test of their survival instincts, as they navigate a treacherous landscape filled with hidden traps, resource scarcity, and unexpected challenges.

As the game progresses, the stakes increase, and the Debtors face tougher decisions. The tension rises as friendships crumble, alliances collapse, and secrets are unveiled. Each contribution round becomes a nerve-wracking affair, as the player with the lowest contribution faces elimination, banished from the game forever.

Yet, beneath the ruthless facade of Payday Purgatory, a rebel resistance movement brews. Some Debtors begin to question the corporate tyranny, seeking ways to escape the game and overthrow Payday Corp's stranglehold on society. As the final rounds approach, the rebellion gains momentum, and the line between the game and reality blurs.

In this dark and twisted world, the ultimate goal is not just survival but to expose the truth and ignite a revolution. The last remaining Debtor, the one who emerges from Payday Purgatory, holds the key to unraveling the secrets of the corporation and becoming the catalyst for change.

Will you embrace the cutthroat nature of Payday Purgatory, or will you rise above it to forge a new destiny for yourself and all those trapped in this merciless game? The choice is yours in this gripping tale of desperation, resilience, and the fight for a better tomorrow.
`.trim().split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>);

export default StoryTheme;
