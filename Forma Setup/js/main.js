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

  // Scheme 1 (Default): Page N -> Artboard N
  // In the 4x4 visual plate (Image 1):
  // Row 1: [ Artboard 8 (180°), Artboard 1 (180°), Artboard 2 (180°), Artboard 7 (180°) ]
  // Row 2: [ Artboard 9 (0°),   Artboard 16 (0°),  Artboard 15 (0°),  Artboard 10 (0°)   ]
  // Row 3: [ Artboard 12 (0°),  Artboard 13 (0°),  Artboard 14 (0°),  Artboard 11 (0°)   ]
  // Row 4: [ Artboard 5 (180°), Artboard 4 (180°), Artboard 3 (180°), Artboard 6 (180°) ]
  var SCHEME_ARTBOARD_MATCH_16 = {
    1:  { slot: 1,  rot: 180, ab: 1  },
    2:  { slot: 2,  rot: 180, ab: 2  },
    3:  { slot: 14, rot: 180, ab: 3  },
    4:  { slot: 13, rot: 180, ab: 4  },
    5:  { slot: 12, rot: 180, ab: 5  },
    6:  { slot: 15, rot: 180, ab: 6  },
    7:  { slot: 3,  rot: 180, ab: 7  },
    8:  { slot: 0,  rot: 180, ab: 8  },
    9:  { slot: 4,  rot: 0,   ab: 9  },
    10: { slot: 7,  rot: 0,   ab: 10 },
    11: { slot: 11, rot: 0,   ab: 11 },
    12: { slot: 8,  rot: 0,   ab: 12 },
    13: { slot: 9,  rot: 0,   ab: 13 },
    14: { slot: 10, rot: 0,   ab: 14 },
    15: { slot: 6,  rot: 0,   ab: 15 },
    16: { slot: 5,  rot: 0,   ab: 16 }
  };

  // Scheme 2: Standard Sheetwise (Forma 01)
  var SCHEME_STANDARD_16 = {
    1:  { slot: 4,  rot: 0,   ab: 5  },
    2:  { slot: 8,  rot: 0,   ab: 9  },
    3:  { slot: 11, rot: 0,   ab: 12 },
    4:  { slot: 7,  rot: 0,   ab: 8  },
    5:  { slot: 3,  rot: 180, ab: 4  },
    6:  { slot: 15, rot: 180, ab: 16 },
    7:  { slot: 12, rot: 180, ab: 13 },
    8:  { slot: 0,  rot: 180, ab: 1  },
    9:  { slot: 1,  rot: 180, ab: 2  },
    10: { slot: 13, rot: 180, ab: 14 },
    11: { slot: 14, rot: 180, ab: 15 },
    12: { slot: 2,  rot: 180, ab: 3  },
    13: { slot: 6,  rot: 0,   ab: 7  },
    14: { slot: 10, rot: 0,   ab: 11 },
    15: { slot: 9,  rot: 0,   ab: 10 },
    16: { slot: 5,  rot: 0,   ab: 6  }
  };

  // Scheme 3: Work & Turn / Album
  var SCHEME_WORK_TURN_16 = {
    1:  { slot: 7,  rot: 0,   ab: 8  },
    2:  { slot: 11, rot: 0,   ab: 12 },
    3:  { slot: 8,  rot: 0,   ab: 9  },
    4:  { slot: 4,  rot: 0,   ab: 5  },
    5:  { slot: 0,  rot: 180, ab: 1  },
    6:  { slot: 12, rot: 180, ab: 13 },
    7:  { slot: 15, rot: 180, ab: 16 },
    8:  { slot: 3,  rot: 180, ab: 4  },
    9:  { slot: 2,  rot: 180, ab: 3  },
    10: { slot: 14, rot: 180, ab: 15 },
    11: { slot: 13, rot: 180, ab: 14 },
    12: { slot: 1,  rot: 180, ab: 2  },
    13: { slot: 5,  rot: 0,   ab: 6  },
    14: { slot: 9,  rot: 0,   ab: 10 },
    15: { slot: 10, rot: 0,   ab: 11 },
    16: { slot: 6,  rot: 0,   ab: 7  }
  };

  var SCHEME_ALBUM_8 = {
    1: { slot: 0, rot: 0,   ab: 1 },
    2: { slot: 1, rot: 0,   ab: 2 },
    3: { slot: 2, rot: 0,   ab: 3 },
    4: { slot: 3, rot: 0,   ab: 4 },
    5: { slot: 4, rot: 180, ab: 5 },
    6: { slot: 5, rot: 180, ab: 6 },
    7: { slot: 6, rot: 180, ab: 7 },
    8: { slot: 7, rot: 180, ab: 8 }
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

    els.selMappingScheme.addEventListener("change", function () {
      state.mappingScheme = els.selMappingScheme.value;
      renderPreview();
    });

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

      var isUlta = (rot === 180);
      var arrowSymbol = isUlta ? "⬇️" : "⬆️";
      var rotText = isUlta ? "১৮০° উল্টা" : "০° সোজা";
      var rotClass = isUlta ? "cell-rot-down" : "cell-rot-up";
      var abFormatted = (abNum < 10 ? "0" : "") + abNum;

      cell.innerHTML = [
        '<div class="cell-ab-target">AB ' + abFormatted + '</div>',
        '<div class="cell-page-num" style="transform: ' + (isUlta ? 'rotate(180deg)' : 'none') + ';">' + bnNum + '</div>',
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

  function init() {
    initSizePresets();
    initSectionSelection();
    els.btnRunImposition.addEventListener("click", runImposition);
    els.btnRefreshDocs.addEventListener("click", function () {
      renderPreview();
      showStatus("প্রিভিউ রিফ্রেশ করা হয়েছে।", "info", 2000);
    });

    renderPreview();
  }

  document.addEventListener("DOMContentLoaded", init);

})();
