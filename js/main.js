// Global URL opener for Adobe CEP
window.openAuthorProfile = function (e) {
    if (e && e.preventDefault) e.preventDefault();
    var url = "https://github.com/yahiabinzaman";
    
    // 1. CSInterface API
    try {
        if (window.csInterface && typeof window.csInterface.openURLInDefaultBrowser === "function") {
            window.csInterface.openURLInDefaultBrowser(url);
            return false;
        }
    } catch (e1) {}

    // 2. CEP native
    try {
        if (window.__adobe_cep__ && typeof window.__adobe_cep__.openURLInDefaultBrowser === "function") {
            window.__adobe_cep__.openURLInDefaultBrowser(url);
            return false;
        }
    } catch (e2) {}

    // 3. CEP util
    try {
        if (window.cep && window.cep.util && typeof window.cep.util.openURLInDefaultBrowser === "function") {
            window.cep.util.openURLInDefaultBrowser(url);
            return false;
        }
    } catch (e3) {}

    // 4. Node.js child_process for macOS
    try {
        if (typeof require === "function") {
            var cp = require("child_process");
            if (cp && cp.exec) {
                cp.exec('open "' + url + '"');
                return false;
            }
        }
    } catch (e4) {}

    // 5. Standard fallback
    try {
        window.open(url, "_blank");
    } catch (e5) {}

    return false;
};

document.addEventListener("DOMContentLoaded", function () {
    var csInterface = new CSInterface();

    // DOM Elements
    var hdrDocName = document.getElementById("hdr-doc-name");
    var hdrStats = document.getElementById("hdr-stats");
    var tabBtns = document.querySelectorAll(".tab-button");
    var tabPages = document.querySelectorAll(".tab-page");
    var navTabsRow = document.getElementById("nav-tabs-row");
    var hudScreen = document.getElementById("hud-console-screen");
    var btnClose = document.getElementById("btn-close-panel");

    // Relink DOMs
    var relinkPath = document.getElementById("relink-filepath");
    var btnBrowse = document.getElementById("btn-browse-file");
    var rbRelinkAll = document.getElementById("rb-relink-all");
    var rbRelinkSel = document.getElementById("rb-relink-sel");
    var lblRelinkAll = document.getElementById("lbl-relink-all");
    var lblRelinkSel = document.getElementById("lbl-relink-sel");
    var chkPreserveClip = document.getElementById("chk-preserve-clip");
    var chkPreserveDim = document.getElementById("chk-preserve-dim");
    var btnRelinkMain = document.getElementById("btn-relink-main");

    // Embed DOMs
    var rbEmbedAll = document.getElementById("rb-embed-all");
    var rbEmbedSel = document.getElementById("rb-embed-sel");
    var lblEmbedAll = document.getElementById("lbl-embed-all");
    var lblEmbedSel = document.getElementById("lbl-embed-sel");
    var btnEmbedMain = document.getElementById("btn-embed-main");

    // Rasterize DOMs
    var rbRastSample = document.getElementById("rb-rast-sample");
    var rbRastSel = document.getElementById("rb-rast-sel");
    var rbRastAll = document.getElementById("rb-rast-all");
    var lblRastSample = document.getElementById("lbl-rast-sample");
    var lblRastSel = document.getElementById("lbl-rast-sel");
    var lblRastAll = document.getElementById("lbl-rast-all");
    var rastPpi = document.getElementById("rast-ppi");
    var rastCustomPpi = document.getElementById("rast-custom-ppi");
    var rastColor = document.getElementById("rast-color");
    var rastTransparent = document.getElementById("rast-transparent");
    var rastAa = document.getElementById("rast-aa");
    var btnRasterizeMain = document.getElementById("btn-rasterize-main");

    if (rastPpi && rastCustomPpi) {
        rastPpi.addEventListener("change", function () {
            if (rastPpi.value === "custom") {
                rastCustomPpi.style.display = "inline-block";
                rastCustomPpi.focus();
            } else {
                rastCustomPpi.style.display = "none";
            }
        });
    }

    // Word Cloud DOMs
    var wcPreset = document.getElementById("wc-preset");
    var wcSplit = document.getElementById("wc-split");
    var wcCase = document.getElementById("wc-case");
    var wcMixWeights = document.getElementById("wc-mix-weights");
    var wcTracking = document.getElementById("wc-tracking");
    var wcAspect = document.getElementById("wc-aspect");
    var wcPadding = document.getElementById("wc-padding");
    var wcMinSz = document.getElementById("wc-min-sz");
    var wcMaxSz = document.getElementById("wc-max-sz");
    var wcHierarchy = document.getElementById("wc-hierarchy");
    var wcRot = document.getElementById("wc-rot");
    var wcVertPct = document.getElementById("wc-vert-pct");
    var wcPalette = document.getElementById("wc-palette");
    var btnWordCloudMain = document.getElementById("btn-wordcloud-main");

    // Cached state
    var currentStats = {
        totalEmbedded: 0,
        totalLinked: 0,
        totalGroups: 0,
        selEmbedded: 0,
        selLinked: 0,
        selItemsCount: 0,
        selTextCount: 0,
        sampleWidth: 0,
        sampleHeight: 0,
        matchedSampleCount: 0
    };

    // Close panel
    if (btnClose) {
        btnClose.addEventListener("click", function () {
            csInterface.closeExtension();
        });
    }

    // Refresh Live Document Stats
    function refreshStats() {
        csInterface.evalScript("VectorToolkitHost.getDocStats();", function (res) {
            try {
                var s = JSON.parse(res);
                if (!s || !s.success) return;
                currentStats = s;

                hdrDocName.textContent = "Document: " + s.docName;
                hdrStats.textContent = "Total: " + s.totalEmbedded + " Embedded Raster(s) | " + s.totalLinked + " Linked | " + s.totalGroups + " Group(s)" + (s.selTextCount > 0 ? " | " + s.selTextCount + " Text Object(s)" : "");

                // Relink tab
                lblRelinkAll.textContent = "All Embedded Rasters (" + s.totalEmbedded + ")";
                lblRelinkSel.textContent = "Selected Items Only (" + s.selEmbedded + ")";
                rbRelinkSel.disabled = (s.selEmbedded === 0);
                updateRelinkButtonText();

                // Embed tab
                lblEmbedAll.textContent = "All Linked Files in Document (" + s.totalLinked + " files)";
                lblEmbedSel.textContent = "Selected Linked Items Only (" + s.selLinked + " selected)";
                rbEmbedSel.disabled = (s.selLinked === 0);
                updateEmbedButtonText();

                // Rasterize tab
                if (s.sampleWidth > 0 && s.sampleHeight > 0) {
                    var mmW = (s.sampleWidth * 0.352778).toFixed(1);
                    var mmH = (s.sampleHeight * 0.352778).toFixed(1);
                    lblRastSample.textContent = "Match Selected Sample Size (" + mmW + " x " + mmH + " mm) [" + s.matchedSampleCount + " designs found]";
                    rbRastSample.disabled = false;
                } else {
                    lblRastSample.textContent = "Match Selected Sample Size (Select 1 design sample first)";
                    rbRastSample.disabled = true;
                }
                lblRastSel.textContent = "Each Selected Group / Object Individually (" + s.selItemsCount + " selected)";
                lblRastAll.textContent = "All Top-Level Groups in Document (" + s.totalGroups + " groups)";
                rbRastSel.disabled = (s.selItemsCount === 0);

            } catch (e) {}
        });
    }

    // Tab Navigation
    tabBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            var targetId = btn.getAttribute("data-tab");
            tabBtns.forEach(function (b) { b.classList.remove("active"); });
            tabPages.forEach(function (p) { p.classList.remove("active"); });
            hudScreen.classList.remove("active");
            navTabsRow.style.display = "flex";

            btn.classList.add("active");
            var page = document.getElementById(targetId);
            if (page) page.classList.add("active");

            refreshStats();
        });
    });

    // Relink Button Text Sync
    function updateRelinkButtonText() {
        if (rbRelinkAll.checked) {
            btnRelinkMain.textContent = "Relink All " + currentStats.totalEmbedded + " Embedded Rasters";
        } else {
            btnRelinkMain.textContent = "Relink Selected " + currentStats.selEmbedded + " Raster(s)";
        }
    }
    rbRelinkAll.addEventListener("change", updateRelinkButtonText);
    rbRelinkSel.addEventListener("change", updateRelinkButtonText);

    // Embed Button Text Sync
    function updateEmbedButtonText() {
        if (rbEmbedAll.checked) {
            btnEmbedMain.textContent = "Embed All " + currentStats.totalLinked + " Linked Files (Fast Mode)";
        } else {
            btnEmbedMain.textContent = "Embed Selected " + currentStats.selLinked + " Linked File(s)";
        }
    }
    rbEmbedAll.addEventListener("change", updateEmbedButtonText);
    rbEmbedSel.addEventListener("change", updateEmbedButtonText);

    // Browse Button
    btnBrowse.addEventListener("click", function () {
        csInterface.evalScript("VectorToolkitHost.browseForImage();", function (res) {
            try {
                var data = JSON.parse(res);
                if (data.success && data.filePath) {
                    relinkPath.value = data.filePath;
                }
            } catch (e) {}
        });
    });

    // Word Cloud Master Presets
    wcPreset.addEventListener("change", function () {
        var idx = parseInt(wcPreset.value, 10);
        if (idx === 0) { // Swiss Modern
            wcMinSz.value = 14; wcMaxSz.value = 58; wcRot.value = 0; wcVertPct.value = 30;
            wcPalette.value = 0; wcCase.value = 3; wcAspect.value = 0.7; wcTracking.value = -25; wcPadding.value = 3;
        } else if (idx === 1) { // Cyberpunk Neon
            wcMinSz.value = 12; wcMaxSz.value = 64; wcRot.value = 0; wcVertPct.value = 35;
            wcPalette.value = 1; wcCase.value = 3; wcAspect.value = 1.0; wcTracking.value = -50; wcPadding.value = 2;
        } else if (idx === 2) { // Editorial Classic
            wcMinSz.value = 16; wcMaxSz.value = 48; wcRot.value = 2; wcVertPct.value = 0;
            wcPalette.value = 0; wcCase.value = 2; wcAspect.value = 0.7; wcTracking.value = 0; wcPadding.value = 4;
        } else if (idx === 3) { // Chaotic Art
            wcMinSz.value = 12; wcMaxSz.value = 60; wcRot.value = 3; wcVertPct.value = 40;
            wcPalette.value = 1; wcCase.value = 0; wcAspect.value = 1.0; wcTracking.value = -25; wcPadding.value = 2;
        } else if (idx === 4) { // T-Shirt / Radial
            wcMinSz.value = 10; wcMaxSz.value = 52; wcRot.value = 0; wcVertPct.value = 25;
            wcPalette.value = 4; wcCase.value = 3; wcAspect.value = 1.0; wcTracking.value = -25; wcPadding.value = 2;
        } else if (idx === 5) { // Vintage Warm
            wcMinSz.value = 14; wcMaxSz.value = 54; wcRot.value = 0; wcVertPct.value = 30;
            wcPalette.value = 2; wcCase.value = 2; wcAspect.value = 0.7; wcTracking.value = -25; wcPadding.value = 3;
        }
    });

    // HUD Display Helper
    function showHUD(taskName, totalItems) {
        tabPages.forEach(function (p) { p.classList.remove("active"); });
        navTabsRow.style.display = "none";
        hudScreen.classList.add("active");

        document.getElementById("hud-task-name").textContent = "PROTOCOL: " + taskName.toUpperCase();
        document.getElementById("hud-processed").textContent = "PROCESSED: 0 / " + totalItems;
        document.getElementById("hud-remaining").textContent = "REMAINING: " + totalItems;
        document.getElementById("hud-percent").textContent = "[ 0.0% ]";
        document.getElementById("hud-speed").textContent = "SPEED: CALC...";
        document.getElementById("hud-elapsed").textContent = "ELAPSED: 00:00s";
        document.getElementById("hud-eta").textContent = "ETA: --:--s";
        document.getElementById("hud-bar-display").textContent = "[ .............................. ] 0.0%";
        document.getElementById("hud-log-line1").textContent = ">> [BOOT]: INITIALIZING PROTOCOL: " + taskName;
        document.getElementById("hud-log-line2").textContent = ">> [CORE]: ALLOCATING HEAP MEMORY FOR " + totalItems + " UNITS";
        document.getElementById("hud-log-line3").textContent = ">> [EXEC]: STREAMING UNIT #1...";
    }

    function hideHUD() {
        hudScreen.classList.remove("active");
        navTabsRow.style.display = "flex";
        // restore active tab
        var activeBtn = document.querySelector(".tab-button.active");
        if (activeBtn) {
            var targetId = activeBtn.getAttribute("data-tab");
            var page = document.getElementById(targetId);
            if (page) page.classList.add("active");
        }
        refreshStats();
    }

    // In-Panel Toast Notification (No blocking browser alerts)
    var toastTimer = null;
    function showToast(msg, type) {
        var toast = document.getElementById("panel-toast");
        if (!toast) return;
        toast.textContent = msg;
        toast.className = "panel-toast " + (type || "success");
        toast.style.display = "block";
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            toast.style.display = "none";
        }, 4000);
    }

    // ACTION: Relink
    btnRelinkMain.addEventListener("click", function () {
        var filePath = relinkPath.value.trim();
        if (!filePath) {
            showToast("Please click 'Browse...' to select your source PSD/Image file first.", "error");
            return;
        }

        var isSelectedOnly = rbRelinkSel.checked;
        var preserveClip = chkPreserveClip.checked;
        var preserveDim = chkPreserveDim.checked;

        var params = {
            filePath: filePath,
            selectedOnly: isSelectedOnly,
            preserveClip: preserveClip,
            preserveDim: preserveDim
        };

        var count = isSelectedOnly ? currentStats.selEmbedded : currentStats.totalEmbedded;
        showHUD("RELINK EMBEDDED RASTERS", count);

        csInterface.evalScript("VectorToolkitHost.executeRelink('" + JSON.stringify(params).replace(/'/g, "\\'") + "');", function (res) {
            hideHUD();
            try {
                var data = JSON.parse(res);
                if (data.success) {
                    showToast("Relink Completed: " + data.successCount + " raster(s) relinked successfully.", "success");
                    refreshStats();
                } else {
                    showToast("Notice: " + (data.message || "Relink failed."), "error");
                }
            } catch (e) {
                showToast("Result: " + res, "error");
            }
        });
    });

    // ACTION: Fast Embed
    btnEmbedMain.addEventListener("click", function () {
        var isSelectedOnly = rbEmbedSel.checked;
        showHUD("FAST BATCH EMBED", 10);
        csInterface.evalScript("VectorToolkitHost.executeFastEmbed(" + isSelectedOnly + ");", function (res) {
            hideHUD();
            try {
                var data = JSON.parse(res);
                if (data.success) {
                    showToast("Batch Embed Completed: " + data.embeddedCount + " linked file(s) embedded.", "success");
                    refreshStats();
                } else {
                    showToast("Notice: " + (data.message || "No linked files found to embed."), "error");
                }
            } catch (e) {
                showToast("Result: " + res, "error");
            }
        });
    });

    // ACTION: Batch Rasterize
    btnRasterizeMain.addEventListener("click", function () {
        var scope = "sample";
        if (rbRastSel.checked) scope = "selected";
        else if (rbRastAll.checked) scope = "all";

        var ppiVal = rastPpi.value;
        if (ppiVal === "custom" && rastCustomPpi) {
            ppiVal = rastCustomPpi.value || "300";
        }

        var params = {
            scope: scope,
            ppi: ppiVal,
            colorModel: rastColor.value,
            transparent: rastTransparent.checked,
            antiAliasing: rastAa.value
        };

        showHUD("BATCH RASTERIZE PRINT", 10);
        csInterface.evalScript("VectorToolkitHost.executeBatchRasterize('" + JSON.stringify(params).replace(/'/g, "\\'") + "');", function (res) {
            hideHUD();
            try {
                var data = JSON.parse(res);
                if (data.success) {
                    showToast("Rasterize Completed: " + data.rasterizedCount + " design(s) rasterized successfully.", "success");
                    refreshStats();
                } else {
                    showToast("Notice: " + (data.message || "Rasterize failed."), "error");
                }
            } catch (e) {
                showToast("Result: " + res, "error");
            }
        });
    });

    // ACTION: Word Cloud
    btnWordCloudMain.addEventListener("click", function () {
        var params = {
            splitMode: parseInt(wcSplit.value, 10),
            textCase: parseInt(wcCase.value, 10),
            mixFontWeights: wcMixWeights.checked,
            tracking: parseInt(wcTracking.value, 10),
            aspectRatio: parseFloat(wcAspect.value) || 0.7,
            padding: parseFloat(wcPadding.value) || 3,
            minSize: parseFloat(wcMinSz.value) || 14,
            maxSize: parseFloat(wcMaxSz.value) || 58,
            sizeDist: parseInt(wcHierarchy.value, 10),
            rotationMode: parseInt(wcRot.value, 10),
            verticalProb: (parseFloat(wcVertPct.value) || 30) / 100,
            palette: parseInt(wcPalette.value, 10),
            mode: "cloud"
        };

        showHUD("TYPOGRAPHY WORD CLOUD", 25);
        csInterface.evalScript("VectorToolkitHost.executeWordCloud('" + JSON.stringify(params).replace(/'/g, "\\'") + "');", function (res) {
            hideHUD();
            try {
                var data = JSON.parse(res);
                if (data.success) {
                    showToast("Typography Poster Generated: " + data.itemCount + " item(s) arranged.", "success");
                } else {
                    showToast("Notice: " + (data.message || "Word Cloud failed."), "error");
                }
            } catch (e) {
                showToast("Result: " + res, "error");
            }
        });
    });

    // ACTION: Auto-Align to Artboards
    var btnAutoalignMain = document.getElementById("btn-autoalign-main");
    var chkAutoalignEmbed = document.getElementById("chk-autoalign-embed");
    if (btnAutoalignMain) {
        btnAutoalignMain.addEventListener("click", function () {
            var autoEmbed = chkAutoalignEmbed ? chkAutoalignEmbed.checked : true;
            showHUD("SMART ARTBOARD AUTO-ALIGN", 10);
            csInterface.evalScript("VectorToolkitHost.executeAutoAlign(" + autoEmbed + ");", function (res) {
                hideHUD();
                try {
                    var data = JSON.parse(res);
                    if (data.success) {
                        showToast("Auto-Align Complete: " + data.alignedCount + " image(s) fitted into " + data.artboardCount + " artboard(s).", "success");
                        refreshStats();
                    } else {
                        showToast("Notice: " + (data.message || "Auto-Align failed."), "error");
                    }
                } catch (e) {
                    showToast("Result: " + res, "error");
                }
            });
        });
    }

    // ACTION: Clone Artboard
    var btnCloneabMain = document.getElementById("btn-cloneab-main");
    var txtCloneGap = document.getElementById("txt-clone-gap");
    var txtCloneCopies = document.getElementById("txt-clone-copies");
    if (btnCloneabMain) {
        btnCloneabMain.addEventListener("click", function () {
            var gap = parseFloat(txtCloneGap ? txtCloneGap.value : 50) || 50;
            var copies = parseInt(txtCloneCopies ? txtCloneCopies.value : 1, 10) || 1;

            var params = { gap: gap, copies: copies };
            showHUD("CLONE ARTBOARD & CONTENT", copies);
            csInterface.evalScript("VectorToolkitHost.executeDuplicateArtboard('" + JSON.stringify(params).replace(/'/g, "\\'") + "');", function (res) {
                hideHUD();
                try {
                    var data = JSON.parse(res);
                    if (data.success) {
                        showToast("Artboard Cloned: " + data.duplicatedCount + " copy created. Total: " + data.totalArtboards, "success");
                        refreshStats();
                    } else {
                        showToast("Notice: " + (data.message || "Clone failed."), "error");
                    }
                } catch (e) {
                    showToast("Result: " + res, "error");
                }
            });
        });
    }

    // ACTION: Keyring & Quantity Counter
    var btnKeyringMain = document.getElementById("btn-keyring-main");
    var txtKeyringLimit = document.getElementById("txt-keyring-limit");
    var keyringResultsBox = document.getElementById("keyring-results-box");
    var keyringSummaryTxt = document.getElementById("keyring-summary-txt");
    var keyringBreakdownList = document.getElementById("keyring-breakdown-list");
    if (btnKeyringMain) {
        btnKeyringMain.addEventListener("click", function () {
            var limit = parseFloat(txtKeyringLimit ? txtKeyringLimit.value : 500) || 500;
            csInterface.evalScript("VectorToolkitHost.executeKeyringCounter(" + limit + ");", function (res) {
                try {
                    var data = JSON.parse(res);
                    if (data.success) {
                        if (keyringResultsBox) keyringResultsBox.style.display = "block";
                        if (keyringSummaryTxt) {
                            keyringSummaryTxt.innerHTML = "Total Items: <b>" + data.totalItems + "</b> &nbsp;|&nbsp; TOTAL SUM: <b style='color:#00ff66;'>" + data.totalSum + "</b>" + (data.ignoredCount > 0 ? " <span style='color:#888;'>(Ignored " + data.ignoredCount + " > " + limit + ")</span>" : "");
                        }
                        if (keyringBreakdownList) {
                            var html = "";
                            for (var b = 0; b < data.breakdown.length; b++) {
                                var item = data.breakdown[b];
                                html += "<div style='display:flex; justify-content:space-between; padding:2px 0; border-bottom:1px solid #282828;'><span>Amount <b>" + item.amount + "</b></span><span style='color:#00e5ff;'>" + item.pcs + " pcs</span></div>";
                            }
                            keyringBreakdownList.innerHTML = html;
                        }
                        showToast("Calculation complete: " + data.totalItems + " item(s) counted.", "success");
                    } else {
                        showToast("Notice: " + (data.message || "No valid numbers found."), "error");
                    }
                } catch (e) {
                    showToast("Result: " + res, "error");
                }
            });
        });
    }

    // Author GitHub Link
    var btnAuthorLink = document.getElementById("btn-author-link");
    if (btnAuthorLink) {
        btnAuthorLink.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            var url = "https://github.com/yahiabinzaman";
            // 1. CEP API
            try {
                if (window.__adobe_cep__) {
                    window.__adobe_cep__.openURLInDefaultBrowser(url);
                }
            } catch (err1) {}
            // 2. Node child_process
            try {
                if (typeof require === "function") {
                    var cp = require('child_process');
                    if (process.platform === 'darwin') {
                        cp.exec('open "' + url + '"');
                    } else {
                        cp.exec('start "" "' + url + '"');
                    }
                }
            } catch (err2) {}
            // 3. ExtendScript host
            try {
                csInterface.evalScript('openWebUrl("' + url + '");');
            } catch (err3) {}
            // 4. Window open
            try {
                window.open(url, "_blank");
            } catch (err4) {}
        });
    }

    // Initial Load & Auto Refresh
    refreshStats();
    window.addEventListener("focus", refreshStats);
    document.addEventListener("mouseenter", refreshStats);
    setInterval(refreshStats, 2500);

    // ==========================================
    // TAB 8: BIJOY TO UNICODE BANGLA BOOK CONVERTER
    // ==========================================
        // Version button selectors
    var versionButtons = document.querySelectorAll(".btn-ansi-version");
    var hiddenVersionInput = document.getElementById("selected-bijoy-version");
    var versionModeTitle = document.getElementById("version-mode-title");
    var versionModeSub = document.getElementById("version-mode-sub");

    var versionDescriptions = {
        "auto": { title: "Auto-Detect", sub: "(Tests V1, V2 & V3 dynamically for cleanest output)" },
        "v1": { title: "ANSI V1", sub: "(Bijoy Classic / SutonnyMJ Older)" },
        "v2": { title: "ANSI V2", sub: "(Bijoy Bayanno / SutonnyMJ Newer)" },
        "v3": { title: "ANSI V3", sub: "(Okkhor / Lipighor ANSI V3)" }
    };

    if (versionButtons && versionButtons.length > 0) {
        versionButtons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                versionButtons.forEach(function (b) {
                    b.classList.remove("active");
                    b.style.background = "#282828";
                    b.style.borderColor = "#444444";
                    b.style.color = "#bbbbbb";
                });
                btn.classList.add("active");
                btn.style.background = "#ff4500";
                btn.style.borderColor = "#ff4500";
                btn.style.color = "#ffffff";

                var v = btn.getAttribute("data-version") || "auto";
                if (hiddenVersionInput) hiddenVersionInput.value = v;

                if (versionModeTitle && versionModeSub && versionDescriptions[v]) {
                    versionModeTitle.innerText = versionDescriptions[v].title;
                    versionModeSub.innerText = versionDescriptions[v].sub;
                }
            });
        });
    }

    var btnBijoyConvert = document.getElementById("btn-bijoy-convert");
    var rbBijoyAll = document.getElementById("rb-bijoy-all");
    var rbBijoySel = document.getElementById("rb-bijoy-sel");
    var bijoyFontSelect = document.getElementById("bijoy-font-select");
    var bijoyVersionSelect = document.getElementById("bijoy-version-select");
    var chkBijoyKars = document.getElementById("chk-bijoy-kars");
    var chkBijoyUnlock = document.getElementById("chk-bijoy-unlock");
    var bijoyStatusBox = document.getElementById("bijoy-status-box");
    var bijoyStatusHeading = document.getElementById("bijoy-status-heading");
    var bijoyStatusDetails = document.getElementById("bijoy-status-details");

    if (btnBijoyConvert) {
        btnBijoyConvert.addEventListener("click", function () {
            var scope = (rbBijoyAll && rbBijoyAll.checked) ? "all" : "selected";
            var fontVal = bijoyFontSelect ? bijoyFontSelect.value : "Bornomala-Regular";
            var fixKars = chkBijoyKars ? chkBijoyKars.checked : true;
            var unlockLayers = chkBijoyUnlock ? chkBijoyUnlock.checked : true;

            btnBijoyConvert.disabled = true;
            btnBijoyConvert.innerText = "Converting 400+ Pages...";

            if (bijoyStatusBox) {
                bijoyStatusBox.style.display = "none";
            }

            var versionVal = hiddenVersionInput ? hiddenVersionInput.value : "auto";
            var config = {
                scope: scope,
                targetFont: fontVal,
                engineVersion: versionVal,
                fixKars: fixKars,
                unlockLayers: unlockLayers
            };

            csInterface.evalScript("VectorToolkitHost.convertBijoyToUnicode(" + JSON.stringify(JSON.stringify(config)) + ")", function (res) {
                btnBijoyConvert.disabled = false;
                btnBijoyConvert.innerText = "Convert Bijoy to Unicode & Apply Font";

                try {
                    var data = JSON.parse(res);
                    if (data.success) {
                        var appliedFont = data.fontApplied || fontVal;
                        if (fontVal === "keep") appliedFont = "Current Font (No Change)";

                        if (bijoyStatusBox && bijoyStatusHeading && bijoyStatusDetails) {
                            bijoyStatusBox.style.display = "block";
                            bijoyStatusHeading.innerText = "Conversion Complete";
                            bijoyStatusDetails.innerHTML = "Converted: " + data.count + " of " + data.total + " text frames<br>" +
                                "Target Font: " + appliedFont + "<br>" +
                                "Pre-kars & Conjuncts: Verified & Aligned<br>" +
                                "Special thanks to the legend <a href=\"#\" onclick=\"openAuthorProfile(event); return false;\" style=\"color: #4a90e2; text-decoration: underline; cursor: pointer; font-weight: 600;\">Yahia Bin Zaman</a>";

                            var creditLink = document.getElementById("credit-author-link");
                            if (creditLink) {
                                creditLink.onclick = function (e) {
                                    if (e && e.preventDefault) e.preventDefault();
                                    if (window.__adobe_cep__) {
                                        window.__adobe_cep__.openURLInDefaultBrowser("https://github.com/yahiabinzaman");
                                    } else {
                                        window.open("https://github.com/yahiabinzaman", "_blank");
                                    }
                                    return false;
                                };
                            }
                        }
                    } else {
                        if (bijoyStatusBox && bijoyStatusHeading && bijoyStatusDetails) {
                            bijoyStatusBox.style.display = "block";
                            bijoyStatusHeading.innerText = "Notice";
                            bijoyStatusDetails.innerText = data.error || "No text frames found to convert.";
                        }
                    }
                } catch (e) {
                    if (bijoyStatusBox && bijoyStatusHeading && bijoyStatusDetails) {
                        bijoyStatusBox.style.display = "block";
                        bijoyStatusHeading.innerText = "Status";
                        bijoyStatusDetails.innerText = "Conversion finished: " + res;
                    }
                }
            });
        });
    }


    // ==========================================
    // TAB 9: PAGE NUMBERS PRO (001, 002...)
    // ==========================================
    var rbPageNumInsert = document.getElementById("rb-pagenum-insert");
    var rbPageNumReplace = document.getElementById("rb-pagenum-replace");
    var grpPageNumFind = document.getElementById("grp-pagenum-find");
    var rowPageNumMargin = document.getElementById("row-pagenum-margin");
    var panelPageNumPos = document.getElementById("panel-pagenum-pos");
    var txtPageNumFind = document.getElementById("pagenum-find-text");
    var txtPageNumStart = document.getElementById("pagenum-start");
    var txtPageNumMargin = document.getElementById("pagenum-margin");
    var txtPageNumTemplate = document.getElementById("pagenum-template");
    var btnPageNumApply = document.getElementById("btn-pagenum-apply");
    var pagenumStatusBox = document.getElementById("pagenum-status-box");
    var pagenumStatusHeading = document.getElementById("pagenum-status-heading");
    var pagenumStatusDetails = document.getElementById("pagenum-status-details");

    if (rbPageNumInsert && rbPageNumReplace) {
        rbPageNumInsert.addEventListener("change", function () {
            if (rbPageNumInsert.checked) {
                if (grpPageNumFind) grpPageNumFind.style.display = "none";
                if (rowPageNumMargin) rowPageNumMargin.style.display = "flex";
                if (panelPageNumPos) panelPageNumPos.style.display = "block";
            }
        });

        rbPageNumReplace.addEventListener("change", function () {
            if (rbPageNumReplace.checked) {
                if (grpPageNumFind) grpPageNumFind.style.display = "flex";
                if (rowPageNumMargin) rowPageNumMargin.style.display = "none";
                if (panelPageNumPos) panelPageNumPos.style.display = "none";
            }
        });
    }

    // Quick Insert Buttons
    function appendPageToken(token) {
        if (txtPageNumTemplate) {
            txtPageNumTemplate.value = txtPageNumTemplate.value + token;
        }
    }

    var token001 = document.getElementById("btn-token-001");
    var token01 = document.getElementById("btn-token-01");
    var tokenPage = document.getElementById("btn-token-page");
    var tokenPages = document.getElementById("btn-token-pages");
    var tokenDate = document.getElementById("btn-token-date");
    var tokenTime = document.getElementById("btn-token-time");
    var tokenFile = document.getElementById("btn-token-file");
    var tokenClear = document.getElementById("btn-token-clear");

    if (token001) token001.addEventListener("click", function() { appendPageToken("*00p*"); });
    if (token01) token01.addEventListener("click", function() { appendPageToken("*0p*"); });
    if (tokenPage) tokenPage.addEventListener("click", function() { appendPageToken("*page*"); });
    if (tokenPages) tokenPages.addEventListener("click", function() { appendPageToken("*pages*"); });
    if (tokenDate) tokenDate.addEventListener("click", function() { appendPageToken("*date*"); });
    if (tokenTime) tokenTime.addEventListener("click", function() { appendPageToken("*time*"); });
    if (tokenFile) tokenFile.addEventListener("click", function() { appendPageToken("*file*"); });
    if (tokenClear) tokenClear.addEventListener("click", function() { if (txtPageNumTemplate) txtPageNumTemplate.value = ""; });

    if (btnPageNumApply) {
        btnPageNumApply.addEventListener("click", function () {
            var mode = (rbPageNumReplace && rbPageNumReplace.checked) ? "replace" : "insert";
            var findVal = txtPageNumFind ? txtPageNumFind.value : "000";
            var startVal = txtPageNumStart ? txtPageNumStart.value : "1";
            var marginVal = txtPageNumMargin ? txtPageNumMargin.value : "0.25";
            var templateVal = (txtPageNumTemplate && txtPageNumTemplate.value.trim() !== "") ? txtPageNumTemplate.value : "*00p*";

            var vPosElem = document.querySelector('input[name="pagenum-vpos"]:checked');
            var hPosElem = document.querySelector('input[name="pagenum-hpos"]:checked');
            var vPos = vPosElem ? vPosElem.value : "bottom";
            var hPos = hPosElem ? hPosElem.value : "right";

            var config = {
                mode: mode,
                findText: findVal,
                startNum: startVal,
                margin: marginVal,
                vPos: vPos,
                hPos: hPos,
                template: templateVal
            };

            btnPageNumApply.disabled = true;
            btnPageNumApply.innerText = "Applying Page Numbers...";

            if (pagenumStatusBox) pagenumStatusBox.style.display = "none";

            csInterface.evalScript("VectorToolkitHost.executePageNumbers(" + JSON.stringify(JSON.stringify(config)) + ")", function (res) {
                btnPageNumApply.disabled = false;
                btnPageNumApply.innerText = "Apply Page Numbers (001, 002...)";

                try {
                    var data = JSON.parse(res);
                    if (data.success) {
                        if (pagenumStatusBox && pagenumStatusHeading && pagenumStatusDetails) {
                            pagenumStatusBox.style.display = "block";
                            pagenumStatusHeading.innerText = "Page Numbers Applied Successfully!";
                            pagenumStatusDetails.innerHTML = "Processed: " + data.count + " of " + data.total + " artboards<br>" +
                                "Format: " + templateVal + " (Mode: " + data.mode + ")<br>" +
                                "<strong>Thanks to Legend Yahia Bin Zaman</strong>";
                        }
                        showToast("Page numbering complete! Thanks to Legend Yahia Bin Zaman", "success");
                    } else {
                        if (pagenumStatusBox && pagenumStatusHeading && pagenumStatusDetails) {
                            pagenumStatusBox.style.display = "block";
                            pagenumStatusHeading.innerText = "Notice";
                            pagenumStatusDetails.innerText = data.error || "Failed to process page numbers.";
                        }
                    }
                } catch (e) {
                    if (pagenumStatusBox && pagenumStatusHeading && pagenumStatusDetails) {
                        pagenumStatusBox.style.display = "block";
                        pagenumStatusHeading.innerText = "Status";
                        pagenumStatusDetails.innerText = "Result: " + res;
                    }
                }
            });
        });
    }

});
