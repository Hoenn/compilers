# A Compiler
Try out the compiler front-end [here](https://hoenn.github.io/compilers/)

Compiles [a++](http://labouseur.com/courses/compilers/grammar.pdf) into a 6502 Machine Language subset called [6502a](http://labouseur.com/commondocs/6502alan-instruction-set.pdf)

## Building

`$ npm install`

Compile TypeScript in `src/` to JavaScript in `dist/` and `browserify views/script.js` to `views/index.js` for front-end using

`$ npm run build`

## Testing

### Automated Tests

There is a suite of automated tests built using `mocha` and `chai`, you can run them using

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



