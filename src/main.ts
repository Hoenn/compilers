import { Lexer } from './Lexer';
import fs = require('fs');
export function main(sourceArg: string, filePath?: boolean) {
    let sourceProgram: string;
    //If the sourceArg is a filepath, parse it into a string
    if (filePath) {
        sourceProgram = fs.readFileSync(sourceArg, 'utf8');
    } else {
        sourceProgram = sourceArg;
    }
    var l = new Lexer();
    var tokens = l.lex(sourceProgram);
    return sourceProgram;

}
if(process.argv[2] == 'r'||process.argv[2]=='raw'){
    main(process.argv[1], false);
} else {
    main(process.argv[1], true);
}
