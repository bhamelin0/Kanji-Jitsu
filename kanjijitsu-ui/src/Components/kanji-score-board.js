import { React } from "react";
import '../css/kanji-game.css'

function KanjiScoreBoard({score, matchedVocabCommon, matchedVocabRare, selectedKanjiVocabCommon, selectedKanjiVocabRare}) {
    const matchCountCommon = matchedVocabCommon && Object.keys(matchedVocabCommon).length;
    const matchCountRare = matchedVocabRare && Object.keys(matchedVocabRare).length;
    const totalCommon = selectedKanjiVocabCommon && selectedKanjiVocabCommon.length;
    const totalRare = selectedKanjiVocabRare && selectedKanjiVocabRare.length;
    return (
        <div className="Kanji-Score-Board">
            <div className="Kanji-Score">
                Score: {score}
            </div>
            <div className="Kanji-Score">
                {matchCountCommon}/{totalCommon} common
            </div>
            <div className="Kanji-Score">
                {matchCountRare}/{totalRare} uncommon
            </div>
        </div>
    );
}
  
export default KanjiScoreBoard;