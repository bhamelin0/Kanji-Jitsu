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

    function handleKanjiTileClick(kanji) {

        console.log("Clicked Kanji " + kanji.Kanji + " Level " + kanji.N_level);
        setSelectedKanji(kanji)
        setGameStage(1);
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
                : selectedKanji && gameStage == 1 ? (
                    <div className="Kanji-Game-Stage-1">
                        <KanjiTile key={selectedKanji.Kanji_id} kanji={selectedKanji} showKanji />
                        <VocabTyper></VocabTyper>
                        <div className="Vocab-List"> 
                            <VocabTile/><VocabTile/><VocabTile/><VocabTile/><VocabTile/><VocabTile/><VocabTile/><VocabTile/><VocabTile/><VocabTile/>
                        </div>
                        <div className="Vocab-List"> 
                            <VocabTile/><VocabTile/><VocabTile/><VocabTile/><VocabTile/><VocabTile/><VocabTile/><VocabTile/><VocabTile/><VocabTile/>
                        </div>
                        <div className="Vocab-List"> 
                            <VocabTile/><VocabTile/><VocabTile/><VocabTile/><VocabTile/><VocabTile/><VocabTile/><VocabTile/><VocabTile/><VocabTile/>
                        </div>
                    </div>
                ) :   <div> Game Over! </div>

            }
        </div>
    </div>
    );
  }
  
  export default KanjiGame;
  