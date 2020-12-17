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
	    this.audio_feeds = JSON.parse(document.getElementById("podcast-audio").text);
	    
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

		this.showResults(results);
	    }
	}

	showResults(results) {

	    while(this.results_list_el.firstChild) {
		this.results_list_el.firstChild.remove();
	    }

	    this.results_el.style.visibility = "visible";

	    results.map((result) => {

		//console.log(result);
		const clone = this.rtmplt.content.cloneNode(true);
		const hdr = clone.querySelector(".result-header");
		hdr.innerText = `Captions: #${result.seq}\nTimecodes: ${result.start.hmsString()} - ${result.end.hmsString()}`;

		const msg = clone.querySelector(".result-message");
		msg.innerText = result.message;

		const audio = clone.querySelector(".result-audio");
		audio.src = this.audio_feeds[this.transcript_el.options[this.transcript_el.selectedIndex].value];
		audio.currentTime=result.start.seconds;
		
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

	const srt = await response.text();

	const [text, entries] = parseFromText(srt);
	if(entries == null) {
	    console.error("Failed to parse the SRT.", text.slice(100));
	    return null;
	}

	const results = searchSimple(text, entries, q);
	
	return results;
    }
    
    function init() {
	const app = new App();
	console.debug(app);
    }
    
    window.onload = init;
    
})();
