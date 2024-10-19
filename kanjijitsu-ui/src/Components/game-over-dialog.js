import { React, useState } from "react";
import ReactModal from 'react-modal';
import '../css/kanji-game.css'

function GameOverDialog({isOpen, score, matchedVocabCommon, matchedVocabRare, selectedKanjiVocabCommon, selectedKanjiVocabRare, onReturnToLevelSelectorClick, onContinueClick, onTryAgainClick}) {
    const [showCopyText, setShowCopyText] = useState(false);

    const matchCountCommon = matchedVocabCommon && Object.keys(matchedVocabCommon).length;
    const matchCountRare = matchedVocabRare && Object.keys(matchedVocabRare).length;

    return (
        <ReactModal appElement={document.getElementById('root') || undefined} className="Game-Over-Dialog" isOpen={isOpen}>
            <div className="Game-Over-Container">
                <div>
                    Game Over!
                </div>
                <div>
                    Your Results:
                </div>
                <div>
                    <ul className="Game-Over-List">
                        <li>Total Score: {score}</li>
                        <li>Common Words: {matchCountCommon} / {selectedKanjiVocabCommon?.length}</li>
                        <li>Rare Words: {matchCountRare} / {selectedKanjiVocabRare?.length}</li>
                    </ul>
                </div>
                <button className="Kanji-Game-Button" onClick={() => setShowCopyText(true)}>Copy Score</button>
                <div className="Kanji-Game-Subtext">{showCopyText ? "Score copied! You can share it with your friends by pasting into any emoji friendly software or site, like Slack or discord!" : null }</div>
              
            </div>
            <div className="Game-Over-Buttons">
                    <button className="Kanji-Game-Button" onClick={() => onContinueClick()}>Close and review</button> 
                    <button className="Kanji-Game-Button" onClick={() => onTryAgainClick()}>Reset and try again</button> 
                    <button className="Kanji-Game-Button" onClick={() => onReturnToLevelSelectorClick()}>Return to kanji selection page</button>
                </div>
        </ReactModal>

    );
}
  
export default GameOverDialog;
  
