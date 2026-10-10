(function (window) {
"use strict";

const STEP = 0.5;

window.Asc.plugin.init = function (initData) {

    if (!window.__binded__) {

        bind("line-10", () => setLineSpacing(1.0));
        bind("line-15", () => setLineSpacing(1.5));
        bind("line-20", () => setLineSpacing(2.0));

        bind("char-inc", () => changeSpacing(STEP));
        bind("char-dec", () => changeSpacing(-STEP));
        bind("char-apply", applyFromInput);
        bind("char-reset", resetSpacing);

        window.__binded__ = true;
    }

    readCurrentSpacing();
};

window.Asc.plugin.button = function () {
    window.Asc.plugin.executeCommand("close", "");
};

function bind(id, fn) {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        try {
            fn();
        } catch (err) {
            console.log(err);
        }
    }, false);
}

function applyFromInput() {
    let v = parseFloat(document.getElementById("char-val").value);
    if (isNaN(v)) v = 0;
    applySpacing(v);
}

function resetSpacing() {
    document.getElementById("char-val").value = "0";
    applySpacing(0);
}

function changeSpacing(delta) {
    const input = document.getElementById("char-val");
    let v = parseFloat(input.value);
    if (isNaN(v)) v = 0;
    v = Math.round((v + delta) * 10) / 10;
    input.value = v.toFixed(1);
    applySpacing(v);
}

function applySpacing(pt) {
    Asc.scope.spacing = Math.round(pt * 20);

    window.Asc.plugin.callCommand(function () {
        var doc = Api.GetDocument();
        if (!doc) return;

        var range = doc.GetRangeBySelect();
        if (!range) return;

        var textPr = Api.CreateTextPr();
        textPr.SetSpacing(Asc.scope.spacing);
        range.SetTextPr(textPr);

    }, true);

    setTimeout(readCurrentSpacing, 100);
}

function readCurrentSpacing() {

    window.Asc.plugin.callCommand(function () {

        var doc = Api.GetDocument();
        if (!doc) return 0;

        var range = doc.GetRangeBySelect();
        if (!range) return 0;

        if (!range.GetTextPr)
            return 0;

        var textPr = range.GetTextPr();
        if (!textPr || !textPr.GetSpacing)
            return 0;

        return textPr.GetSpacing();

    }, false, true, function (spacing) {

        if (spacing == null)
            spacing = 0;

        var input = document.getElementById("char-val");
        if (input)
            input.value = (spacing / 20).toFixed(1);

    });
}

function setLineSpacing(value) {

    Asc.scope.line = value;

    window.Asc.plugin.callCommand(function () {

        var doc = Api.GetDocument();
        if (!doc) return;

        var range = doc.GetRangeBySelect();
        if (!range) return;

        var paragraphs = range.GetParagraphs();
        if (!paragraphs) return;

        for (var i = 0; i < paragraphs.length; i++) {
            paragraphs[i].SetSpacingLine(Asc.scope.line, "auto");
        }

    }, true);
}

})(window);
