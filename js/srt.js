// srt.js

export function hello() {
    console.log("Hello World!");
    console.log("srt.js is loaded.");
}

class Parser {
    constructor(lines) {
	this.lines = lines;
	this.i = 0;
	this.curr = null;
	this.entries = [];
	this.err = null;
    }

    line() {
	return this.lines[this.i];
    }

    peek() {
	return this.i + 1 < this.lines.length ? this.lines[this.i + 1] : null;
    }
    
    next() {
	return ++this.i < this.lines.length ? this.lines[this.i] : null;
    }

    addEntry(entry) {
	this.entries.push(entry);
    }
}

export function parseFromText(text) {

    let p = new Parser(text.split("\n"));
    let parseFunc = parseTop;

    while(true) {

	parseFunc = parseFunc(p);
	if(parseFunc == null) {
	    break;
	}
    }

    return p.entries;
}

function parseTop(p) {

    if(typeof(p.line()) === "undefined") {
	return null;
    }
    
    let line = p.line().trim();
    while(line == "") {
	line = p.next();
    }

    return parseEntry;
}

function parseEntry(p) {
    p.curr = {};
    return parseSeq;
}

function parseSeq(p) {
    p.curr["seq"] = p.line();

    let parseFunc = parseTimecode;
    let line = p.next();
    if(line == null) {
	parseFunc = null;
    }
    
    return parseFunc;
}

function parseTimecode(p) {
    p.curr["timecode"] = p.line();

    let parseFunc = parseMessage;
    let line = p.next();
    if(line == null) {
	parseFunc = null;
    }
    
    return parseFunc;
}

function parseMessage(p) {

    let msg = p.line();
    let line = p.next();
    while(line != "" && line != null) {
	msg += line;
	line = p.next();
    }

    p.curr["message"] = msg;
    p.addEntry(p.curr);
    p.curr = null;

    let parseFunc = parseTop;
    if(line == null) {
	parseFunc = null;
    }
    
    return parseFunc;
}






