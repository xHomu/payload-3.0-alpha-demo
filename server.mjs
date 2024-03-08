import express from "express";
import next from "next";

let port = process.env.PORT || "4000";
let host = process.env.HOST || "localhost";
let env = process.env.NODE_ENV || "development";

let dev = env !== "production";
let app = next({ dev });
let handle = app.getRequestHandler();

function nextHandler(req, res) {
  return handle(req, res);
}

async function main() {
  await app.prepare();

  let server = express();

  // First, we need to serve all the /_next URLs, this includes the built files
  // and the images optimized by Next.js
  server.all("/_next/*", nextHandler);

  // Then, we need to server the static files on the public folder
  server.use(express.static("public", { immutable: false, maxAge: "1h" }));

  // Finally, we need to tell our server to pass any other request to Next
  // so it can keep working as an expected
  server.all("*", nextHandler);

  server.listen(port, host, (error) => {
    if (error) throw error;
    console.log(`> Ready on http://${host}:${port}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
