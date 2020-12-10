// index.js
// © 2020 Kilobit Labs Inc.

import {argv, exit} from "process";
import * as fs from "fs/promises";
import * as srt from "./js/srt.js";

let q;
let fn = "/dev/stdin";
let of = "/dev/stdout";

switch(argv.length) {

case 3:
    q = argv[2];
    break;

case 4:
    q = argv[2];
    fn = argv[3];
    break;

case 5:
    q = argv[2];
    fn = argv[3];
    of = argv[4];
    break;
    
default:
    console.error("Usage: nodejs index.js QUERY [SRTFILE] [OUTFILE]");
    exit(1);
}

fs.readFile(fn, 'utf8').then((text) => {
    
    const entries = srt.parseFromText(text);
    const results = srt.searchSimple(entries, q);

    fs.writeFile(of, JSON.stringify(results, null, 2), 'utf8').catch((err) => {
	console.error(err);
	exit(1);
    });
    
}).catch((err) => {
    console.error(err);
    exit(1);
});
