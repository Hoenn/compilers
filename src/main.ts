import { Lexer } from './Lexer';
import { Parser } from './Parser';

import fs = require('fs');
import util = require('util');
export function main(sourceArg: string, filePath?: boolean) {
    let sourceProgram: string;
    //If the sourceArg is a filepath, parse it into a string
    if (filePath) {
        sourceProgram = fs.readFileSync(sourceArg, 'utf8');
    } else {
        sourceProgram = sourceArg;
    }
    let l = new Lexer();
    let tokens = l.lex(sourceProgram);

    if(tokens.t) {
        let p = new Parser(tokens.t);
        let cst = p.parse();
        console.log(cst.toString());

    }
    
    return sourceProgram;

}
if(process.argv[3] && process.argv[3] == 'r'||process.argv[3]=='raw'){
    main(process.argv[2], false);
} else {
    main(process.argv[2], true);
}
