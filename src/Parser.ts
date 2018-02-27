import {TokenType, Token, TokenRegex} from './Token';
import {SyntaxTree, Node} from './SyntaxTree';
import {Alert, error, warning} from './Alert';
export class Parser {

    cst: SyntaxTree;
    tokens : Token[];
    log : string[];

    constructor(tokens: Token[]) {
        //Add initial program token, make root node
        this.cst = new SyntaxTree(new Node("Root"));
        this.tokens = tokens;
        this.log = [];
    }
    parse() : {log: string[], cst:SyntaxTree | null, e: Alert |undefined }{
        let err = this.parseProgram();
        if(err) {
            return {log: this.log, cst: null, e: err};
        }
        //If there are more tokens
        if(this.tokens.length > 0) {
            //If there is a left bracket, parse the next program
            // LBracket is the only valid token after EOP
            if(this.tokens[0].kind == TokenType.LBracket) {
                err=this.parseProgram();
            } else { 
                err = error("Unexpected token '"+this.tokens[0].value+"' after EOP");
            }
        }
        if(err) {
            return {log: this.log, cst: null, e: err};
        }

        return {log: this.log, cst: this.cst, e: undefined};
    }
    parseProgram()  {
        this.emit("program");
        this.addBranch("Program");
        let err = this.parseBlock();
        if(err) {
            return err;
        }
        err = this.consume(["[$]"], TokenType.EOP);
        if(err) {
            return err;
        }
        this.moveUp();
        this.cst.moveCurrentUp();
    
    }
    parseBlock() {
        this.emit("block");
        this.addBranch("Block");
        let error = this.consume(["{"], TokenType.LBracket);
        if(error) {
            return error;
        }
        error = this.parseStatementList();
        if(error) {
            return error;
        }
        error = this.consume(["}"], TokenType.RBracket);
        if(error) {
            return error;
        }
        this.cst.moveCurrentUp();
    }
    parseStatementList(): Alert | undefined {
        this.addBranch("StatementList");
        let nToken = this.tokens[0].value;
        if(nToken.match(TokenRegex.Statement)) {
            let err = this.parseStatement();
            if (err) {
                return err;
            }
        } else {
            //Lambda Production
            this.emit("Lambda Production in StatementList on line "+this.tokens[0].lineNum);
        }
        
        //Incase tokens may have moved in parseStatement above, reassign nToken
        nToken = this.tokens[0].value;
        //See if next token would start a valid statement
        //If so, recurse, if not moveUp
        if(nToken.match(TokenRegex.Statement) ) {
            let err = this.parseStatementList();
            if(err) {
                return err;
            }
        }
        this.cst.moveCurrentUp();
    }
    parseStatement(): Alert | undefined{
        this.emit("statement");
        this.addBranch("Statement");

        //Look at next token to decide how to parse
        let nToken = this.tokens[0].kind;
        let err;
        switch(nToken) {
            case TokenType.LBracket: {
                err = this.parseBlock();
                break;
            }
            case TokenType.Print: {
                err = this.parsePrint();
                break;
            }
            case TokenType.VarType: {
                err = this.parseVarDecl();
                break;
            }
            case TokenType.While: {
                err = this.parseWhile();
                break;
            }
            case TokenType.If: {
                err = this.parseIf();
                break;
            }
            case TokenType.Id: {
                err = this.parseAssignment();
                break;
            }
            default: {
                err = error("Expected print|while|Assignment|VarDecl|If|Block statement on ",
                                this.tokens[0].lineNum);
                break;
            }
        }
        //Propagate any errs from switch
        if(err) {
            return err;
        }
        this.cst.moveCurrentUp();
    }
    parsePrint() {
        this.emit("print statement");
        this.addBranch("PrintStatement");
        let err = this.consume(["print"], "print");
        if(err) {
            return err;
        }
        //"[(]" since ( alone throws malformed RegExp error
        // /\(/ also accomplishes the same
        this.consume(["[(]"], "(");
        err = this.parseExpr()
        if (err) {
          return err;
        }
        err = this.consume(["[)]"], ")");
        if(err) {
            return err;
        }

        this.cst.moveCurrentUp();
    }
    parseAssignment() {
        this.emit("assignment statement");
        this.addBranch("AssignmentStatement");
        let err = this.parseId();
        if(err){
            return err;
        }
        err = this.consume([TokenRegex.Assign], "Equals");
        if(err) {
            return err;
        }
        err = this.parseExpr();
        if(err){
            return err;
        }
        this.cst.moveCurrentUp();

    }
    parseIf() {
        this.emit("if statement");
        this.addBranch("IfStatement");
        let err = this.consume([TokenRegex.If], "if");
        if (err) {
            return err;
        }
        err = this.parseBoolExpr();
        if(err) {
            return err;
        }
        err = this.parseBlock();
        if(err) {
            return err;
        }
        this.cst.moveCurrentUp();
    }
    parseWhile() {
        this.emit("while statement");
        this.addBranch("WhileStatement");
        let err = this.consume(["while"], "while");
        if(err) {
            return err;
        }
        err = this.parseBoolExpr();
        if(err) {
            return err;
        }
        err = this.parseBlock();
        if(err) {
            return err;
        }
        this.cst.moveCurrentUp();
    }
    parseVarDecl() {
        this.emit("variable declaration");
        this.addBranch("VarDeclStatement");
        let err = this.parseType();
        if(err) {
            return err;
        }
        err = this.parseId();
        if(err) {
            return err;
        }
        this.cst.moveCurrentUp();
    }
    parseExpr() {
        this.emit("expression");
        this.addBranch("Expression");
 
        let nToken = this.tokens[0].kind
        let err;
        switch(nToken) {
            case TokenType.Digit: {
                err = this.parseIntExpr()
                break;
            }
            case TokenType.Id: {
                err = this.parseId();
                break;
            }
            case TokenType.LParen: {
                err = this.parseBoolExpr();
                break;
            }
            case TokenType.BoolLiteral: {
                err = this.parseBoolExpr();
                break;
            }
            case TokenType.Quote: {
                err = this.parseStringExpr();
                break;
            }
            default: {
                return error("Expected Int|Boolean|String expression or Id got "+
                    this.tokens[0].kind, this.tokens[0].lineNum);
            }
        }

        if(err){
            return err;
        }
        this.cst.moveCurrentUp();
    }
    parseIntExpr(): Alert|undefined{
        this.emit("int expression");
        this.addBranch("IntExpr");
        let err = this.consume([TokenRegex.Digit], "Digit");
        if(err){
            return err;
        }
        let nToken = this.tokens[0].kind;
        if(nToken == TokenType.IntOp){
            err = this.consume([TokenRegex.IntOp], "Plus");
            if(err) {
                return err;
            }
            err = this.parseExpr();
            if(err) {
                return err;
            }
            
        }
        this.cst.moveCurrentUp();
    }
    parseBoolExpr(): Alert |undefined {
        this.emit("boolean expression");
        this.addBranch("BooleanExpr");
        let err;
        let nToken = this.tokens[0];
        if(nToken.kind == TokenType.LParen) {
            err = this.consume(["[(]"], TokenType.LParen);
            if(err) {
                return err;
            }
            err = this.parseExpr();
            if(err) {
                return err;
            }
            err = this.consume([TokenRegex.BoolOp], "boolean operation");
            if(err) {
                return err;
            }
            err = this.parseExpr();
            if(err) {
                return err;
            }
            err = this.consume(["[)]"], TokenType.RParen);
            if(err) {
                return err;
            }
        } else if(nToken.kind == TokenType.BoolLiteral) {
            err = this.consume([TokenRegex.BoolLiteral], "boolean literal");
            if(err) {
                return err;
            }
        } else {
            return error("Expected BooleanExpression got "+nToken.kind+" on line "+nToken.lineNum);
        }
        this.cst.moveCurrentUp();
    }
    parseStringExpr() {
        this.addBranch("StringExpr");
        this.emit("string expression");

        let err = this.consume(['"'], "open quote");
        if(err){
            return err;
        }
        err = this.parseCharList();
        if(err) {
            return err;
        }
        err = this.consume(['"'], "close quote");
        if(err){
            return err;
        }
        this.cst.moveCurrentUp();
    }
    parseCharList(): Alert |undefined {
        this.addBranch("CharList");
        this.emit("character list");
        let nToken = this.tokens[0];
        let err;
        //Check for character
        if(nToken.value.match(TokenRegex.Char)) {
            err = this.consume([TokenRegex.Char], "lower case character");
        } else if(nToken.value == ' '){ //And space
            err = this.consume([" "], "space");
        } else {
            //Lambda production for empty charlist"
        }
        //If next token is a char, repeat
        if(nToken.value.match(/[a-z]|( )/)) {
            err = this.parseCharList();
            if(err) {
                return err;
            }
        }
        this.cst.moveCurrentUp();
        return err;

    }
    parseId() {
        this.addBranch("Id");
        this.emit("id");
        let err = this.consume([TokenRegex.Id], "Id");
        if (err) {
            return err;
        }
        this.cst.moveCurrentUp();
    }
    parseType() {
        this.addBranch("Type");
        this.emit("type");
        let err = this.consume([TokenRegex.Type], "int|boolean|string type");
        if(err){
            return err;
        }
        this.cst.moveCurrentUp();
    }
    //search[] may contain string | RegExp
    //want:string is needed for error reporting in case a list of
    //  possible input is being searched for
    consume(search:string[] | RegExp[], want: string): Alert |undefined { 
        let cToken = this.tokens.shift();
        if(cToken) {
            for(var exp of search){
                if(cToken.value.match(exp)){
                    this.cst.addLeafNode(new Node(cToken.value));
                    
                    return undefined;
                }
            }
        } else {
            //Should never happen if Lex was passed
            return error("Unexpected end of input");
        }

        return error("Expected "+want+" got " + cToken.kind, cToken.lineNum);
        
    }
    emit(s: string) {
        this.log.push("Parsing "+s);
    }
    addBranch(nodeName: string) {
        this.cst.addBranchNode(new Node(nodeName));
    }
    moveUp() {
        this.cst.moveCurrentUp();
    }
}
