import { React } from "react";
import "../css/cross-sign.css";

function CrossSign({ active }) {


    function renderActive() {
        return (
            <span className="Cross-Sign">
                <div className="Cross-Sign-Circle"></div>
                <div className="Cross-Sign-Stem"></div>
                <div className="Cross-Sign-Stem-2"></div>
            </span>
        );
    }

    function renderInactive() {
        return (
            <span className="Cross-Sign">
                <div className="Cross-Sign-Circle-Inactive"></div>
            </span>
        );
    }

    if(active) {
        return renderActive();
    }
    return renderInactive();
}
  
export default CrossSign;
  