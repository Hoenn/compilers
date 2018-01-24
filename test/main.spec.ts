import { main } from '../src/main';
import { expect } from 'chai';
import 'mocha';

describe('main function with a file', () => {
    it('should text of test file', () => {
        const result = main("./test/codesamples/lexTest1", true);
        expect(result).to.equal(results['lexResult1']);
    });
});
describe('main function with a source string', () => {
    it('should return the exact source string', () => {
        const result = main('hello\n world\t'); // 
        expect(result).to.equal(results['lexResult2']);
    });
});

let results = {
    lexResult1: 
        '{\n' +
        '    int x = 5\n'+
        '} $',
    lexResult2: 'hello\n world\t'
    
}