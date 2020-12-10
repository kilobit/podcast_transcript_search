Podcast Transcript Search
=========================

Search SubRip formatted transcripts for text matches.

This has been produced in support of the Podcasting 2.0 project.

Status: Prototype

```
$ node index.js "" < testdata/sample1.srt

[
  {
    "seq": "2",
    "timecode": {
      "start": {
        "millis": 140476
      },
      "end": {
        "millis": 142501
      }
    },
    "message": "Very good, Lieutenant."
  }
]
```

```
curl -s 'https://mp3s.nashownotes.com/NA-1301-Captions.srt' | node ./index.js "dogs"

[
  {
    "seq": "1767",
    "timecode": {
      "start": {
        "millis": 39197850
      },
      "end": {
        "millis": 39200760
      }
    },
    "message": "animals allowed on planes will\nbe dogs specifically trained to"
  },
  {
    "seq": "1769",
    "timecode": {
      "start": {
        "millis": 39204120
      },
      "end": {
        "millis": 39209040
      }
    },
    "message": "pets including Yes, turkeys and\npeacocks. Dogs"
  },
  {
    "seq": "1778",
    "timecode": {
      "start": {
        "millis": 39249390
      },
      "end": {
        "millis": 39252150
      }
    },
    "message": "too bored first with their lying\ndogs."
  },
]

```

Features
--------

- Read srt data and perform a simple string match.
- Use from the CLI.
- Access via browser with a static www server.

Future:

- Match across srt entries.
- Provide context for matches.
- Stream the srt data rather than reading then processing.
- Add context before and after the match.
- Implement service to mitigate CORS.

Installation
------------

Package Layout
--------------

Coming Soon!

Building
--------

Run from NPM Coming Soon!

Contribute
----------

Submit pull requests through [github](https://github.com/kilobit/).

Support
-------

Submit tickets through [github](https://github.com/kilobit/).

License
-------

See LICENSE.

--
Created: Dec 9, 2019
By: Christian Saunders <cps@kilobit.ca>
Kilobit Labs Inc.
