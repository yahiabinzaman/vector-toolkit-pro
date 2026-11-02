#target illustrator

/**
 * ==============================================================================
 * Card Numbering Pro - 1-Click Card Serial Fixer
 * ==============================================================================
 * Developed for Adobe Illustrator by Yahia Bin Zaman
 *
 * Specially designed for auto-numbering cards (Bio Cards, ID Cards, Certificates):
 * 1. Automatically finds card number badges / text frames across artboards or selection.
 * 2. Fixes duplicate numbers (e.g. copied template with '1' on all cards).
 * 3. Fixes broken / jumped sequences (e.g. 1-8 correct, then jumps to 12-16).
 * 4. Arranges 100+ cards into perfect 1 to 100 sequential order in 1 click!
 * 5. Orders cards across artboards in natural grid reading order:
 *      Row-by-Row: 1 - 2, 3 - 4, 5 - 6 ...
 *      Column-by-Column: 1 - 5, 2 - 6 ...
 * 6. Supports Unicode Bengali (১, ২, ৩... ১০০), ANSI SutonnyMJ, and English.
 * 7. Strictly preserves font, size, leading, tracking, color, and center alignment.
 * ==============================================================================
 */

(function () {
    if (app.documents.length === 0) {
        alert("❌ কোনো ইলাস্ট্রেটর ডকুমেন্ট খোলা নেই!\nঅনুগ্রহ করে প্রথমে আপনার কার্ডের ফাইলটি ওপেন করুন।", "Card Numbering Pro");
        return;
    }

    var doc = app.activeDocument;
    var numABs = doc.artboards.length;
    var activeABIdx = doc.artboards.getActiveArtboardIndex();

    // Bengali Digits Table
    var bnDigits = ['\u09E6', '\u09E7', '\u09E8', '\u09E9', '\u09EA', '\u09EB', '\u09EC', '\u09ED', '\u09EE', '\u09EF'];
    var bnToAscii = {
        '\u09E6': '0', '\u09E7': '1', '\u09E8': '2', '\u09E9': '3', '\u09EA': '4',
        '\u09EB': '5', '\u09EC': '6', '\u09ED': '7', '\u09EE': '8', '\u09EF': '9'
    };

    // ==========================================================================
    // Helper: Item Visibility & Lock Check
    // ==========================================================================
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

    // ==========================================================================
    // Helper: Find Artboard Index for Bounds
    // ==========================================================================
    function getABIndex(gb) {
        if (!gb || numABs === 0) return 0;
        var midX = (gb[0] + gb[2]) / 2;
        var midY = (gb[1] + gb[3]) / 2;
        var closestAB = 0;
        var minDist = 999999999;

        for (var a = 0; a < numABs; a++) {
            var r = doc.artboards[a].artboardRect;
            // In Illustrator coordinates: r[0]=left, r[1]=top, r[2]=right, r[3]=bottom
            if (midX >= r[0] && midX <= r[2] && midY <= r[1] && midY >= r[3]) {
                return a;
            }
            var abCenterX = (r[0] + r[2]) / 2;
            var abCenterY = (r[1] + r[3]) / 2;
            var d = (midX - abCenterX) * (midX - abCenterX) + (midY - abCenterY) * (midY - abCenterY);
            if (d < minDist) {
                minDist = d;
                closestAB = a;
            }
        }
        return closestAB;
    }

    // ==========================================================================
    // Helper: Test if a TextFrame qualifies as a Card Serial Number
    // ==========================================================================
    function testCardSerialTF(tf, cardBounds) {
        if (!tf || tf.typename !== "TextFrame") return { valid: false, score: 0 };
        var txt = tf.contents ? tf.contents.replace(/^\s+|\s+$/g, "") : "";
        if (!txt || txt.length === 0) return { valid: false, score: 0 };

        // Exclude multi-line texts
        if (txt.indexOf("\r") !== -1 || txt.indexOf("\n") !== -1) return { valid: false, score: 0 };

        // Exclude typical biodata keywords
        if (/(?:নাম|পিতা|মাতা|গ্রাম|ডাক|পোস্ট|থানা|উপজেলা|জেলা|মোবাইল|ফোন|রক্ত|গ্রুপ|হিফ[জয]|কুরআন|মাদরাসা|মাদ্রাসা|বিভাগ|রোল|দাখেলা|ফরম|Form|Roll)/i.test(txt)) {
            return { valid: false, score: 0 };
        }

        // Exclude phone numbers (7 or more digits)
        var engDigits = txt.replace(/\D/g, "");
        var bngDigits = txt.replace(/[^০-৯]/g, "");
        if (engDigits.length >= 7 || bngDigits.length >= 7) {
            return { valid: false, score: 0 };
        }

        // Exclude 4-digit years (e.g. 2024, 2025, 2026, 2027, 1445, 1446)
        if (/^(?:19|20)\d\d$/.test(txt) || /^(?:১৪|১৫)[০-৯]{2}$/.test(txt) || /^(?:২০|১৯)[০-৯]{2}$/.test(txt)) {
            return { valid: false, score: 0 };
        }

        // Serial numbers are short: 1 to 5 characters max
        if (txt.length > 5) return { valid: false, score: 0 };

        var score = 10;

        // Pure digits get very high priority
        var isAllDigits = /^[0-9]+$/.test(txt) || /^[০-৯]+$/.test(txt);
        if (isAllDigits) score += 40;

        // Known serial number tokens or placeholders
        if (/^(?:00|0|000|০০|০|০০০|#|sl|নং|১|1)$/i.test(txt)) score += 30;

        // Spatial position relative to card boundaries
        if (cardBounds) {
            var tfgb = tf.geometricBounds;
            var cardW = Math.max(1, Math.abs(cardBounds[2] - cardBounds[0]));
            var cardH = Math.max(1, Math.abs(cardBounds[1] - cardBounds[3]));

            var relX = (tfgb[0] - cardBounds[0]) / cardW;
            var relY = (cardBounds[1] - tfgb[1]) / cardH;

            // In card designs, serial badges are at the bottom or bottom-right
            if (relY > 0.50) score += 30;
            if (relY > 0.70) score += 40; // close to bottom edge
            if (relX > 0.40) score += 20;
            if (relX > 0.60) score += 30; // bottom-right badge position
        }

        // Check text frame dimensions (serial badges are small)
        try {
            var tgb = tf.geometricBounds;
            var tw = Math.abs(tgb[2] - tgb[0]);
            var th = Math.abs(tgb[1] - tgb[3]);
            if (tw < 75 && th < 55) score += 20;
        } catch(e) {}

        return { valid: (score >= 40), score: score };
    }

    // ==========================================================================
    // Collect all sub-TextFrames inside a container (GroupItem, etc.)
    // ==========================================================================
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

    // ==========================================================================
    // Card Detection Engine
    // ==========================================================================
    function detectCards(scope) {
        var detected = [];
        var attachedTF = {};

        if (scope === "selection") {
            var sel = doc.selection;
            if (!sel || sel.length === 0) {
                return { error: "❌ কোনো কার্ড বা অবজেক্ট সিলেক্ট করা নেই!\nঅনুগ্রহ করে কার্ড সিলেক্ট করুন অথবা 'All Artboards' অপশনটি বেছে নিন।" };
            }

            for (var s = 0; s < sel.length; s++) {
                var itm = sel[s];
                if (!isItemVisibleAndUnlocked(itm)) continue;

                if (itm.typename === "GroupItem") {
                    var gb = itm.geometricBounds;
                    var tfs = [];
                    collectSubTFs(itm, tfs);
                    var bestTF = null;
                    var bestScore = -1;

                    for (var t = 0; t < tfs.length; t++) {
                        var tf = tfs[t];
                        var testRes = testCardSerialTF(tf, gb);
                        if (testRes.valid && testRes.score > bestScore) {
                            bestScore = testRes.score;
                            bestTF = tf;
                        }
                    }

                    if (bestTF) {
                        detected.push({
                            card: itm,
                            tf: bestTF,
                            bounds: gb,
                            centerX: (gb[0] + gb[2]) / 2,
                            centerY: (gb[1] + gb[3]) / 2,
                            width: Math.abs(gb[2] - gb[0]),
                            height: Math.abs(gb[1] - gb[3]),
                            artboardIndex: getABIndex(gb)
                        });
                        attachedTF[bestTF] = true;
                    }
                } else if (itm.typename === "TextFrame") {
                    var tgb = itm.geometricBounds;
                    var tRes = testCardSerialTF(itm, null);
                    if (tRes.valid) {
                        detected.push({
                            card: itm,
                            tf: itm,
                            bounds: tgb,
                            centerX: (tgb[0] + tgb[2]) / 2,
                            centerY: (tgb[1] + tgb[3]) / 2,
                            width: Math.abs(tgb[2] - tgb[0]),
                            height: Math.abs(tgb[1] - tgb[3]),
                            artboardIndex: getABIndex(tgb)
                        });
                        attachedTF[itm] = true;
                    }
                }
            }
        } else {
            // "all_artboards" or "active_artboard"
            var targetAB = (scope === "active_artboard") ? activeABIdx : null;

            // Phase 1: Scan for Card Groups
            for (var l = 0; l < doc.layers.length; l++) {
                var lyr = doc.layers[l];
                if (!lyr.visible || lyr.locked) continue;

                for (var p = 0; p < lyr.pageItems.length; p++) {
                    var pItem = lyr.pageItems[p];
                    if (!isItemVisibleAndUnlocked(pItem)) continue;

                    if (pItem.typename === "GroupItem") {
                        var cgb = pItem.geometricBounds;
                        var cW = Math.abs(cgb[2] - cgb[0]);
                        var cH = Math.abs(cgb[1] - cgb[3]);

                        // Exclude gigantic artboard-sized wrapper groups or tiny icon groups
                        if (cW > 600 && cH > 600) continue;
                        if (cW < 60 || cH < 30) continue;

                        var itemAB = getABIndex(cgb);
                        if (targetAB !== null && itemAB !== targetAB) continue;

                        var gTfs = [];
                        collectSubTFs(pItem, gTfs);
                        var gBestTF = null;
                        var gBestScore = -1;

                        for (var t = 0; t < gTfs.length; t++) {
                            var gtf = gTfs[t];
                            var gRes = testCardSerialTF(gtf, cgb);
                            if (gRes.valid && gRes.score > gBestScore) {
                                gBestScore = gRes.score;
                                gBestTF = gtf;
                            }
                        }

                        if (gBestTF) {
                            detected.push({
                                card: pItem,
                                tf: gBestTF,
                                bounds: cgb,
                                centerX: (cgb[0] + cgb[2]) / 2,
                                centerY: (cgb[1] + cgb[3]) / 2,
                                width: cW,
                                height: cH,
                                artboardIndex: itemAB
                            });
                            attachedTF[gBestTF] = true;
                        }
                    }
                }
            }

            // Phase 2: Fallback for loose or unattached serial number TextFrames
            for (var dt = 0; dt < doc.textFrames.length; dt++) {
                var dtf = doc.textFrames[dt];
                if (!isItemVisibleAndUnlocked(dtf) || attachedTF[dtf]) continue;

                var dgb = dtf.geometricBounds;
                var dw = Math.abs(dgb[2] - dgb[0]);
                var dh = Math.abs(dgb[1] - dgb[3]);
                if (dw > 85 || dh > 55) continue; // serial badges are small

                var dAB = getABIndex(dgb);
                if (targetAB !== null && dAB !== targetAB) continue;

                var dRes = testCardSerialTF(dtf, null);
                if (dRes.valid && dRes.score >= 50) {
                    detected.push({
                        card: dtf,
                        tf: dtf,
                        bounds: dgb,
                        centerX: (dgb[0] + dgb[2]) / 2,
                        centerY: (dgb[1] + dgb[3]) / 2,
                        width: dw,
                        height: dh,
                        artboardIndex: dAB
                    });
                    attachedTF[dtf] = true;
                }
            }
        }

        if (detected.length === 0) {
            return { error: "❌ কোনো কার্ডের সিরিয়াল নম্বর শনাক্ত করা যায়নি!\n\nপরামর্শ:\n1. কার্ডগুলো সিলেক্ট করে 'Selection Only' দিয়ে চেষ্টা করুন।\n2. অথবা নিশ্চিত করুন কার্ডের নিচের নম্বরের টেক্সট ফ্রেমটি লক বা হাইড করা নেই।" };
        }

        return { items: detected };
    }

    // ==========================================================================
    // Grid Sorting: Row-by-Row vs Column-by-Column
    // ==========================================================================
    function sortCards(items, direction) {
        if (!items || items.length <= 1) return items;

        // Group by Artboard
        var byAB = {};
        var abKeys = [];
        for (var i = 0; i < items.length; i++) {
            var ab = items[i].artboardIndex;
            if (!byAB[ab]) {
                byAB[ab] = [];
                abKeys.push(ab);
            }
            byAB[ab].push(items[i]);
        }
        abKeys.sort(function(a, b) { return a - b; });

        var sortedResult = [];

        for (var k = 0; k < abKeys.length; k++) {
            var abItems = byAB[abKeys[k]];

            if (direction === "column") {
                // Column-by-Column: Col 1 (top to bottom), Col 2 (top to bottom)...
                abItems.sort(function(a, b) { return a.centerX - b.centerX; });
                var cols = [];
                for (var i = 0; i < abItems.length; i++) {
                    var itm = abItems[i];
                    var placed = false;
                    for (var c = 0; c < cols.length; c++) {
                        var col = cols[c];
                        var thresh = Math.max(30, col.avgW * 0.45);
                        if (Math.abs(itm.centerX - col.avgX) <= thresh) {
                            col.items.push(itm);
                            var sumX = 0, sumW = 0;
                            for (var m = 0; m < col.items.length; m++) {
                                sumX += col.items[m].centerX;
                                sumW += col.items[m].width;
                            }
                            col.avgX = sumX / col.items.length;
                            col.avgW = sumW / col.items.length;
                            placed = true;
                            break;
                        }
                    }
                    if (!placed) {
                        cols.push({ avgX: itm.centerX, avgW: itm.width, items: [itm] });
                    }
                }
                cols.sort(function(a, b) { return a.avgX - b.avgX; });
                for (var c = 0; c < cols.length; c++) {
                    cols[c].items.sort(function(a, b) { return b.centerY - a.centerY; });
                    for (var r = 0; r < cols[c].items.length; r++) {
                        sortedResult.push(cols[c].items[r]);
                    }
                }
            } else {
                // Default: Row-by-Row: 1 - 2, 3 - 4, 5 - 6 ...
                abItems.sort(function(a, b) { return b.centerY - a.centerY; });
                var rows = [];
                for (var i = 0; i < abItems.length; i++) {
                    var itm = abItems[i];
                    var placed = false;
                    for (var r = 0; r < rows.length; r++) {
                        var row = rows[r];
                        var thresh = Math.max(25, row.avgH * 0.45);
                        if (Math.abs(itm.centerY - row.avgY) <= thresh) {
                            row.items.push(itm);
                            var sumY = 0, sumH = 0;
                            for (var m = 0; m < row.items.length; m++) {
                                sumY += row.items[m].centerY;
                                sumH += row.items[m].height;
                            }
                            row.avgY = sumY / row.items.length;
                            row.avgH = sumH / row.items.length;
                            placed = true;
                            break;
                        }
                    }
                    if (!placed) {
                        rows.push({ avgY: itm.centerY, avgH: itm.height, items: [itm] });
                    }
                }
                rows.sort(function(a, b) { return b.avgY - a.avgY; });
                for (var r = 0; r < rows.length; r++) {
                    rows[r].items.sort(function(a, b) { return a.centerX - b.centerX; });
                    for (var c = 0; c < rows[r].items.length; c++) {
                        sortedResult.push(rows[r].items[c]);
                    }
                }
            }
        }

        return sortedResult;
    }

    // ==========================================================================
    // Format Number with Language, Padding & SutonnyMJ Safety
    // ==========================================================================
    function formatCardNumber(num, padLen, styleMode, tf) {
        var str = String(num);
        while (str.length < padLen) {
            str = "0" + str;
        }

        var fontName = "";
        try {
            if (tf && tf.textRange && tf.textRange.characterAttributes && tf.textRange.characterAttributes.textFont) {
                fontName = tf.textRange.characterAttributes.textFont.name || "";
            }
        } catch(fe) {}

        var isSutonny = /sutonny/i.test(fontName);

        var useBengali = false;
        if (styleMode === "bn") {
            useBengali = true;
        } else if (styleMode === "eng") {
            useBengali = false;
        } else {
            // Auto-Detect: check font or existing text
            var cur = tf ? (tf.contents || "") : "";
            if (/[\u09E6-\u09EF]/.test(cur) || /bornomala|kalpurush|solaiman|siyam|bangla/i.test(fontName)) {
                useBengali = true;
            }
        }

        // SutonnyMJ Special Handling:
        // In SutonnyMJ (ANSI font), ASCII characters 0-9 produce Bengali glyphs ০-৯.
        // Inserting Unicode Bengali characters \u09E7 into SutonnyMJ causes broken glyphs!
        if (isSutonny) {
            return str;
        }

        if (useBengali) {
            var res = "";
            for (var i = 0; i < str.length; i++) {
                var ch = str.charAt(i);
                if (ch >= '0' && ch <= '9') {
                    res += bnDigits[parseInt(ch, 10)];
                } else {
                    res += ch;
                }
            }
            return res;
        }

        return str;
    }

    // ==========================================================================
    // Initial State & Scope Determination
    // ==========================================================================
    var initialScope = "all_artboards";
    var hasUserSelection = (doc.selection && doc.selection.length > 0);
    if (hasUserSelection) {
        initialScope = "selection";
    }

    // ==========================================================================
    // ScriptUI Dialog Window
    // ==========================================================================
    var dlg = new Window("dialog", "Card Numbering Pro - 1-Click Card Serial Fixer");
    dlg.orientation = "column";
    dlg.alignChildren = ["fill", "top"];
    dlg.spacing = 10;
    dlg.margins = 16;

    // Header Panel
    var pnlHead = dlg.add("panel", undefined, "কার্ড সিরিয়াল অটোমেশন (Card Serial Automation)");
    pnlHead.orientation = "column";
    pnlHead.alignChildren = ["fill", "top"];
    pnlHead.margins = 10;

    var lblStatus = pnlHead.add("statictext", undefined, "🔍 ডকুমেন্ট স্ক্যান করা হচ্ছে...", { multiline: false });
    lblStatus.graphics.foregroundColor = lblStatus.graphics.newPen(dlg.graphics.PenType.SOLID_COLOR, [0.0, 0.55, 0.25, 1], 1);

    // Target Scope Panel
    var pnlScope = dlg.add("panel", undefined, "Target Scope (টার্গেট পরিধি)");
    pnlScope.orientation = "row";
    pnlScope.alignChildren = ["left", "center"];
    pnlScope.margins = 10;
    var rbScopeAll = pnlScope.add("radiobutton", undefined, "সব আর্টবোর্ড (All Artboards)");
    var rbScopeActive = pnlScope.add("radiobutton", undefined, "বর্তমান আর্টবোর্ড (Active)");
    var rbScopeSel = pnlScope.add("radiobutton", undefined, "সিলেক্টেড কার্ড (Selection)");

    if (initialScope === "selection") rbScopeSel.value = true;
    else rbScopeAll.value = true;

    // Settings Panel
    var pnlOpts = dlg.add("panel", undefined, "Serial Settings (সিরিয়াল সেটিংস)");
    pnlOpts.orientation = "column";
    pnlOpts.alignChildren = ["fill", "top"];
    pnlOpts.spacing = 8;
    pnlOpts.margins = 10;

    // Row 1: Start Number & Style
    var grpR1 = pnlOpts.add("group");
    grpR1.orientation = "row";
    grpR1.alignChildren = ["left", "center"];
    grpR1.add("statictext", undefined, "শুরু হবে (Start Number):");
    var txtStart = grpR1.add("edittext", undefined, "1");
    txtStart.characters = 5;

    grpR1.add("statictext", undefined, "   ফরম্যাট / স্টাইল:");
    var ddlFormat = grpR1.add("dropdownlist", undefined, [
        "বাংলা: ১, ২, ৩... ১০০ (প্যাডিং ছাড়া - ছবিতে যেমন)",
        "বাংলা: ০১, ০২, ০৩... ১০০ (২ ডিজিট)",
        "বাংলা: ০০১, ০০২... ১০০ (৩ ডিজিট)",
        "English: 1, 2, 3... 100 (No Padding)",
        "English: 01, 02, 03... 100 (2 Digits)",
        "English: 001, 002... 100 (3 Digits)",
        "Auto-Detect (ফন্ট ও টেক্সট অনুযায়ী)"
    ]);
    ddlFormat.selection = 0; // Default: ১, ২, ৩... (matches image 2!)

    // Row 2: Fill Direction (Row-by-Row vs Column-by-Column)
    var grpR2 = pnlOpts.add("group");
    grpR2.orientation = "row";
    grpR2.alignChildren = ["left", "center"];
    grpR2.add("statictext", undefined, "সিরিয়াল ক্রম (Order):");
    var rbOrderRow = grpR2.add("radiobutton", undefined, "পাশাপাশি: ১ - ২, ৩ - ৪... (Row-by-Row)");
    var rbOrderCol = grpR2.add("radiobutton", undefined, "ওপর-নিচ: ১ - ৫, ২ - ৬... (Column-by-Column)");
    rbOrderRow.value = true;

    // Preview Panel
    var pnlPrev = dlg.add("panel", undefined, "লাইভ প্রিভিউ (Live Preview)");
    pnlPrev.orientation = "column";
    pnlPrev.alignChildren = ["fill", "top"];
    pnlPrev.margins = 10;
    var txtPreview = pnlPrev.add("edittext", undefined, "", { multiline: true, readonly: true });
    txtPreview.preferredSize.width = 460;
    txtPreview.preferredSize.height = 95;

    // Button Bar
    var grpBtn = dlg.add("group");
    grpBtn.orientation = "row";
    grpBtn.alignment = ["center", "top"];
    var btnApply = grpBtn.add("button", undefined, "⚡ ১ ক্লিকে সিরিয়াল বসান (Apply)", { name: "ok" });
    btnApply.preferredSize.width = 230;
    btnApply.preferredSize.height = 36;

    var btnRefresh = grpBtn.add("button", undefined, "🔄 রিফ্রেশ স্ক্যান");
    var btnCancel = grpBtn.add("button", undefined, "Cancel", { name: "cancel" });

    // Cache of detected items
    var currentDetectedItems = [];

    // ==========================================================================
    // Function to Update UI & Preview
    // ==========================================================================
    function refreshScan() {
        var scope = rbScopeAll.value ? "all_artboards" : (rbScopeActive.value ? "active_artboard" : "selection");
        var scanRes = detectCards(scope);

        if (scanRes.error) {
            lblStatus.text = "⚠️ " + scanRes.error.split("\n")[0];
            lblStatus.graphics.foregroundColor = lblStatus.graphics.newPen(dlg.graphics.PenType.SOLID_COLOR, [0.85, 0.1, 0.1, 1], 1);
            txtPreview.text = scanRes.error;
            btnApply.enabled = false;
            currentDetectedItems = [];
            return;
        }

        var direction = rbOrderRow.value ? "row" : "column";
        var sorted = sortCards(scanRes.items, direction);
        currentDetectedItems = sorted;

        btnApply.enabled = (sorted.length > 0);
        lblStatus.text = "✓ মোট " + sorted.length + " টি কার্ড শনাক্ত হয়েছে (" + (scope === "selection" ? "Selection" : (scope === "active_artboard" ? "Active Artboard" : numABs + " টি আর্টবোর্ড")) + ")";
        lblStatus.graphics.foregroundColor = lblStatus.graphics.newPen(dlg.graphics.PenType.SOLID_COLOR, [0.0, 0.55, 0.25, 1], 1);

        // Calculate preview
        var sNum = parseInt(txtStart.text, 10) || 1;
        var fmtIdx = ddlFormat.selection.index;
        var padLen = 1;
        var styleMode = "bn";

        if (fmtIdx === 0) { padLen = 1; styleMode = "bn"; }
        else if (fmtIdx === 1) { padLen = 2; styleMode = "bn"; }
        else if (fmtIdx === 2) { padLen = 3; styleMode = "bn"; }
        else if (fmtIdx === 3) { padLen = 1; styleMode = "eng"; }
        else if (fmtIdx === 4) { padLen = 2; styleMode = "eng"; }
        else if (fmtIdx === 5) { padLen = 3; styleMode = "eng"; }
        else { padLen = 1; styleMode = "auto"; }

        var prevLines = [];
        var maxShow = Math.min(sorted.length, 6);
        for (var i = 0; i < maxShow; i++) {
            var unit = sorted[i];
            var oldVal = unit.tf.contents ? unit.tf.contents.replace(/^\s+|\s+$/g, "") : "(empty)";
            var newVal = formatCardNumber(sNum + i, padLen, styleMode, unit.tf);
            prevLines.push("কার্ড #" + (i + 1) + " (AB " + (unit.artboardIndex + 1) + "): '" + oldVal + "' ➔ '" + newVal + "'");
        }
        if (sorted.length > maxShow) {
            var lastUnit = sorted[sorted.length - 1];
            var lastNewVal = formatCardNumber(sNum + (sorted.length - 1), padLen, styleMode, lastUnit.tf);
            prevLines.push("... এবং আরও " + (sorted.length - maxShow) + " টি কার্ড ... কার্ড #" + sorted.length + " ➔ '" + lastNewVal + "'");
        }

        txtPreview.text = prevLines.join("\n");
    }

    // Event Handlers for UI changes
    rbScopeAll.onClick = refreshScan;
    rbScopeActive.onClick = refreshScan;
    rbScopeSel.onClick = refreshScan;
    rbOrderRow.onClick = refreshScan;
    rbOrderCol.onClick = refreshScan;
    ddlFormat.onChange = refreshScan;
    txtStart.onChanging = refreshScan;
    btnRefresh.onClick = refreshScan;

    // Initial Scan Call
    refreshScan();

    // ==========================================================================
    // Apply Action (1-Click Execution)
    // ==========================================================================
    btnApply.onClick = function () {
        if (!currentDetectedItems || currentDetectedItems.length === 0) {
            alert("কোনো কার্ড পাওয়া যায়নি!", "Card Numbering Pro");
            return;
        }

        var sNum = parseInt(txtStart.text, 10) || 1;
        var fmtIdx = ddlFormat.selection.index;
        var padLen = 1;
        var styleMode = "bn";

        if (fmtIdx === 0) { padLen = 1; styleMode = "bn"; }
        else if (fmtIdx === 1) { padLen = 2; styleMode = "bn"; }
        else if (fmtIdx === 2) { padLen = 3; styleMode = "bn"; }
        else if (fmtIdx === 3) { padLen = 1; styleMode = "eng"; }
        else if (fmtIdx === 4) { padLen = 2; styleMode = "eng"; }
        else if (fmtIdx === 5) { padLen = 3; styleMode = "eng"; }
        else { padLen = 1; styleMode = "auto"; }

        var updatedCount = 0;

        for (var i = 0; i < currentDetectedItems.length; i++) {
            var unit = currentDetectedItems[i];
            var tf = unit.tf;
            var finalStr = formatCardNumber(sNum + i, padLen, styleMode, tf);

            try {
                // Preserve existing styling
                var origFont = null;
                var origSize = 10;
                var origColor = null;
                var origLeading = null;
                var origHScale = null;
                var origJust = null;

                if (tf.textRange && tf.textRange.characterAttributes) {
                    var ca = tf.textRange.characterAttributes;
                    origFont = ca.textFont;
                    origSize = ca.size;
                    origColor = ca.fillColor;
                    origLeading = ca.leading;
                    origHScale = ca.horizontalScale;
                }

                if (tf.paragraphs.length > 0 && tf.paragraphs[0].paragraphAttributes) {
                    origJust = tf.paragraphs[0].paragraphAttributes.justification;
                }

                // Apply new number
                tf.contents = finalStr;

                // Re-apply preserved attributes
                if (tf.textRange && tf.textRange.characterAttributes) {
                    var ca2 = tf.textRange.characterAttributes;
                    if (origFont) ca2.textFont = origFont;
                    if (origSize > 0) ca2.size = origSize;
                    if (origColor && origColor.typename !== "NoColor") ca2.fillColor = origColor;
                    if (origLeading > 0) ca2.leading = origLeading;
                    if (origHScale > 0) ca2.horizontalScale = origHScale;
                }

                if (origJust !== null && tf.paragraphs.length > 0 && tf.paragraphs[0].paragraphAttributes) {
                    tf.paragraphs[0].paragraphAttributes.justification = origJust;
                }

                updatedCount++;
            } catch(e) {}
        }

        try { app.redraw(); } catch(e) {}

        var firstNumStr = formatCardNumber(sNum, padLen, styleMode, null);
        var lastNumStr = formatCardNumber(sNum + updatedCount - 1, padLen, styleMode, null);

        alert("✓ সফলভাবে " + updatedCount + " টি কার্ডে সিরিয়াল নম্বর বসানো হয়েছে!\n" +
              "রেঞ্জ: " + firstNumStr + " থেকে " + lastNumStr + " পর্যন্ত সাজানো হয়েছে।\n\n" +
              "Developed by Yahia Bin Zaman", "Card Numbering Pro - Success");

        dlg.close();
    };

    btnCancel.onClick = function () {
        dlg.close();
    };

    dlg.show();
})();
