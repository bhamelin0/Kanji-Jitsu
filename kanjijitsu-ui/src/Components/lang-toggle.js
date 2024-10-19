import {React, useState } from "react";
import '../css/kanji-game.css'

function LangToggle({checked, onClick}) {

    function handleClick() {
        checked = !checked;
        if(onClick) {
            onClick();
        }
    }
    
    return (
        <div className="switch-container">
            <label className="switch">
                <input type="checkbox" checked={checked} onClick={handleClick} />
                <div className="slider">
                    <span className="slider-text">{checked ? "EN" : "JP"}</span>
                </div>
            </label>
        </div>
    );
}
  
export default LangToggle;
  