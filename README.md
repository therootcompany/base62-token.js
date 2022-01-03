# [base62-token.js](https://github.com/therootcompany/base62-token.js)

Generate &amp; Verify [GitHub-style][gh-tokens] &amp; [npm-style][npm-tokens]
Base62 Tokens

[gh-tokens]:
  https://github.blog/2021-04-05-behind-githubs-new-authentication-token-formats/
[npm-tokens]:
  https://github.blog/2021-09-23-announcing-npms-new-access-token-format/

Works in Vanilla JS (Browsers), Node.js, and Webpack.

# [Online Demo](https://therootcompany.github.io/base62-token.js/)

See the online Base62 token generator & verifier in action:

- <https://therootcompany.github.io/base62-token.js/>

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

```js
var b62Token = Base62Token.create(dict);

var token = b62Token.generate("abc_", 30);

var verified = b62Token.verify(token);
```

# API

```txt
Base62Token.generateDictionary(); // Return the Lexographic (a.k.a. GMP)
                                  // Base62 dictionary.

Base62Token.create(dictionary);   // Creates a token generator and verifier
                                  // 'dictionary' is any 62-char alphabet.
                                  // Returns a generator / verifier instance.

b62Token.generate(prefix, length); // Returns token string.
b62Token.verify(token);            // Returns true / false.
```

```txt
Base62Token.BITS_PER_CHARACTER    // 5.954196310386876
                                  // For reference: Base64 is an even 6

Base62Token.calcMinChars(bitlen); // calculate the minimum number of chars
                                  // needed to guarantee the target entropy.
                                  // ex: 173-bit entropy needs 30 chars

Base62Token.calcMinBits(charlen); // calculate the minimum entropy guaranteed
                                  // by the given number of characters
                                  // ex: 30 chars guarantees 178-bit entropy.

Base62Token.checksum(dict, str);  // generates an (unsigned) CRC-32 checksum
                                  // for the given string (where each char is
                                  // treated as a single byte).
                                  // Returns the Base62 encoded unsigned int.

Base62Token.encode(dict, n, pad); // encode a 32-bit int (i.e. CRC-32 checksum)
                                  // as Base62 in the given dictionary, with a
                                  // default pad of 6 (guarantees 32-bits).
```

# Base62 Token Spec

## GitHub Token Breakdown

The 40-character tokens are broken down into 3 consecutive parts:

`pre_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxcccccc`

- **Prefix**: 4-char (ex: `ghx_`)
- **Entropy**: 30-char (178-bits + leading 0 padding)
  - `BITS_PER_CHAR = Math.log(62) / Math.log(2) // about 5.9541`
  - `BITS_PER_CHAR * 30 // about 178.6258`
- **Checksum**: 6-char CRC32 (32-bits, 4 bytes, 6 base62 characters)
  - (of entropy-only, not prefix)
  - `BITS_PER_CHAR * 5 // about 35.7251`

| Prefix | Entropy                        | Checksum |
| -----: | :----------------------------- | :------- |
|  pre\_ | xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx | cccccc   |

See

- https://github.blog/2021-04-05-behind-githubs-new-authentication-token-formats/
- https://github.blog/changelog/2021-09-23-npm-has-a-new-access-token-format/

## Pseudocode

```go
const dict = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

// prefix is like 'ghp_', 'gho_', etc
func GenerateBase62Token(prefix string, len int) string {
    entropy := []
    for 0..len {
        index := math.RandomInt(62)
        entropy = append(entropy, dict[index])
    }
    chksum := crc32.Checksum(entropy) // uint32

    pad := 6
    // ex: "ghp_" + "zQWBuTSOoRi4A9spHcVY5ncnsDkxkJ" + "0mLq17"
    return prefix + string(entropy) + base62.Encode(dict, chksum, pad)
}
```

## Standard Base62 Dictionaries

There are 3 widely-used, generic Base62 dictionaries, all of which are based on
the alphanumeric character set (i.e. 0-9, A-Z, a-z).

For general encoding and decoding, you should use one of these:

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

GitHub and NPM use the Lexographic (a.k.a. GMP) Base62 alphabet.

# Legal

For a business license and/or commercial support ($99/year), please contact
[Root](https://therootcompany.com/contact/).

Copyright 2022 [AJ ONeal](https://coolaj86.com) \
Copyright 2022 [Root](https://therootcompany.com)

MPL-2.0 (Open Source) | [Terms of Use](https://therootcompany.com/legal/#terms)
| [Privacy Policy](https://therootcompany.com/legal/#privacy)
