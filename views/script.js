var example  = require('./examples');
const programs = example.programs;
const LexerModule = require('../dist/Lexer.js');
const ParserModule = require('../dist/Parser.js');
const SemanticAnalysisModule = require('../dist/SemanticAnalyzer.js');
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
    
    //Pre group programs by EOP ($)
    var pgms = preGroup(editor.getValue());

    //Lexer
    $("#log-text").html("Starting Lexer...\n");
    //Safe way to track time, supported on newer browsers
    let start =  window.performance.now();

    let lexedPgms = lexPgms(pgms);
    //lexedPrograms :: [{t:Token[], e:{lvl:string, msg:string} | null} | null]
    for(let i = 0; i < lexedPgms.length; i++) {
        //Program number text
        $("#lexer-text").append("<i>Program "+(i+1)+"\n</i>");
        //Check for errors
        let result = lexedPgms[i];
        if (result.t){
            let tokens = result.t;
            for(let k = 0; k < tokens.length; k++) {
                let text = "[LEXER] => "+tokens[k].kind+" ["+tokens[k].value+
                           "] on line: "+tokens[k].lineNum+"\n";
                tabOutput("lexer",text);
            }
        }
        if(result.e) {
            let errorMsg = errorSpan("LEXER", result.e);
            logError('lexer', errorMsg);
            $("#tab-head-two").addClass(statusColor(result.e.lvl));
        } 
        $("#lexer-text").append("\n");
    }
   
    
 
    let time = window.performance.now()-start;
    logOutput("lexer", "[LEXER] => Completed in: "+time.toFixed(2)+" ms\n");

    //Parser
    $("#log-text").append("\nStarting Parser...\n");
    //Safe way to track time, supported on newer browsers
    start =  window.performance.now();
    let parsedPgms = []
    for(let i = 0; i < lexedPgms.length; i++) {
        $('#parser-text').append("<i>Parsing Program "+(i+1)+"\n</i>");
        if(lexedPgms[i].e && lexedPgms[i].e.lvl == 'error') {
            $('#parser-text').append("<i>Skipping Program "+(i+1)+" with lexical error <br/></i>");
            $('#parser-text').append("<br/>");
            parsedPgms.push("lexical");
            continue;
        }

        let parser = new ParserModule.Parser(lexedPgms[i].t);
        //result :: {log: string[], cst:SyntaxTree | undefined, ast: SyntaxTree | undefined
        //           st:[Symbol]|undefined, e:{lvl:string, msg:string} | null} 
        result = parser.parse();
        let log = result.log;
        for(let i =0; i < log.length; i++) {
            let text = "[PARSER] => "+log[i]+"\n";
            tabOutput("parser",text);
        }
        let err = result.e;
        if(err) {
            let errorMsg = errorSpan("PARSER", err);
            
            logError("parser", errorMsg);
            $("#tab-head-three").addClass(statusColor(err.lvl));
            parsedPgms.push("parse");
            continue;
        } else {
            applyFilter($("#compile-img"), 'default');
            parsedPgms.push(result)
        }
        let st = result.st;
        if(st) {
            tabOutput("parser", "\n[PARSER] => Symbol Table\n");
            for(let i = 0; i < st.length; i++){
                tabOutput("parser", "[PARSER] => "+st[i].toString()+"\n");
            }
        }
        let cst = result.cst;
        if(cst) {
            let lines = cst.toString().split("\n");
            tabOutput("parser", "\n[PARSER] => Concrete Syntax Tree\n");
            for(let i = 0; i < lines.length-1; i++) {
                tabOutput("parser", "[PARSER] => " + lines[i].toString()+"\n");
            }
        }
        tabOutput("parser", "\n");

    }
    time = window.performance.now()-start;

    logOutput("parser", "[PARSER] => Completed in: "+time.toFixed(2)+" ms\n");

    //Semantic Analysis
    let analysedPgms = [];
    console.log(parsedPgms);
    $("#log-text").append("\nStarting Semantic Analysis...\n");
    start = window.performance.now();
    for(let currPgm = 0; currPgm < parsedPgms.length; currPgm++) {
        $('#semantic-text').append("<i>Analyzing Program "+(currPgm+1)+"\n</i>");
        if(parsedPgms[currPgm] == "parse" || parsedPgms[currPgm] == "lexical") {
            $('#semantic-text').append("<i>Skipping Program "+(currPgm+1)+
                " with "+parsedPgms[currPgm]+" error <br/></i>");
            $("#semantic-text").append("</br>");
            analysedPgms.push(parsedPgms[currPgm]);
            continue;
        }
        let semanticAnalyzer = new SemanticAnalysisModule.SemanticAnalyzer(parsedPgms[currPgm].ast);
        //result :: {ast:SyntaxTree, st: SymbolTree, log: string[], warnings: Alert[], error: Alert|undefined}
        result = semanticAnalyzer.analyze();
        let log = result.log;
        for(let i = 0; i < log.length; i++) {
            let text = "[SEMANTIC] => "+log[i]+"\n";
            tabOutput("semantic", text);
        }
        let err = result.error;
        if(err) {
            let errorMsg = errorSpan("LEXER", err);
            logError("semantic", errorMsg);
            $("#tab-head-four").addClass(statusColor(err.lvl));
            analysedPgms.push("semantic");
            continue;
        } else {
            applyFilter($("#compile-img"), 'default');
            analysedPgms.push(result);
        }
        let ast = result.ast;
        if(ast) {
            let lines = ast.toString().split("\n");
            tabOutput("semantic", "\n[SEMANTIC] => Abstract Syntax Tree\n");
            for(let i = 0; i < lines.length-1; i++){
                tabOutput("semantic", "[SEMANTIC] => "+lines[i].toString()+"\n");
            }
        }
        let st = result.st;
        if(st) {
            let lines = st.toString().split("\n");
            tabOutput("semantic", "\n[SEMANTIC] => Symbol Tree\n");
            for(let i =0; i < lines.length-1; i++) {
                tabOutput("semantic", "[SEMANTIC] => "+lines[i].toString()+"\n");
            }
        }
        let warnings = result.warnings; 
        if(warnings.length > 0) {
            for(let i = 0; i < warnings.length; i ++) {
                let warningMsg = errorSpan("SEMANTIC", warnings[i]);
                logError("semantic", warningMsg);
            }
            //Just add color to tab head one time
            $("#tab-head-four").addClass(statusColor(warnings[0].lvl));
        }
        tabOutput("semantic", "\n");
    }
    time = window.performance.now()-start;
    logOutput("semantic", "[SEMANTIC] => Completed in: "+time.toFixed(2)+" ms\n");
    //Go back to editor when complete
    editor.focus();
}

//Split on $ glyph to separate multiple programs into list
preGroup = function(source) {
    source = source.trim();
    let result = [];
    let current = "";
    let inQuotes = false;
    for(let i = 0; i < source.length; i++) {
        current += source[i];
        if(source[i] == '"') {
            inQuotes = !inQuotes;
        }
        if(!inQuotes && source[i] == "$") {
            result.push(current);
            current = "";
        } else if(i == source.length -1){
            result.push(current);
        }
    }
    
    console.log(result);
    return result;
}

lexPgms = function(pgms) {
    let lexer = new LexerModule.Lexer();
    let result = [];
    //Lex each program
    for (let i = 0; i < pgms.length; i++) {
        result.push(lexer.lex(pgms[i]));
    }

    return result; 
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
    applyFilter($("#compile-img"), 'default');
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
    //Semantic
    $("#semantic-text").html("");
    $("#tab-head-four").removeClass(function(index, className) {
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
