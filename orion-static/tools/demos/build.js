/* Builds every demo site. Run: node tools/demos/build.js */
const chess = require("./chess.js");
const barbers = require("./barbers.js");
const saltmarsh = require("./saltmarsh.js");
let n = 0;
console.log("demos:");
n += chess();
n += barbers();
n += saltmarsh();
console.log("\n" + n + " demo pages generated");
