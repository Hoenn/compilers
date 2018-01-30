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
console.log(process.argv);
if(process.argv[3] == 'r'||process.argv[3]=='raw'){
    main(process.argv[2], false);
} else {
    main(process.argv[2], true);
}
