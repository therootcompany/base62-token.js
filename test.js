(function (exports) {
  "use strict";

  var Base62Token = exports.Base62Token || require("./base62-token.js");
  var dict = Base62Token.generateDictionary();
  console.info("");
  console.info("Secure Dictionary:", dict);
  console.info("Entropy in 30 chars:", Base62Token.calcMinBits(30));
  console.info(
    "Characters needed for 173-bits of entropy:",
    Base62Token.calcMinChars(173)
  );
  console.info("");

  var b62Token = Base62Token.create(dict);

  var token = b62Token.generate("b62_", 30);
  var verified = b62Token.verify(token);
  var verified2 = Base62Token.verify(dict, token);

  if (40 !== token.length) {
    throw new Error(
      "Token length should be 40 characters, got " + token.length
    );
  }
  if (!verified) {
    throw new Error("Token should self-verify");
  }
  if (!verified2) {
    throw new Error("Token should verify with same dictionary");
  }
  console.info("PASS: generated 40-charecter token that passes verification");

  var dict2 = dict.slice(0, -2) + dict.slice(-2).split("").reverse();
  if (Base62Token.verify(dict2, token)) {
    throw new Error("Token should NOT verify with different dictionary");
  }
  var token2 =
    token.slice(0, -4) +
    Base62Token._shuffle(token.slice(-6).split("")).join("");

  if (b62Token.verify(token2)) {
    throw new Error("Bad checksum should not verify");
  }
  console.info("PASS: invalid tokens and/or dictionaries fail verification");

  console.info("");
  console.info("All tests pass.");
  console.info("");
})("undefined" === typeof module ? window : module.exports);
