import Card from './card'
import { useState } from 'react';

function Cards({ cards, canVote, address, minimised, missingText }) {
    const [collapse, setCollapse] = useState(minimised ?? true);

    let presentCards = [...cards];
    presentCards.reverse();
    presentCards.sort((cardA, cardB) => cardB.votes - cardA.votes);
    if ( collapse ) presentCards = presentCards.slice(0, 6);
    if ( presentCards.length == 0 ) {
        return (
            <div className="text-center my-20">
                {missingText}
            </div>
        )
    }

    return (
        <div className="md:grid grid-cols-3 gap-4 pt-5 pb-12">
            {
                presentCards
                    .map(card => 
                        <Card
                            uid={card.uid}
                            boardID={card.boardID}
                            idea={card.idea}
                            link={card.link}
                            votes={card.votes}
                            owner={card.owner}
                            key={`${card.boardID}-${card.uid}`}
                            canVote={canVote}
                            ownIdea={card.owner === address}
                            castVote={card.voted}
                        />
                    )
            }
        </div>
    )
}

export default Cards;