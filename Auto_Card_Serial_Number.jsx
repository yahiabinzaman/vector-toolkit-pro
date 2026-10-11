#target illustrator

/**
 * Auto Card Serial Number Pro
 * Developed for Adobe Illustrator by Yahia Bin Zaman
 * Automatically detects card serial number placeholders ("00", "০০") 
 * and fills them sequentially in grid order:
 * 01 - 02
 * 03 - 04
 * 05 - 06 ...
 */

(function () {
    if (app.documents.length === 0) {
        alert("কোনো ডকুমেন্ট খোলা নেই!\nঅনুগ্রহ করে ইলাস্ট্রেটরে একটি ডকুমেন্ট ওপেন করুন।", "Vector Toolkit Pro");
        return;
    }

    var doc = app.activeDocument;
    var numABs = doc.artboards.length;
    var activeABIdx = doc.artboards.getActiveArtboardIndex();

    // Dialog Window
    var dlg = new Window("dialog", "Card Serial Auto-Filler (01-02, 03-04...)");
    dlg.orientation = "column";
    dlg.alignChildren = ["fill", "top"];
    dlg.spacing = 10;
    dlg.margins = 16;

    // Header Info
    var pnlHead = dlg.add("panel", undefined, "কার্ড সিরিয়াল অটোমেশন");
    pnlHead.orientation = "column";
    pnlHead.alignChildren = ["left", "top"];
    pnlHead.margins = 10;
    var lblDesc = pnlHead.add("statictext", undefined, "কার্ডের নিচের '00' বা '০০' টেক্সট ফ্রেম অটো শনাক্ত করে সিরিয়াল ফিল করবে:", { multiline: true });
    lblDesc.preferredSize.width = 330;

    // Scope Panel
    var pnlScope = dlg.add("panel", undefined, "Target Scope (টার্গেট পরিধি)");
    pnlScope.orientation = "row";
    pnlScope.alignChildren = ["left", "center"];
    pnlScope.margins = 10;
    var rbScopeAll = pnlScope.add("radiobutton", undefined, "All Artboards (সব)");
    var rbScopeActive = pnlScope.add("radiobutton", undefined, "Active Artboard");
    var rbScopeSel = pnlScope.add("radiobutton", undefined, "Selection Only");
    rbScopeAll.value = true;

    // Settings Panel
    var pnlOpts = dlg.add("panel", undefined, "Settings (সিরিয়াল সেটিংস)");
    pnlOpts.orientation = "column";
    pnlOpts.alignChildren = ["fill", "top"];
    pnlOpts.spacing = 8;
    pnlOpts.margins = 10;

    // Row 1: Start Number & Padding
    var grpR1 = pnlOpts.add("group");
    grpR1.orientation = "row";
    grpR1.alignChildren = ["left", "center"];
    grpR1.add("statictext", undefined, "Start Number:");
    var txtStart = grpR1.add("edittext", undefined, "1");
    txtStart.characters = 5;

    grpR1.add("statictext", undefined, "   Padding:");
    var ddlPad = grpR1.add("dropdownlist", undefined, ["01, 02 (2 Digits)", "1, 2 (No Padding)", "001, 002 (3 Digits)", "0001 (4 Digits)"]);
    ddlPad.selection = 0;

    // Row 2: Digits Language & Target Text
    var grpR2 = pnlOpts.add("group");
    grpR2.orientation = "row";
    grpR2.alignChildren = ["left", "center"];
    grpR2.add("statictext", undefined, "Digits Style:  ");
    var ddlDigits = grpR2.add("dropdownlist", undefined, ["Auto-Detect (বাংলা/Eng)", "English (01, 02...)", "বাংলা (০১, ০২...)"]);
    ddlDigits.selection = 0;

    grpR2.add("statictext", undefined, "   Placeholder:");
    var txtHolder = grpR2.add("edittext", undefined, "00");
    txtHolder.characters = 5;

    // Row 3: Grid Sequence
    var pnlOrder = dlg.add("panel", undefined, "Fill Direction (বসানোর দিক)");
    pnlOrder.orientation = "column";
    pnlOrder.alignChildren = ["left", "top"];
    pnlOrder.margins = 10;
    var rbOrderRow = pnlOrder.add("radiobutton", undefined, "Row-by-Row: 01-02, 03-04 (আড়াআড়ি)");
    var rbOrderCol = pnlOrder.add("radiobutton", undefined, "Column-by-Column: 01-04, 02-05 (লম্বালম্বি)");
    rbOrderRow.value = true;

    // Button Bar
    var grpBtn = dlg.add("group");
    grpBtn.orientation = "row";
    grpBtn.alignment = ["center", "top"];
    var btnScan = grpBtn.add("button", undefined, "🔍 Preview Scan");
    var btnApply = grpBtn.add("button", undefined, "⚡ Apply Serial", { name: "ok" });
    var btnCancel = grpBtn.add("button", undefined, "Cancel", { name: "cancel" });

    // Detection Engine
    function isItemVisibleAndUnlocked(item) {
        if (!item) return false;
        try {
            if (item.hidden || item.locked) return false;
            var p = item.parent;
            while (p && p.typename !== "Document") {
                if (p.hidden || p.locked) return false;
                p = p.parent;
            }
            return true;
        } catch(e) {
            return false;
        }
    }

    function testSerialTF(tf, placeholder) {
        if (!tf || tf.typename !== "TextFrame") return false;
        var txt = tf.contents ? tf.contents.replace(/^\s+|\s+$/g, "") : "";
        if (!txt) return false;

        if (placeholder && placeholder.length > 0) {
            if (txt === placeholder) return true;
            if (placeholder === "00" && (txt === "00" || txt === "\u09E6\u09E6")) return true;
            if (placeholder === "\u09E6\u09E6" && (txt === "00" || txt === "\u09E6\u09E6")) return true;
        }

        if (txt.indexOf("\r") !== -1 || txt.indexOf("\n") !== -1) return false;
        if (txt.replace(/\D/g, "").length >= 7) return false;
        if (txt.replace(/[^০-৯]/g, "").length >= 7) return false;
        if (/^(?:19|20)\d\d$/.test(txt) || /^(?:১৪|১৫)[০-৯]{2}$/.test(txt) || /^(?:২০|১৯)[০-৯]{2}$/.test(txt)) return false;
        if (/(?:মোবাইল|পিতা|গ্রাম|গ্রেড|রোল|নাম|ঠিকানা|বিভাগ|হিফয|কুরআন)/i.test(txt)) return false;

        if (/^(?:00|\u09E6\u09E6|0|\u09E6|000|\u09E6\u09E6\u09E6|#|\u09A8\u0982|sl)$/i.test(txt)) return true;
        if (/^[০-৯0-9]{1,3}$/.test(txt)) return true;

        return false;
    }

    function collectSubTFs(container, outArr) {
        if (!container || !isItemVisibleAndUnlocked(container)) return;
        if (container.typename === "TextFrame") {
            outArr.push(container);
            return;
        }
        if (container.typename === "GroupItem" || container.pageItems) {
            for (var i = 0; i < container.pageItems.length; i++) {
                collectSubTFs(container.pageItems[i], outArr);
            }
        }
    }

    function getABIndex(gb) {
        if (!gb || numABs === 0) return 0;
        var midX = (gb[0] + gb[2]) / 2;
        var midY = (gb[1] + gb[3]) / 2;
        for (var a = 0; a < numABs; a++) {
            var r = doc.artboards[a].artboardRect;
            if (midX >= r[0] && midX <= r[2] && midY <= r[1] && midY >= r[3]) return a;
        }
        return 0;
    }

    function detectCards(scope, placeholder, order) {
        var detected = [];
        var attached = {};

        if (scope === "selection") {
            var sel = doc.selection;
            if (!sel || sel.length === 0) return { error: "Please select cards first or select All Artboards." };
            for (var s = 0; s < sel.length; s++) {
                var itm = sel[s];
                if (!isItemVisibleAndUnlocked(itm)) continue;
                if (itm.typename === "GroupItem") {
                    var tfs = [];
                    collectSubTFs(itm, tfs);
                    var bestTF = null, bestScore = -1;
                    var gb = itm.geometricBounds;
                    for (var t = 0; t < tfs.length; t++) {
                        var tf = tfs[t];
                        if (testSerialTF(tf, placeholder)) {
                            var sc = 10;
                            var ttxt = tf.contents.replace(/^\s+|\s+$/g, "");
                            if (ttxt === placeholder || ttxt === "00" || ttxt === "\u09E6\u09E6") sc += 50;
                            var tfgb = tf.geometricBounds;
                            var relX = (tfgb[0] - gb[0]) / Math.max(1, Math.abs(gb[2] - gb[0]));
                            var relY = (gb[1] - tfgb[1]) / Math.max(1, Math.abs(gb[1] - gb[3]));
                            if (relX > 0.4) sc += 20;
                            if (relY > 0.4) sc += 20;
                            if (sc > bestScore) { bestScore = sc; bestTF = tf; }
                        }
                    }
                    if (bestTF) {
                        detected.push({ item: itm, tf: bestTF, bounds: gb, ab: getABIndex(gb) });
                        attached[bestTF] = true;
                    }
                } else if (itm.typename === "TextFrame") {
                    if (testSerialTF(itm, placeholder)) {
                        detected.push({ item: itm, tf: itm, bounds: itm.geometricBounds, ab: getABIndex(itm.geometricBounds) });
                        attached[itm] = true;
                    }
                }
            }
        } else {
            var abFilter = (scope === "artboard") ? activeABIdx : null;

            for (var l = 0; l < doc.layers.length; l++) {
                var lyr = doc.layers[l];
                if (!lyr.visible || lyr.locked) continue;
                for (var p = 0; p < lyr.pageItems.length; p++) {
                    var pItem = lyr.pageItems[p];
                    if (!isItemVisibleAndUnlocked(pItem)) continue;
                    if (pItem.typename === "GroupItem") {
                        var gb = pItem.geometricBounds;
                        if (Math.abs(gb[2] - gb[0]) > 650 && Math.abs(gb[1] - gb[3]) > 650) continue;
                        var itemAb = getABIndex(gb);
                        if (abFilter !== null && itemAb !== abFilter) continue;

                        var gTfs = [];
                        collectSubTFs(pItem, gTfs);
                        var bestTF = null, bestScore = -1;
                        for (var t = 0; t < gTfs.length; t++) {
                            var tf = gTfs[t];
                            if (testSerialTF(tf, placeholder)) {
                                var sc = 10;
                                var ttxt = tf.contents.replace(/^\s+|\s+$/g, "");
                                if (ttxt === placeholder || ttxt === "00" || ttxt === "\u09E6\u09E6") sc += 50;
                                var tfgb = tf.geometricBounds;
                                var relX = (tfgb[0] - gb[0]) / Math.max(1, Math.abs(gb[2] - gb[0]));
                                var relY = (gb[1] - tfgb[1]) / Math.max(1, Math.abs(gb[1] - gb[3]));
                                if (relX > 0.4) sc += 20;
                                if (relY > 0.4) sc += 20;
                                if (sc > bestScore) { bestScore = sc; bestTF = tf; }
                            }
                        }
                        if (bestTF) {
                            detected.push({ item: pItem, tf: bestTF, bounds: gb, ab: itemAb });
                            attached[bestTF] = true;
                        }
                    }
                }
            }

            for (var dt = 0; dt < doc.textFrames.length; dt++) {
                var dtf = doc.textFrames[dt];
                if (!isItemVisibleAndUnlocked(dtf)) continue;
                if (attached[dtf]) continue;
                var dgb = dtf.geometricBounds;
                if (Math.abs(dgb[2] - dgb[0]) > 85 || Math.abs(dgb[1] - dgb[3]) > 55) continue;
                var dAb = getABIndex(dgb);
                if (abFilter !== null && dAb !== abFilter) continue;
                if (testSerialTF(dtf, placeholder)) {
                    detected.push({ item: dtf, tf: dtf, bounds: dgb, ab: dAb });
                    attached[dtf] = true;
                }
            }
        }

        if (detected.length === 0) return { error: "কোনো সিরিয়াল টেক্সট ফ্রেম শনাক্ত করা সম্ভব হয়নি!" };

        // Group by Artboard
        var byAB = {};
        for (var i = 0; i < detected.length; i++) {
            var a = detected[i].ab;
            if (!byAB[a]) byAB[a] = [];
            byAB[a].push(detected[i]);
        }

        var abKeys = [];
        for (var k in byAB) { if (byAB.hasOwnProperty(k)) abKeys.push(parseInt(k, 10)); }
        abKeys.sort(function(a, b) { return a - b; });

        var sorted = [];
        for (var ak = 0; ak < abKeys.length; ak++) {
            var abList = byAB[abKeys[ak]];
            for (var i = 0; i < abList.length; i++) {
                var b = abList[i].bounds;
                abList[i].centerX = (b[0] + b[2]) / 2;
                abList[i].centerY = (b[1] + b[3]) / 2;
                abList[i].height = Math.abs(b[1] - b[3]);
            }

            if (order === "column") {
                // Column by column
                var cols = [];
                for (var i = 0; i < abList.length; i++) {
                    var itm = abList[i];
                    var placed = false;
                    for (var c = 0; c < cols.length; c++) {
                        if (Math.abs(itm.centerX - cols[c].avgX) < 40) {
                            cols[c].items.push(itm);
                            var sX = 0; for (var m = 0; m < cols[c].items.length; m++) sX += cols[c].items[m].centerX;
                            cols[c].avgX = sX / cols[c].items.length;
                            placed = true;
                            break;
                        }
                    }
                    if (!placed) cols.push({ avgX: itm.centerX, items: [itm] });
                }
                cols.sort(function(a, b) { return a.avgX - b.avgX; });
                for (var c = 0; c < cols.length; c++) {
                    cols[c].items.sort(function(a, b) { return b.centerY - a.centerY; });
                    for (var r = 0; r < cols[c].items.length; r++) sorted.push(cols[c].items[r]);
                }
            } else {
                // Row by Row (Horizontal)
                var rows = [];
                for (var i = 0; i < abList.length; i++) {
                    var itm = abList[i];
                    var placed = false;
                    for (var r = 0; r < rows.length; r++) {
                        var rH = rows[r].avgH || 60;
                        if (Math.abs(itm.centerY - rows[r].avgY) < Math.max(30, rH * 0.45)) {
                            rows[r].items.push(itm);
                            var sY = 0, sH = 0;
                            for (var m = 0; m < rows[r].items.length; m++) { sY += rows[r].items[m].centerY; sH += rows[r].items[m].height; }
                            rows[r].avgY = sY / rows[r].items.length;
                            rows[r].avgH = sH / rows[r].items.length;
                            placed = true;
                            break;
                        }
                    }
                    if (!placed) rows.push({ avgY: itm.centerY, avgH: itm.height, items: [itm] });
                }
                rows.sort(function(a, b) { return b.avgY - a.avgY; });
                for (var r = 0; r < rows.length; r++) {
                    rows[r].items.sort(function(a, b) { return a.centerX - b.centerX; });
                    for (var c = 0; c < rows[r].items.length; c++) sorted.push(rows[r].items[c]);
                }
            }
        }

        return { items: sorted, totalArtboards: abKeys.length };
    }

    var bnDigits = ['\u09E6', '\u09E7', '\u09E8', '\u09E9', '\u09EA', '\u09EB', '\u09EC', '\u09ED', '\u09EE', '\u09EF'];
    function formatNumberStr(num, padLen, langMode, tf) {
        var str = String(num);
        while (str.length < padLen) str = "0" + str;

        var fontName = "";
        try {
            if (tf && tf.textRange && tf.textRange.characterAttributes && tf.textRange.characterAttributes.textFont) {
                fontName = tf.textRange.characterAttributes.textFont.name || "";
            }
        } catch(fe) {}

        if (/sutonny/i.test(fontName)) return str;

        var useBn = false;
        if (langMode === 2) useBn = true; // Bengali
        else if (langMode === 1) useBn = false; // English
        else {
            // Auto
            var cur = tf ? (tf.contents || "") : "";
            if (/[\u09E6-\u09EF]/.test(cur) || /bornomala|kalpurush|solaiman|siyam/i.test(fontName)) useBn = true;
        }

        if (useBn) {
            var res = "";
            for (var i = 0; i < str.length; i++) {
                var ch = str.charAt(i);
                if (ch >= '0' && ch <= '9') res += bnDigits[parseInt(ch, 10)];
                else res += ch;
            }
            return res;
        }
        return str;
    }

    btnScan.onClick = function () {
        var scope = rbScopeAll.value ? "all_artboards" : (rbScopeActive.value ? "artboard" : "selection");
        var holder = txtHolder.text;
        var order = rbOrderRow.value ? "row" : "column";
        var res = detectCards(scope, holder, order);
        if (res.error) {
            alert(res.error, "Scan Result");
            return;
        }

        var sNum = parseInt(txtStart.text, 10) || 1;
        var padVal = [2, 1, 3, 4][ddlPad.selection.index];
        var langIdx = ddlDigits.selection.index;

        var msg = "✓ Found " + res.items.length + " Cards across " + res.totalArtboards + " Artboard(s)!\n\nPreview First Few:\n";
        var maxShow = Math.min(res.items.length, 6);
        for (var i = 0; i < maxShow; i++) {
            var val = formatNumberStr(sNum + i, padVal, langIdx, res.items[i].tf);
            msg += "Card #" + (i + 1) + " (AB " + (res.items[i].ab + 1) + "): '" + res.items[i].tf.contents + "' ➔ " + val + "\n";
        }
        if (res.items.length > maxShow) msg += "... and " + (res.items.length - maxShow) + " more cards.";

        alert(msg, "Card Serial Preview");
    };

    btnApply.onClick = function () {
        var scope = rbScopeAll.value ? "all_artboards" : (rbScopeActive.value ? "artboard" : "selection");
        var holder = txtHolder.text;
        var order = rbOrderRow.value ? "row" : "column";
        var res = detectCards(scope, holder, order);
        if (res.error) {
            alert(res.error, "Error");
            return;
        }

        var sNum = parseInt(txtStart.text, 10) || 1;
        var padVal = [2, 1, 3, 4][ddlPad.selection.index];
        var langIdx = ddlDigits.selection.index;

        for (var i = 0; i < res.items.length; i++) {
            var unit = res.items[i];
            var finalStr = formatNumberStr(sNum + i, padVal, langIdx, unit.tf);
            try {
                unit.tf.contents = finalStr;
            } catch(e) {}
        }

        app.redraw();
        alert("✓ সফলভাবে " + res.items.length + " টি কার্ডে সিরিয়াল নম্বর বসানো হয়েছে!\n(01 - 02, 03 - 04... সাজানো হয়েছে)\n\nDeveloped by Yahia Bin Zaman", "Success");
        dlg.close();
    };

    btnCancel.onClick = function () {
        dlg.close();
    };

    dlg.show();
})();
