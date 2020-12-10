// srt.js

class TOffset {
    constructor(hours, minutes, seconds, millis) {
	this.millis =
	    hours * 36000000 +
	    minutes * 60000 +
	    seconds * 1000 +
	    millis;
    }

    get [Symbol.toStringTag]() {
	return "" + this.millis / 1000;
    }

    hmsString() {
	const d = new Date(this.millis);

	return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`;
    }
}

const toffre = /(?<hours>\d\d):(?<minutes>\d\d):(?<seconds>\d\d)\,(?<millis>\d+)/;
function parseTOffsetFromString(str) {

    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    let millis = 0;
    
    let match = str.match(toffre);
    if(match == null) {
	return null;
    }

    hours = parseInt(match.groups.hours, 10);
    minutes = parseInt(match.groups.minutes, 10);
    seconds = parseInt(match.groups.seconds, 10);
    millis = parseInt(match.groups.millis, 10);

    return new TOffset(hours, minutes, seconds, millis);
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

export function searchSimple(entries, query) {

    const q = query.toLowerCase();
    
    return entries.filter((entry) => entry.message.toLowerCase().includes(q));
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

const tcre = /(?<start>\S+)\s*-->\s*(?<end>\S+)/
function parseTimecode(p) {

    let start = "";
    let end = "";
    
    let matches = p.line().match(tcre);
    if(matches != null) {
	start = parseTOffsetFromString(matches.groups.start);
	end = parseTOffsetFromString(matches.groups.end);
    }
    
    p.curr["timecode"] = {start: start, end: end};

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
	msg += "\n" + line;
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






