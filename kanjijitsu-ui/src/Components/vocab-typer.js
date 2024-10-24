import { React, useLayoutEffect, useState } from "react";
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import * as wanakana from 'wanakana';


function VocabTyper({kanji, enabled, onSubmit}) {
    const [input, setInput] = useState('');
    const [bound, setBound] = useState(false);
    const [tooltipText, setTooltipText] = useState('');
    const inputElem = document.getElementById("vocab-typer-input");

    if(inputElem && !bound) {
        wanakana.bind(inputElem);
        setBound(true);
        setInput(wanakana.toKana(input));
    }

    function onSubmitHandler(input) {
        input = input.trim();
        setTooltipText("")
        if(!wanakana.isKana(input)) {
            setTooltipText("Please ensure the input is entirely hiragana/katakana.");
            return;
        }
        
        onSubmit(input);
        setInput('');
    }

    function handleKeyPress(e) {
        if(e.key !== 'Enter') {
            setTooltipText("")
            return;
        }
        onSubmitHandler(input);
    }

    function handleClick(e) {
        setTooltipText("");
    }

    return (
        <span className="Vocab-Typer">
            <Tooltip id="my-tooltip" isOpen={tooltipText.length} variant="dark"/>
            <input id="vocab-typer-input" disabled={!enabled} className="Vocab-Input" placeholder={`Write vocabulary for ${kanji}!`} 
                value={input} onKeyDown={(e) => handleKeyPress(e)} onInput={(e) => setInput(e.target.value)} onClick={(e) => handleClick()}
                data-tooltip-id="my-tooltip" data-tooltip-content={tooltipText} >
            </input>
            <button className="Kanji-Game-Button Vocab-Input-Button" onClick={() => onSubmitHandler(input)} disabled={!enabled}>Submit</button>
        </span>

    );
}
  
export default VocabTyper;
  