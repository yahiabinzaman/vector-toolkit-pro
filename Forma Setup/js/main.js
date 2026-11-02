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
    diagramTitle: document.getElementById("diagramTitle"),
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
    if (els.statusIcon) {
      els.statusIcon.className = "status-dot status-dot-" + (type || "info");
      els.statusIcon.textContent = "";
    }

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
      updateCtpUI();
    });

    els.selFormaBatch.addEventListener("change", function () {
      state.formaBatch = parseInt(els.selFormaBatch.value, 10) || 1;
      renderPreview();
      updateCtpUI();
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
    if (state.sectionType === "album_16") {
      if (els.diagramTitle) els.diagramTitle.textContent = "অ্যালবাম লেআউট প্রিভিউ (ঝুড়ি / Front & Back)";
      if (els.diagramInfo) els.diagramInfo.textContent = "১৬ আর্টবোর্ড (লম্বা লম্বি)";
      els.impositionGridPreview.style.display = "flex";
      els.impositionGridPreview.style.flexDirection = "column";
      els.impositionGridPreview.style.gap = "6px";
      els.impositionGridPreview.innerHTML = "";

      // Part 1: Left Sheet (Front / Sheet 1)
      // Row 1 (Top): 5, 12, 9, 8 (Rot: 180° / উল্টা)
      // Row 2 (Bottom): 4, 13, 16, 1 (Rot: 0° / সোজা)
      var sheet1 = [
        { ab: 5, page: 5, rot: 180 },
        { ab: 12, page: 12, rot: 180 },
        { ab: 9, page: 9, rot: 180 },
        { ab: 8, page: 8, rot: 180 },
        { ab: 4, page: 4, rot: 0 },
        { ab: 13, page: 13, rot: 0 },
        { ab: 16, page: 16, rot: 0 },
        { ab: 1, page: 1, rot: 0 }
      ];

      // Part 2: Right Sheet (Back / Sheet 2)
      // Row 1 (Top): 7, 10, 11, 6 (Rot: 180° / উল্টা)
      // Row 2 (Bottom): 2, 15, 14, 3 (Rot: 0° / সোজা)
      var sheet2 = [
        { ab: 7, page: 7, rot: 180 },
        { ab: 10, page: 10, rot: 180 },
        { ab: 11, page: 11, rot: 180 },
        { ab: 6, page: 6, rot: 180 },
        { ab: 2, page: 2, rot: 0 },
        { ab: 15, page: 15, rot: 0 },
        { ab: 14, page: 14, rot: 0 },
        { ab: 3, page: 3, rot: 0 }
      ];

      function buildSheetGrid(items, title) {
        var wrap = document.createElement("div");
        wrap.className = "sheet-wrap";

        var lbl = document.createElement("div");
        lbl.className = "sheet-label";
        lbl.innerHTML = '<span>' + title + '</span><span style="opacity:0.8; font-weight:400;">৪x২ আর্টবোর্ড</span>';
        wrap.appendChild(lbl);

        var grid = document.createElement("div");
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = "repeat(4, 1fr)";
        grid.style.gap = "4px";

        items.forEach(function (it) {
          var cell = document.createElement("div");
          cell.className = "grid-cell";

          var isInv = (it.rot === 180);
          var arrow = isInv ? "↓" : "↑";
          var rotTxt = isInv ? "উল্টা" : "সোজা";
          var rotCls = isInv ? "cell-rot-down" : "cell-rot-up";
          var abStr = (it.ab < 10 ? "0" : "") + it.ab;

          cell.innerHTML = [
            '<div class="cell-ab-target">AB ' + abStr + '</div>',
            '<div class="cell-page-num">' + toBnNum(it.page) + '</div>',
            '<div class="cell-rot-arrow ' + rotCls + '">' + arrow + ' ' + rotTxt + '</div>'
          ].join("");

          cell.title = "Artboard " + it.ab + " -> Page " + it.page + " (" + (isInv ? "180° উল্টা" : "0° সোজা") + ")";
          grid.appendChild(cell);
        });

        wrap.appendChild(grid);
        return wrap;
      }

      els.impositionGridPreview.appendChild(buildSheetGrid(sheet1, "পার্ট ১ (সামনে / Front Sheet)"));
      els.impositionGridPreview.appendChild(buildSheetGrid(sheet2, "পার্ট ২ (পেছনে / Back Sheet)"));
      return;
    }

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

    if (els.diagramTitle) {
      els.diagramTitle.textContent = is8Page ? "অ্যালবাম লেআউট প্রিভিউ (৮ পেজ)" : "ইনার / নোট লেআউট প্রিভিউ (৪x৪)";
    }
    els.diagramInfo.textContent = totalSlots + " Artboards (4x" + (is8Page ? 2 : 4) + ")";
    els.impositionGridPreview.style.display = "grid";
    els.impositionGridPreview.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";
    els.impositionGridPreview.style.gap = "4px";
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
      var arrowSymbol = isRight ? "→" : "←";
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

  function ensureHostScript(callback) {
    csInterface.evalScript("typeof FormaEngine", function (res) {
      if (res === "object") {
        if (callback) callback();
      } else {
        var extRoot = csInterface.getSystemPath(SystemPath.EXTENSION);
        var jsxPath = extRoot + "/jsx/hostscript.jsx";
        csInterface.evalScript('$.evalFile("' + jsxPath + '")', function () {
          if (callback) callback();
        });
      }
    });
  }

  function runImposition() {
    var txtJob = document.getElementById("txtCtpJobName");
    var jobNameVal = txtJob ? txtJob.value.trim() : "";

    var payload = {
      diarySize: state.diarySize,
      sectionType: state.sectionType,
      formaBatch: state.formaBatch,
      mappingScheme: state.mappingScheme,
      orientationMode: state.orientationMode,
      jobNameBn: jobNameVal
    };

    showStatus("ফর্মা সেটআপ প্রক্রিয়াকরণ চলছে...", "info");
    els.btnRunImposition.disabled = true;

    ensureHostScript(function () {
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
    });
  }

  function runPrintDemo() {
    var btn = document.getElementById("btnPrintDemo");
    if (btn) btn.disabled = true;
    showStatus("প্রিন্ট ডেমোর জন্য আর্টবোর্ড প্রস্তুত করা হচ্ছে...", "info");

    ensureHostScript(function () {
      var script = "FormaEngine.executePrintDemo('" + state.sectionType + "')";
      csInterface.evalScript(script, function (res) {
        if (btn) btn.disabled = false;
        try {
          var result = JSON.parse(res);
          if (result.success) {
            var msg = (state.sectionType === "album_16")
              ? "অ্যালবাম ডেমো প্রিন্ট সম্পন্ন (Front & Back আলাদা শিট আর্টবোর্ড প্রস্তুত)।"
              : "ডেমো প্রিন্ট সম্পন্ন এবং মূল শিট আর্টবোর্ডে রিস্টোর করা হয়েছে।";
            showStatus(msg, "success", 7000);
          } else {
            showStatus(result.error || "প্রিন্ট ডেমো ব্যর্থ হয়েছে।", "error", 7000);
          }
        } catch (err) {
          showStatus("Result: " + res, "error", 7000);
        }
      });
    });
  }

  function runRestoreSheet() {
    var btn = document.getElementById("btnRestoreSheet");
    if (btn) btn.disabled = true;
    showStatus("আর্টবোর্ড পুরো শিটে ফিট করা হচ্ছে...", "info");

    ensureHostScript(function () {
      var script = "FormaEngine.restoreFullSheet('" + state.sectionType + "')";
      csInterface.evalScript(script, function (res) {
        if (btn) btn.disabled = false;
        try {
          var result = JSON.parse(res);
          if (result.success) {
            var msg = (state.sectionType === "album_16")
              ? "অ্যালবাম ২টি শিট (Front & Back) আলাদা গ্রুপ ও আর্টবোর্ডে ফিট করা হয়েছে।"
              : "আর্টবোর্ড সফলভাবে পুরো শিট বাউন্সে ফিট করা হয়েছে।";
            showStatus(msg, "success", 5000);
          } else {
            showStatus(result.error || "শিট ফিট ব্যর্থ হয়েছে।", "error", 6000);
          }
        } catch (err) {
          showStatus("Result: " + res, "error", 6000);
        }
      });
    });
  }

  var BENGALI_DICTIONARY = {
    "islampur": "ইসলামপুর",
    "malibagh": "মালিবাগ",
    "madrasa": "মাদ্রাসা",
    "madrasha": "মাদ্রাসা",
    "madrasah": "মাদ্রাসা",
    "jamia": "জামিয়া",
    "jamiya": "জামিয়া",
    "islamia": "ইসলামিয়া",
    "darul": "দারুল",
    "uloom": "উলুম",
    "ulum": "উলুম",
    "qawmi": "কওমি",
    "hafizia": "হাফেজিয়া",
    "shohid": "শহীদ",
    "shahid": "শহীদ",
    "school": "স্কুল",
    "college": "কলেজ",
    "dhaka": "ঢাকা",
    "bogura": "বগুড়া",
    "khulna": "খুলনা",
    "barishal": "বরিশাল",
    "sylhet": "সিলেট",
    "rajshahi": "রাজশাহী",
    "chattogram": "চট্টগ্রাম",
    "chittagong": "চট্টগ্রাম",
    "comilla": "কুমিল্লা",
    "narayanganj": "নারায়ণগঞ্জ",
    "gazipur": "গাজীপুর",
    "jatrabari": "যাত্রাবাড়ী",
    "uttara": "উত্তরা",
    "mirpur": "মিরপুর",
    "dhanmondi": "ধানমন্ডি",
    "colorlab": "কালারল্যাব",
    "al": "আল",
    "nur": "নূর",
    "noor": "নূর",
    "huda": "হুদা",
    "furqan": "ফুরকান"
  };

  function toBengaliWords(engStr) {
    if (!engStr) return "";
    var words = engStr.trim().split(/\s+/);
    var bnWords = words.map(function (w) {
      var key = w.toLowerCase().replace(/[^a-z]/g, "");
      return BENGALI_DICTIONARY[key] || w;
    });
    return bnWords.join(" ");
  }

  function updateCtpUI() {
    var badge = document.getElementById("badgeCtpColorMode");
    var descLine = document.getElementById("ctpColorDescLine");
    var selMode = document.getElementById("selCtpColorMode");
    var mode = selMode ? selMode.value : "auto";

    var is4Color = false;
    if (mode === "4color") is4Color = true;
    else if (mode === "2color") is4Color = false;
    else {
      is4Color = (state.sectionType === "album_16" || state.sectionType === "album_8");
    }

    if (badge) {
      badge.textContent = is4Color ? "৪-কালার সিএমওয়াইকে" : "২-কালার প্লেট";
      badge.style.color = is4Color ? "#34c759" : "#0a84ff";
      badge.style.background = is4Color ? "rgba(52, 199, 89, 0.15)" : "rgba(10, 132, 255, 0.15)";
    }
    if (descLine) {
      descLine.textContent = is4Color
        ? "• ৪-কালার ফুল কালার (CMYK কালার অপরিবর্তিত থাকবে)"
        : "• ম্যাজেন্টা ও ইয়েলো অপসারিত (Cyan & Black 2-Color)";
    }
  }

  function autoFillJobName() {
    var txt = document.getElementById("txtCtpJobName");
    if (!txt) return;
    ensureHostScript(function () {
      csInterface.evalScript("FormaEngine.getActiveDocJobName()", function (res) {
        if (res && res !== "null" && res !== "undefined" && res.length > 0) {
          var bn = toBengaliWords(res);
          txt.value = bn;
        }
      });
    });
  }

  function runCtpPrep() {
    var btn = document.getElementById("btnRunCtp");
    var txt = document.getElementById("txtCtpJobName");
    var selMode = document.getElementById("selCtpColorMode");
    var jobNameBn = txt ? txt.value.trim() : "";
    var modeVal = selMode ? selMode.value : "auto";

    if (btn) btn.disabled = true;
    showStatus("সিটিপি প্রস্তুতি (গ্রিড ক্লিন, আউটলাইন, এম্বেড) চলছে...", "info");

    ensureHostScript(function () {
      var ctpPayload = {
        jobNameBn: jobNameBn,
        sectionType: state.sectionType,
        colorMode: modeVal
      };
      var script = "FormaEngine.executeCtpPrep('" + JSON.stringify(ctpPayload).replace(/'/g, "\\'") + "')";
      csInterface.evalScript(script, function (res) {
        if (btn) btn.disabled = false;
        try {
          var result = JSON.parse(res);
          if (result.success) {
            var is4Col = (modeVal === "4color" || (modeVal === "auto" && (state.sectionType === "album_16" || state.sectionType === "album_8")));
            var modeTxt = is4Col ? "৪-কালার সিএমওয়াইকে (ফুল কালার অক্ষুণ্ণ)" : "২-কালার (ম্যাজেন্টা ও ইয়েলো অপসারিত)";
            var successMsg = "সিটিপি প্রস্তুতি সম্পন্ন [" + modeTxt + "]! গ্রিড ক্লিন, ছবি এম্বেড ও টেক্সট আউটলাইন করা হয়েছে।";
            showStatus(successMsg, "success", 8000);
          } else {
            showStatus(result.error || "সিটিপি প্রিপারেশন ব্যর্থ হয়েছে।", "error", 7000);
          }
        } catch (err) {
          showStatus("Result: " + res, "error", 7000);
        }
      });
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

  function autoDetectDoc(quiet) {
    ensureHostScript(function () {
      csInterface.evalScript("FormaEngine.getActiveDocInfo()", function (res) {
        if (!res) return;
        try {
          var info = JSON.parse(res);
          if (info && info.hasDoc) {
            if (info.detectedType && els.selSectionType) {
              els.selSectionType.value = info.detectedType;
              state.sectionType = info.detectedType;
              els.selSectionType.dispatchEvent(new Event("change"));
            }
            if (info.jobName) {
              var txtCtp = document.getElementById("txtCtpJobName");
              if (txtCtp) txtCtp.value = toBengaliWords(info.jobName);
            }
            renderPreview();
            updateCtpUI();
            if (!quiet) {
              var typeLabel = (state.sectionType === "album_16") ? "অ্যালবাম (Album 16)" : "ইনার/নোট (Inner 16)";
              showStatus("ডকুমেন্ট ডিটেক্টেড: " + info.name + " [" + typeLabel + "]", "info", 3000);
            }
          }
        } catch (e) {}
      });
    });
  }

  function init() {
    ensureHostScript();
    initSizePresets();
    initSectionSelection();
    els.btnRunImposition.addEventListener("click", runImposition);

    var btnPrintDemo = document.getElementById("btnPrintDemo");
    if (btnPrintDemo) {
      btnPrintDemo.addEventListener("click", runPrintDemo);
    }

    var btnRestoreSheet = document.getElementById("btnRestoreSheet");
    if (btnRestoreSheet) {
      btnRestoreSheet.addEventListener("click", runRestoreSheet);
    }

    var btnAutoJobName = document.getElementById("btnAutoJobName");
    if (btnAutoJobName) {
      btnAutoJobName.addEventListener("click", autoFillJobName);
    }

    var btnRunCtp = document.getElementById("btnRunCtp");
    if (btnRunCtp) {
      btnRunCtp.addEventListener("click", runCtpPrep);
    }

    var selCtpMode = document.getElementById("selCtpColorMode");
    if (selCtpMode) {
      selCtpMode.addEventListener("change", updateCtpUI);
    }

    els.btnRefreshDocs.addEventListener("click", function () {
      autoDetectDoc(false);
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

    autoDetectDoc(true);
    updateCtpUI();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
