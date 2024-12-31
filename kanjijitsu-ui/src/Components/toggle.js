import {React, useState } from "react";
import '../css/kanji-game.css'

function Toggle({checked, onClick, checkedText, uncheckedText}) {

    function handleClick() {
        checked = !checked;
        if(onClick) {
            onClick();
        }
    }
    
    return (
        <div className="switch-container">
            <label className="switch">
                <input type="checkbox" checked={checked} onClick={handleClick} readOnly />
                <div className="slider">
                    <span className="slider-text">{checked ? checkedText : uncheckedText}</span>
                </div>
            </label>
        </div>
    );
}
  
export default Toggle;
