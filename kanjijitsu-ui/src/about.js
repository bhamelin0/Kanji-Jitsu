import './css/about.css';
import * as React from "react";
import { Link } from "react-router-dom";

function AboutPage() {
    return (
      <div className="App App-Error">
        <div className="App-Body">
          <div className="App-Toolbar">
            <div>
              <Link to={"/"} className="App-Toolbar-Breadcrumb">Return to Homepage</Link>
            </div>
          </div>
          <header className="App-header">
            <p>About Kanji Jitsu</p>
          </header>
          <div className="About-Text">
            
            {`Thank you for checking out Kanji Jitsu.
            I made this site as a platform to study Kanji and Japanese vocabulary.
            Kanji Jitsu is build with React, Golang, and PostgreSQL, and runs off of AWS Lambda.
            Kanji Jitsu went live on 2024-10-13, and I plan to develop many improvements as I use it as part of my Japanese study routine.

            In the near future, the following will be improved:`}
            <ul>
              <li>Better mobile experience</li>
              <li>Animations for a tile 'flipping' after being clicked / vocab entered</li>
              <li>Add counters to the vocab tiles</li>
              <li>Link to a dictionary for each vocab item</li>
              <li>Allow text entry on the page regardless of focus</li>
              <li>Japanese UI implementation</li>
              <li>An integrated how to play tutorial</li>
            </ul>

            <div>Thank you to the <a href="https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project">JMdict-EDICT Dictionary Project</a> for supplying the data for this app.</div>
            <div>Thank you to WaniKani for supplying the <a href="https://github.com/WaniKani/WanaKana">WanaKana english to hiragana/katakana typing library</a>.</div>
            <br/>

            {`If you're interested in contacting me about this website,
            or hiring and sponsoring a visa for a Canadian software developer interested in moving to Japan,
            please feel free to contact me at `}<a href="mailto:kanjijitsu@gmail.com">kanjijitsu@gmail.com</a>.
          </div>

        </div>
      </div>
    );
  }
  
  export default AboutPage;
  