import { greeter } from '../src/greet';
import { expect } from 'chai';
import 'mocha';

describe('Greet function', () => {
    it('should return Hello ${param1} !!', () => {
        const result = greeter("Mocha");
        expect(result).to.equal("Hello Mocha !!");
    });
});