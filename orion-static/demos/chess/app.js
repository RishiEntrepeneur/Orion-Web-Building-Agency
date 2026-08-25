/* Alderley Chess Club — demo build.
   No dependencies, same as everything else Orion builds. */
(function () {
  "use strict";

  /* ---------- the board ----------
     64 squares, index 0 = a8, 63 = h1. A square is dark when
     (row + file) is odd, which puts a1 dark where it belongs. */
  /* How a printed chess diagram does it: White is the hollow glyph, Black the
     solid one, and BOTH are drawn in ink. Colouring the white set white is the
     trap — the glyph is an outline, so a white outline on a light square is
     nothing at all. Ink on both keeps every piece legible on either square. */
  var GLYPH = {
    K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
    k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟"
  };
  var START = (
    "rnbqkbnr" +
    "pppppppp" +
    "........" +
    "........" +
    "........" +
    "........" +
    "PPPPPPPP" +
    "RNBQKBNR"
  ).split("");

  /* Giuoco Piano. from/to are board indices; say is what we tell the reader. */
  var LINE = [
    { san: "1. e4",   from: 52, to: 36, say: "White takes the centre. The pawn also opens lines for the bishop and the queen behind it." },
    { san: "1… e5", from: 12, to: 28, say: "Black claims an equal share of the middle. Neither pawn can take the other." },
    { san: "2. Nf3",  from: 62, to: 45, say: "A knight comes out and attacks the e5 pawn. Every move so far does two jobs." },
    { san: "2… Nc6", from: 1,  to: 18, say: "Black defends the pawn with a piece that also wanted to come out anyway." },
    { san: "3. Bc4",  from: 61, to: 34, say: "The bishop points at f7 — the square only the black king defends." },
    { san: "3… Bc5", from: 5,  to: 26, say: "Black mirrors it. This is the Giuoco Piano, and both sides are simply ready to play." }
  ];

  var cb = document.getElementById("cb");
  var movesEl = document.getElementById("moves");
  var sayEl = document.getElementById("say");
  var nextBtn = document.getElementById("next");
  var resetBtn = document.getElementById("reset");
  var cells = [];
  var ply = 0;

  if (cb) {
    for (var i = 0; i < 64; i++) {
      var el = document.createElement("i");
      var row = Math.floor(i / 8), file = i % 8;
      if ((row + file) % 2 === 1) el.className = "d";
      cb.appendChild(el);
      cells.push(el);
    }
    LINE.forEach(function (m, n) {
      var s = document.createElement("span");
      s.textContent = m.san;
      s.addEventListener("click", function () { goTo(n + 1); });
      s.setAttribute("role", "button");
      s.setAttribute("tabindex", "0");
      s.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goTo(n + 1); }
      });
      movesEl.appendChild(s);
    });
    goTo(0);
  }

  function goTo(n) {
    ply = Math.max(0, Math.min(LINE.length, n));
    var b = START.slice();
    var hi = [];
    for (var i = 0; i < ply; i++) {
      var m = LINE[i];
      b[m.to] = b[m.from];
      b[m.from] = ".";
      if (i === ply - 1) hi = [m.from, m.to];
    }
    for (var s = 0; s < 64; s++) {
      var p = b[s];
      var c = cells[s];
      c.textContent = p === "." ? "" : GLYPH[p];
      var row = Math.floor(s / 8), file = s % 8;
      var cls = (row + file) % 2 === 1 ? "d" : "";
      if (p !== "." && p === p.toUpperCase()) cls += " w";
      if (hi.indexOf(s) > -1) cls += " hi";
      c.className = cls.trim();
    }
    var kids = movesEl.children;
    for (var k = 0; k < kids.length; k++) kids[k].className = k < ply ? "on" : "";
    sayEl.textContent = ply === 0 ? "The starting position. White to move." : LINE[ply - 1].say;
    nextBtn.textContent = ply >= LINE.length ? "Start again" : "Next move";
  }

  if (nextBtn) nextBtn.addEventListener("click", function () { goTo(ply >= LINE.length ? 0 : ply + 1); });
  if (resetBtn) resetBtn.addEventListener("click", function () { goTo(0); });

  /* ---------- the enquiry form ----------
     No server behind a demo, so it validates, assembles and offers a copy. */
  var f = document.getElementById("f");
  if (!f) return;
  var alert = document.getElementById("alert");
  var done = document.getElementById("done");
  var out = document.getElementById("out");
  var copied = document.getElementById("copied");
  var text = "";

  function field(input) { return input.closest(".fld"); }
  function bad(input, msg) {
    var w = field(input);
    w.setAttribute("data-bad", "1");
    input.setAttribute("aria-invalid", "true");
    w.querySelector(".err").textContent = msg;
  }
  function good(input) {
    var w = field(input);
    w.removeAttribute("data-bad");
    input.setAttribute("aria-invalid", "false");
    w.querySelector(".err").textContent = "";
  }

  var inputs = f.querySelectorAll("input, select, textarea");
  Array.prototype.forEach.call(inputs, function (i) {
    i.addEventListener("input", function () { good(i); });
    i.addEventListener("change", function () { good(i); });
  });

  f.addEventListener("submit", function (e) {
    e.preventDefault();
    var problems = [];
    Array.prototype.forEach.call(inputs, function (i) {
      if (!i.required) return;
      var v = (i.value || "").trim();
      good(i);
      if (!v) { bad(i, "We need this one"); problems.push(i); return; }
      if (i.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        bad(i, "That does not look like an email address"); problems.push(i);
      }
    });
    if (problems.length) {
      alert.hidden = false;
      alert.textContent = problems.length === 1
        ? "One field still needs filling in."
        : problems.length + " fields still need filling in.";
      problems[0].focus();
      return;
    }
    alert.hidden = true;
    var d = new FormData(f);
    text = [
      "ALDERLEY CHESS CLUB — ENQUIRY",
      "==============================",
      "",
      "NAME:   " + d.get("name"),
      "EMAIL:  " + d.get("email"),
      "PLAYS:  " + d.get("level"),
      "",
      "QUESTION",
      "--------",
      d.get("msg")
    ].join("\n");
    out.textContent = text;
    f.hidden = true;
    done.hidden = false;
    copied.textContent = "";
    done.focus();
  });

  document.getElementById("again").addEventListener("click", function () {
    done.hidden = true;
    f.hidden = false;
    document.getElementById("f-name").focus();
  });

  document.getElementById("copy").addEventListener("click", function () {
    function say(ok) {
      copied.textContent = ok ? "Copied to your clipboard." : "Could not copy — select the text above instead.";
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { say(true); }, function () { say(false); });
    } else { say(false); }
  });
})();
