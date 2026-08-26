/* =====================================================================
   ALDERLEY CHESS CLUB — one interactive thing, done properly
   ===================================================================== */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------------
     The board.

     Printed diagrams do not colour the pieces black and white — the
     Unicode "white" glyphs are hollow outlines and vanish on a light
     square if you fill them white. Both sides are drawn in ink, and it
     is the hollow-versus-solid glyph that tells them apart, exactly as
     a newspaper does it.
     ------------------------------------------------------------------ */
  var W = { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" };
  var B = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };

  function start() {
    return [
      ["r", "n", "b", "q", "k", "b", "n", "r"].map(function (t) { return { t: t, s: "b" }; }),
      "pppppppp".split("").map(function () { return { t: "p", s: "b" }; }),
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      "pppppppp".split("").map(function () { return { t: "p", s: "w" }; }),
      ["r", "n", "b", "q", "k", "b", "n", "r"].map(function (t) { return { t: t, s: "w" }; })
    ];
  }

  /* file/rank to row/col: a1 is bottom-left, and row 0 is rank 8 */
  function sq(name) {
    return { c: name.charCodeAt(0) - 97, r: 8 - parseInt(name[1], 10) };
  }

  var GAME = [
    { m: "e4", from: "e2", to: "e4", say: "White takes the centre. Nearly every game you will ever see starts with a pawn on one of these two squares." },
    { m: "e5", from: "e7", to: "e5", say: "Black says the same thing back. The two pawns now stare at each other and neither can advance." },
    { m: "Nf3", from: "g1", to: "f3", say: "A knight out, attacking the pawn on e5. Develop a piece and make a threat with the same move — that is the whole idea." },
    { m: "Nc6", from: "b8", to: "c6", say: "Black defends the pawn with a knight, which also develops. Nobody has wasted a move yet." },
    { m: "Bc4", from: "f1", to: "c4", say: "The bishop points at f7, the weakest square in Black's position. This is the Italian Game, and it is about five hundred years old." },
    { m: "Bc5", from: "f8", to: "c5", say: "Black mirrors it. Four pieces out, both kings safe, and the game has not really started — which is exactly what an opening is for." }
  ];

  function board() {
    var el = $("#board");
    if (!el) return;
    var movesEl = $("#moves");
    var cap = $("#mv-cap");
    var prev = $("#mv-prev");
    var next = $("#mv-next");
    var at = 0;

    movesEl.innerHTML = GAME.map(function (g, i) {
      return '<li data-i="' + i + '">' + (i % 2 === 0 ? (i / 2 + 1) + ". " : "") + g.m + "</li>";
    }).join("");

    function render() {
      var pos = start();
      var last = null;
      for (var i = 0; i < at; i++) {
        var g = GAME[i];
        var f = sq(g.from), t = sq(g.to);
        pos[t.r][t.c] = pos[f.r][f.c];
        pos[f.r][f.c] = null;
        last = { f: f, t: t };
      }

      var html = "";
      for (var r = 0; r < 8; r++) {
        for (var c = 0; c < 8; c++) {
          var p = pos[r][c];
          var dark = (r + c) % 2 === 1;
          var isFrom = last && last.f.r === r && last.f.c === c;
          var isTo = last && last.t.r === r && last.t.c === c;
          html += '<span class="sq ' + (dark ? "sq--d" : "sq--l") + '"' +
            (isFrom ? ' data-from="true"' : "") +
            (isTo ? ' data-to="true" data-moved="true"' : "") + ">" +
            (p ? '<span class="sq__p">' + (p.s === "w" ? W[p.t] : B[p.t]) + "</span>" : "") +
            "</span>";
        }
      }
      el.innerHTML = html;

      $$("li", movesEl).forEach(function (li, i) {
        li.setAttribute("data-on", String(i === at - 1));
      });
      cap.textContent = at === 0
        ? "The starting position. Press Next move to play through the opening."
        : GAME[at - 1].say;
      el.setAttribute("aria-label", at === 0
        ? "A chess board in the starting position"
        : "A chess board after " + GAME[at - 1].m);
      prev.disabled = at === 0;
      next.disabled = at === GAME.length;
      next.textContent = at === GAME.length ? "That is the opening" : "Next move";
    }

    next.addEventListener("click", function () { if (at < GAME.length) { at++; render(); } });
    prev.addEventListener("click", function () { if (at > 0) { at--; render(); } });
    $$("li", movesEl).forEach(function (li) {
      li.addEventListener("click", function () { at = +li.getAttribute("data-i") + 1; render(); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.target && e.target.closest && e.target.closest("input, textarea, select")) return;
      if (e.key === "ArrowRight" && at < GAME.length) { at++; render(); }
      if (e.key === "ArrowLeft" && at > 0) { at--; render(); }
    });

    render();
  }

  /* ---------- the message ---------------------------------------------- */
  function ask() {
    var form = $("#ask");
    if (!form) return;
    var done = $("#ask-done");
    function err(id, msg) {
      var p = $('[data-err-for="' + id + '"]');
      if (p) p.textContent = msg || "";
      var f = $("#" + id);
      if (f) f.setAttribute("aria-invalid", msg ? "true" : "false");
      return !msg;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#c-name"), email = $("#c-email"), msg = $("#c-msg");
      var ok = true;
      ok = err("c-name", name.value.trim() ? "" : "We need something to call you.") && ok;
      ok = err("c-email", /.+@.+\..+/.test(email.value.trim()) ? "" : "An email address, so somebody can answer.") && ok;
      ok = err("c-msg", msg.value.trim() ? "" : "Ask us anything at all.") && ok;
      if (!ok) {
        var first = !name.value.trim() ? name : !/.+@.+\..+/.test(email.value.trim()) ? email : msg;
        first.focus();
        return;
      }
      done.hidden = false;
      form.querySelector('button[type="submit"]').disabled = true;
      done.setAttribute("tabindex", "-1");
      done.focus();
    });
  }

  function boot() { board(); ask(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else { boot(); }
})();
