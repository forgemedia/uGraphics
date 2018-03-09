The application starts at `server.js` - read the comments there for a walkthrough
of how it works under the hood

Developed against node v8.9.4

## Developing and running the graphics server

See below for Windows instructions

### Prerequisite software

- Node.js (download at nodejs.org, using a package manager for
your platform, e.g. Homebrew on macOS or Chocolatey on Windows,
or using `nvm` or nvm for windows)
- JSPM (install globally through Node's npm package manager by running
`npm install -g jspm`)
- Strongly recommended: Yarn, an alternative to the npm package manager (again,
recommended to install this through e.g. `brew` or `choco`)
- For development: gulp (`npm install -g gulp-cli`)

### Installing packages

- At the terminal/command prompt, run `npm install` (or `yarn` if you have
it installed), followed by `jspm install`

### Running the server

- Run `node server` to run the server
- Run `gulp` to run the server with the debug environment variable,
watch for changes to essential files and reload the server (useful during
development)
- You can use the option `-p` or `--port` to choose the port the server listens
on (3000 by default)

### Generating documentation
To generate documentation, use [ESDoc](https://esdoc.org).

## Steps to make the thing work on Windows, from scratch

- Open cmd/powershell
- Install chocolatey from chocolatey.org
- `choco install -y git nodejs yarn`
- Close the cmd/powershell and open it again
- `npm i -g typescript ts-node gulp-cli` (can leave `gulp-cli` out if not developing)
- Make sure you're in the directory you want to be in
- `git clone <repository>`
- `cd <repository>`
- `yarn` (if you don't have yarn, then `npm i`)
- `jspm i`
- Run it using `ts-node server`
- Run it in debug mode using `gulp`

## Files and directories
```
/.vscode - Visual Studio Code configuration
/assets - Static assets
    /assets/css - Static CSS stylesheets
    /assets/fonts - Webfont files
    /assets/img - Images (including SVG)
/src - Client-side source files
    /src/js - Client-side JavaScript (dash and character generator)
        - config.js - SystemJS config
    /src/scss - SCSS stylesheets for the dashboard (Gulp compiles these to the /assets/css directory)
    /src/styl - Stylus stylesheets for the character generator (the server compiles these live)
/views - Pug files (compiled to HTML live by the server)
/*.ts - Server source
/gulpfile.js - Gulp tasks
/package.json - Package configuration
/yarn.lock - Yarn package manager lockfile
/config.json - Server configuration
/index.js - A stub that uses babel-register to load server.js
```
