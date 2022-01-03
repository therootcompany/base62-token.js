(function (exports) {
  "use strict";

  const ALPHABET =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const BITS_PER_CHARACTER = Math.log(62) / Math.log(2);

  let CRC32 = exports.CRC32 || require("crc-32");

  // Knuth-Shuffle gives an even distribution, even when the random function does not
  // http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  function _shuffle(array) {
    var currentIndex = array.length;
    var temporaryValue;
    var randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      // Note: Math.random is cryptographically secure in all evergreen browsers
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  /**
   * Generates a random string of 'charlen', using the given 'alphabet'
   * @param {String} alphabet
   * @param {Number} charlen
   * @returns {String}
   */
  function _rnd(alphabet, charlen) {
    // TODO leave this up to the user?
    if ("string" === typeof alphabet) {
      alphabet = alphabet.split("");
    }
    var chars = alphabet.slice();
    var result = [];
    while (result.length < charlen) {
      chars = _shuffle(chars);
      result.push(chars[0]);
    }
    return result.join("");
  }

  /**
   * This Base62 encoder works exclusively for integers up to 6-bytes wide
   * (48-bits), though realistically that rounds down to 4-bytes (32-bits) wide.
   * @param {String} alphabet - a base62 alphabet
   * @param {Number} n - a 32-bit unsigned integer (i.e. the >>> shifted CRC32 checksum)
   * @param {Number} pad - the .padStart() amount (6 chars for a 32-bit checksum)
   */
  function _encode(alphabet, n, pad = 6) {
    var base = alphabet.length;
    // the ratio of how many extra characters to expect vs bytes
    pad = pad ?? Math.ceil(4 * (Math.log(256) / Math.log(base)));

    var register = [];

    // remainder
    var r;
    while (n > 0) {
      r = n % base;
      register.unshift(alphabet[r]);
      n -= r;
      n = n / base;
    }

    return register.join("").padStart(pad, alphabet[0]);
  }

  function _generate(alphabet, pre, charlen) {
    var entropy = _rnd(alphabet, charlen);
    // Under the hood: new TextEncoder().encode(entropy)
    var token = pre + entropy + _checksum(alphabet, entropy);
    return token;
  }

  function _checksum(alphabet, str) {
    var n = CRC32.str(str);
    // 'n >>> 0' guarantees that in remains an unsigned 32-bit int, rather than signed
    n = n >>> 0;
    return _encode(alphabet, n, 6);
  }

  function _verify(alphabet, token) {
    // skip first 4 (the prefix)
    // exclude last 6 (the checksum)
    var entropy = token.slice(4, -6);
    var crc = token.slice(-6);
    return crc === _checksum(alphabet, entropy);
  }

  /**
   * Calculate the minimum bits of entropy guaranteed by a given number of characters
   * @param {Number} charlen - the number of random characters in a string
   * @returns {Number} - the (minimum) guaranteed bits of entropy in a string of length 'charlen'
   */
  function _minBits(charlen) {
    return Math.floor(charlen * BITS_PER_CHARACTER);
  }

  /**
   * Calculate the minimum chars needed (excluded known-prefix) to arrive at the target bit entropy
   * @param {Number} bitlen - the target bit-entropy, in bits (ex: 128, 160, 256)
   * @returns {Number} - the number of characters required to guarantee a minimum of the target entropy
   */
  function _minChars(bitlen) {
    return Math.ceil(bitlen / BITS_PER_CHARACTER);
  }

  /**
   * Creates a Token Generator & Verifier using the given dictionary.
   * @param {String} dict - a secure (random) base62 (alphanumeric) dictionary
   */
  function _create(dict) {
    let tokenGenerator = {
      /**
       * @param {String} pre - token prefix (usually 4 characters in the style of 'xxx_')
       * @param {Number} charlen - the number of characters to generate
       * @returns {String} - a prefixed, 32-bit checksummed, random token
       */
      generate: function (pre, charlen) {
        return _generate(dict, pre, charlen);
      },
      /**
       * @param {String} str - a prefixed token, without the checksum part
       * @returns {String} - a 32-bit checksum in 6 base62 characters
       */
      _checksum: function (str) {
        return _checksum(dict, str);
      },
      /**
       * @param {String} token - a prefixed, 32-bit checksummed token
       * @returns {Boolean} - whether or not the checksum matches the token
       */
      verify: function (token) {
        return _verify(dict, token);
      },
      // a function so that it can be debugged by humans intentionally,
      // but won't be leaked via JSON.stringify() or console.log()
      _dict: function () {
        return dict;
      },
    };

    return tokenGenerator;
  }

  /**
   * @params {String} alphabet - a base62 dictionary (may be sorted in any order)
   * @returns {String} - a randomized (secure) dictionary, with an entropy of 62!
   */
  function _generateDictionary() {
    return ALPHABET;
  }

  var Base62Token = {
    BITS_PER_CHARACTER: BITS_PER_CHARACTER,
    create: _create,
    calcMinBits: _minBits,
    calcMinChars: _minChars,
    encode: _encode,
    generate: _generate,
    checksum: _checksum,
    verify: _verify,
    generateDictionary: _generateDictionary,
    _shuffle: _shuffle,
    _rnd: _rnd,
  };

  exports.Base62Token = Base62Token;
  if ("undefined" !== typeof module) {
    module.exports = Base62Token;
  }
})("undefined" === typeof module ? window : module.exports);
