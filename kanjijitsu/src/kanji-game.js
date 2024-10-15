import './kanji-game.css';
import React, { useState, useEffect, useRef } from "react";
import CrossSign from './Components/cross-sign';
import KanjiTile from './Components/kanji-tile';
import VocabTyper from './Components/vocab-typer';
import LangToggle from './Components/lang-toggle';
import Loader from './Components/loader';
import VocabTile from './Components/vocab-tile';
import KanjiScoreBoard from './Components/kanji-score-board';
import GameOverDialog from './Components/game-over-dialog';
import { useDraggable } from "react-use-draggable-scroll-safe";

function KanjiGame() {
    const [kanjiJson, setKanjiJson] = useState([]);
    const [gameStage, setGameStage] = useState(0); // 1 displays selected Kanji, 2 is end screen
    const [selectedKanji, setSelectedKanji] = useState(null); // 1 displays selected Kanji, 2 is end screen
    const [selectedKanjiVocabCommon, setSelectedKanjiVocabCommon] = useState(null); // List of common valid Kanji inputs
    const [selectedKanjiVocabRare, setSelectedKanjiVocabRare] = useState(null); // List of rare valid Vocab inputs
    const [failedReadings, setFailedReadings] = useState([]); // 1 displays selected Kanji, 2 is end screen

    const [points, setPoints] = useState(0);
    const [attemptedReadings, setAttemptedReadings] = useState({});
    const [matchedVocabCommon, setMatchedVocabCommon] = useState({});
    const [matchedVocabRare, setMatchedVocabRare] = useState({});

    const [showGloss, setShowGloss] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [boxCountStyle, setBoxCountStyle] = useState({ "--box-count": Math.floor((window.innerWidth * .9) / 250) - 1 });

    // Scroll Dragging
    const commonRef = useRef(); // We will use React useRef hook to reference the wrapping div:
    const rareRef = useRef(); // We will use React useRef hook to reference the wrapping div:
    const commonEvents = useDraggable(commonRef).events; // Now we pass the reference to the useDraggable hook:
    const rareEvents = useDraggable(rareRef).events; // Now we pass the reference to the useDraggable hook:

    useEffect(() => {
        async function getKanjiOfDay() {
            try {
                const res = await fetch(`kanjijitsu.com/dailyKanji`);
                const kanjiJson = await res.json();
                setKanjiJson(kanjiJson)
                console.log(kanjiJson)
            } catch (err) {
               console.log(err)
            }
        }

        getKanjiOfDay();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setBoxCountStyle({ "--box-count": Math.floor((window.innerWidth * .9) / 250) - 1 });
        }
        window.addEventListener('resize', handleResize);
        return () => { window.removeEventListener('resize', handleResize); };
    }, []);
    

    async function handleKanjiTileClick(kanji) {
        setGameStage(1);
        console.log("Clicked Kanji " + kanji.Kanji + " Level " + kanji.N_level);
        setSelectedKanji(kanji)

        try {
            const res = await fetch(`kanjijitsu.com/vocabForKanji?kanji=${kanji.Kanji}`)
            const vocabJson = await res.json();
            const vocabEntries = vocabJson.VocabCollection;
            console.log(vocabEntries);
            setSelectedKanjiVocabCommon(vocabEntries.filter(entry => entry.Common === true))
            setSelectedKanjiVocabRare(vocabEntries.filter(entry => entry.Common === false))
        } catch (err) {
           console.log(err)
        }
    }

    function handleVocabAttempt(e) {
        if(attemptedReadings[e]) {
            // TODO move to tile if any, display 'already used' message
        } else {
            const commonEntryWords = selectedKanjiVocabCommon.filter(entry => entry.Readings.includes(e) === true);
            const rareEntryWords = selectedKanjiVocabRare.filter(entry => entry.Readings.includes(e) === true);
            const newPoints = (commonEntryWords.length * 100 + rareEntryWords.length * 10) / (showGloss ? 2 : 1);
            const newMatchedVocabCommon = {};
            const newMatchedVocabRare = {};
            if(newPoints === 0) {
                if(failedReadings.length === 2) {
                    handleGameOver();
                }
                setFailedReadings([...failedReadings, e]);

            } else {
                setPoints(points + newPoints);

                commonEntryWords.forEach(element => {
                    newMatchedVocabCommon[element.Vocab_id] = true;
                });


                rareEntryWords.forEach(element => {
                    newMatchedVocabRare[element.Vocab_id] = true;
                });
            }
            attemptedReadings[e] = true;
            setAttemptedReadings({...attemptedReadings });
            setMatchedVocabCommon({...matchedVocabCommon, ...newMatchedVocabCommon});
            setMatchedVocabRare({...matchedVocabRare, ...newMatchedVocabRare});
        }
    }

    async function handleGameOver() {
        setGameStage(2);
        setShowAll(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setGameStage(3); // Game over dialog will open here
    }

    function handleContinueClick() {
        console.log("test");
        setGameStage(4); // Close the game over, allow player to return to N level selection
    }

    function reset() {
        setFailedReadings([]);
        setPoints(0);
        setAttemptedReadings({});
        setShowGloss(false);
        setShowAll(false);
        setMatchedVocabCommon({})
        setMatchedVocabRare({})
    }

    function handleTryAgainClick() {
        setGameStage(1);
        reset();
    }

    function handleReturnToLevelSelectorClick() {
        setGameStage(0);
        setSelectedKanji(null);
        reset();
    }
    
    return (
      <div className="App">
        <GameOverDialog 
            isOpen={gameStage === 3} 
            score={points}
            matchedVocabCommon={matchedVocabCommon} 
            matchedVocabRare={matchedVocabRare} 
            selectedKanjiVocabCommon={selectedKanjiVocabCommon} 
            selectedKanjiVocabRare={selectedKanjiVocabRare} 
            onContinueClick={() => handleContinueClick()} 
            onTryAgainClick={() => handleTryAgainClick()} 
            onReturnToLevelSelectorClick={() => handleReturnToLevelSelectorClick()}>
        </GameOverDialog>
        <div className="App-Body">
            <div className="App-Toolbar">
                <div>
                    <button className="Kanji-Game-Button App-Toolbar-Breadcrumb" hidden={gameStage < 1} onClick={() => handleReturnToLevelSelectorClick()}>Return to Level Select</button>
                </div>
                <div>
                    <LangToggle/>
                </div>
            </div>    
            <header className="App-header">
            <p>
                Kanji Jitsu!
            </p>
            </header>
            { 
                !selectedKanji && gameStage == 0 ? 
                    <div>
                        <div className = "Kanji-Selector-Subtitle">What level of Kanji do you want to practice?</div>
                        <div className="Kanji-Selector">
                        { kanjiJson.map((kanji) => 
                            <KanjiTile key={kanji.Kanji_id} kanji={kanji} onClick={() => handleKanjiTileClick(kanji)} />

                        )}
                        </div>
                    </div>

                    
                : !selectedKanjiVocabCommon && gameStage == 1 ? (
                    <Loader/>
                )
                :
                <div className="Kanji-Game-Stage-1">
                    <div className="Kanji-Game-Board">
                        <div className="Kanji-Game-Board-Left">
                            <div className="Kanji-Game-Board-Buttons">
                                <button className="Kanji-Game-Button" onClick={() => setShowGloss(true)} disabled={showGloss || gameStage > 1}>
                                    Show Definitions (-50% score)
                                </button>
                                <button className="Kanji-Game-Button" onClick={() => handleGameOver()} disabled={gameStage > 1}>
                                    Reveal Answers
                                </button>
                            </div>
                            <div className="Kanji-Game-Board-Buttons">
                                <CrossSign active={ failedReadings.length > 0 }/>
                                <CrossSign active={ failedReadings.length > 1 }/>
                                <CrossSign active={ failedReadings.length > 2 }/>
                            </div>


                        </div>
                        <div className="Kanji-Game-Board-Tile">
                            <KanjiTile key={selectedKanji.Kanji_id} kanji={selectedKanji} showKanji />
                        </div>
                        <div className="Kanji-Game-Board-Right">
                            <KanjiScoreBoard 
                                score={points} 
                                matchedVocabCommon={matchedVocabCommon} 
                                matchedVocabRare={matchedVocabRare}
                                selectedKanjiVocabCommon={selectedKanjiVocabCommon}
                                selectedKanjiVocabRare={selectedKanjiVocabRare}>
                            </KanjiScoreBoard>
                        </div>
                    </div>
                    <VocabTyper enabled={gameStage < 2} onSubmit={(e) => handleVocabAttempt(e)}></VocabTyper>
                        <div className="Vocab-List" style={boxCountStyle} {...commonEvents} ref={commonRef}>
                            { selectedKanjiVocabCommon.map((vocab) => 
                                <VocabTile hidden={!matchedVocabCommon[vocab.Vocab_id]} showGloss={showGloss} showAll={showAll} kanji={selectedKanji.Kanji} vocab={vocab} key={vocab.Vocab_id}/>
                            )}
                        </div>
                    <div className="Vocab-List" style={boxCountStyle} {...rareEvents} ref={rareRef}> 
                        { selectedKanjiVocabRare.map((vocab) => 
                                <VocabTile hidden={!matchedVocabRare[vocab.Vocab_id]} showGloss={showGloss} showAll={showAll} kanji={selectedKanji.Kanji} vocab={vocab} key={vocab.Vocab_id}/>
                        )}
                    </div>
                </div>
            }
        </div>
    </div>
    );
  }
  
  export default KanjiGame;
  