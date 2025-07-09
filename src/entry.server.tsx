import { eventHandler } from "vinxi/http";

import { GoogleFonts, renderHTML } from "@rio.js/vinxi/render";

export default eventHandler(
  renderHTML(({ headPrepend, head, scripts, env }) => (
    <html
      lang="en"
      className="light theme-purple theme-scaled"
      style={{
        colorScheme: "light",
      }}
    >
      <head>
        {headPrepend}
        <GoogleFonts />
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/png" href="/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{`${env.PUBLIC_APP_NAME} | Lepton`}</title>
        {head}
      </head>
      <body>
        <div id="root"></div>
        {scripts}
      </body>
    </html>
  ))
);
