/**
 * ColorLab Forma Setup Pro - Streamlined UI Controller
 * Author: Yahia Bin Zaman / ColorLab
 */

(function () {
  "use strict";

  var csInterface = new CSInterface();

  var state = {
    diarySize: "size2",
    sectionType: "album_16",
    formaBatch: 1,
    mappingScheme: "scheme_artboard_match",
    orientationMode: "auto"
  };

  var BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  function toBnNum(num) {
    return String(num).split("").map(function (d) {
      return BN_DIGITS[parseInt(d, 10)] || d;
    }).join("");
  }

  var els = {
    statusBanner: document.getElementById("statusBanner"),
    statusIcon: document.getElementById("statusIcon"),
    statusText: document.getElementById("statusText"),
    btnRefreshDocs: document.getElementById("btnRefreshDocs"),

    sizePresetBtns: document.querySelectorAll(".btn-size-preset"),
    badgeDiarySize: document.getElementById("badgeDiarySize"),

    selSectionType: document.getElementById("selSectionType"),
    batchGroup: document.getElementById("batchGroup"),
    selFormaBatch: document.getElementById("selFormaBatch"),

    selMappingScheme: document.getElementById("selMappingScheme"),
    selOrientationMode: document.getElementById("selOrientationMode"),

    impositionGridPreview: document.getElementById("impositionGridPreview"),
    diagramInfo: document.getElementById("diagramInfo"),
    btnRunImposition: document.getElementById("btnRunImposition")
  };

  /**
   * Universal 16-Page Offset Imposition Layout:
   * Col 0: 8, 9, 12, 5  -> Dan (Right = 270°)
   * Col 1: 1, 16, 13, 4 -> Bam (Left = 90°)
   * Col 2: 2, 15, 14, 3 -> Dan (Right = 270°)
   * Col 3: 7, 10, 11, 6 -> Bam (Left = 90°)
   */
  var SCHEME_ARTBOARD_MATCH_16 = {
    1:  { slot: 1,  rot: 90,  ab: 1  }, // Col 1: Bam
    2:  { slot: 2,  rot: 270, ab: 2  }, // Col 2: Dan
    3:  { slot: 14, rot: 270, ab: 3  }, // Col 2: Dan
    4:  { slot: 13, rot: 90,  ab: 4  }, // Col 1: Bam
    5:  { slot: 12, rot: 270, ab: 5  }, // Col 0: Dan
    6:  { slot: 15, rot: 90,  ab: 6  }, // Col 3: Bam
    7:  { slot: 3,  rot: 90,  ab: 7  }, // Col 3: Bam
    8:  { slot: 0,  rot: 270, ab: 8  }, // Col 0: Dan
    9:  { slot: 4,  rot: 270, ab: 9  }, // Col 0: Dan
    10: { slot: 7,  rot: 90,  ab: 10 }, // Col 3: Bam
    11: { slot: 11, rot: 90,  ab: 11 }, // Col 3: Bam
    12: { slot: 8,  rot: 270, ab: 12 }, // Col 0: Dan
    13: { slot: 9,  rot: 90,  ab: 13 }, // Col 1: Bam
    14: { slot: 10, rot: 270, ab: 14 }, // Col 2: Dan
    15: { slot: 6,  rot: 270, ab: 15 }, // Col 2: Dan
    16: { slot: 5,  rot: 90,  ab: 16 }  // Col 1: Bam
  };

  var SCHEME_STANDARD_16 = SCHEME_ARTBOARD_MATCH_16;
  var SCHEME_WORK_TURN_16 = SCHEME_ARTBOARD_MATCH_16;

  var SCHEME_ALBUM_8 = {
    1: { slot: 1, rot: 90,  ab: 1 },
    2: { slot: 2, rot: 270, ab: 2 },
    3: { slot: 6, rot: 270, ab: 3 },
    4: { slot: 5, rot: 90,  ab: 4 },
    5: { slot: 4, rot: 270, ab: 5 },
    6: { slot: 7, rot: 90,  ab: 6 },
    7: { slot: 3, rot: 90,  ab: 7 },
    8: { slot: 0, rot: 270, ab: 8 }
  };

  function showStatus(text, type, durationMs) {
    if (!els.statusBanner) return;
    els.statusBanner.className = "status-banner show status-" + (type || "info");
    els.statusText.textContent = text;
    els.statusIcon.textContent = (type === "success") ? "✅" : (type === "error") ? "⚠️" : "ℹ️";

    if (durationMs) {
      setTimeout(function () {
        els.statusBanner.className = "status-banner";
      }, durationMs);
    }
  }

  function initSizePresets() {
    els.sizePresetBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        els.sizePresetBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        state.diarySize = btn.getAttribute("data-size");

        var label = "2 No. Size";
        if (state.diarySize === "size1") label = "1 No. Size";
        else if (state.diarySize === "size3") label = "3 No. Size";
        els.badgeDiarySize.textContent = label;
      });
    });
  }

  function initSectionSelection() {
    els.selSectionType.addEventListener("change", function () {
      state.sectionType = els.selSectionType.value;

      if (state.sectionType === "inner_32") {
        els.batchGroup.style.display = "flex";
        els.selFormaBatch.innerHTML = '<option value="1">Forma 1 (Pages 1 - 16)</option><option value="2">Forma 2 (Pages 17 - 32)</option>';
      } else if (state.sectionType === "inner_48") {
        els.batchGroup.style.display = "flex";
        els.selFormaBatch.innerHTML = '<option value="1">Forma 1 (Pages 1 - 16)</option><option value="2">Forma 2 (Pages 17 - 32)</option><option value="3">Forma 3 (Pages 33 - 48)</option>';
      } else {
        els.batchGroup.style.display = "none";
      }

      state.formaBatch = parseInt(els.selFormaBatch.value, 10) || 1;
      renderPreview();
    });

    els.selFormaBatch.addEventListener("change", function () {
      state.formaBatch = parseInt(els.selFormaBatch.value, 10) || 1;
      renderPreview();
    });

    if (els.selMappingScheme) {
      els.selMappingScheme.addEventListener("change", function () {
        state.mappingScheme = els.selMappingScheme.value;
        renderPreview();
      });
    }

    if (els.selOrientationMode) {
      els.selOrientationMode.addEventListener("change", function () {
        state.orientationMode = els.selOrientationMode.value;
      });
    }
  }

  function renderPreview() {
    var is8Page = (state.sectionType === "album_8");
    var totalSlots = is8Page ? 8 : 16;
    var cols = 4;

    var mapping = SCHEME_ARTBOARD_MATCH_16;
    if (is8Page) {
      mapping = SCHEME_ALBUM_8;
    } else if (state.mappingScheme === "scheme_forma01") {
      mapping = SCHEME_STANDARD_16;
    } else if (state.mappingScheme === "scheme_work_turn") {
      mapping = SCHEME_WORK_TURN_16;
    }

    var pageOffset = (state.formaBatch - 1) * 16;

    els.diagramInfo.textContent = totalSlots + " Artboards (4x" + (is8Page ? 2 : 4) + ")";
    els.impositionGridPreview.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";
    els.impositionGridPreview.innerHTML = "";

    var slotMap = {};
    for (var p = 1; p <= totalSlots; p++) {
      var item = mapping[p];
      if (item) {
        slotMap[item.slot] = {
          page: p + pageOffset,
          rot: item.rot,
          ab: item.ab || p
        };
      }
    }

    for (var slotIdx = 0; slotIdx < totalSlots; slotIdx++) {
      var cell = document.createElement("div");
      cell.className = "grid-cell";

      var mapped = slotMap[slotIdx];
      var pageNum = mapped ? mapped.page : "-";
      var abNum = mapped ? mapped.ab : (slotIdx + 1);
      var rot = mapped ? mapped.rot : 0;
      var bnNum = mapped ? toBnNum(pageNum) : "-";

      var isRight = (rot === 270);
      var arrowSymbol = isRight ? "➡️" : "⬅️";
      var rotText = isRight ? "ডান" : "বাম";
      var rotClass = isRight ? "cell-rot-right" : "cell-rot-left";
      var abFormatted = (abNum < 10 ? "0" : "") + abNum;

      cell.innerHTML = [
        '<div class="cell-ab-target">AB ' + abFormatted + '</div>',
        '<div class="cell-page-num">' + bnNum + '</div>',
        '<div class="cell-rot-arrow ' + rotClass + '">' + arrowSymbol + ' ' + rotText + '</div>'
      ].join("");

      cell.title = "Artboard " + abNum + " -> Page " + pageNum + " (" + rot + "°)";
      els.impositionGridPreview.appendChild(cell);
    }
  }

  function runImposition() {
    var payload = {
      diarySize: state.diarySize,
      sectionType: state.sectionType,
      formaBatch: state.formaBatch,
      mappingScheme: state.mappingScheme,
      orientationMode: state.orientationMode
    };

    showStatus("ফর্মা সেটআপ প্রক্রিয়াকরণ চলছে...", "info");
    els.btnRunImposition.disabled = true;

    var script = "FormaEngine.executeImposition('" + JSON.stringify(payload) + "')";
    csInterface.evalScript(script, function (res) {
      els.btnRunImposition.disabled = false;
      try {
        var result = JSON.parse(res);
        if (result.success) {
          showStatus(result.message, "success", 6000);
        } else {
          showStatus(result.error, "error", 7000);
        }
      } catch (err) {
        showStatus("Result: " + res, "error", 7000);
      }
    });
  }

  function openInSystemBrowser(url) {
    var opened = false;
    try {
      if (window.__adobe_cep__ && typeof window.__adobe_cep__.openURLInDefaultBrowser === "function") {
        window.__adobe_cep__.openURLInDefaultBrowser(url);
        opened = true;
      }
    } catch (e) {}

    if (!opened) {
      try {
        if (typeof csInterface !== "undefined" && typeof csInterface.openURLInDefaultBrowser === "function") {
          csInterface.openURLInDefaultBrowser(url);
          opened = true;
        }
      } catch (e) {}
    }

    if (!opened) {
      try {
        if (window.cep && window.cep.process && typeof window.cep.process.createProcess === "function") {
          window.cep.process.createProcess("/usr/bin/open", url);
          opened = true;
        }
      } catch (e) {}
    }

    if (!opened) {
      try {
        csInterface.evalScript('try { var f = new File("/usr/bin/open"); if (f.exists) { app.system("/usr/bin/open \\"' + url + '\\""); } } catch(e){}');
      } catch (e) {}
    }
  }

  function init() {
    initSizePresets();
    initSectionSelection();
    els.btnRunImposition.addEventListener("click", runImposition);
    els.btnRefreshDocs.addEventListener("click", function () {
      renderPreview();
      showStatus("প্রিভিউ রিফ্রেশ করা হয়েছে।", "info", 2000);
    });

    var authorLink = document.getElementById("authorGithubLink");
    if (authorLink) {
      authorLink.addEventListener("click", function (e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        var url = this.getAttribute("data-url") || "https://github.com/yahiabinzaman";
        openInSystemBrowser(url);
      });
    }

    renderPreview();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
