import * as React from "react";
import { Link, useRouteError } from "react-router-dom";
import './css/kanji-game.css'

function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="App App-Error">
      <div className="App-Body">
      <header className="App-header">
        <h1>Oops!</h1>
      </header>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
      <Link to={"/"}>Return to Kanji Jitsu</Link>
      </div>
    </div>
  );
}

export default ErrorPage;