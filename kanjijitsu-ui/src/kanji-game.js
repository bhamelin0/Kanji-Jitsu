import './css/kanji-game.css';
import { getDailyKanjiRoute, getDailyVocabRoute } from './Library/fetchEnv.js';
import { Link } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import CrossSign from './Components/cross-sign';
import KanjiTile from './Components/kanji-tile';
import VocabTyper from './Components/vocab-typer';
import Loader from './Components/loader';
import VocabTile from './Components/vocab-tile';
import KanjiScoreBoard from './Components/kanji-score-board';
import GameOverDialog from './Components/game-over-dialog';
import { useDraggable } from "react-use-draggable-scroll-safe";

function KanjiGame() {
    const [kanjiJson, setKanjiJson] = useState([]);
    const [gameStage, setGameStage] = useState(0); // 1 displays selected Kanji, 2 is end screen
    const [selectedKanji, setSelectedKanji] = useState(null); // 1 displays selected Kanji, 2 is end screen
    const [selectedKanjiVocabCommon, setSelectedKanjiVocabCommon] = useState([]); // List of common valid Kanji inputs
    const [selectedKanjiVocabRare, setSelectedKanjiVocabRare] = useState([]); // List of rare valid Vocab inputs
    const [failedReadings, setFailedReadings] = useState([]); // 1 displays selected Kanji, 2 is end screen
    const [statusField, setStatusField] = useState(""); // 1 displays selected Kanji, 2 is end screen

    const [points, setPoints] = useState(0);
    const [attemptedReadings, setAttemptedReadings] = useState({});
    const [matchedVocabCommon, setMatchedVocabCommon] = useState({});
    const [matchedVocabRare, setMatchedVocabRare] = useState({});

    const [showGloss, setShowGloss] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [boxCountStyle, setBoxCountStyle] = useState({ "--box-count": Math.max(Math.floor((window.innerWidth * .9) / 250) - 1, 1) });

    // Scroll Dragging
    const commonRef = useRef(); // We will use React useRef hook to reference the wrapping div:
    const rareRef = useRef(); // We will use React useRef hook to reference the wrapping div:
    const commonEvents = useDraggable(commonRef).events; // Now we pass the reference to the useDraggable hook:
    const rareEvents = useDraggable(rareRef).events; // Now we pass the reference to the useDraggable hook:

    useEffect(() => {
        async function getKanjiOfDay() {
            try {
                const res = await fetch(getDailyKanjiRoute());
                const kanjiJson = await res.json();
                setKanjiJson(kanjiJson)
            } catch (err) {
               console.log(err)
            }
        }

        getKanjiOfDay();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setBoxCountStyle({ "--box-count": Math.max(Math.floor((window.innerWidth * .9) / 250) - 1, 1) });
        }
        window.addEventListener('resize', handleResize);
        return () => { window.removeEventListener('resize', handleResize); };
    }, []);

    async function handleKanjiTileClick(kanji) {
        if(selectedKanji) { 
            return; 
        }

        setGameStage(1);
        setSelectedKanji(kanji)
        setStatusField(`Try to type as many vocab readings using ${kanji.Kanji} as you can. Aim for 20!`)

        try {
            const res = await fetch(getDailyVocabRoute(kanji.Kanji));
            const vocabJson = await res.json();
            const vocabEntries = vocabJson.VocabCollection;
            setSelectedKanjiVocabCommon(vocabEntries.filter(entry => entry.Common === true))
            setSelectedKanjiVocabRare(vocabEntries.filter(entry => entry.Common === false))
        } catch (err) {
           console.log(err)
        }
    }

    function handleVocabAttempt(e) {
        if(attemptedReadings[e]) {
            setStatusField(`'${e}' has already been used.`);
        } else {
            const commonEntryWords = selectedKanjiVocabCommon.filter(entry => entry.Readings.includes(e) === true);
            const rareEntryWords = selectedKanjiVocabRare.filter(entry => entry.Readings.includes(e) === true);
            const newPoints = (commonEntryWords.length * 100 + rareEntryWords.length * 10) / (showGloss ? 2 : 1);
            const newMatchedVocabCommon = {};
            const newMatchedVocabRare = {};
            if(newPoints === 0) {
                if(failedReadings.length === 2) {
                    setStatusField(`'${e}' is not a reading for any vocab of ${selectedKanji.Kanji}. No attempts remaining!`);
                    handleGameOver();
                } else {
                    setStatusField(`'${e}' is not a reading for any vocab of ${selectedKanji.Kanji}.`);
                }
                setFailedReadings([...failedReadings, e]);
            } else {
                setPoints(points + newPoints);
                setStatusField(`'${e}' is a valid reading. +${newPoints} score!`);
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
        setGameStage(3); // Game over; Can open dialog
    }

    async function openDialog() {
        setGameStage(4); // Game over; Can open dialog
    }

    function handleContinueClick() {
        setGameStage(3); // Close the game over, allow player to return to N level selection
    }

    function resetForKanji() {
        setFailedReadings([]);
        setPoints(0);
        setAttemptedReadings({});
        setShowGloss(false);
        setShowAll(false);
        setMatchedVocabCommon({});
        setMatchedVocabRare({});
        setGameStage(1);
        setStatusField("");
    }

    function resetForAll() {
        setFailedReadings([]);
        setPoints(0);
        setAttemptedReadings({});
        setShowGloss(false);
        setShowAll(false);
        setMatchedVocabCommon({});
        setMatchedVocabRare({});
        setSelectedKanjiVocabCommon([]);
        setSelectedKanjiVocabRare([]);
        setSelectedKanji(null);
        setGameStage(0);
        setStatusField("");
    }

    return (
      <div className="App">
        <GameOverDialog 
            isOpen={gameStage === 4} 
            score={points}
            matchedVocabCommon={matchedVocabCommon} 
            matchedVocabRare={matchedVocabRare} 
            selectedKanjiVocabCommon={selectedKanjiVocabCommon} 
            selectedKanjiVocabRare={selectedKanjiVocabRare} 
            onContinueClick={() => handleContinueClick()} 
            onTryAgainClick={() => resetForKanji()} 
            onReturnToLevelSelectorClick={() => resetForAll()}>
        </GameOverDialog>
        <div className="App-Body">
            <div className="App-Toolbar">
                <div>
                    <Link className="App-Toolbar-Breadcrumb" hidden={gameStage < 1} onClick={() => resetForAll()}>Return to Level Select</Link>
                    <Link className="App-Toolbar-Breadcrumb" to={"/about"}>About</Link>
                </div>
                <div>
          
                </div>
            </div>    
            <header className="App-header">
                <p className="App-header-p">
                    Kanji Jitsu
                </p>
            </header>
            { 
                kanjiJson.length === 0 ? 
                    <Loader/>
                : (!selectedKanji || selectedKanjiVocabCommon.length === 0) && gameStage < 2 ? 
                    <div>
                        <div className = "Kanji-Selector-Subtitle">Which level of Kanji do you want to practice today?</div>
                        <div className="Kanji-Selector">
                        { kanjiJson.map((kanji) => 
                            <KanjiTile key={kanji.Kanji_id} kanji={kanji} onClick={() => handleKanjiTileClick(kanji)} />
                        )}
                        </div>
                        <div className = "Kanji-Selector-Subtitle">Set of kanji rotates every day at 12AM JST.</div>
                        { gameStage == 1 ? <Loader/> : null }
                    </div>
                :
                <div className="Kanji-Game-Stage-1">
                    <div className="Kanji-Game-Board">
                        <div className="Kanji-Game-Board-Left">
                            <div className="Kanji-Game-Board-Buttons">
                                <button className="Kanji-Game-Button" onClick={() => setShowGloss(true)} disabled={showGloss || gameStage > 1}>
                                    Show Definitions (-50% score)
                                </button>
                                <button className="Kanji-Game-Button" onClick={() => handleGameOver()} disabled={gameStage > 1} hidden={gameStage >= 3}>
                                    Reveal Answers
                                </button>
                                <button className="Kanji-Game-Button" onClick={() => openDialog()} hidden={gameStage < 3}>
                                    Finish Reviewing
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
                    <VocabTyper kanji={selectedKanji.Kanji} enabled={gameStage < 2} onSubmit={(e) => handleVocabAttempt(e)}></VocabTyper>
                    <div className="Kanji-Status">{statusField}</div>
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
  