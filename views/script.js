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

    let programNumber = 0;
    let programTokensList = [[]];
    programTokensList.push([]);
    const tokens = result.t;
    $("#lexer-text").append("Program "+(programNumber+1)+"\n");
    //Append messages for whatever tokens are available
    for(var i = 0; i < tokens.length; i++) {
        let text = "[LEXER] => "+tokens[i].kind+" ["+tokens[i].value+"] on line: "+tokens[i].lineNum+"\n";
        tabOutput("lexer",text);
        programTokensList[programNumber].push(tokens[i]);
        if(tokens[i].kind == "EOP") {
            $("#lexer-text").append("\n");
            //If it's not the last token
            if(i != tokens.length-1){
                programTokensList.push([]);
                programNumber++;
                $("#lexer-text").append("Program "+(programNumber+1)+"\n");
            }
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
    for(let programNum = 0; programNum < programTokensList.length-1; programNum++) {
        tabOutput("parser", "Parsing Program "+(programNum+1)+"\n");

        let parser = new ParserModule.Parser(programTokensList[programNum]);
        //result :: {log: string[], cst:SyntaxTree | undefined,
        //           st:[Symbol]|undefined, e:{lvl:string, msg:string} | null} 
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
            break;
        } else {
            applyFilter($("#compile-img"), 'default');
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
