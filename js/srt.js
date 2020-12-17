// srt.js

class TOffset {
    constructor(hours, minutes, seconds, millis) {
	this.millis =
	    hours * 3600000 +
	    minutes * 60000 +
	    seconds * 1000 +
	    millis;
    }

    get [Symbol.toStringTag]() {
	return "" + this.millis / 1000;
    }

    get hours() {
	return Math.floor(this.millis / 3600000);
    }

    get minutes() {
	return Math.floor(this.millis / 60000);
    }
    
    get seconds() {
	return Math.floor(this.millis / 1000);
    }

    hmsString() {
	
	let m = String(this.minutes % 60).padStart(2, '0');
	let s = String(this.seconds % 60).padStart(2, '0');
	
	return `${this.hours}:${m}:${s}`;
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

function searchText(text, query) {

    const q = query.toLowerCase().split(wordre).filter((w) => w !== "").join(" ");
    
    let i = 0;
    const matches = [];
    while(true) {
	i = text.indexOf(q, i+q.length);
	if(i == -1) {
	    break;
	}
	matches.push(i);
    }

    return matches;
}

function searchEntries(i, entries) {
    
    return entries.findIndex((entry) => entry.i <= i && i < entry.c);    
}

export function searchSimple(text, entries, query) {

    const ctx = 2; // FIXME: hard coded context value.
    const text_matches = searchText(text, query);
    let entry_matches = text_matches.map((i) => searchEntries(i, entries));
    entry_matches = entry_matches.filter((v, i, self) => self.indexOf(v) === i); // unique the results.

    return entry_matches.map((i) => {
	const matched_entries = entries.slice(Math.max(0, i-ctx), i + ctx);

	return {
	    seq: matched_entries.map((entry) => entry.seq).join(", "),
	    start: matched_entries[0].timecode.start,
	    end: matched_entries[matched_entries.length - 1].timecode.end,
	    message: matched_entries.map((entry) => entry.message).join("\n"),
	}
    });
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






