# Forge Graphics Server G3 - a beginners' technical overview

The application starts at `server.ts` - read the comments there for a walkthrough
of how it works under the hood

## Developing and running the graphics server

### Prerequisite software

- Node.js (download at nodejs.org, or using a package manager for
your platform, e.g. Homebrew on macOS or Chocolatey on Windows)
- JSPM (install globally through Node's npm package manager by running
`npm install -g jspm`)
- Strongly recommended: Yarn, an alternative to the npm package manager (again,
recommended to install this through e.g. `brew` or `choco`)
- For development: gulp (`npm install -g gulp-cli`)
- NPM global packages: `ts-node` `typescript` `node-gyp` (including `npm i -g --production windows-build-tools` on Windows)

### Installing packages

- At the terminal/command prompt, run `npm install` (or `yarn` if you have
it installed), followed by `jspm install`

### Running the server

- Run `ts-node server` to run the server
- Run `gulp` to run the server with the debug environment variable,
watch for changes to essential files and reload the server (useful during
development)
- You can use the option `-p` or `--port` to choose the port the server listens
on (3000 by default)
