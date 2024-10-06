import {React } from "react";
import "../kanji-game.css"

function KanjiScoreBoard({score}) {
    return (
        <div className="Kanji-Score-Board">
            <div className="Kanji-Score">
                Score: {score}
            </div>
        </div>

    );
}
  
export default KanjiScoreBoard;
  
