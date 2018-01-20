#!/bin/bash
#Build Script

#Compile src/ *.ts -> dist/ *.js
tsc

#Browserify the front-end JS that interacts with backend
node_modules/browserify/bin/cmd.js views/script.js -o views/index.js