//@target illustrator

/**
 * ============================================================================
 * VECTOR TOOLKIT PRO - HYPER EDITION
 * - Tab 1: One-Click Relink Embedded Rasters to PSD / External File
 * - Tab 2: High-Speed Batch Embed (Optimized Duplicate Engine)
 * - Tab 3: Batch Rasterize for Print (Clipping Mask Optimized & RAM Safe)
 * - Hyper-Futuristic Real-Time Animated Cyberpunk HUD with Live ETA & Speed Matrix
 * - Developed with Special Thanks to: Yahia Bin Zaman
 * ============================================================================
 */

(function () {
    if (app.documents.length === 0) {
        alert("No active document found!\nPlease open an Illustrator document first.");
        return;
    }

    var doc = app.activeDocument;

    // Helper: Open URL in default browser (Cross-platform)
    function openWebUrl(url) {
        try {
            var isMac = (File.fs === "Macintosh" || (typeof $.os !== "undefined" && $.os.indexOf("Mac") !== -1));
            if (isMac) {
                var openedMac = false;
                try {
                    if (typeof app.system === "function") {
                        app.system('/usr/bin/open "' + url + '"');
                        openedMac = true;
                    }
                } catch (err1) {}

                if (!openedMac) {
                    try {
                        var webloc = new File(Folder.temp.fsName + "/open_profile.webloc");
                        webloc.open("w");
                        webloc.write('<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n<dict>\n\t<key>URL</key>\n\t<string>' + url + '</string>\n</dict>\n</plist>');
                        webloc.close();
                        webloc.execute();
                    } catch (err2) {}
                }
            } else {
                var openedWin = false;
                try {
                    if (typeof app.system === "function") {
                        app.system('cmd.exe /c start "" "' + url + '"');
                        openedWin = true;
                    }
                } catch (wErr) {}

                if (!openedWin) {
                    try {
                        var urlFile = new File(Folder.temp.fsName + "/open_profile.url");
                        urlFile.open("w");
                        urlFile.write('[InternetShortcut]\r\nURL=' + url + '\r\n');
                        urlFile.close();
                        urlFile.execute();
                    } catch (wErr2) {}
                }
            }
        } catch (e) {}
    }

    // Helper: Convert points to mm
    function ptToMm(pt) {
        return (pt * 0.352778).toFixed(1);
    }

    // Helper: Format seconds to mm:ss
    function formatTime(seconds) {
        var m = Math.floor(seconds / 60);
        var s = Math.floor(seconds % 60);
        return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s + "s";
    }

    // Helper: Collect designs matching sample size across all layers
    function findMatchingDesigns(sampleW, sampleH) {
        var results = [];
        if (!sampleW || !sampleH || sampleW <= 0 || sampleH <= 0) return results;

        var tolW = Math.max(sampleW * 0.12, 10);
        var tolH = Math.max(sampleH * 0.12, 10);

        function isSizeMatch(item) {
            try {
                if (item.locked || item.hidden || item.guides) return false;
                var w = Math.abs(item.width);
                var h = Math.abs(item.height);
                return (Math.abs(w - sampleW) <= tolW && Math.abs(h - sampleH) <= tolH);
            } catch (e) {
                return false;
            }
        }

        for (var l = 0; l < doc.layers.length; l++) {
            var layer = doc.layers[l];
            if (layer.locked || !layer.visible) continue;

            for (var p = 0; p < layer.pageItems.length; p++) {
                var pItem = layer.pageItems[p];
                if (isSizeMatch(pItem)) {
                    results.push(pItem);
                }
            }
        }

        if (results.length === 0) {
            for (var g = 0; g < doc.groupItems.length; g++) {
                var grp = doc.groupItems[g];
                if (isSizeMatch(grp)) {
                    results.push(grp);
                }
            }
        }

        return results;
    }

    // Helper: Count stats & sample info
    function getDocStats() {
        var embeddedCount = doc.rasterItems.length;
        var linkedCount = doc.placedItems.length;

        var selEmbedded = 0;
        var selLinked = 0;
        var selItemsCount = 0;
        var sampleWidth = 0;
        var sampleHeight = 0;
        var matchedSampleCount = 0;

        if (doc.selection && doc.selection.length > 0) {
            selItemsCount = doc.selection.length;
            try {
                sampleWidth = Math.abs(doc.selection[0].width);
                sampleHeight = Math.abs(doc.selection[0].height);
            } catch (e) {}

            function countInItems(items) {
                for (var i = 0; i < items.length; i++) {
                    try {
                        if (items[i].typename === "RasterItem") selEmbedded++;
                        else if (items[i].typename === "PlacedItem") selLinked++;
                        else if (items[i].typename === "GroupItem") countInItems(items[i].pageItems);
                    } catch (e) {}
                }
            }
            countInItems(doc.selection);

            if (sampleWidth > 0 && sampleHeight > 0) {
                var matched = findMatchingDesigns(sampleWidth, sampleHeight);
                matchedSampleCount = matched.length;
            }
        }

        var totalTopItems = doc.pageItems.length;
        var totalGroups = doc.groupItems.length;
        var selTextFramesList = (doc.selection && doc.selection.length > 0) ? extractTextFrames(doc.selection) : [];
        var selTextCount = selTextFramesList.length;

        return {
            totalEmbedded: embeddedCount,
            totalLinked: linkedCount,
            totalTopItems: totalTopItems,
            totalGroups: totalGroups,
            selEmbedded: selEmbedded,
            selLinked: selLinked,
            selItemsCount: selItemsCount,
            selTextCount: selTextCount,
            selTextFramesList: selTextFramesList,
            sampleWidth: sampleWidth,
            sampleHeight: sampleHeight,
            matchedSampleCount: matchedSampleCount,
            hasSelection: (doc.selection && doc.selection.length > 0)
        };
    }

    // Helper: Extract TextFrames from items (including groups)
    function extractTextFrames(items) {
        var frames = [];
        if (!items) return frames;
        for (var i = 0; i < items.length; i++) {
            var itm = items[i];
            if (itm.typename === "TextFrame") {
                frames.push(itm);
            } else if (itm.typename === "GroupItem") {
                for (var j = 0; j < itm.pageItems.length; j++) {
                    if (itm.pageItems[j].typename === "TextFrame") {
                        frames.push(itm.pageItems[j]);
                    }
                }
            }
        }
        return frames;
    }

    // Find all variants in the same font family
    function getFamilyFontVariants(baseFont) {
        var variants = {
            allList: [],
            boldList: [],
            regularList: []
        };

        if (!baseFont) return variants;

        var familyName = baseFont.family;
        var totalFonts = app.textFonts.length;

        for (var i = 0; i < totalFonts; i++) {
            var f = app.textFonts[i];
            if (f.family === familyName) {
                variants.allList.push(f);
                var style = (f.style || "").toLowerCase();

                if (style.indexOf("bold") !== -1 || style.indexOf("black") !== -1 || 
                    style.indexOf("heavy") !== -1 || style.indexOf("semibold") !== -1 || 
                    style.indexOf("medium") !== -1 || style.indexOf("extrabold") !== -1) {
                    variants.boldList.push(f);
                } else {
                    variants.regularList.push(f);
                }
            }
        }

        if (variants.boldList.length === 0) variants.boldList = variants.allList.slice();
        if (variants.regularList.length === 0) variants.regularList = variants.allList.slice();
        if (variants.allList.length === 0) variants.allList = [baseFont];

        return variants;
    }

    function getFrameFont(tf) {
        try {
            return tf.textRange.characterAttributes.textFont;
        } catch (e) {
            return null;
        }
    }

    function applyFont(tf, font) {
        if (!font) return;
        try {
            tf.textRange.characterAttributes.textFont = font;
        } catch (e) {}
    }

    function applyTracking(frames, trackingVal) {
        for (var i = 0; i < frames.length; i++) {
            try {
                frames[i].textRange.characterAttributes.tracking = trackingVal;
            } catch (e) {}
        }
    }

    var stats = getDocStats();

    // Detect base font from selection
    var sampleBaseFont = null;
    if (stats.selTextFramesList.length > 0) {
        sampleBaseFont = getFrameFont(stats.selTextFramesList[0]);
    }
    var fontVariants = getFamilyFontVariants(sampleBaseFont);

    // ─────────────────────────────────────────────────────────────
    // MAIN SCRIPTUI DIALOG (COMPACT & 100% CLOSABLE)
    // ─────────────────────────────────────────────────────────────
    var win = new Window("dialog", "Vector Toolkit Pro // Hyper Edition");
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 8;
    win.margins = 12;
    win.preferredSize.width = 540;

    // Header Banner with Top-Right Close Button
    var headerPnl = win.add("panel", undefined, undefined, { borderStyle: "sunken" });
    headerPnl.orientation = "column";
    headerPnl.alignChildren = ["fill", "center"];
    headerPnl.margins = [12, 8, 12, 8];
    headerPnl.spacing = 3;

    var topTitleRow = headerPnl.add("group");
    topTitleRow.orientation = "row";
    topTitleRow.alignChildren = ["fill", "center"];

    var titleTxt = topTitleRow.add("statictext", undefined, "VECTOR TOOLKIT PRO // ALL-IN-ONE HYPER SUITE");
    titleTxt.graphics.font = ScriptUI.newFont("Helvetica", "BOLD", 13);
    titleTxt.preferredSize.width = 410;

    var btnCloseTop = topTitleRow.add("button", undefined, "X", { name: "cancel" });
    btnCloseTop.preferredSize.width = 30;
    btnCloseTop.preferredSize.height = 24;
    btnCloseTop.helpTip = "Close this toolkit panel";
    btnCloseTop.onClick = function () {
        win.close();
    };

    var fileInfo = headerPnl.add("statictext", undefined, "Document: " + doc.name);
    fileInfo.graphics.font = ScriptUI.newFont("Helvetica", "REGULAR", 11);

    var statText = headerPnl.add(
        "statictext",
        undefined,
        "Total: " + stats.totalEmbedded + " Embedded Raster(s)  |  " + stats.totalLinked + " Linked  |  " + stats.totalGroups + " Group(s)" +
        (stats.selTextCount > 0 ? "  |  " + stats.selTextCount + " Text Object(s)" : "")
    );
    statText.graphics.font = ScriptUI.newFont("Helvetica", "BOLD", 11);

    // ── NAVIGATION BAR (4 TABS) ──────────────────────────────────
    var navGrp = win.add("group");
    navGrp.orientation = "row";
    navGrp.alignChildren = ["fill", "center"];
    navGrp.spacing = 5;

    var btnTab1 = navGrp.add("button", undefined, "Relink Rasters");
    var btnTab2 = navGrp.add("button", undefined, "Fast Embed");
    var btnTab3 = navGrp.add("button", undefined, "Batch Rasterize");
    var btnTab4 = navGrp.add("button", undefined, "Typography Cloud");

    btnTab1.preferredSize.height = 26;
    btnTab2.preferredSize.height = 26;
    btnTab3.preferredSize.height = 26;
    btnTab4.preferredSize.height = 26;

    // ── CONTAINER FOR THE PANELS ────────────────────────────────
    var contentStack = win.add("group");
    contentStack.orientation = "stack";
    contentStack.alignChildren = ["fill", "top"];

    // ── PANEL 1: RELINK EMBEDDED TO FILE ────────────────────────
    var pnlRelink = contentStack.add("panel", undefined, "Relink Embedded Rasters");
    pnlRelink.orientation = "column";
    pnlRelink.alignChildren = ["fill", "top"];
    pnlRelink.spacing = 10;
    pnlRelink.margins = 14;

    var relinkDesc = pnlRelink.add("statictext", undefined, "Batch replace embedded background rasters with an external linked file:");
    relinkDesc.graphics.font = ScriptUI.newFont("Helvetica", "REGULAR", 11);

    var filePnl = pnlRelink.add("panel", undefined, "Source File (PSD / Image):");
    filePnl.orientation = "row";
    filePnl.alignChildren = ["fill", "center"];
    filePnl.margins = [10, 12, 10, 10];
    filePnl.spacing = 8;

    var pathInput = filePnl.add("edittext", undefined, "");
    pathInput.preferredSize.width = 290;
    pathInput.helpTip = "Path to your source background PSD / Image file";

    var browseBtn = filePnl.add("button", undefined, "Browse...");
    browseBtn.preferredSize.width = 80;

    var targetPsdFile = null;

    browseBtn.onClick = function () {
        var f = File.openDialog(
            "Select Background PSD or Image File:",
            function (item) {
                if (item instanceof Folder) return true;
                var ext = item.name.substring(item.name.lastIndexOf(".")).toLowerCase();
                return (ext === ".psd" || ext === ".psb" || ext === ".tif" || ext === ".tiff" || ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".ai" || ext === ".pdf");
            }
        );
        if (f) {
            var ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
            if (ext === ".jsx" || ext === ".js") {
                alert("Invalid File Selected!\nYou selected a script file (.jsx). Please select a valid PSD or image file.");
                return;
            }
            targetPsdFile = f;
            pathInput.text = f.fsName;
        }
    };

    var scopePnl1 = pnlRelink.add("panel", undefined, "Target Scope:");
    scopePnl1.orientation = "row";
    scopePnl1.alignChildren = ["left", "center"];
    scopePnl1.margins = [10, 10, 10, 10];
    scopePnl1.spacing = 15;

    var rbAllEmbedded = scopePnl1.add("radiobutton", undefined, "All Embedded Rasters (" + stats.totalEmbedded + ")");
    var rbSelEmbedded = scopePnl1.add("radiobutton", undefined, "Selected Items Only (" + stats.selEmbedded + ")");

    rbAllEmbedded.value = true;
    if (stats.selEmbedded === 0) {
        rbSelEmbedded.enabled = false;
    }

    var advPnl = pnlRelink.add("panel", undefined, "Options:");
    advPnl.orientation = "column";
    advPnl.alignChildren = ["left", "center"];
    advPnl.margins = [10, 10, 10, 8];
    advPnl.spacing = 6;

    var chkPreserveClip = advPnl.add("checkbox", undefined, "Preserve Clipping Masks & Stacking Order (Z-Index)");
    chkPreserveClip.value = true;

    var chkMatchDim = advPnl.add("checkbox", undefined, "Preserve Dimensions & Position (X, Y, Width, Height)");
    chkMatchDim.value = true;

    var btnExecuteRelink = pnlRelink.add("button", undefined, "Relink All " + stats.totalEmbedded + " Embedded Rasters", { name: "ok" });
    btnExecuteRelink.preferredSize.height = 34;
    btnExecuteRelink.graphics.font = ScriptUI.newFont("Helvetica", "BOLD", 12);

    function updateRelinkBtnText() {
        if (rbAllEmbedded.value) {
            btnExecuteRelink.text = "Relink All " + stats.totalEmbedded + " Embedded Rasters";
        } else {
            btnExecuteRelink.text = "Relink Selected " + stats.selEmbedded + " Raster(s)";
        }
    }

    rbAllEmbedded.onClick = updateRelinkBtnText;
    rbSelEmbedded.onClick = updateRelinkBtnText;

    // ── PANEL 2: HIGH-SPEED BATCH EMBED ALL ──────────────────────
    var pnlEmbed = contentStack.add("panel", undefined, "Fast Batch Embed");
    pnlEmbed.orientation = "column";
    pnlEmbed.alignChildren = ["fill", "top"];
    pnlEmbed.spacing = 12;
    pnlEmbed.margins = 14;

    var embedDesc = pnlEmbed.add("statictext", undefined, "High-Speed Embed Engine: Embeds placed assets instantly with zero UI lag:");
    embedDesc.graphics.font = ScriptUI.newFont("Helvetica", "REGULAR", 11);

    var scopePnl2 = pnlEmbed.add("panel", undefined, "Target Linked Items:");
    scopePnl2.orientation = "column";
    scopePnl2.alignChildren = ["left", "center"];
    scopePnl2.margins = [10, 12, 10, 10];
    scopePnl2.spacing = 8;

    var rbAllLinked = scopePnl2.add("radiobutton", undefined, "All Linked Files in Document (" + stats.totalLinked + " files)");
    var rbSelLinked = scopePnl2.add("radiobutton", undefined, "Selected Linked Items Only (" + stats.selLinked + " selected)");

    // Default to embedding ALL linked files in the document
    rbAllLinked.value = true;
    if (stats.selLinked === 0) {
        rbSelLinked.enabled = false;
    }

    var btnExecuteEmbed = pnlEmbed.add("button", undefined, "Embed All " + stats.totalLinked + " Linked Files (Fast Mode)");
    btnExecuteEmbed.preferredSize.height = 34;
    btnExecuteEmbed.graphics.font = ScriptUI.newFont("Helvetica", "BOLD", 12);

    function updateEmbedBtnText() {
        if (rbAllLinked.value) {
            btnExecuteEmbed.text = "Embed All " + stats.totalLinked + " Linked Files (Fast Mode)";
        } else {
            btnExecuteEmbed.text = "Embed Selected " + stats.selLinked + " Linked File(s)";
        }
    }

    rbAllLinked.onClick = updateEmbedBtnText;
    rbSelLinked.onClick = updateEmbedBtnText;

    // ── PANEL 3: BATCH RASTERIZE FOR PRINT PREP ──────────────────
    var pnlRasterize = contentStack.add("panel", undefined, "Batch Rasterize (Print Production)");
    pnlRasterize.orientation = "column";
    pnlRasterize.alignChildren = ["fill", "top"];
    pnlRasterize.spacing = 10;
    pnlRasterize.margins = 14;

    var rastDesc = pnlRasterize.add("statictext", undefined, "Ultra-fast rasterize vector designs individually for production print:");
    rastDesc.graphics.font = ScriptUI.newFont("Helvetica", "REGULAR", 11);

    var rastScopePnl = pnlRasterize.add("panel", undefined, "Target Designs to Rasterize:");
    rastScopePnl.orientation = "column";
    rastScopePnl.alignChildren = ["left", "center"];
    rastScopePnl.margins = [10, 10, 10, 10];
    rastScopePnl.spacing = 6;

    var sampleInfoLabel = "";
    if (stats.hasSelection && stats.sampleWidth > 0) {
        sampleInfoLabel = "Match Selected Sample Size (" + ptToMm(stats.sampleWidth) + " x " + ptToMm(stats.sampleHeight) + " mm)  [" + stats.matchedSampleCount + " designs found]";
    } else {
        sampleInfoLabel = "Match Selected Sample Size (Select 1 design sample first)";
    }

    var rbRastMatchSample = rastScopePnl.add("radiobutton", undefined, sampleInfoLabel);
    var rbRastSelectedOnly = rastScopePnl.add("radiobutton", undefined, "Each Selected Group / Object Individually (" + stats.selItemsCount + " selected)");
    var rbRastAllTopGroups = rastScopePnl.add("radiobutton", undefined, "All Top-Level Groups in Document (" + stats.totalGroups + " groups)");

    if (stats.hasSelection && stats.sampleWidth > 0 && stats.matchedSampleCount > 0) {
        rbRastMatchSample.value = true;
    } else if (stats.hasSelection && stats.selItemsCount > 0) {
        rbRastSelectedOnly.value = true;
    } else {
        rbRastAllTopGroups.value = true;
        rbRastMatchSample.enabled = false;
        rbRastSelectedOnly.enabled = false;
    }

    var rastSettingsPnl = pnlRasterize.add("panel", undefined, "Print Rasterization Settings:");
    rastSettingsPnl.orientation = "column";
    rastSettingsPnl.alignChildren = ["fill", "center"];
    rastSettingsPnl.margins = [10, 10, 10, 8];
    rastSettingsPnl.spacing = 8;

    var ppiRow = rastSettingsPnl.add("group");
    ppiRow.orientation = "row";
    ppiRow.alignChildren = ["left", "center"];
    ppiRow.spacing = 10;

    var ppiLbl = ppiRow.add("statictext", undefined, "Resolution (PPI):");
    ppiLbl.preferredSize.width = 110;
    ppiLbl.graphics.font = ScriptUI.newFont("Helvetica", "BOLD", 11);

    var ppiDropdown = ppiRow.add("dropdownlist", undefined, [
        "300 PPI [Turbo Speed - Industry Standard]",
        "450 PPI [High-Definition Print]",
        "600 PPI [Ultra Fine Micro-Detail]",
        "150 PPI [Fast Proofing Draft]",
        "Custom PPI"
    ]);
    ppiDropdown.selection = 0; // Default 300 PPI (Blazing fast, 0.1s per unit)
    ppiDropdown.preferredSize.width = 250;

    var customPpiInput = ppiRow.add("edittext", undefined, "300");
    customPpiInput.preferredSize.width = 50;
    customPpiInput.visible = false;

    ppiDropdown.onChange = function () {
        if (ppiDropdown.selection && ppiDropdown.selection.index === 4) {
            customPpiInput.visible = true;
        } else {
            customPpiInput.visible = false;
        }
        win.layout.layout(true);
    };

    var colorRow = rastSettingsPnl.add("group");
    colorRow.orientation = "row";
    colorRow.alignChildren = ["left", "center"];
    colorRow.spacing = 10;

    var colorLbl = colorRow.add("statictext", undefined, "Color Model:");
    colorLbl.preferredSize.width = 110;
    colorLbl.graphics.font = ScriptUI.newFont("Helvetica", "BOLD", 11);

    var colorDropdown = colorRow.add("dropdownlist", undefined, ["CMYK (Print Default)", "RGB", "Grayscale"]);
    colorDropdown.selection = 0;
    colorDropdown.preferredSize.width = 160;

    var chkTransparent = colorRow.add("checkbox", undefined, "Transparent Background");
    chkTransparent.value = true;

    var aaRow = rastSettingsPnl.add("group");
    aaRow.orientation = "row";
    aaRow.alignChildren = ["left", "center"];
    aaRow.spacing = 10;

    var aaLbl = aaRow.add("statictext", undefined, "Anti-aliasing:");
    aaLbl.preferredSize.width = 110;
    aaLbl.graphics.font = ScriptUI.newFont("Helvetica", "BOLD", 11);

    var aaDropdown = aaRow.add("dropdownlist", undefined, ["Art Optimized (Supersampling)", "Type Optimized (Hinted)", "None"]);
    aaDropdown.selection = 0;
    aaDropdown.preferredSize.width = 220;

    var btnExecuteRasterize = pnlRasterize.add("button", undefined, "Batch Rasterize All Matching Designs");
    btnExecuteRasterize.preferredSize.height = 34;
    btnExecuteRasterize.graphics.font = ScriptUI.newFont("Helvetica", "BOLD", 12);

    // ── PANEL 4: RANDOM WORD CLOUD & TYPOGRAPHY POSTER ENGINE ────
    var pnlWordCloud = contentStack.add("panel", undefined, "Typography Word Cloud Generator Pro");
    pnlWordCloud.orientation = "column";
    pnlWordCloud.alignChildren = ["fill", "top"];
    pnlWordCloud.spacing = 6;
    pnlWordCloud.margins = 10;

    var wcDesc = pnlWordCloud.add("statictext", undefined, "Generate tight, non-overlapping typography posters with 1-click presets & color palettes:");
    wcDesc.graphics.font = ScriptUI.newFont("Helvetica", "REGULAR", 10);

    // Master Preset Row
    var wcPresetPnl = pnlWordCloud.add("panel", undefined, "1-Click Master Style Presets:");
    wcPresetPnl.orientation = "row";
    wcPresetPnl.alignChildren = ["left", "center"];
    wcPresetPnl.margins = [8, 6, 8, 6];
    wcPresetPnl.spacing = 8;

    wcPresetPnl.add("statictext", undefined, "Preset:");
    var ddWcPreset = wcPresetPnl.add("dropdownlist", undefined, [
        "1. Swiss Modern Poster (Bold/Black, 0/90 deg, Monochrome)",
        "2. Cyberpunk Neon (0/90/-90 deg, Electric Neon Palette)",
        "3. Editorial Classic (0 deg Horizontal, Title Case, Elegant)",
        "4. Chaotic Typography Art (Free Angles 0/45/90/-45, Mixed)",
        "5. T-Shirt / Radial Cluster (Tight Circle, 3-Tier Hierarchy)",
        "6. Vintage Warm Poster (Warm Autumn Palette, 0/90 deg)",
        "7. Custom Settings"
    ]);
    ddWcPreset.selection = 0;
    ddWcPreset.preferredSize.width = 380;

    // Row 1: Split & Case
    var wcRow1 = pnlWordCloud.add("group");
    wcRow1.orientation = "row";
    wcRow1.alignChildren = ["left", "center"];
    wcRow1.spacing = 8;

    wcRow1.add("statictext", undefined, "Split Text:");
    var ddWcSplit = wcRow1.add("dropdownlist", undefined, [
        "Line by Line (Full Names)",
        "Individual Words",
        "Keep Frames As-Is"
    ]);
    ddWcSplit.selection = 0;
    ddWcSplit.preferredSize.width = 175;

    wcRow1.add("statictext", undefined, "Case:");
    var ddWcCase = wcRow1.add("dropdownlist", undefined, [
        "Keep Original",
        "lowercase",
        "Title Case",
        "UPPERCASE"
    ]);
    ddWcCase.selection = 3; // Default UPPERCASE for poster
    ddWcCase.preferredSize.width = 130;

    // Row 2: Font Mixing & Letter Tracking
    var wcRow2 = pnlWordCloud.add("group");
    wcRow2.orientation = "row";
    wcRow2.alignChildren = ["left", "center"];
    wcRow2.spacing = 8;

    var chkWcMixFonts = wcRow2.add("checkbox", undefined, "Mix Weights (Bold/Regular)");
    chkWcMixFonts.value = (fontVariants && fontVariants.allList.length > 1);

    wcRow2.add("statictext", undefined, "Tracking:");
    var ddWcTracking = wcRow2.add("dropdownlist", undefined, [
        "Tight Poster (-25)",
        "Ultra Tight (-50)",
        "Normal (0)",
        "Wide (+50)"
    ]);
    ddWcTracking.selection = 0;
    ddWcTracking.preferredSize.width = 140;

    // Row 3: Cluster Shape & Padding
    var wcRow3 = pnlWordCloud.add("group");
    wcRow3.orientation = "row";
    wcRow3.alignChildren = ["left", "center"];
    wcRow3.spacing = 8;

    wcRow3.add("statictext", undefined, "Cluster Shape:");
    var ddWcAspect = wcRow3.add("dropdownlist", undefined, [
        "Vertical Poster (0.7)",
        "Square / Circle (1.0)",
        "Wide Banner (1.6)",
        "Panoramic (2.2)"
    ]);
    ddWcAspect.selection = 0;
    ddWcAspect.preferredSize.width = 150;

    wcRow3.add("statictext", undefined, "Padding (pt):");
    var txtWcPadding = wcRow3.add("edittext", undefined, "3");
    txtWcPadding.characters = 3;

    var rbWcCloud = wcRow3.add("radiobutton", undefined, "Cloud Packing");
    var rbWcInPlace = wcRow3.add("radiobutton", undefined, "In-Place");
    rbWcCloud.value = true;

    // Row 4: Size Scale & Distribution
    var wcRow4 = pnlWordCloud.add("group");
    wcRow4.orientation = "row";
    wcRow4.alignChildren = ["left", "center"];
    wcRow4.spacing = 8;

    wcRow4.add("statictext", undefined, "Min (pt):");
    var txtWcMinSz = wcRow4.add("edittext", undefined, "14");
    txtWcMinSz.characters = 4;

    wcRow4.add("statictext", undefined, "Max (pt):");
    var txtWcMaxSz = wcRow4.add("edittext", undefined, "58");
    txtWcMaxSz.characters = 4;

    wcRow4.add("statictext", undefined, "Hierarchy:");
    var ddWcSizeDist = wcRow4.add("dropdownlist", undefined, [
        "Hero Hierarchy (Few Big, Many Small)",
        "Uniform Random",
        "3-Tier (Big/Med/Small)"
    ]);
    ddWcSizeDist.selection = 0;
    ddWcSizeDist.preferredSize.width = 200;

    // Row 5: Rotation & Angles
    var wcRow5 = pnlWordCloud.add("group");
    wcRow5.orientation = "row";
    wcRow5.alignChildren = ["left", "center"];
    wcRow5.spacing = 8;

    wcRow5.add("statictext", undefined, "Rotation:");
    var ddWcRotation = wcRow5.add("dropdownlist", undefined, [
        "Horizontal & Vertical (0, 90, -90 deg)",
        "Horizontal & 90 deg Up (0, 90 deg)",
        "Horizontal Only (0 deg)",
        "Free Angles (0, 45, 90, -45 deg)",
        "Random (0 - 360 deg)"
    ]);
    ddWcRotation.selection = 0;
    ddWcRotation.preferredSize.width = 230;

    wcRow5.add("statictext", undefined, "Vert %:");
    var txtWcVertPct = wcRow5.add("edittext", undefined, "30");
    txtWcVertPct.characters = 3;
    wcRow5.add("statictext", undefined, "%");

    // Row 6: Color Palette
    var wcRow6 = pnlWordCloud.add("group");
    wcRow6.orientation = "row";
    wcRow6.alignChildren = ["left", "center"];
    wcRow6.spacing = 8;

    wcRow6.add("statictext", undefined, "Color Palette:");
    var ddWcColorTheme = wcRow6.add("dropdownlist", undefined, [
        "1. Poster Monochrome (Black & Gray Shades)",
        "2. Cyberpunk Neon (Cyan, Magenta, Neon Yellow)",
        "3. Vintage Warm (Rust, Mustard, Terracotta, Forest)",
        "4. Nordic Ocean (Navy, Sky Blue, Teal)",
        "5. Luxury Gold & Slate (Gold, Bronze, Charcoal)",
        "6. Keep Current Document Swatches"
    ]);
    ddWcColorTheme.selection = 0;
    ddWcColorTheme.preferredSize.width = 340;

    // Preset Change Event
    ddWcPreset.onChange = function () {
        var idx = ddWcPreset.selection.index;
        if (idx === 0) {
            // Swiss Modern
            txtWcMinSz.text = "14"; txtWcMaxSz.text = "58";
            ddWcRotation.selection = 0; txtWcVertPct.text = "30";
            ddWcColorTheme.selection = 0; ddWcCase.selection = 3;
            ddWcAspect.selection = 0; ddWcTracking.selection = 0; txtWcPadding.text = "3";
        } else if (idx === 1) {
            // Cyberpunk Neon
            txtWcMinSz.text = "12"; txtWcMaxSz.text = "64";
            ddWcRotation.selection = 0; txtWcVertPct.text = "35";
            ddWcColorTheme.selection = 1; ddWcCase.selection = 3;
            ddWcAspect.selection = 1; ddWcTracking.selection = 1; txtWcPadding.text = "2";
        } else if (idx === 2) {
            // Editorial Classic
            txtWcMinSz.text = "16"; txtWcMaxSz.text = "48";
            ddWcRotation.selection = 2; txtWcVertPct.text = "0";
            ddWcColorTheme.selection = 0; ddWcCase.selection = 2;
            ddWcAspect.selection = 0; ddWcTracking.selection = 2; txtWcPadding.text = "4";
        } else if (idx === 3) {
            // Chaotic Art
            txtWcMinSz.text = "12"; txtWcMaxSz.text = "60";
            ddWcRotation.selection = 3; txtWcVertPct.text = "40";
            ddWcColorTheme.selection = 1; ddWcCase.selection = 0;
            ddWcAspect.selection = 1; ddWcTracking.selection = 0; txtWcPadding.text = "2";
        } else if (idx === 4) {
            // T-Shirt / Radial
            txtWcMinSz.text = "10"; txtWcMaxSz.text = "52";
            ddWcRotation.selection = 0; txtWcVertPct.text = "25";
            ddWcColorTheme.selection = 4; ddWcCase.selection = 3;
            ddWcAspect.selection = 1; ddWcTracking.selection = 0; txtWcPadding.text = "2";
        } else if (idx === 5) {
            // Vintage Warm
            txtWcMinSz.text = "14"; txtWcMaxSz.text = "54";
            ddWcRotation.selection = 0; txtWcVertPct.text = "30";
            ddWcColorTheme.selection = 2; ddWcCase.selection = 2;
            ddWcAspect.selection = 0; ddWcTracking.selection = 0; txtWcPadding.text = "3";
        }
    };

    var btnExecuteWordCloud = pnlWordCloud.add("button", undefined, "Generate Typography Word Cloud Poster");
    btnExecuteWordCloud.preferredSize.height = 32;
    btnExecuteWordCloud.graphics.font = ScriptUI.newFont("Helvetica", "BOLD", 12);

    // ── PANEL 5: PURE HACKER TERMINAL CONSOLE HUD (NO BLUE BAR) ──
    var pnlHUD = contentStack.add("panel", undefined, "TERMINAL CONSOLE // SYSTEM MATRIX LIVE");
    pnlHUD.orientation = "column";
    pnlHUD.alignChildren = ["fill", "top"];
    pnlHUD.spacing = 10;
    pnlHUD.margins = 16;
    pnlHUD.visible = false;

    var hudStatusTxt = pnlHUD.add("statictext", undefined, ">> ROOT@VECTOR-TOOLKIT:~# EXEC_PROTOCOL --LIVE-STREAM");
    hudStatusTxt.graphics.font = ScriptUI.newFont("Courier", "BOLD", 11);

    var hudTaskTxt = pnlHUD.add("statictext", undefined, "PROTOCOL: INITIALIZING...");
    hudTaskTxt.graphics.font = ScriptUI.newFont("Courier", "BOLD", 13);

    // Live Metrics Terminal Row 1
    var statPnl1 = pnlHUD.add("panel", undefined, "CORE METRICS");
    statPnl1.orientation = "row";
    statPnl1.alignChildren = ["fill", "center"];
    statPnl1.margins = [10, 8, 10, 8];
    statPnl1.spacing = 10;

    var lblProcessed = statPnl1.add("statictext", undefined, "PROCESSED: 0 / 0");
    lblProcessed.preferredSize.width = 140;
    lblProcessed.graphics.font = ScriptUI.newFont("Courier", "BOLD", 11);

    var lblRemaining = statPnl1.add("statictext", undefined, "REMAINING: 0");
    lblRemaining.preferredSize.width = 120;
    lblRemaining.graphics.font = ScriptUI.newFont("Courier", "BOLD", 11);

    var lblPercent = statPnl1.add("statictext", undefined, "[ 0.0% ]");
    lblPercent.preferredSize.width = 80;
    lblPercent.graphics.font = ScriptUI.newFont("Courier", "BOLD", 12);

    // Live Performance Terminal Row 2
    var statPnl2 = pnlHUD.add("panel", undefined, "TELEMETRY & SPEED");
    statPnl2.orientation = "row";
    statPnl2.alignChildren = ["fill", "center"];
    statPnl2.margins = [10, 8, 10, 8];
    statPnl2.spacing = 10;

    var lblSpeed = statPnl2.add("statictext", undefined, "SPEED: -- UNITS/S");
    lblSpeed.preferredSize.width = 140;
    lblSpeed.graphics.font = ScriptUI.newFont("Courier", "BOLD", 11);

    var lblElapsed = statPnl2.add("statictext", undefined, "ELAPSED: 00:00s");
    lblElapsed.preferredSize.width = 120;
    lblElapsed.graphics.font = ScriptUI.newFont("Courier", "BOLD", 11);

    var lblEta = statPnl2.add("statictext", undefined, "ETA: --:--s");
    lblEta.preferredSize.width = 90;
    lblEta.graphics.font = ScriptUI.newFont("Courier", "BOLD", 11);

    // Terminal Matrix ASCII Progress Display
    var termAsciiPnl = pnlHUD.add("panel", undefined, "TERMINAL MATRIX PROGRESS");
    termAsciiPnl.orientation = "column";
    termAsciiPnl.alignChildren = ["fill", "center"];
    termAsciiPnl.margins = [12, 10, 12, 10];
    termAsciiPnl.spacing = 4;

    var lblBarDisplay = termAsciiPnl.add("statictext", undefined, "[ .............................. ]  0.0%");
    lblBarDisplay.graphics.font = ScriptUI.newFont("Courier", "BOLD", 13);

    // Multi-line Rolling Terminal Feed
    var consoleFeedPnl = pnlHUD.add("panel", undefined, "CONSOLE OUTPUT FEED");
    consoleFeedPnl.orientation = "column";
    consoleFeedPnl.alignChildren = ["fill", "top"];
    consoleFeedPnl.margins = [10, 8, 10, 8];
    consoleFeedPnl.spacing = 2;

    var logLine1 = consoleFeedPnl.add("statictext", undefined, ">> [SYSTEM]: VECTOR HYPER ENGINE ONLINE // M4 ACCELERATION ACTIVE");
    logLine1.graphics.font = ScriptUI.newFont("Courier", "REGULAR", 10);

    var logLine2 = consoleFeedPnl.add("statictext", undefined, ">> [ALLOC]: CMYK COLOR MATRIX MOUNTED // READY");
    logLine2.graphics.font = ScriptUI.newFont("Courier", "REGULAR", 10);

    var logLine3 = consoleFeedPnl.add("statictext", undefined, ">> [STANDBY]: WAITING FOR EXECUTION THREAD...");
    logLine3.graphics.font = ScriptUI.newFont("Courier", "BOLD", 10);

    function startHUD(taskTitle, totalItems) {
        navGrp.visible = false;
        btmGrp.visible = false;
        pnlRelink.visible = false;
        pnlEmbed.visible = false;
        pnlRasterize.visible = false;
        pnlWordCloud.visible = false;
        pnlHUD.visible = true;

        hudTaskTxt.text = "PROTOCOL: " + taskTitle.toUpperCase();
        lblProcessed.text = "PROCESSED: 0 / " + totalItems;
        lblRemaining.text = "REMAINING: " + totalItems;
        lblPercent.text = "[ 0.0% ]";
        lblSpeed.text = "SPEED: CALC...";
        lblElapsed.text = "ELAPSED: 00:00s";
        lblEta.text = "ETA: --:--s";

        lblBarDisplay.text = "[ .............................. ]   0.0%";

        logLine1.text = ">> [BOOT]: INITIALIZING PROTOCOL: " + taskTitle;
        logLine2.text = ">> [CORE]: ALLOCATING HEAP MEMORY FOR " + totalItems + " UNITS";
        logLine3.text = ">> [EXEC]: STREAMING UNIT #1...";

        win.layout.layout(true);
        win.update();

        var startTime = new Date().getTime();
        var barLength = 30;

        return {
            updateProgress: function (current, logMsg) {
                var now = new Date().getTime();
                var elapsedSec = Math.max(0.1, (now - startTime) / 1000);
                var safeCurrent = Math.min(current, totalItems);
                var pct = (safeCurrent / totalItems) * 100;
                var remaining = totalItems - safeCurrent;

                var speed = (safeCurrent / elapsedSec).toFixed(1);
                var etaSec = (speed > 0 && remaining > 0) ? Math.round(remaining / speed) : 0;

                var elapsedMin = Math.floor(elapsedSec / 60);
                var elapsedRemSec = Math.floor(elapsedSec % 60);
                var elapsedStr = (elapsedMin < 10 ? "0" : "") + elapsedMin + ":" + (elapsedRemSec < 10 ? "0" : "") + elapsedRemSec + "s";

                var etaMin = Math.floor(etaSec / 60);
                var etaRemSec = Math.floor(etaSec % 60);
                var etaStr = (etaMin < 10 ? "0" : "") + etaMin + ":" + (etaRemSec < 10 ? "0" : "") + etaRemSec + "s";

                // Render ASCII Bar
                var filledCount = Math.round((pct / 100) * barLength);
                var barStr = "[ ";
                for (var b = 0; b < barLength; b++) {
                    if (b < filledCount) barStr += "#";
                    else barStr += ".";
                }
                barStr += " ] " + (pct < 10 ? "  " : (pct < 100 ? " " : "")) + pct.toFixed(1) + "%";

                lblProcessed.text = "PROCESSED: " + safeCurrent + " / " + totalItems;
                lblRemaining.text = "REMAINING: " + remaining;
                lblPercent.text = "[ " + pct.toFixed(1) + "% ]";
                lblSpeed.text = "SPEED: " + speed + " U/S";
                lblElapsed.text = "ELAPSED: " + elapsedStr;
                lblEta.text = "ETA: " + etaStr;
                lblBarDisplay.text = barStr;

                // Shift Multi-line Terminal logs
                logLine1.text = logLine2.text;
                logLine2.text = logLine3.text;
                if (logMsg) {
                    logLine3.text = ">> [CORE]: " + logMsg + " [" + speed + " U/S]";
                } else {
                    logLine3.text = ">> [CORE]: UNIT #" + safeCurrent + " / " + totalItems + " PROCESSED [OK]";
                }

                win.update();
                $.sleep(5);
            }
        };
    }

    // ── TAB SWITCHING LOGIC ──────────────────────────────────────
    function switchTab(activeIdx) {
        pnlRelink.visible = (activeIdx === 0);
        pnlEmbed.visible = (activeIdx === 1);
        pnlRasterize.visible = (activeIdx === 2);
        pnlWordCloud.visible = (activeIdx === 3);
        pnlHUD.visible = false;

        btnTab1.graphics.font = ScriptUI.newFont("Helvetica", (activeIdx === 0) ? "BOLD" : "REGULAR", 11);
        btnTab2.graphics.font = ScriptUI.newFont("Helvetica", (activeIdx === 1) ? "BOLD" : "REGULAR", 11);
        btnTab3.graphics.font = ScriptUI.newFont("Helvetica", (activeIdx === 2) ? "BOLD" : "REGULAR", 11);
        btnTab4.graphics.font = ScriptUI.newFont("Helvetica", (activeIdx === 3) ? "BOLD" : "REGULAR", 11);

        win.layout.layout(true);
    }

    btnTab1.onClick = function () { switchTab(0); };
    btnTab2.onClick = function () { switchTab(1); };
    btnTab3.onClick = function () { switchTab(2); };
    btnTab4.onClick = function () { switchTab(3); };

    if (stats.selTextCount > 0) {
        switchTab(3); // Auto open Typography Cloud if text is selected!
    } else if (stats.hasSelection && stats.matchedSampleCount > 0) {
        switchTab(2); // Auto open Rasterize if keyrings are selected!
    } else if (stats.totalLinked > 0 && stats.totalEmbedded === 0) {
        switchTab(1); // Auto open Fast Embed if document has linked files!
    } else {
        switchTab(0);
    }

    // Bottom Action Bar
    var btmGrp = win.add("group");
    btmGrp.orientation = "row";
    btmGrp.alignChildren = ["right", "center"];
    var btnClose = btmGrp.add("button", undefined, "Cancel", { name: "cancel" });

    // ─────────────────────────────────────────────────────────────
    // EXECUTION LOGIC
    // ─────────────────────────────────────────────────────────────

    // Action 1: Execute Relink
    btnExecuteRelink.onClick = function () {
        try {
            if (pathInput.text === "") {
                alert("Please click 'Browse...' to select your source PSD/Image file first.");
                return;
            }

            var psdFile = targetPsdFile || new File(pathInput.text);
            if (!psdFile.exists) {
                alert("File not found:\n" + pathInput.text);
                return;
            }

            var targetItems = [];
            if (rbSelEmbedded.value) {
                function collectSel(items) {
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].typename === "RasterItem") targetItems.push(items[i]);
                        else if (items[i].typename === "GroupItem") collectSel(items[i].pageItems);
                    }
                }
                collectSel(doc.selection);
            } else {
                for (var i = 0; i < doc.rasterItems.length; i++) {
                    targetItems.push(doc.rasterItems[i]);
                }
            }

            if (targetItems.length === 0) {
                alert("No embedded raster items found to replace.");
                return;
            }

            var hud = startHUD("RELINK EMBEDDED RASTERS", targetItems.length);

            var originalInteractionLevel = app.userInteractionLevel;
            app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

            var successCount = 0;
            var failCount = 0;
            var masterPlaced = null;

            try {
                masterPlaced = doc.placedItems.add();
                masterPlaced.file = psdFile;

                for (var j = targetItems.length - 1; j >= 0; j--) {
                    var rItem = targetItems[j];
                    var currentNum = targetItems.length - j;
                    try {
                        var parentContainer = rItem.parent;
                        var placed = masterPlaced.duplicate(parentContainer, ElementPlacement.PLACEBEFORE);

                        if (chkMatchDim.value) {
                            placed.left = rItem.left;
                            placed.top = rItem.top;
                            placed.width = rItem.width;
                            placed.height = rItem.height;
                        } else {
                            placed.left = rItem.left;
                            placed.top = rItem.top;
                        }

                        rItem.remove();
                        successCount++;
                    } catch (e) {
                        failCount++;
                    }

                    hud.updateProgress(currentNum, "RELINKED RASTER #" + currentNum + " / " + targetItems.length);
                }
            } catch (err) {
                alert("Error placing file: " + err.message);
            } finally {
                if (masterPlaced) {
                    try { masterPlaced.remove(); } catch (e) {}
                }
                app.userInteractionLevel = originalInteractionLevel;
            }

            try { doc.selection = null; } catch (eSel1) {}
            try { $.gc(); } catch (eGc1) {}

            win.close();
            var displayName = decodeURI(psdFile.name);
            showCompletionPopup("Relink Completed", successCount + " embedded item(s) successfully relinked to:\n'" + displayName + "'" + (failCount > 0 ? "\n(" + failCount + " items failed)" : ""));
        } catch (globalRelinkErr) {
            alert("Unexpected Error during Relink: " + globalRelinkErr.message);
        }
    };

    // Action 2: Fast Batch Embed
    btnExecuteEmbed.onClick = function () {
        try {
            var targetsToEmbed = [];

            if (rbSelLinked.value) {
                function collectPlaced(items) {
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].typename === "PlacedItem") targetsToEmbed.push(items[i]);
                        else if (items[i].typename === "GroupItem") collectPlaced(items[i].pageItems);
                    }
                }
                collectPlaced(doc.selection);
            } else {
                for (var i = 0; i < doc.placedItems.length; i++) {
                    targetsToEmbed.push(doc.placedItems[i]);
                }
            }

            if (targetsToEmbed.length === 0) {
                alert("No linked placed items found to embed.");
                return;
            }

            var totalToEmbed = targetsToEmbed.length;
            var hud = startHUD("FAST BATCH EMBED", totalToEmbed);

            var originalInteractionLevel = app.userInteractionLevel;
            app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

            var embeddedSuccess = 0;
            var embeddedFail = 0;

            try {
                // Loop backwards so index shifts never drop items
                for (var idx = targetsToEmbed.length - 1; idx >= 0; idx--) {
                    var pItem = targetsToEmbed[idx];
                    var doneCount = targetsToEmbed.length - idx;
                    var fName = "Image";
                    try {
                        if (pItem.file && pItem.file.name) fName = decodeURI(pItem.file.name);
                    } catch (eName) {}

                    try {
                        try { pItem.locked = false; } catch (eLk) {}
                        pItem.embed();
                        embeddedSuccess++;
                    } catch (errEmbed) {
                        try {
                            doc.selection = [pItem];
                            doc.rasterize(pItem);
                            embeddedSuccess++;
                        } catch (errRast) {
                            embeddedFail++;
                        }
                    }

                    hud.updateProgress(doneCount, "EMBEDDED: " + fName);
                }
            } finally {
                app.userInteractionLevel = originalInteractionLevel;
            }

            try { doc.selection = null; } catch (eSel2) {}
            try { $.gc(); } catch (eGc2) {}

            win.close();
            showCompletionPopup("Embed Completed", embeddedSuccess + " item(s) successfully embedded in Fast Mode." + (embeddedFail > 0 ? "\n(" + embeddedFail + " items failed)" : ""));
        } catch (globalEmbedErr) {
            alert("Unexpected Error during Embed: " + globalEmbedErr.message);
        }
    };

    // Action 3: Batch Rasterize with Turbo Engine & Live ETA / Speed
    btnExecuteRasterize.onClick = function () {
        try {
            var targetsToRasterize = [];

            // 1. Determine PPI (Default 300 PPI for maximum speed & print perfection)
            var targetResolution = 300;
            if (ppiDropdown.selection) {
                var ppiIdx = ppiDropdown.selection.index;
                if (ppiIdx === 0) targetResolution = 300;
                else if (ppiIdx === 1) targetResolution = 450;
                else if (ppiIdx === 2) targetResolution = 600;
                else if (ppiIdx === 3) targetResolution = 150;
                else if (ppiIdx === 4) {
                    var parsedPpi = parseFloat(customPpiInput.text);
                    targetResolution = (!isNaN(parsedPpi) && parsedPpi > 0) ? parsedPpi : 300;
                }
            }

            // Safe warning if > 600 PPI to protect RAM and disk
            if (targetResolution > 600) {
                var confirmHiRes = confirm(
                    "NOTICE: " + targetResolution + " PPI is 10x heavier than industry print standard (300 PPI).\n" +
                    "For maximum speed and sharpness, 300-600 PPI is recommended.\n\nContinue with " + targetResolution + " PPI?"
                );
                if (!confirmHiRes) return;
            }

            // 2. Determine Color Model safely
            var colorModelVal = undefined;
            var colorModelName = "CMYK";
            if (typeof RasterImageColorModel !== "undefined") {
                if (colorDropdown.selection && colorDropdown.selection.index === 1) {
                    colorModelVal = RasterImageColorModel.RGB;
                    colorModelName = "RGB";
                } else if (colorDropdown.selection && colorDropdown.selection.index === 2) {
                    colorModelVal = RasterImageColorModel.GRAYSCALE;
                    colorModelName = "GRAYSCALE";
                } else {
                    colorModelVal = RasterImageColorModel.CMYK;
                    colorModelName = "CMYK";
                }
            }

            // 3. Determine Anti-aliasing safely
            var aaMethodVal = undefined;
            if (typeof AntiAliasingMethod !== "undefined") {
                if (aaDropdown.selection && aaDropdown.selection.index === 1) {
                    aaMethodVal = AntiAliasingMethod.TYPEOPTIMIZED;
                } else if (aaDropdown.selection && aaDropdown.selection.index === 2) {
                    aaMethodVal = AntiAliasingMethod.NONE;
                } else {
                    aaMethodVal = AntiAliasingMethod.ARTOPTIMIZED;
                }
            }

            // 4. Collect Target Items
            if (rbRastSelectedOnly.value) {
                for (var selI = 0; selI < doc.selection.length; selI++) {
                    targetsToRasterize.push(doc.selection[selI]);
                }
            } else if (rbRastMatchSample.value) {
                targetsToRasterize = findMatchingDesigns(stats.sampleWidth, stats.sampleHeight);
            } else {
                for (var lI = 0; lI < doc.layers.length; lI++) {
                    var ly = doc.layers[lI];
                    if (ly.locked || !ly.visible) continue;
                    for (var pi = 0; pi < ly.pageItems.length; pi++) {
                        var pArt = ly.pageItems[pi];
                        if (!pArt.locked && !pArt.hidden && !pArt.guides) {
                            targetsToRasterize.push(pArt);
                        }
                    }
                }
                if (targetsToRasterize.length === 0) {
                    for (var allG = 0; allG < doc.groupItems.length; allG++) {
                        var g = doc.groupItems[allG];
                        if (!g.locked && !g.hidden) targetsToRasterize.push(g);
                    }
                }
            }

            if (targetsToRasterize.length === 0) {
                alert("No matching designs found to rasterize.\nTip: Select 1 keyring design on the artboard before running the script!");
                return;
            }

            var totalToProcess = targetsToRasterize.length;
            var hud = startHUD("RASTERIZE @" + targetResolution + " PPI (" + colorModelName + ")", totalToProcess);

            // Configure RasterizeOptions
            var rasterOptions = new RasterizeOptions();
            rasterOptions.resolution = targetResolution;
            if (colorModelVal !== undefined) {
                rasterOptions.colorModel = colorModelVal;
            }
            rasterOptions.transparency = chkTransparent.value;
            if (aaMethodVal !== undefined) {
                rasterOptions.antiAliasingMethod = aaMethodVal;
            }
            rasterOptions.padding = 0;
            rasterOptions.convertSpotColors = false;
            rasterOptions.convertTextToOutlines = false;

            var originalInteractionLevel = app.userInteractionLevel;
            app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

            var rasterSuccess = 0;
            var rasterFail = 0;

            // Helper: Extract strict clipping mask bounds [left, top, right, bottom] in valid AI coordinate system
            function getStrictArtworkBounds(art) {
                var b = null;
                try {
                    if (art.typename === "GroupItem" && art.clipped) {
                        for (var k = 0; k < art.pageItems.length; k++) {
                            var p = art.pageItems[k];
                            if (p.clipping) {
                                b = p.geometricBounds;
                                break;
                            }
                        }
                        if (!b && art.pageItems.length > 0) {
                            b = art.pageItems[0].geometricBounds;
                        }
                    }
                } catch (eClipFind) {}

                if (!b) {
                    try { b = art.visibleBounds; } catch (eVB) {}
                }
                if (!b) {
                    try { b = art.geometricBounds; } catch (eGB) {}
                }

                if (b && b.length === 4) {
                    var l = Math.min(b[0], b[2]);
                    var r = Math.max(b[0], b[2]);
                    var t = Math.max(b[1], b[3]);
                    var bot = Math.min(b[1], b[3]);
                    if ((r - l) > 1 && (t - bot) > 1) {
                        return [l, t, r, bot];
                    }
                }
                return undefined;
            }

            // Helper: Unlock and unhide all sub-items in artwork
            function unlockArt(art) {
                try { art.locked = false; } catch (e) {}
                try { art.hidden = false; } catch (e) {}
                if (art.typename === "GroupItem") {
                    for (var u = 0; u < art.pageItems.length; u++) {
                        unlockArt(art.pageItems[u]);
                    }
                }
            }

            // Helper: Fetch next live valid unrasterized target directly from DOM (prevents pointer invalidation)
            function getNextLiveTarget() {
                var tolW = Math.max(stats.sampleWidth * 0.12, 10);
                var tolH = Math.max(stats.sampleHeight * 0.12, 10);

                if (rbRastSelectedOnly.value) {
                    if (doc.selection && doc.selection.length > 0) {
                        for (var s = 0; s < doc.selection.length; s++) {
                            var sItem = doc.selection[s];
                            if (sItem && sItem.typename !== "RasterItem") {
                                return sItem;
                            }
                        }
                    }
                    return null;
                }

                for (var l = 0; l < doc.layers.length; l++) {
                    var layer = doc.layers[l];
                    if (layer.locked || !layer.visible) continue;

                    for (var p = 0; p < layer.pageItems.length; p++) {
                        var itm = layer.pageItems[p];
                        if (itm && itm.typename !== "RasterItem" && !itm.locked && !itm.hidden && !itm.guides) {
                            if (rbRastMatchSample.value) {
                                var w = Math.abs(itm.width);
                                var h = Math.abs(itm.height);
                                if (Math.abs(w - stats.sampleWidth) <= tolW && Math.abs(h - stats.sampleHeight) <= tolH) {
                                    return itm;
                                }
                            } else {
                                return itm;
                            }
                        }
                    }
                }
                return null;
            }

            try {
                for (var step = 0; step < totalToProcess; step++) {
                    var targetArt = getNextLiveTarget();
                    if (!targetArt) {
                        break;
                    }

                    var doneIndex = step + 1;

                    try {
                        unlockArt(targetArt);
                        var safeClipBounds = getStrictArtworkBounds(targetArt);

                        // Strict Crop Rasterize: ONLY rasterizes inside the mask box
                        if (safeClipBounds) {
                            doc.rasterize(targetArt, safeClipBounds, rasterOptions);
                        } else {
                            doc.rasterize(targetArt, undefined, rasterOptions);
                        }
                        rasterSuccess++;
                    } catch (rErr) {
                        try {
                            doc.selection = [targetArt];
                            doc.rasterize(targetArt, undefined, rasterOptions);
                            rasterSuccess++;
                        } catch (rErr2) {
                            rasterFail++;
                        }
                    }

                    // Ultra-fast memory purge every 5 items
                    if (doneIndex % 5 === 0) {
                        try { $.gc(); } catch (egc) {}
                    }

                    hud.updateProgress(doneIndex, "UNIT #" + doneIndex + " / " + totalToProcess + " @" + targetResolution + " PPI " + colorModelName);
                }
            } finally {
                app.userInteractionLevel = originalInteractionLevel;
            }

            // High-Speed Finalization: Clear selection & purge memory to eliminate canvas lag
            try { doc.selection = null; } catch (eSel) {}
            try { $.gc(); $.gc(); } catch (eGc) {}

            win.close();

            showCompletionPopup(
                "Rasterize Completed",
                rasterSuccess + " design(s) rasterized at " + targetResolution + " PPI (" + colorModelName + ")." +
                (rasterFail > 0 ? "\n(" + rasterFail + " items failed)" : "")
            );
        } catch (globalRastErr) {
            alert("Unexpected Error during Rasterize: " + globalRastErr.message);
        }
    };

    // Action 4: Universal Vector & Typography Word Cloud Generator
    btnExecuteWordCloud.onClick = function () {
        try {
            if (!doc.selection || doc.selection.length === 0) {
                alert("Please select text frames, vector shapes, icons, or design groups on your artboard first!");
                return;
            }

            var selTextFrames = extractTextFrames(doc.selection);
            var selVectorItems = [];
            for (var s = 0; s < doc.selection.length; s++) {
                var itm = doc.selection[s];
                if (itm.typename !== "TextFrame") {
                    selVectorItems.push(itm);
                }
            }

            var minSz = parseFloat(txtWcMinSz.text) || 12;
            var maxSz = parseFloat(txtWcMaxSz.text) || 60;
            if (minSz > maxSz) { var tmp = minSz; minSz = maxSz; maxSz = tmp; }

            var padVal = parseFloat(txtWcPadding.text);
            if (isNaN(padVal) || padVal < 0) padVal = 3;

            var vPctVal = parseFloat(txtWcVertPct.text);
            if (isNaN(vPctVal) || vPctVal < 0) vPctVal = 30;
            if (vPctVal > 100) vPctVal = 100;

            var aspVal = 0.7;
            if (ddWcAspect.selection.index === 1) aspVal = 1.0;
            else if (ddWcAspect.selection.index === 2) aspVal = 1.6;
            else if (ddWcAspect.selection.index === 3) aspVal = 2.2;

            var trkVal = -25;
            if (ddWcTracking.selection.index === 1) trkVal = -50;
            else if (ddWcTracking.selection.index === 2) trkVal = 0;
            else if (ddWcTracking.selection.index === 3) trkVal = 50;

            var wcSettings = {
                mode: rbWcCloud.value ? "cloud" : "inplace",
                splitMode: ddWcSplit.selection.index,
                mixFontWeights: chkWcMixFonts.value,
                minSize: minSz,
                maxSize: maxSz,
                sizeDist: ddWcSizeDist.selection.index,
                rotationMode: ddWcRotation.selection.index,
                verticalProb: vPctVal / 100,
                colorTheme: ddWcColorTheme.selection.index,
                textCase: ddWcCase.selection.index,
                padding: padVal,
                aspectRatio: aspVal,
                tracking: trkVal
            };

            var cloudItems = [];
            var origBounds = calculateGroupBounds(doc.selection);
            var centerX = (origBounds[0] + origBounds[2]) / 2;
            var centerY = (origBounds[1] + origBounds[3]) / 2;

            // 1. Process Text Frames if present
            if (selTextFrames.length > 0) {
                if (wcSettings.splitMode === 0) {
                    for (var i = 0; i < selTextFrames.length; i++) {
                        var tf = selTextFrames[i];
                        var rawText = tf.contents;
                        if (!rawText || rawText.replace(/\s+/g, "").length === 0) continue;
                        var f = getFrameFont(tf) || sampleBaseFont;
                        var lines = rawText.split(/\r\n|\r|\n/);
                        for (var l = 0; l < lines.length; l++) {
                            var lStr = cleanText(lines[l], wcSettings.textCase);
                            if (!lStr) continue;
                            var nTf = doc.textFrames.add();
                            nTf.contents = lStr;
                            applyFont(nTf, f);
                            cloudItems.push(nTf);
                        }
                        tf.remove();
                    }
                } else if (wcSettings.splitMode === 1) {
                    for (var j = 0; j < selTextFrames.length; j++) {
                        var tf2 = selTextFrames[j];
                        var rawText2 = tf2.contents;
                        if (!rawText2 || rawText2.replace(/\s+/g, "").length === 0) continue;
                        var f2 = getFrameFont(tf2) || sampleBaseFont;
                        var words = rawText2.match(/[^\s\r\n]+/g);
                        if (!words || words.length === 0) continue;
                        for (var w = 0; w < words.length; w++) {
                            var wStr = cleanText(words[w], wcSettings.textCase);
                            if (!wStr) continue;
                            var nTf2 = doc.textFrames.add();
                            nTf2.contents = wStr;
                            applyFont(nTf2, f2);
                            cloudItems.push(nTf2);
                        }
                        tf2.remove();
                    }
                } else {
                    for (var k = 0; k < selTextFrames.length; k++) {
                        var cl = cleanText(selTextFrames[k].contents, wcSettings.textCase);
                        if (cl) selTextFrames[k].contents = cl;
                        cloudItems.push(selTextFrames[k]);
                    }
                }
            }

            // 2. Process Vector Artwork / Shapes / Groups if present
            if (selVectorItems.length > 0) {
                // If only 1-5 vector items selected, duplicate to populate a rich cloud
                var targetVectorCount = selVectorItems.length;
                if (selVectorItems.length < 15 && selTextFrames.length === 0) {
                    targetVectorCount = Math.max(25, selVectorItems.length * 6);
                }

                for (var v = 0; v < targetVectorCount; v++) {
                    var srcItem = selVectorItems[v % selVectorItems.length];
                    if (v < selVectorItems.length) {
                        cloudItems.push(srcItem);
                    } else {
                        try {
                            var dup = srcItem.duplicate(srcItem.parent, ElementPlacement.PLACEATBEGINNING);
                            cloudItems.push(dup);
                        } catch (eDup) {}
                    }
                }
            }

            if (cloudItems.length === 0) {
                alert("No valid items found to generate cloud poster.");
                return;
            }

            var hud = startHUD("CLOUD POSTER GENERATOR", cloudItems.length);

            // Phase 2: Sizing Hierarchy (Works on both Text & Vector Objects)
            assignItemSizes(cloudItems, wcSettings);
            hud.updateProgress(Math.round(cloudItems.length * 0.25), "SCALE HIERARCHY ASSIGNED");

            // Phase 3: Font weights (Only on TextFrames)
            if (wcSettings.mixFontWeights && fontVariants && fontVariants.allList.length > 1) {
                assignFontWeights(cloudItems, fontVariants, wcSettings);
                hud.updateProgress(Math.round(cloudItems.length * 0.5), "TYPOGRAPHY WEIGHTS MIXED");
            }

            // Phase 4: Tracking (Only on TextFrames)
            applyTracking(cloudItems, wcSettings.tracking);

            // Phase 5: Rotation (Works on both Text & Vector Objects)
            applyRotation(cloudItems, wcSettings);
            hud.updateProgress(Math.round(cloudItems.length * 0.75), "ROTATION MATRIX APPLIED");

            // Phase 6: Color Themes (Applies to both Text & Vector Objects)
            applyColorTheme(doc, cloudItems, wcSettings.colorTheme);

            // Phase 7: Spiral Packing
            if (wcSettings.mode === "cloud") {
                arrangeWordCloud(cloudItems, centerX, centerY, wcSettings);
            }

            // Group results
            var cloudGroup = doc.groupItems.add();
            cloudGroup.name = "Vector & Word Cloud Generated";
            for (var g = 0; g < cloudItems.length; g++) {
                try {
                    cloudItems[g].moveToBeginning(cloudGroup);
                } catch (eMv) {}
            }

            hud.updateProgress(cloudItems.length, "VECTOR CLOUD COMPLETE");

            try { doc.selection = [cloudGroup]; } catch (eSel) {}
            try { $.gc(); } catch (eGc) {}

            win.close();
            showCompletionPopup("Cloud Generated", cloudItems.length + " vector/typography item(s) successfully clustered & styled!");
        } catch (wcErr) {
            alert("Unexpected Error during Cloud generation: " + wcErr.message);
        }
    };

    // Helper: Universal Sizing for both Text and Vector Objects
    function assignItemSizes(items, settings) {
        var min = settings.minSize;
        var max = settings.maxSize;
        var total = items.length;

        shuffleArray(items);

        for (var i = 0; i < total; i++) {
            var itm = items[i];
            var size = min;
            if (settings.sizeDist === 0) {
                var rank = i / total;
                if (rank < 0.1) {
                    size = max * (0.85 + Math.random() * 0.15);
                } else if (rank < 0.3) {
                    size = min + (max - min) * (0.5 + Math.random() * 0.3);
                } else if (rank < 0.6) {
                    size = min + (max - min) * (0.25 + Math.random() * 0.25);
                } else {
                    size = min + (max - min) * (Math.random() * 0.2);
                }
            } else if (settings.sizeDist === 2) {
                var r = Math.random();
                if (r < 0.15) size = max;
                else if (r < 0.5) size = min + (max - min) * 0.5;
                else size = min;
            } else {
                size = min + Math.random() * (max - min);
            }

            size = Math.round(size * 10) / 10;

            if (itm.typename === "TextFrame") {
                try {
                    itm.textRange.characterAttributes.size = size;
                } catch (e) {}
            } else {
                // Vector object: scale proportionally
                try {
                    var b = itm.geometricBounds;
                    var w = Math.abs(b[2] - b[0]);
                    var h = Math.abs(b[1] - b[3]);
                    var maxDim = Math.max(w, h, 1);
                    var scaleFactor = (size / maxDim) * 100;
                    if (scaleFactor > 0) {
                        itm.resize(scaleFactor, scaleFactor, true, true, true, true, scaleFactor, Transformation.CENTER);
                    }
                } catch (eVScale) {}
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // TYPOGRAPHY WORD CLOUD ALGORITHMS & HELPERS
    // ─────────────────────────────────────────────────────────────
    function assignFontWeights(frames, fontVars, settings) {
        var min = settings.minSize;
        var max = settings.maxSize;
        var threshold = min + (max - min) * 0.45;

        for (var i = 0; i < frames.length; i++) {
            var tf = frames[i];
            var sz = tf.textRange.characterAttributes.size || min;
            var chosenFont = (sz >= threshold) ? 
                ((Math.random() < 0.85) ? getRandomItem(fontVars.boldList) : getRandomItem(fontVars.regularList)) :
                ((Math.random() < 0.75) ? getRandomItem(fontVars.regularList) : getRandomItem(fontVars.boldList));

            if (chosenFont) {
                try {
                    tf.textRange.characterAttributes.textFont = chosenFont;
                } catch (e) {}
            }
        }
    }

    function cleanText(str, caseOption) {
        if (!str) return "";
        var res = String(str).replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").replace(/^\s+|\s+$/g, "");
        if (!res) return "";

        switch (caseOption) {
            case 1:
                return res.toLowerCase();
            case 2:
                return res.replace(/\w\S*/g, function (txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            case 3:
                return res.toUpperCase();
            default:
                return res;
        }
    }

    function assignSizes(frames, settings) {
        var min = settings.minSize;
        var max = settings.maxSize;
        var total = frames.length;

        shuffleArray(frames);

        for (var i = 0; i < total; i++) {
            var size = min;
            if (settings.sizeDist === 0) {
                var rank = i / total;
                if (rank < 0.1) {
                    size = max * (0.85 + Math.random() * 0.15);
                } else if (rank < 0.3) {
                    size = min + (max - min) * (0.5 + Math.random() * 0.3);
                } else if (rank < 0.6) {
                    size = min + (max - min) * (0.25 + Math.random() * 0.25);
                } else {
                    size = min + (max - min) * (Math.random() * 0.2);
                }
            } else if (settings.sizeDist === 2) {
                var r = Math.random();
                if (r < 0.15) size = max;
                else if (r < 0.5) size = min + (max - min) * 0.5;
                else size = min;
            } else {
                size = min + Math.random() * (max - min);
            }

            size = Math.round(size * 10) / 10;
            try {
                frames[i].textRange.characterAttributes.size = size;
            } catch (e) {}
        }
    }

    function applyRotation(frames, settings) {
        for (var i = 0; i < frames.length; i++) {
            var tf = frames[i];
            var angle = 0;
            var isVert = Math.random() < settings.verticalProb;

            switch (settings.rotationMode) {
                case 0:
                    angle = isVert ? (Math.random() < 0.5 ? 90 : -90) : 0;
                    break;
                case 1:
                    angle = isVert ? 90 : 0;
                    break;
                case 2:
                    angle = 0;
                    break;
                case 3:
                    var angles = [0, 90, -90, 45, -45];
                    angle = angles[Math.floor(Math.random() * angles.length)];
                    break;
                case 4:
                    angle = Math.floor(Math.random() * 360);
                    break;
            }

            if (angle !== 0) {
                try {
                    tf.rotate(angle, true, true, true, true, Transformation.CENTER);
                } catch (e) {}
            }
        }
    }

    function applyColorTheme(doc, frames, themeIndex) {
        if (themeIndex === 5) return;

        var isCMYK = (doc.documentColorSpace === DocumentColorSpace.CMYK);
        var palettes = {
            neon: [[0, 240, 255], [255, 0, 128], [255, 230, 0], [180, 0, 255], [245, 245, 245]],
            vintage: [[184, 51, 42], [218, 148, 59], [68, 108, 110], [43, 65, 53], [50, 45, 40]],
            ocean: [[20, 40, 80], [45, 120, 180], [0, 168, 180], [120, 190, 210], [40, 60, 70]],
            luxury: [[212, 175, 55], [184, 134, 11], [205, 127, 50], [47, 53, 66], [116, 125, 140]]
        };

        function rgbToCmyk(r, g, b) {
            var c = 1 - (r / 255), m = 1 - (g / 255), y = 1 - (b / 255);
            var k = Math.min(c, Math.min(m, y));
            if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
            return {
                c: Math.round(((c - k) / (1 - k)) * 100),
                m: Math.round(((m - k) / (1 - k)) * 100),
                y: Math.round(((y - k) / (1 - k)) * 100),
                k: Math.round(k * 100)
            };
        }

        for (var i = 0; i < frames.length; i++) {
            try {
                if (themeIndex === 0) {
                    var blackPercent = 40 + Math.floor(Math.random() * 61);
                    if (isCMYK) {
                        var cmykMono = new CMYKColor();
                        cmykMono.cyan = 0; cmykMono.magenta = 0; cmykMono.yellow = 0; cmykMono.black = blackPercent;
                        frames[i].textRange.characterAttributes.fillColor = cmykMono;
                    } else {
                        var rgbVal = Math.round(255 * (1 - (blackPercent / 100)));
                        var rgbMono = new RGBColor();
                        rgbMono.red = rgbVal; rgbMono.green = rgbVal; rgbMono.blue = rgbVal;
                        frames[i].textRange.characterAttributes.fillColor = rgbMono;
                    }
                } else {
                    var pal = palettes.neon;
                    if (themeIndex === 2) pal = palettes.vintage;
                    else if (themeIndex === 3) pal = palettes.ocean;
                    else if (themeIndex === 4) pal = palettes.luxury;

                    var chosenRgb = pal[Math.floor(Math.random() * pal.length)];

                    if (isCMYK) {
                        var conv = rgbToCmyk(chosenRgb[0], chosenRgb[1], chosenRgb[2]);
                        var cmykCol = new CMYKColor();
                        cmykCol.cyan = conv.c; cmykCol.magenta = conv.m; cmykCol.yellow = conv.y; cmykCol.black = conv.k;
                        frames[i].textRange.characterAttributes.fillColor = cmykCol;
                    } else {
                        var rgbCol = new RGBColor();
                        rgbCol.red = chosenRgb[0]; rgbCol.green = chosenRgb[1]; rgbCol.blue = chosenRgb[2];
                        frames[i].textRange.characterAttributes.fillColor = rgbCol;
                    }
                }
            } catch (e) {}
        }
    }

    function arrangeWordCloud(frames, startCenterX, startCenterY, settings) {
        frames.sort(function (a, b) {
            var sizeA = a.textRange.characterAttributes.size || 12;
            var sizeB = b.textRange.characterAttributes.size || 12;
            return sizeB - sizeA;
        });

        var placedRects = [];
        var padding = settings.padding;
        var aspect = settings.aspectRatio;

        for (var i = 0; i < frames.length; i++) {
            var tf = frames[i];
            var bounds = tf.geometricBounds;
            var w = bounds[2] - bounds[0];
            var h = bounds[1] - bounds[3];

            if (i === 0) {
                var newLeft = startCenterX - w / 2;
                var newTop = startCenterY + h / 2;
                tf.position = [newLeft, newTop];

                var currentBounds = tf.geometricBounds;
                placedRects.push({
                    left: currentBounds[0] - padding,
                    top: currentBounds[1] + padding,
                    right: currentBounds[2] + padding,
                    bottom: currentBounds[3] - padding
                });
                continue;
            }

            var placed = false;
            var theta = Math.random() * Math.PI * 2;
            var dTheta = 0.15;
            var spiralStep = 1.25;
            var maxSteps = 3200;

            for (var step = 0; step < maxSteps; step++) {
                var r = spiralStep * (step * dTheta);
                var x = startCenterX + (aspect * r * Math.cos(theta)) - (w / 2);
                var y = startCenterY + (r * Math.sin(theta)) + (h / 2);

                var candidate = {
                    left: x - padding,
                    top: y + padding,
                    right: x + w + padding,
                    bottom: y - h - padding
                };

                var collision = false;
                for (var p = 0; p < placedRects.length; p++) {
                    if (rectsIntersect(candidate, placedRects[p])) {
                        collision = true;
                        break;
                    }
                }

                if (!collision) {
                    tf.position = [x, y];
                    var realBounds = tf.geometricBounds;
                    placedRects.push({
                        left: realBounds[0] - padding,
                        top: realBounds[1] + padding,
                        right: realBounds[2] + padding,
                        bottom: realBounds[3] - padding
                    });
                    placed = true;
                    break;
                }

                theta += dTheta;
            }

            if (!placed) {
                tf.position = [startCenterX + (step * 0.5), startCenterY];
            }
        }
    }

    function rectsIntersect(r1, r2) {
        return !(
            r1.left > r2.right ||
            r1.right < r2.left ||
            r1.bottom > r2.top ||
            r1.top < r2.bottom
        );
    }

    function calculateGroupBounds(items) {
        var minX = Infinity, maxY = -Infinity, maxX = -Infinity, minY = Infinity;
        for (var i = 0; i < items.length; i++) {
            var b = items[i].geometricBounds;
            if (b[0] < minX) minX = b[0];
            if (b[1] > maxY) maxY = b[1];
            if (b[2] > maxX) maxX = b[2];
            if (b[3] < minY) minY = b[3];
        }
        return [minX, maxY, maxX, minY];
    }

    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    function getRandomItem(arr) {
        if (!arr || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // ─────────────────────────────────────────────────────────────
    // PROFESSIONAL COMPLETION DIALOG WITH CLICKABLE FACEBOOK LINK
    // ─────────────────────────────────────────────────────────────
    function showCompletionPopup(title, details) {
        var pop = new Window("dialog", "Task Completed Successfully");
        pop.orientation = "column";
        pop.alignChildren = ["fill", "top"];
        pop.spacing = 14;
        pop.margins = 20;
        pop.preferredSize.width = 400;

        var header = pop.add("panel");
        header.orientation = "column";
        header.alignChildren = ["center", "center"];
        header.margins = [12, 14, 12, 14];
        header.spacing = 6;

        var hText = header.add("statictext", undefined, title.toUpperCase());
        hText.graphics.font = ScriptUI.newFont("Helvetica", "BOLD", 13);

        var dText = header.add("statictext", undefined, details, { multiline: true });
        dText.graphics.font = ScriptUI.newFont("Helvetica", "REGULAR", 11);

        var tributePnl = pop.add("panel", undefined, "Developed By");
        tributePnl.orientation = "column";
        tributePnl.alignChildren = ["center", "center"];
        tributePnl.margins = [14, 12, 14, 12];
        tributePnl.spacing = 6;

        var tTitle = tributePnl.add("statictext", undefined, "Special Thanks to:");
        tTitle.graphics.font = ScriptUI.newFont("Helvetica", "REGULAR", 11);

        var fbBtn = tributePnl.add("button", undefined, "Yahia Bin Zaman (GitHub)");
        fbBtn.preferredSize.height = 30;
        fbBtn.preferredSize.width = 250;
        fbBtn.helpTip = "Click to open GitHub profile in your browser";
        fbBtn.graphics.font = ScriptUI.newFont("Helvetica", "BOLD", 12);

        fbBtn.onClick = function () {
            openWebUrl("https://github.com/yahiabinzaman");
        };

        var okBtn = pop.add("button", undefined, "OK", { name: "ok" });
        okBtn.preferredSize.height = 34;
        okBtn.graphics.font = ScriptUI.newFont("Helvetica", "BOLD", 12);
        okBtn.onClick = function () {
            pop.close();
        };

        pop.center();
        pop.show();
    }

    btnClose.onClick = function () {
        win.close();
    };

    // Show Dialog Window
    win.center();
    win.show();
})();
