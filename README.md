TSearchEd
=========

Search SubRip formatted transcripts for text matches.

This is part of the Podcasting 2.0 project.

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

Future:

- Match across srt entries.
- Provide context for matches.
- Stream the srt data rather than reading then processing.
- Add context before and after the match.

Installation
------------

Package Layout
--------------

 - *./index.js* NodeJS entrypoint for CLI applications.
 - *./test.js* Launch the test suite from the CLI.
 - */js/* ES6 Modules
 - */test/* Utilities and module for running tests.

Building
--------

Contribute
----------

Support
-------

License
-------

See LICENSE.

--
Created: Jun 18, 2019
By: Christian Saunders <cps@kilobit.ca>
Copyright 2019 Kilobit Labs Inc.
