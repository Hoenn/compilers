(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function error(errMsg, lineNum) {
    return { lvl: "error", msg: errMsg + (lineNum ? " on line " + lineNum : "") };
}
exports.error = error;
function warning(m) {
    return { lvl: "warning", msg: m };
}
exports.warning = warning;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token_1 = require("./Token");
var Alert_1 = require("./Alert");
var Lexer = /** @class */ (function () {
    function Lexer() {
    }
    Lexer.prototype.lex = function (src) {
        //Break text into blobs to perform longest match on
        //filter out undefined blobs
        var tokenBlobs = src.split(Token_1.TokenRegex.Split).filter(function (defined) { return defined; });
        var lineNum = 1;
        var tokens = [];
        var result = { t: null, e: null };
        for (var _i = 0, tokenBlobs_1 = tokenBlobs; _i < tokenBlobs_1.length; _i++) {
            var blob = tokenBlobs_1[_i];
            //If a comment or whitespace just skip
            if (blob.match(Token_1.TokenRegex.Comment) || blob.match(Token_1.TokenRegex.WhiteSpace)) {
                //If newline is found increment lineNum but skip
                if (blob.match("\n")) {
                    lineNum += 1;
                }
                continue;
            }
            result = this.longestMatch(blob, lineNum);
            if (result.t) {
                for (var _a = 0, _b = result.t; _a < _b.length; _a++) {
                    var t = _b[_a];
                    tokens.push(t);
                }
            }
            //It's possible to have valid tokens returned along with an error
            if (result.e) {
                break;
            }
        }
        //If we have no errors, check if EOP is missing. No need if there are other lex errors
        if (result.e === null) {
            if (tokens.length == 0 || tokens[tokens.length - 1].kind != Token_1.TokenType.EOP) {
                tokens.push(new Token_1.Token(Token_1.TokenType.EOP, "$", lineNum));
                result.e = Alert_1.warning("End of Program missing. Added $ symbol.");
            }
        }
        return { t: tokens, e: result.e };
    };
    Lexer.prototype.longestMatch = function (blob, lineNum) {
        if (Token_1.TokenRegex.Quote.test(blob)) {
            //Break "quoted" blob into characters after removing comments
            var noComment = blob.replace(/\/\*.*\*\//g, "");
            var splitQuote = noComment.split("");
            var tokenArray = [];
            for (var _i = 0, splitQuote_1 = splitQuote; _i < splitQuote_1.length; _i++) {
                var char = splitQuote_1[_i];
                //If it's a quote simply add that token
                if (char === "\"") {
                    tokenArray.push(new Token_1.Token(Token_1.TokenType.Quote, char, lineNum));
                }
                else if (char.match(/[a-z]/) || char.match(/\s/)) {
                    //If it's a new line, accurately report it
                    if (char.match("\n")) {
                        return { t: tokenArray, e: this.multiLineStringError(lineNum) };
                    }
                    //If it's a letter or space add that token
                    tokenArray.push(new Token_1.Token(Token_1.TokenType.Char, char, lineNum));
                }
                else {
                    //"quoted" may only contain valid lexemes (chars)
                    return { t: tokenArray, e: this.unknownTokenError(char, lineNum) };
                }
            }
            return { t: tokenArray, e: null };
        }
        else if (Token_1.TokenRegex.While.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.While, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.Print.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.Print, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.EOP.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.EOP, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.VarType.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.VarType, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.If.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.If, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.BoolLiteral.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.BoolLiteral, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.Id.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.Id, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.Digit.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.Digit, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.Assign.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.Assign, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.IntOp.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.IntOp, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.BoolOp.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.BoolOp, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.LParen.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.LParen, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.RParen.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.RParen, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.LBracket.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.LBracket, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.RBracket.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.RBracket, blob, lineNum)], e: null };
        }
        else {
            //Blob did not match any valid tokens, but may contain valid tokens
            //ex: intx -> [int, x]
            //Check match for keywords
            if (blob.match(Token_1.TokenRegex.Keywords)) {
                //If there are keywords, split string by them and longest match the result
                var splitBlob = blob.split(Token_1.TokenRegex.Keywords)
                    .filter(function (def) { return def; });
                var tokenArray = [];
                var result = { t: null, e: null };
                for (var _a = 0, splitBlob_1 = splitBlob; _a < splitBlob_1.length; _a++) {
                    var b = splitBlob_1[_a];
                    //Longest match on new string
                    var result_1 = this.longestMatch(b, lineNum);
                    //If there is no error, keep this token and proceed
                    if (result_1.t) {
                        for (var _b = 0, _c = result_1.t; _b < _c.length; _b++) {
                            var t = _c[_b];
                            tokenArray.push(t);
                        }
                    }
                    else {
                        break;
                    }
                }
                return { t: tokenArray, e: result.e };
            }
            else {
                //If the blob doesn't contain any keywords and reached here it must not be valid
                return { t: null, e: this.unknownTokenError(blob, lineNum) };
            }
        }
    };
    Lexer.prototype.unknownTokenError = function (blob, lineNum) {
        return Alert_1.error("Unknown token " + blob.trim(), lineNum);
    };
    Lexer.prototype.multiLineStringError = function (lineNum) {
        return Alert_1.error("Multiline strings not allowed, found", lineNum);
    };
    return Lexer;
}());
exports.Lexer = Lexer;

},{"./Alert":1,"./Token":5}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token_1 = require("./Token");
var SyntaxTree_1 = require("./SyntaxTree");
var Alert_1 = require("./Alert");
var Parser = /** @class */ (function () {
    function Parser(tokens) {
        //Add initial program token, make root node
        this.cst = new SyntaxTree_1.SyntaxTree(new SyntaxTree_1.Node("Program"));
        this.tokens = tokens;
        this.log = [];
    }
    Parser.prototype.parse = function () {
        this.emit("program");
        var err = this.parseBlock();
        if (err) {
            return { log: this.log, cst: null, e: err };
        }
        err = this.consume(["[$]"], Token_1.TokenType.EOP);
        //Will be an error if there is anything after main block
        if (err) {
            return { log: this.log, cst: null, e: err };
        }
        return { log: this.log, cst: this.cst, e: err };
        //return syntax tree and errors        
    };
    Parser.prototype.parseBlock = function () {
        this.emit("block");
        this.cst.addBranchNode(new SyntaxTree_1.Node("Block"));
        var error = this.consume(["{"], Token_1.TokenType.LBracket);
        if (error) {
            return error;
        }
        error = this.parseStatementList();
        if (error) {
            return error;
        }
        error = this.consume(["}"], Token_1.TokenType.RBracket);
        if (error) {
            return error;
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseStatementList = function () {
        this.cst.addBranchNode(new SyntaxTree_1.Node("StatementList"));
        var nToken = this.tokens[0].value;
        if (nToken.match(Token_1.TokenRegex.Statement)) {
            var err = this.parseStatement();
            if (err) {
                return err;
            }
        }
        else {
            //Lambda Production
            this.emit("Lambda Production in StatementList on line " + this.tokens[0].lineNum);
        }
        //Incase tokens may have moved in parseStatement above, reassign nToken
        nToken = this.tokens[0].value;
        //See if next token would start a valid statement
        //If so, recurse, if not moveUp
        if (nToken.match(Token_1.TokenRegex.Statement)) {
            var err = this.parseStatementList();
            if (err) {
                return err;
            }
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseStatement = function () {
        this.emit("statement");
        this.cst.addBranchNode(new SyntaxTree_1.Node("Statement"));
        //Look at next token to decide how to parse
        var nToken = this.tokens[0].kind;
        var err;
        switch (nToken) {
            case Token_1.TokenType.LBracket: {
                err = this.parseBlock();
                break;
            }
            case Token_1.TokenType.Print: {
                err = this.parsePrint();
                break;
            }
            case Token_1.TokenType.VarType: {
                err = this.parseVarDecl();
                break;
            }
            case Token_1.TokenType.While: {
                err = this.parseWhile();
                break;
            }
            case Token_1.TokenType.If: {
                err = this.parseIf();
                break;
            }
            case Token_1.TokenType.Id: {
                err = this.parseAssignment();
                break;
            }
            default: {
                err = Alert_1.error("Expected print|while|Assignment|VarDecl|If|Block statement on ", this.tokens[0].lineNum);
                break;
            }
        }
        //Propagate any errs from switch
        if (err) {
            return err;
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parsePrint = function () {
        this.emit("print statement");
        this.cst.addBranchNode(new SyntaxTree_1.Node("PrintStatement"));
        var err = this.consume(["print"], "print");
        if (err) {
            return err;
        }
        //"[(]" since ( alone throws malformed RegExp error
        // /\(/ also accomplishes the same
        this.consume(["[(]"], "(");
        err = this.parseExpr();
        if (err) {
            return err;
        }
        err = this.consume(["[)]"], ")");
        if (err) {
            return err;
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseAssignment = function () {
        this.emit("assignment statement");
        this.cst.addBranchNode(new SyntaxTree_1.Node("AssignmentStatement"));
        var err = this.parseId();
        if (err) {
            return err;
        }
        err = this.consume([Token_1.TokenRegex.Assign], "Equals");
        if (err) {
            return err;
        }
        err = this.parseExpr();
        if (err) {
            return err;
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseIf = function () {
        this.emit("if statement");
        this.cst.addBranchNode(new SyntaxTree_1.Node("IfStatement"));
        var err = this.consume([Token_1.TokenRegex.If], "if");
        if (err) {
            return err;
        }
        err = this.parseBoolExpr();
        if (err) {
            return err;
        }
        err = this.parseBlock();
        if (err) {
            return err;
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseWhile = function () {
        this.emit("while statement");
        this.cst.addBranchNode(new SyntaxTree_1.Node("WhileStatement"));
        var err = this.consume(["while"], "while");
        if (err) {
            return err;
        }
        err = this.parseBoolExpr();
        if (err) {
            return err;
        }
        err = this.parseBlock();
        if (err) {
            return err;
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseVarDecl = function () {
        this.emit("variable declaration");
        this.cst.addBranchNode(new SyntaxTree_1.Node("VarDeclStatement"));
        var err = this.parseType();
        if (err) {
            return err;
        }
        err = this.parseId();
        if (err) {
            return err;
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseExpr = function () {
        this.emit("expression");
        this.cst.addBranchNode(new SyntaxTree_1.Node("Expression"));
        var nToken = this.tokens[0].kind;
        var err;
        switch (nToken) {
            case Token_1.TokenType.Digit: {
                err = this.parseIntExpr();
                break;
            }
            case Token_1.TokenType.Id: {
                err = this.parseId();
                break;
            }
            case Token_1.TokenType.LParen: {
                err = this.parseBoolExpr();
                break;
            }
            case Token_1.TokenType.BoolLiteral: {
                err = this.parseBoolExpr();
                break;
            }
            case Token_1.TokenType.Quote: {
                err = this.parseStringExpr();
                break;
            }
            default: {
                return Alert_1.error("Expected Int|Boolean|String expression or Id got " +
                    this.tokens[0].kind, this.tokens[0].lineNum);
            }
        }
        if (err) {
            return err;
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseIntExpr = function () {
        this.emit("int expression");
        this.cst.addBranchNode(new SyntaxTree_1.Node("IntExpr"));
        var err = this.consume([Token_1.TokenRegex.Digit], "Digit");
        if (err) {
            return err;
        }
        var nToken = this.tokens[0].kind;
        if (nToken == Token_1.TokenType.IntOp) {
            err = this.consume([Token_1.TokenRegex.IntOp], "Plus");
            if (err) {
                return err;
            }
            err = this.parseExpr();
            if (err) {
                return err;
            }
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseBoolExpr = function () {
        this.emit("boolean expression");
        this.cst.addBranchNode(new SyntaxTree_1.Node("BooleanExpr"));
        var err;
        var nToken = this.tokens[0];
        if (nToken.kind == Token_1.TokenType.LParen) {
            err = this.consume(["[(]"], Token_1.TokenType.LParen);
            if (err) {
                return err;
            }
            err = this.parseExpr();
            if (err) {
                return err;
            }
            err = this.consume([Token_1.TokenRegex.BoolOp], "boolean operation");
            if (err) {
                return err;
            }
            err = this.parseExpr();
            if (err) {
                return err;
            }
            err = this.consume(["[)]"], Token_1.TokenType.RParen);
            if (err) {
                return err;
            }
        }
        else if (nToken.kind == Token_1.TokenType.BoolLiteral) {
            err = this.consume([Token_1.TokenRegex.BoolLiteral], "boolean literal");
            if (err) {
                return err;
            }
        }
        else {
            return Alert_1.error("Expected BooleanExpression got " + nToken.kind + " on line " + nToken.lineNum);
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseStringExpr = function () {
        this.cst.addBranchNode(new SyntaxTree_1.Node("StringExpr"));
        this.emit("string expression");
        var err = this.consume(['"'], "open quote");
        if (err) {
            return err;
        }
        err = this.parseCharList();
        if (err) {
            return err;
        }
        err = this.consume(['"'], "close quote");
        if (err) {
            return err;
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseCharList = function () {
        this.cst.addBranchNode(new SyntaxTree_1.Node("CharList"));
        this.emit("character list");
        var nToken = this.tokens[0];
        var err;
        //Check for character
        if (nToken.value.match(Token_1.TokenRegex.Char)) {
            err = this.consume([Token_1.TokenRegex.Char], "lower case character");
        }
        else if (nToken.value == ' ') {
            err = this.consume([" "], "space");
        }
        else {
            //Lambda production for empty charlist"
        }
        //If next token is a char, repeat
        if (nToken.value.match(/[a-z]|( )/)) {
            err = this.parseCharList();
            if (err) {
                return err;
            }
        }
        this.cst.moveCurrentUp();
        return err;
    };
    Parser.prototype.parseId = function () {
        this.cst.addBranchNode(new SyntaxTree_1.Node("Id"));
        this.emit("id");
        var err = this.consume([Token_1.TokenRegex.Id], "Id");
        if (err) {
            return err;
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseType = function () {
        this.cst.addBranchNode(new SyntaxTree_1.Node("Type"));
        this.emit("type");
        var err = this.consume([Token_1.TokenRegex.Type], "int|boolean|string type");
        if (err) {
            return err;
        }
        this.cst.moveCurrentUp();
    };
    //search[] may contain string | RegExp
    //want:string is needed for error reporting in case a list of
    //  possible input is being searched for
    Parser.prototype.consume = function (search, want) {
        var cToken = this.tokens.shift();
        if (cToken) {
            for (var _i = 0, search_1 = search; _i < search_1.length; _i++) {
                var exp = search_1[_i];
                if (cToken.value.match(exp)) {
                    this.cst.addLeafNode(new SyntaxTree_1.Node(cToken.value));
                    return undefined;
                }
            }
        }
        else {
            //Should never happen if Lex was passed
            return Alert_1.error("Unexpected end of input");
        }
        return Alert_1.error("Expected " + want + " got " + cToken.kind, cToken.lineNum);
    };
    Parser.prototype.emit = function (s) {
        this.log.push("Parsing " + s);
    };
    return Parser;
}());
exports.Parser = Parser;

},{"./Alert":1,"./SyntaxTree":4,"./Token":5}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SyntaxTree = /** @class */ (function () {
    function SyntaxTree(n) {
        this.root = n;
        this.current = this.root;
    }
    SyntaxTree.prototype.addBranchNode = function (n) {
        //Maybe refactor to construct a node here
        //Set the parent of new Node
        n.parent = this.current;
        //Add new node to current child list
        this.current.addChild(n);
        //Update current to new node
        this.current = n;
    };
    SyntaxTree.prototype.addLeafNode = function (n) {
        n.parent = this.current;
        this.current.addChild(n);
    };
    SyntaxTree.prototype.moveCurrentUp = function () {
        //If it has a parent move it up
        if (this.current.parent) {
            this.current = this.current.parent;
        }
    };
    SyntaxTree.prototype.toString = function () {
        var result = "";
        function expand(node, depth) {
            //Add indentation
            for (var i = 0; i < depth; i++) {
                result += "-";
            }
            if (node.children.length === 0) {
                result += "[" + node.name + "]";
                result += "\n";
            }
            else {
                result += "<" + node.name + ">\n";
                for (var i = 0; i < node.children.length; i++) {
                    expand(node.children[i], depth + 1);
                }
            }
        }
        expand(this.root, 0);
        return result;
    };
    return SyntaxTree;
}());
exports.SyntaxTree = SyntaxTree;
var Node = /** @class */ (function () {
    function Node(n) {
        this.name = n;
        this.parent = null;
        this.children = [];
    }
    Node.prototype.addChild = function (n) {
        this.children.push(n);
    };
    return Node;
}());
exports.Node = Node;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token = /** @class */ (function () {
    function Token(kind, value, lineNum) {
        this.kind = kind;
        this.value = value;
        this.lineNum = lineNum;
    }
    return Token;
}());
exports.Token = Token;
//Master list of available token types
var TokenType;
(function (TokenType) {
    TokenType["EOP"] = "EOP";
    TokenType["While"] = "While";
    TokenType["If"] = "If";
    TokenType["Print"] = "Print";
    TokenType["VarType"] = "VarType";
    TokenType["BoolLiteral"] = "BoolLiteral";
    TokenType["Id"] = "Id";
    TokenType["Char"] = "Char";
    TokenType["Digit"] = "Digit";
    TokenType["LParen"] = "LParen";
    TokenType["RParen"] = "RParen";
    TokenType["Quote"] = "Quote";
    TokenType["LBracket"] = "LBracket";
    TokenType["RBracket"] = "RBracket";
    TokenType["Assign"] = "Assign";
    TokenType["BoolOp"] = "BoolOp";
    TokenType["IntOp"] = "IntOp";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
//Used  to calculate starting colNum of a token
//Not used right now, leaving just in case
exports.TokenGlyphs = {
    "EOP": "$",
    "While": "while",
    "If": "if",
    "Print": "print",
    "Id": ""
};
exports.TokenRegex = {
    //Break on characters -> digits -> "any/*text*/" -> /*comments*/ -> symbols and new lines
    Split: new RegExp(/([a-z]+)|([0-9])|("[^"]*")|(\/\*.*\*\/)|(==|!=|=|\$|{|}|\(|\)|\+|\s)/g),
    WhiteSpace: new RegExp(/^(\s)$/g),
    //types, while, print, id (for assignment), block start,
    Statement: new RegExp(/(int|boolean|string|[a-z]|{|if|while)/g),
    //Match any keyword first, then valid ids after
    Keywords: new RegExp(/(int|boolean|string|while|print|if|true|false|[a-z])/g),
    Comment: new RegExp(/^\/\*.*\*\/$/),
    EOP: new RegExp(/(^|\s)[$]($|\s)/),
    While: new RegExp(/(^|\s)while($|\s)/),
    If: new RegExp(/(^|\s)if($|\s)/),
    Print: new RegExp(/(^|\s)print($|\s)/),
    VarType: new RegExp(/(^|\s)(int|boolean|string)($|\s)/g),
    BoolLiteral: new RegExp(/(^|\s)(true|false)($|\s)/),
    Id: new RegExp(/^[a-z]$/),
    Quote: new RegExp(/(".*)/g),
    Char: new RegExp(/[a-z]/),
    Digit: new RegExp(/[0-9]/),
    LParen: new RegExp(/(\()/),
    RParen: new RegExp(/(\))/),
    LBracket: new RegExp(/({)/),
    RBracket: new RegExp(/(})/),
    Assign: new RegExp(/^(=)$/),
    BoolOp: new RegExp(/(==)|(!=)/),
    IntOp: new RegExp(/(\+)/)
};

},{}],6:[function(require,module,exports){
const programs = [
{
    "name": "Example",
    "source": 
`/*Full Grammar*/
{
    int x
    x =0
    int y
    y= 6 

    while(x != y) {
        print(x)
        x = 1 + x
        if(x == 3) {
            print("fizz")
        }
        if (x==5) {
            print("buzz")
        }

    }
}$
`,
    "type":null
},
{
    "name": "EOP Warning",
    "source":
`/*Missing EOP Warning*/
{
    int x
}
`,
    "type": "warning"
},
{
    "name": "Invalid Token",
    "source": 
`/*Invalid Token Error*/
{
    int y
    y = 3
    print(y * 2)
} $
`,
    "type": "error"
},
{
    "name":"Multiple Programs",
    "source":
`/*Multiple Programs*/
{
    int x
} $ {
    int y
} $
`,
    "type": null
},
{
    "name":"Lex Edge Cases",
    "source":
`/*Lex Edge Cases*/
"a /*b*/ c"
"int x"
int intel
intintel
"ab
`,
    "type": "warning"
},
{
    "name": "Many Lex Examples",
    "source":
`
/*Should pass the lexer with no warnings or errors*/
{1=2}$
{}$
{{{}}}$
{{{}}$
{print("")}$
{print(a)}$
{print(2)}$
{print("a")}$
{print(false)}$
{print("inta")}$
print(a){print(a)}$
{a=1}$
{a = 1}$
{a = 1 + 2 + 3 + 4    +   5}$
{
    int a
    a=a
    string b
    a=b
}$
{int a a=a string b a=b}$
{{a=1+2+3+4+5{print(4+a)}}}$
{
    /*comment*/
    string b
}$
{
    string s
    s="this string is /* in */ visible"
}$


`,
    "type": "null"

},
{
    "name": "Ugly code will Lex",
    "source":
`{intii=0stringss="hello"booleanbb=(true==(1!=2))if(b==true){while(true!=(b!=(false==(2!=3)))){i=1+iprint(s)}}print("ugly code")}$`,
    "type": "null"
},

{
    "name":"Fast Inverse Square Root",
    "source":
`/*Fast Inverse Square Root*/
float Q_rsqrt( float number )
{
	long i;
	float x2, y;
	const float threehalfs = 1.5F;

	x2 = number * 0.5F;
	y  = number;
	i  = * ( long * ) &y;                       // evil floating point bit level hacking
	i  = 0x5f3759df - ( i >> 1 );               // what the f***? 
	y  = * ( float * ) &i;
	y  = y * ( threehalfs - ( x2 * y * y ) );   // 1st iteration
//	y  = y * ( threehalfs - ( x2 * y * y ) );   // 2nd iteration, this can be removed

    return y;
`,
    "type":"error"
}
];
module.exports = {
    programs: programs
}

},{}],7:[function(require,module,exports){
var example  = require('./examples');
const programs = example.programs;
const LexerModule = require('../dist/Lexer.js');
const ParserModule = require('../dist/Parser.js');
var editor;
window.onload = function() {
    setupAceEditor();
    setupMemoryGauge();
    setupProgramList();

    //Compile Code
    window.compileCode = this.compileCode;
}
compileCode = function() {
    //Don't run if editor is empty
    if(editor.getValue().trim() == ""){
        return;
    } 
    clearTabsAndErrors();

    //Lexer
    $("#log-text").html("Starting Lexer...\n");
    //Safe way to track time, supported on newer browsers
    let start =  window.performance.now();

    const lexer = new LexerModule.Lexer();
    //result :: {t:Token[], e:{lvl:string, msg:string} | null} | null
    let result = lexer.lex(editor.getValue());
    let time = window.performance.now()-start;

    const tokens = result.t;
    //Append messages for whatever tokens are available
    for(var i = 0; i < tokens.length; i++) {
        let text = "[LEXER] => "+tokens[i].kind+" ["+tokens[i].value+"] on line: "+tokens[i].lineNum+"\n";
        tabOutput("lexer",text);
        if(tokens[i].kind == "EOP") {
            $("#lexer-text").append("\n");
        }
    }

    let lexFailed = false;
    //If there was an error report it and color it based on level
    if (result.e) {
        if(result.e.lvl === "error"){
            lexFailed = true;
        }
        let errorMsg = errorSpan("LEXER", result.e); 
        
        logError("lexer", errorMsg);
        $("#tab-head-two").addClass(statusColor(result.e.lvl));
    } else {
        applyFilter($("#compile-img"), 'default');
    }

    logOutput("lexer", "[LEXER] => Completed in: "+time.toFixed(2)+" ms\n");

    //Bail out if Lex had any errors
    if(lexFailed) {
        editor.focus();
        return;
    }

    //Parser
    $("#log-text").append("\nStarting Parser...\n");
    //Safe way to track time, supported on newer browsers
    start =  window.performance.now();

    const parser = new ParserModule.Parser(tokens);
    //result :: {log: string[], cst:SyntaxTree | undefined,  e:{lvl:string, msg:string} | null} 
    result = parser.parse();
    let log = result.log;
    for(var i =0; i < log.length; i++) {
        let text = "[PARSER] => "+log[i]+"\n";
        tabOutput("parser",text);
    }
    let parseFailed = false;
    let err = result.e;
    if(err) {
        parseFailed = true;
        let errorMsg = errorSpan("PARSER", err);
        
        logError("parser", errorMsg);
        $("#tab-head-three").addClass(statusColor(err.lvl));
    } else {
        applyFilter($("#compile-img"), 'default');
    }
    let cst = result.cst;
    if(cst) {
        let lines = cst.toString().split("\n");
        console.log(lines);
        tabOutput("parser", "\n[PARSER] => Concrete Syntax Tree\n");
        for(let i = 0; i < lines.length-1; i++) {
            tabOutput("parser", "[PARSER] => " + lines[i]+"\n");
        }

    }


    time = window.performance.now()-start;

    logOutput("parser", "[PARSER] => Completed in: "+time.toFixed(2)+" ms\n");
    //Go back to editor when complete
    editor.focus();
}

/*
Working program, blue or green?
const greenFilter = "hue-rotate(220deg)";
const blueFilter = "hue-rotate(310deg)";
*/
const filters = {
    "warning": "hue-rotate(110deg)",
    "error": "hue-rotate(78deg)",
    "neutral": "hue-rotate(220deg)",
    "default": "hue-rotate(0deg)"
}
applyFilter = function(element, color) {
    $(element).css("filter", randomFilter()).delay(750).queue(function(next) {
            $(this).css("filter", filters[color]);
            next();
    });
}
applyRandomFilter = function(element) {
    $(element).css("filter", randomFilter());
}
randomFilter = function() {
    return "hue-rotate("+(160+Math.floor(Math.random()*200))+"deg)";
}
//component: compiler step that has failed
//err: {lvl: string, msg: string}
// lvl: "warning" | "error"
errorSpan = function(component, err) {
    applyFilter($("#compile-img"), err.lvl);
    return $("<span></span>").append("["+component+"] => "+err.lvl+": "+err.msg+"\n")
            .addClass(statusColor(err.lvl));
}
tabOutput = function (target, text) {
    let element = "#"+target+"-text";
    $(element).append($("<span></span>").text(text));
}
logOutput = function (target, text) {
    let element = "#"+target+"-text";
    $(element).append(text);
    $("#log-text").append(text);
}
logError = function (target, obj) {
    let element = "#"+target+"-text";
    $(element).append(obj);
    $("#log-text").append(obj.clone());
}
statusColor = function (type) {
    return 'compile-'+type;
}
clearTabsAndErrors = function(){
    //Lexer
    $("#lexer-text").html("");
    $("#tab-head-two").removeClass( function(index, className) {
        return (className.match(/(compile-error|compile-warning)/g)||[]).join(' ');
    });
    //Parser
    $("#parser-text").html("");
    $("#tab-head-three").removeClass( function(index, className) {
        return (className.match(/(compile-error|compile-warning)/g)||[]).join(' ');
    });
}

loadProgram = function(index) {
    editor.setValue(""+programs[index].source,1);
}

setupAceEditor = function() {
    //Setup Ace editor
    editor = ace.edit("editor");
    editor.setFontSize(16);
    editor.setTheme("ace/theme/dracula");
    editor.getSession().setMode("ace/mode/javascript");
    editor.getSession().setOptions({useSoftTabs: true});
    editor.getSession().setUseWorker(false);
    editor.setShowPrintMargin(false);
    editor.$blockScrolling = Infinity;
    //Vim Mode toggling
    editorMode = "default";
    window.toggleEditorMode = function (btn) {
        if (editorMode === "default") {
            editor.setKeyboardHandler("ace/keyboard/vim");
            editorMode = "vim";
            $("#mode-toggle-button").text("Editor Mode: Vim");
        } else {
            editor.setKeyboardHandler("");
            editorMode = "default";
            $("#mode-toggle-button").text("Editor Mode: Default");
        }
        editor.focus();
    }
}
setupMemoryGauge = function () {
    //Setup Memory gauge for machine code
    var gauge = new JustGage({
        id: "memory-gauge",
        value: getRandomInt(0, 256), //test
        min: 0,
        max: 256, //Replace with real max byte
        height:160,
        width:180,
        gaugeColor: "#44475a",
        levelColors: ["#bd93f9", "#ff5555"],
        title:"Bytes used",
        titleFontColor: "#f8f8f2",
        titleFontFamily: 'monospace',
        valueFontColor: "#f8f8f2",
        valueFontFamily: 'monospace'
    });
    //Just for testing gauge
    setInterval(function() { gauge.refresh(getRandomInt(0,256))}, 2000);

}
setupProgramList = function() {
    //Setup clickable Example Program List
    programs.forEach(element => {
        let item = $("<span class='dropdown-item'></span")
            .html(element.name)
            .css("cursor", "pointer")
            .on('click', function() {editor.setValue(""+element.source, 1)});
        if(element.type != null) {
            item.addClass(statusColor(element.type))
        }
        $(".dropdown-menu").append(item);
    });

}

},{"../dist/Lexer.js":2,"../dist/Parser.js":3,"./examples":6}]},{},[7]);
