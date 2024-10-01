import React from "react";
import "../kanji-game.css"


function VocabTile({vocab, kanji, hidden}) {
    const vocabStyle = { "--wordLength": vocab && vocab.Vocab.length < 6 ? vocab.Vocab.length : 10 };
    const kanjiStyle = { "--wordLength": 2 };

    return (
        <div className={`Vocab-Box ${vocab.Common ? 'Vocab-Box-Common' : 'Vocab-Box-Rare'}`}>
            { hidden ? 
                <div className="Vocab-Box-Kanji" style={kanjiStyle}>
                    {kanji}
                </div>
            :
                <div>
                    <div className="Vocab-Box-Kanji" style={vocabStyle}>
                        {vocab.Vocab}
                    </div>
                    <div className="Vocab-Box-Reading">
                    {vocab.Readings.join(', ')}
                    </div>
                    <div className="Vocab-Box-Gloss-Container">
                        <div className="Vocab-Box-Gloss">
                            {vocab.Gloss[0]}
                        </div>
                        <div className="Vocab-Box-Gloss">
                            {vocab.Gloss[1]}
                        </div>
                        <div className="Vocab-Box-Gloss">
                            {vocab.Gloss[2]}
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}
  
export default VocabTile;
  