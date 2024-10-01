import './kanji-game.css';
import React, { useState, useEffect } from "react";
import KanjiTile from './Components/kanji-tile';
import VocabTyper from './Components/vocab-typer';
import LangToggle from './Components/lang-toggle';
import VocabTile from './Components/vocab-tile';

function KanjiGame() {
    const [kanjiJson, setKanjiJson] = useState([]);
    const [gameStage, setGameStage] = useState(0); // 1 displays selected Kanji, 2 is end screen
    const [selectedKanji, setSelectedKanji] = useState(null); // 1 displays selected Kanji, 2 is end screen
    const [selectedKanjiVocabCommon, setSelectedKanjiVocabCommon] = useState(null); // List of common valid Kanji inputs
    const [selectedKanjiVocabRare, setSelectedKanjiVocabRare] = useState(null); // List of rare valid Vocab inputs
    const [attempts, setAttempts] = useState([]); // All attempted inputs
    const [failedReadings, setFailedReadings] = useState([]); // 1 displays selected Kanji, 2 is end screen

    useEffect(() => {
        async function getKanjiOfDay() {
            try {
                const res = await fetch(`http://127.0.0.1:3001/dailyKanji`);
                const kanjiJson = await res.json();
                setKanjiJson(kanjiJson)
                console.log(kanjiJson)
            } catch (err) {
               console.log(err)
            }
        }

        getKanjiOfDay();
    }, []);

    async function handleKanjiTileClick(kanji) {
        setGameStage(1);
        console.log("Clicked Kanji " + kanji.Kanji + " Level " + kanji.N_level);
        setSelectedKanji(kanji)

        try {
            const res = await fetch(`http://127.0.0.1:3001/vocabForKanji?kanji=${kanji.Kanji}`)
            const vocabJson = await res.json();
            const vocabEntries = vocabJson.VocabCollection;
            console.log(vocabEntries);
            setSelectedKanjiVocabCommon(vocabEntries.filter(entry => entry.Common === true))
            setSelectedKanjiVocabRare(vocabEntries.filter(entry => entry.Common === false))
        } catch (err) {
           console.log(err)
        }
    }

    return (
      <div className="App">
        <div className="App-Body">
            <div className="App-Toolbar">
                <LangToggle/>
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
                    <div>Loading!</div>
                )
                : selectedKanjiVocabCommon && gameStage == 1 ? (
                    <div className="Kanji-Game-Stage-1">
                        <div className="Kanji-Game-Board">
                            <div className="Kanji-Game-Board-Left">
                            </div>
                            <div className="Kanji-Game-Board-Tile">
                                <KanjiTile key={selectedKanji.Kanji_id} kanji={selectedKanji} showKanji />
                            </div>
                            <div className="Kanji-Game-Board-Right">
                                Score: 50;
                                button to give up
                                button to reveal hints (-50%)
                            </div>
                        </div>
                        <VocabTyper></VocabTyper>
                        <div className="Vocab-List"> 
                            { selectedKanjiVocabCommon.map((vocab) => 
                                 <VocabTile kanji={selectedKanji.Kanji} vocab={vocab} key={vocab.Vocab_id}/>

                            )}
                        </div>
                        <div className="Vocab-List"> 
                            { selectedKanjiVocabRare.map((vocab) => 
                                 <VocabTile kanji={selectedKanji.Kanji} vocab={vocab} key={vocab.Vocab_id}/>
                            )}
                        </div>
                    </div>
                ) :   <div> Game Over! </div>
            }
        </div>
    </div>
    );
  }
  
  export default KanjiGame;
  