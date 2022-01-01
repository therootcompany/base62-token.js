# base62-token.js

Generate &amp; Verify GitHub-style &amp; npm-style Secure Base62 Tokens

Works in Vanilla JS (Browsers), Node.js, and Webpack.

# Install

## Browser

```html
<script src="https://unpkg.com/crc-32"></script>
<script src="https://unpkg.com/base62-token"></script>
```

```js
var Base62Token = window.Base62Token;
```

## Node.js / Webpack

```bash
npm install --save base62-token
```

```js
var Base62Token = require("base62-token");
```

# Usage

## Pre-requisite: Generate & Save a Dictionary

If you intend to reap the additional security benefits of having a secure random
dictionary - meaning that you give yourself the ability to verify tokens
"offline" without also giving potential attackers the same capability - then you
should generate a random dictionary:

```js
var alphanum = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
var dict = Base62Token.generateDictionary(alphanum);
// ex: "vG1SB0JMrONaT7ChDfqtnxY4lHwQ8ILoFWRUgPk9mbzjX2Asy6iVEuKcdeZ35p"
```

Save this random dictionary to a non-public file or configuration (ex: `.env`)
and use it everywhere that you generate or verify tokens.

Note: there's nothing inherently "insecure" about making this dictionary public
_per se_, but doing so will give attackers the same advantage that you give
yourself - the ability to verify your tokens offline without being slowed down
by database calls or hitting any API rate limits, etc.

## Generating & Verifying Tokens

```js
var b62Token = Base62Token.create(dict);

var token = b62Token.generate("abc_", 30);

var verified = b62Token.verify(token);
```

# API

```txt
Base62Token                       // Shuffles a given alphabet to create a random
  .generateDictionary(            // dictionary (uses standard base62 / alphanumeric
    alphabet = "0..9A..Za..z"     // by default).
  );

Base62Token.create(dictionary);   // Creates a token generator and verifier
                                  // 'dictionary' is any 62-character alphabet.
                                  // Returns a generator / verifier (b62Token) instance.

b62Token.generate(prefix, length); // Returns token string.
b62Token.verify(token);            // Returns true / false.
```

```txt
Base62Token.BITS_PER_CHARACTER    // 5.954196310386876
                                  // For reference: Base64 is an even 6

Base62Token.calcMinChars(bitlen); // calculate the minimum number of chars needed to
                                  // guarantee the given bit entropy.
                                  // ex: 30 chars needed for 173-bits of entropy

Base62Token.calcMinChars(bitlen); // calculate the minimum number of chars needed to
                                  // guarantee the given bit entropy.
                                  // ex: 30 chars needed for 173-bits of entropy

Base62Token.checksum(dict, str);  // runs an (unsigned) CRC-32 checksum on the given string
                                  // (where each character is considered a single byte)
                                  // and returns the base62 encoded unsigned int

Base62Token.encode(dict, n, pad); // encodes a 32-bit integer (i.e. CRC-32 checksum)
                                  // as Base62 in the given dictionary, with a default
                                  // pad of 6 (guarantees a full 32-bits).
```

# Standard vs Secure Base62 Dictionaries

There are 3 widely-used, generic Base62 dictionaries, all of which are based on
the alphanumeric character set (i.e. 0-9, A-Z, a-z).

For general encoding and decoding (NOT tokens), you should use one of these:

- Lexographic (digits, upper, lower)
  ```txt
  0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz
  ```
- BaseX (digits, lower, upper)
  ```txt
  0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
  ```
- Truncated Base64 (upper, lower, digits)
  ```txt
  ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789
  ```

However, **for secure tokens** for which you don't want an attacker to have the
advantage of being able to verify a token offline (i.e. you want them to hit
your API rate limiting), you should use a randomized dictionary.

# Legal

For a business license and/or commercial support ($99/year), please contact
[Root](https://therootcompany.com/contact/).

Copyright 2022 [AJ ONeal](https://coolaj86.com) \
Copyright 2022 [Root](https://therootcompany.com)

MPL-2.0 (Open Source) | [Terms of Use](https://therootcompany.com/legal/#terms)
| [Privacy Policy](https://therootcompany.com/legal/#privacy)
