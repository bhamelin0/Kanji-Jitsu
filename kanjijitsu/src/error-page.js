import * as React from "react";
import { Link, Outlet, useRouteError } from "react-router-dom";

function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
      <Link to={"/"}>Return to Kanjigame</Link>
    </div>
  );
}

export default ErrorPage;