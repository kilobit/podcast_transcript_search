// main.js
// © 2020 Kilobit Labs Inc.

import {searchSimple, parseFromText} from "./srt.js";

(function() {

    class App {
	constructor() {

	    const app = this;
	    
	    this.query_el = document.getElementById("query");
	    this.transcript_el = document.getElementById("transcript");
	    this.transcript_override_el = document.getElementById("transcript-override");
	    this.transcript_url_el = document.getElementById("transcript-url");
	    this.search_button_el = document.getElementById("search");
	    this.results_el = document.getElementById("results");
	    this.results_list_el = document.getElementById("results-list");
	    this.rtmplt = document.getElementById("result-template");
	    
	    // Show / Hide the transcipt url field.
	    this.transcript_el.oninput = (evt) => {

		const el = evt.target;
		console.log(el.options[el.selectedIndex].value);

		app.transcript_override_el.style.display = el.options[el.selectedIndex].value === "-" ? "block" : "none";

	    };

	    // Do search
	    this.search_button_el.onclick = async (evt) => {

		let url = app.transcript_el.options[app.transcript_el.selectedIndex].value;
		if(url === "-") {
		    url = app.transcript_url_el.value;
		}
		
		const results = await doSearch(app.query_el.value, url);

		console.log(results);

		this.showResults(results);
	    }
	}

	showResults(results) {
	    // iterate over the result set
	    // stamp the template

	    this.results_el.style.visibility = "visible";

	    results.map((result) => {
		console.log(result);
		const clone = this.rtmplt.content.cloneNode(true);

		const hdr = clone.querySelector(".result-header");
		const start = result.timecode.start.hmsString();
		const end = result.timecode.end.hmsString();
		hdr.innerText = `Caption #${result.seq}: ${start} - ${end}`;

		const msg = clone.querySelector(".result-message");
		msg.innerText = result.message;
		
		this.results_list_el.appendChild(clone);

	    });
	}
	
    }

    async function doSearch(q, url) {

	const response = await fetch(url);

	if(response.type === "error") {
	    console.error(err);
	    return null;
	}

	if(!response.ok) {
	    console.error(response.status, response.statusText, response);
	    return null;
	}

	const text = await response.text();

	const entries = parseFromText(text);
	if(entries == null) {
	    console.error("Failed to parse the SRT.", text.slice(100));
	    return null;
	}

	const results = searchSimple(entries, q);
	
	return results;
    }
    
    function init() {
	const app = new App();
	console.debug(app);
    }
    
    window.onload = init;
    
})();
