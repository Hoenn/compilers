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
    var result = l.removeComments(sourceProgram);
    return sourceProgram;

}
main("./test/codesamples/lexTest1", true);