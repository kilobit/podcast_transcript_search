// index.js
//

import * as srt from "./js/srt.js";

const text = `

1
00:02:17,440 --> 00:02:20,375
Senator, we're making
our final approach into Coruscant.

2
00:02:20,476 --> 00:02:22,501
Very good, Lieutenant.

`;

const foo = srt.parseFromText(text);
console.log(foo);

