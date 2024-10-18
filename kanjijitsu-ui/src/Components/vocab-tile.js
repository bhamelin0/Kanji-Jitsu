import { React, useEffect, useRef  } from "react";
import "../kanji-game.css"


function VocabTile({vocab, kanji, hidden, showGloss, showAll}) {
    const vocabStyle = { "--wordLength": vocab && vocab.Vocab.length < 6 ? vocab.Vocab.length : 10 };
    const kanjiStyle = { "--wordLength": showGloss ? 7 : 2 };
    const ref = useRef(null);

    useEffect(() => {
        if(!hidden) {
            ref.current.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
        }
    }, [hidden])

    function renderGloss() {
        return (                   
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
        </div>);
    }

    function renderComplete() {
        return ( 
            <div>
                <div className="Vocab-Box-Kanji" style={vocabStyle}>
                    {vocab.Vocab}
                </div>
                <div className="Vocab-Box-Reading">
                    { vocab.Readings.join(', ') }
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
        );
    }

    function renderHidden() {
        return ( 
            <div>
                <div className={showGloss ? 'Vocab-Box-Kanji-Hidden' : `Vocab-Box-Kanji-Hidden-Full`} style={kanjiStyle}>
                    {kanji}
                </div>
                { showGloss ? renderGloss() : null }
            </div>
        );
    }

    function renderOld() {
        return ( <div>
            { hidden ? 
                <div>
                    <div className={showGloss ? 'Vocab-Box-Kanji-Hidden' : `Vocab-Box-Kanji-Hidden-Full`} style={kanjiStyle}>
                        {kanji}
                    </div>
                    { showGloss ? renderGloss() : null }
                </div>
            :
                <div>
                    <div className="Vocab-Box-Kanji" style={vocabStyle}>
                        {vocab.Vocab}
                    </div>
                    <div className="Vocab-Box-Reading">
                        { vocab.Readings.join(', ') }
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
        )
    }

    var innerContent;
    if(showAll || !hidden) {
        innerContent = renderComplete();
    } else {
        innerContent = renderHidden();
    }

    return (
        <div ref={ref} className={`Vocab-Box ${hidden ? 'Vocab-Box-Hidden' : vocab.Common ? 'Vocab-Box-Common' : 'Vocab-Box-Rare'}`}>
            {innerContent}
        </div>
    );
}
  
export default VocabTile;
  