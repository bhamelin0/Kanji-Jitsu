import './css/kanji-game.css';
import { getDailyKanjiRoute, getDailyVocabRoute } from './Library/fetchEnv.js';
import { Link } from "react-router-dom";
import { Tooltip } from 'react-tooltip'
import React, { useState, useEffect, useRef } from "react";
import CrossSign from './Components/cross-sign';
import KanjiTile from './Components/kanji-tile';
import VocabTyper from './Components/vocab-typer';
import Loader from './Components/loader';
import VocabTile from './Components/vocab-tile';
import KanjiScoreBoard from './Components/kanji-score-board';
import Toggle from './Components/toggle';
import GameOverDialog from './Components/game-over-dialog';
import { useDraggable } from "react-use-draggable-scroll-safe";
import * as wanakana from 'wanakana';
import { useCookies } from 'react-cookie';

function KanjiGame() {
    const [kanjiJson, setKanjiJson] = useState([]);
    const [gameStage, setGameStage] = useState(0); // 1 displays selected Kanji, 2 is end screen
    const [selectedKanji, setSelectedKanji] = useState(null); // 1 displays selected Kanji, 2 is end screen
    const [selectedKanjiVocabCommon, setSelectedKanjiVocabCommon] = useState([]); // List of common valid Kanji inputs
    const [selectedKanjiVocabRare, setSelectedKanjiVocabRare] = useState([]); // List of rare valid Vocab inputs
    const [failedReadings, setFailedReadings] = useState([]); // 1 displays selected Kanji, 2 is end screen
    const [statusField, setStatusField] = useState(""); // 1 displays selected Kanji, 2 is end screen

    const [kanjiTooltipText, setKanjiTooltipText] = useState('');
    const [customKanjiInput, setCustomKanjiInput] = useState('');

    const [points, setPoints] = useState(0);
    const [attemptedReadings, setAttemptedReadings] = useState({});
    const [matchedVocabCommon, setMatchedVocabCommon] = useState({});
    const [matchedVocabRare, setMatchedVocabRare] = useState({});

    const [showGloss, setShowGloss] = useState(false);

    const [cookies, setCookie] = useCookies(['show-kanji']);
    
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

    function handleCustomKanjiInput(input) {
        setKanjiTooltipText("");
        setCustomKanjiInput(input);
    }

    function handleCustomKanjiEnter() {
        if(customKanjiInput && !wanakana.isKanji(customKanjiInput)) {
            setKanjiTooltipText("Please ensure the input is Kanji.");
            return;
        }

        if(customKanjiInput.length > 1) {
            setKanjiTooltipText("Please enter only one single kanji.");
            return;
        }

        handleKanjiTileClick({ Kanji: customKanjiInput });
    }

    function handleCustomKanjiKeyPress(e) {
        if(e.key !== 'Enter') {
            return;
        }
        if(customKanjiInput && !wanakana.isKanji(customKanjiInput)) {
            setKanjiTooltipText("Please ensure the input is Kanji.");
            return;
        }

        if(customKanjiInput.length > 1) {
            setKanjiTooltipText("Please enter only one single kanji.");
            return;
        }

        handleKanjiTileClick({Kanji: customKanjiInput});
    }

    async function handleKanjiTileClick(kanji) {
        if(selectedKanji) { 
            return; 
        }

        setGameStage(1);

        try {
            const res = await fetch(getDailyVocabRoute(kanji.Kanji));
            const vocabJson = await res.json();
            const vocabEntries = vocabJson.VocabCollection;
            if(vocabEntries === null) {
                setKanjiTooltipText("Not a JLPT Kanji / No Vocabulary set available. Sorry!");
                setGameStage(0);
                return;
            }
            setSelectedKanjiVocabCommon(vocabEntries.filter(entry => entry.Common === true))
            setSelectedKanjiVocabRare(vocabEntries.filter(entry => entry.Common === false))
        } catch (err) {
           console.log(err)
        }

        setGameStage(1);
        setSelectedKanji(kanji)
        setStatusField(`Which vocabulary contains kanji ${kanji.Kanji}?`)
    }

    function handleVocabAttempt(e) {
        if(attemptedReadings[e]) {
            setStatusField(`'${e}' has already been used.`);
        } else {
            var commonEntryWords = selectedKanjiVocabCommon.filter(entry => entry.Readings.includes(e) === true);
            var rareEntryWords = selectedKanjiVocabRare.filter(entry => entry.Readings.includes(e) === true);
            const newMatchedVocabCommon = {};
            const newMatchedVocabRare = {};
            if(commonEntryWords.length === 0 && rareEntryWords.length === 0) {
                if(failedReadings.length === 2) {
                    setStatusField(`'${e}' is not a reading for any vocab of ${selectedKanji.Kanji}. No attempts remaining!`);
                    handleGameOver();
                } else {
                    setStatusField(`'${e}' is not a reading for any vocab of ${selectedKanji.Kanji}.`);
                }
                setFailedReadings([...failedReadings, e]);
            } else {
                // Filter away any additional readings for vocab we already succeeded with
                commonEntryWords = commonEntryWords.filter(entry => matchedVocabCommon[entry.Vocab_id] !== true)
                rareEntryWords = rareEntryWords.filter(entry => matchedVocabRare[entry.Vocab_id] !== true)
                if(commonEntryWords.length === 0 && rareEntryWords.length === 0) {
                    setStatusField(`'${e}' is a new valid reading, but reveals no new kanji.`);
                } else {
                    const newPoints = (commonEntryWords.length * 100 + rareEntryWords.length * 10) / (showGloss ? 2 : 1);
                    setPoints(points + newPoints);
                    setStatusField(`'${e}' is a valid reading. +${newPoints} score!`);
                }
                
                commonEntryWords.forEach((element, index) => {
                    newMatchedVocabCommon[element.Vocab_id] = true;

                    // Swap to front of UI
                    var leftmostUnmatchedIndex = Object.keys(matchedVocabCommon).length + index;
                    var matchedIndex = selectedKanjiVocabCommon.findIndex(vocabItem => vocabItem === element);
                    var swap = selectedKanjiVocabCommon[leftmostUnmatchedIndex];
                    selectedKanjiVocabCommon[leftmostUnmatchedIndex] = selectedKanjiVocabCommon[matchedIndex];
                    selectedKanjiVocabCommon[matchedIndex] = swap;
                });

                rareEntryWords.forEach((element, index) => {
                    newMatchedVocabRare[element.Vocab_id] = true;

                    // Swap to front of UI
                    var leftmostUnmatchedIndex = Object.keys(matchedVocabRare).length + index;
                    var matchedIndex = selectedKanjiVocabRare.findIndex(vocabItem => vocabItem === element);
                    var swap = selectedKanjiVocabRare[leftmostUnmatchedIndex];
                    selectedKanjiVocabRare[leftmostUnmatchedIndex] = selectedKanjiVocabRare[matchedIndex];
                    selectedKanjiVocabRare[matchedIndex] = swap;
                });
            }
            attemptedReadings[e] = true;
            setAttemptedReadings({...attemptedReadings });
            setMatchedVocabCommon({...matchedVocabCommon, ...newMatchedVocabCommon});
            setMatchedVocabRare({...matchedVocabRare, ...newMatchedVocabRare});
            setSelectedKanjiVocabCommon([...selectedKanjiVocabCommon]);
            setSelectedKanjiVocabRare([...selectedKanjiVocabRare]);
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

    function handleShowKanjiToggled(newShowKanji) {
        setCookie('show-kanji', newShowKanji);
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
                <div className="App-Toolbar-Breadcrumb">
                    <Link hidden={gameStage < 1} onClick={() => resetForAll()}>Return to Level Select</Link>
                    <Link  to={"/about"}>About</Link>
                </div>

                <div>
                    <div className='App-Toolbar-Breadcrumb-Toggle'>
                        Show Kanji
                        <Toggle checked={cookies['show-kanji']} onClick={() => handleShowKanjiToggled(!cookies['show-kanji'])} />
                    </div>
                </div>
            </div>    
            <header className="App-header">
                <p className={`${gameStage > 0 && selectedKanjiVocabCommon.length !== 0 ? 'App-header-hidden' : 'App-header-p'}`}>
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
                            <KanjiTile key={kanji.Kanji_id} kanji={kanji} showKanji={cookies['show-kanji']} onClick={() => handleKanjiTileClick(kanji)} />
                        )}
                        </div>
                        <div className = "Kanji-Selector-Subtitle">Set of kanji rotates every day at 12AM JST.</div>
                        
                        <div>
                            <span className="Kanji-Selector-Subtitle">Or, practice a specific JLPT Kanji: </span>
                            <Tooltip id="my-tooltip" isOpen={kanjiTooltipText.length} variant="dark"/>
                            <input className="Kanji-Input"  
                                value={customKanjiInput} onInput={(e) => handleCustomKanjiInput(e.target.value)} onKeyDown={(e) => handleCustomKanjiKeyPress(e)}
                                data-tooltip-id="my-tooltip" data-tooltip-content={kanjiTooltipText}>
                            </input>
                            <button className="Kanji-Game-Button Kanji-Input-Button" onClick={() => handleCustomKanjiEnter()}>Submit</button>
                        </div>

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
                        </div>
                        <div className="Kanji-Game-Board-Tile">
                            <KanjiTile key={selectedKanji.Kanji_id} kanji={selectedKanji} showKanji />
                            <div className="Kanji-Game-Board-Buttons">
                                <CrossSign active={ failedReadings.length > 0 }/>
                                <CrossSign active={ failedReadings.length > 1 }/>
                                <CrossSign active={ failedReadings.length > 2 }/>
                            </div>
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
  