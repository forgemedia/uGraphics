# Forge Graphics Server Thing 3: Electric Boogal...ee

**This readme may now be quite outdated as the project has undergone some extensive changes**

The application starts at `server.js` - read the comments there for a walkthrough
of how it works under the hood

Developed against node v8.9.4

## Developing and running the graphics server

See below for Windows instructions

### Prerequisite software

- Node.js (download at nodejs.org, using a package manager for
your platform, e.g. Homebrew on macOS or Chocolatey on Windows,
or using `nvm` or nvm for windows)
- Strongly recommended: Yarn, an alternative to the npm package manager (again,
recommended to install this through e.g. `brew` or `choco`)
- JSPM (install by running
`yarn add jspm`)
- For development: gulp (`yarn add gulp-cli`)

### Installing packages

- At the terminal/command prompt, run `yarn`, followed by `jspm install` (or `jspm i` for short)

### Running the server

- Run `node index` to run the server
- You can use the option `-p` or `--port` to choose the port the server listens
on (3000 by default)
- Run `npx gulp` to run the server with the debug environment variable,
watch for changes to essential files and reload the server (useful during
development)

### Generating documentation
To generate documentation, use `npx esdoc`.

## Steps to make the thing work on Windows, from scratch

- Open cmd/powershell
- Install chocolatey from chocolatey.org
- `choco install -y git nodejs yarn`
- Close the cmd/powershell and open it again
- Make sure you're in the directory you want to be in
- `git clone <repository>`
- `cd <repository>`
- `yarn` (if you don't have yarn, then `npm i`)
- `jspm i`
- Run it using `node server`
- Run it in debug mode using `npx gulp`

## Files and directories
```
/.vscode - Visual Studio Code configuration
/core - Core files that don't change between profile
/<profile> (e.g. varsity18) - A profile containing styles, code etc. specific to one project/broadcast/whatever
Underneath the previous two:
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
/*.js - Server source code
/gulpfile.js - Gulp tasks
/package.json - Package configuration
/yarn.lock - Yarn package manager lockfile
/config.json - Server configuration
/index.js - A stub that uses babel-register to load server.js
```
