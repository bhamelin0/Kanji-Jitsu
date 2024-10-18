import { React, useState } from "react";
import "../kanji-game.css"

function KanjiTile({ kanji, showKanji, onClick }) {
    const [tileClicked, setTileClicked] = useState(false);

    function handleClick(e) {
        setTileClicked(true);
        if(onClick) {
            onClick(e);
        }
    }
    return (
        <button className={`Kanji-Box Kanji-Box-N${kanji.N_level}`} onClick={handleClick}>
            {showKanji || tileClicked ? kanji.Kanji : `N${kanji.N_level}`}
        </button>
    );
}
  
export default KanjiTile;
  