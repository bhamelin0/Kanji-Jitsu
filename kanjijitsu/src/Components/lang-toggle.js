import {React, useState } from "react";
import "../kanji-game.css"

function LangToggle() {
    const [checked, setChecked] = useState(false);

    function onClick() {    
        setChecked(!checked);
    }
    
    return (
        <div className="switch-container">
            <label className="switch">
                <input type="checkbox" checked={checked} onClick={onClick} />
                <div className="slider">
                    <span className="slider-text">{checked ? "EN" : "JP"}</span>
                </div>
            </label>
        </div>

    );
}
  
export default LangToggle;
  