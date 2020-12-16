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

const wordre = /[\s\n\t\r]+/;

class Parser {
    constructor(lines) {
	this.lines = lines;
	this.i = 0;
	this.curr = null;
	this.text = "";
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

	let t = entry.message.trim().toLowerCase().split(wordre).filter((w) => w !== "").join(" ");
	entry.i = this.text.length + 1;
	entry.c = entry.i + t.length;
	this.text += ` ${t}`;
	this.entries.push(entry);
    }
}

export function searchSimple(text, entries, query) {

    const q = query.toLowerCase().split(wordre).filter((w) => w !== "").join(" ");

    return doSearchSimple(0, text, entries, q, 3);
}

function doSearchSimple(idx, text, entries, q, context) {

    // Search the text for the query.
    idx = text.indexOf(q, idx);
    if(idx == -1) {
	return [];
    }

    // Find the entry associated with the beginning of the query.
    const results = [];
    let i = entries.findIndex((entry) => entry.i < idx && idx < entry.c);
    if(i == -1) {
	return [];
    }
    let entry = entries[i];

    // Add the pre-context to the result set
    results.push(...entries.slice(Math.max(0, i-context), i));
    
    // Load all the remaining entries that constitute a match.
    while(entry.i < idx + q.length) {
	results.push(entry);
	i++;
	entry = entries[i];
	if(!entry) {
	    return [];
	}
    }

    // Add the post-context to the result set
    results.push(...entries.slice(i, Math.min(i+context, entries.length-1)));

    // Recurse, ignoring the portion of the text that has already matched.
    return [results, ...doSearchSimple(idx + q.length, text, entries.slice(i), q, context)];
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

    return [p.text, p.entries];
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






