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

  var fixtures = `
    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
    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
    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
    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
    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
    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
    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
    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
    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
    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
    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
    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
    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
    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
    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
    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
    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
    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
    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
    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
  `;
  fixtures
    .trim()
    .split(/\n/)
    .forEach(function (token) {
      token = token.trim();
      if (!b62Token.verify(token)) {
        throw new Error(
          `Failed to verify actual, real-world GitHub token: ${token}`
        );
      }
    });
  console.info("PASS: verified 20 actual, real-world GitHub tokens");

  var longPrefix = "MoreThanFour_51PEHKkZR5PsBlXhMnRztYvUcl5km24cVLUu";

  if(!b62Token.verify(longPrefix)) {
    throw new Error("Valid token with long prefix should verify");
  }
  console.info("PASS: verified token with prefix greater than four characters");

  console.info("");
  console.info("All tests pass.");
  console.info("");
})("undefined" === typeof module ? window : module.exports);
