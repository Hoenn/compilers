//import { Parser } from '../src/Parser'
import { expect } from 'chai';
import 'mocha';
// describe('Running Tests', () => {
//     //Dummy test needed before we can loop tests
//     it('Tests Complete', function(done){
//         tests.forEach(function(test) {
//             describe('Lex: '+test.test, () => {
//                 const result = L.lex(test.test);
//                 //Test Token output
//                 it(test.describe, ()=> {
//                     expect(result.t).to.deep.equal(test.result);
//                 });
//                 //Optional Error test
//                 if(test.error.lvl || test.error.msg){
//                     it('Should report: '+test.error.lvl+': '+test.error.msg, () => {
//                         expect(result.e).to.deep.equal(test.error);
//                     });
//                 }
//             });
//         });
//         //Required for async testing loop
//         done();
//     });
// });