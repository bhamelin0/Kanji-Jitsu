import { React, useId, useState } from "react";
import * as wanakana from 'wanakana';


function VocabTyper({onSubmit}) {
    const id = useId();
    const [input, setInput] = useState('');
    const [bound, setBound] = useState(false);
    const inputElem = document.getElementById(id);

    if(input && !bound) {
        wanakana.bind(inputElem);
        console.log("bound!");
        setBound(true);
    }

    function onSubmitHandler(input) {
        onSubmit(input);
        setInput('');

    }

    return (
        <div>
            <input id={id} className="Vocab-Input" placeholder="Write vocabulary!" value={input} onInput={e => setInput(e.target.value)}></input>
            <button className="Vocab-Input" onClick={() => onSubmitHandler(input)}>Submit</button>
        </div>

    );
}
  
export default VocabTyper;
  