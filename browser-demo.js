(function () {
  "use strict";

  function $(sel, el) {
    return (el || document).querySelector(sel);
  }

  function $$(sel, el) {
    return (el || document).querySelectorAll(sel);
  }

  var Base62 = window.Base62;
  var Base62Token = window.Base62Token;

  function parseInput(src, format) {
    if ("base64" === format) {
      try {
        // TODO handle '=' padding
        atob(src.replace(/-/g, "+").replace(/_/g, "/"));
      } catch (e) {
        window.alert("could not decode base64");
      }
    } else if ("[" === src[0]) {
      try {
        src = Uint8Array.from(JSON.parse(src));
      } catch (e) {
        // ignore
      }
    } else {
      src = new TextEncoder().encode(src);
    }
    return src;
  }

  // hacky-do because prettier...
  $('[name="gen-dict"]').value = $('[name="gen-dict"]').value.trim();
  $('[name="ver-dict"]').value = $('[name="ver-dict"]').value.trim();

  $('form[data-id="generate"]').addEventListener("submit", function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    var prefix = $('[name="prefix"]').value;
    var dict = $('[name="gen-dict"]').value.trim();
    var len = parseInt($('[name="length"]').value, 10);

    var token = Base62Token.generate(dict, prefix, len);
    $('[name="gen-token"]').value = token;
  });

  $('[name="length"]').addEventListener("keyup", updateEntropy);
  $('[name="length"]').addEventListener("change", updateEntropy);
  function updateEntropy(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    var len = parseInt($('[name="length"]').value, 10);
    $(".js-entropy").innerText = Base62Token.calcMinBits(len);
  }

  $('form[data-id="verify"]').addEventListener("submit", function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    var dict = $('[name="ver-dict"]').value.trim();
    console.log("Dictionary:", dict);

    var token = $('[name="ver-token"]').value;
    console.log("Token:", token);

    if (!token) {
      window.alert("Can't verify an empty token boss...");
      return;
    }
    if (!Base62Token.verify(dict, token)) {
      window.alert(
        "Failed verification.\n\nDid you copy the entire token?\nAre you using the correct dictionary?"
      );
      return;
    }
    window.alert("Verified!\n\nThat appears to be a proper token.");
  });
})();
