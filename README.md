# CMPT 432 - Compilers - Evan Mena

## Tools
[TypeScript](https://www.typescriptlang.org/)

[nodejs](https://nodejs.org/en/)

[browserify](http://browserify.org/)

[ace](https://ace.c9.io/)

## Building

`$ npm install`

Compile TypeScript in `src/` to JavaScript in `dist/` and `browserify views/script.js` to `views/index.js` for front-end

`$ npm run build`

## Testing

### Automated Tests

There is a suite of automated tests built using `mocha` and `chai` you can run them using

`$ npm run test`

### Testing by hand

#### Front End

Open `views/index.html` in your browser and type programs into the editor

#### Terminal

You can test through the terminal by running

##### On a file

`$ node dist/main.js filename`

##### Using the first argument as input

`$ node dist/main.js "{int x}" -r`



