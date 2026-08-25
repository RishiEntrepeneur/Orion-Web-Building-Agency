/* Builds every demo site. Run: node tools/demos/build.js */
const barbers = require("./barbers.js");
const saltmarsh = require("./saltmarsh.js");
let n = 0;
console.log("demos:");
n += barbers();
n += saltmarsh();
console.log("\n" + n + " demo pages generated");
