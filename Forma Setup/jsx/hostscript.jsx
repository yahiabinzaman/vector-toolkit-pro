/**
 * ColorLab Forma Setup Pro - Core ExtendScript Engine
 * Author: Yahia Bin Zaman / ColorLab
 * Host: Adobe Illustrator (CC 2014 - 2026+)
 */

#target illustrator

$.global.FormaEngine = (function () {
    "use strict";

    function toJson(obj) {
        if (obj === null) return "null";
        if (typeof obj === "undefined") return "undefined";
        if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
        if (typeof obj === "string") {
            var s = obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
            var out = '"';
            for (var c = 0; c < s.length; c++) {
                var code = s.charCodeAt(c);
                if (code > 127) {
                    var hex = code.toString(16);
                    while (hex.length < 4) hex = "0" + hex;
                    out += "\\u" + hex;
                } else {
                    out += s.charAt(c);
                }
            }
            return out + '"';
        }
        if (obj instanceof Array) {
            var arrRes = [];
            for (var a = 0; a < obj.length; a++) arrRes.push(toJson(obj[a]));
            return "[" + arrRes.join(",") + "]";
        }
        if (typeof obj === "object") {
            var objRes = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) objRes.push(toJson(key) + ":" + toJson(obj[key]));
            }
            return "{" + objRes.join(",") + "}";
        }
        return '""';
    }

    /**
     * Finds the True Page Trim Bounds [left, top, right, bottom] of a page group.
     * Prevents oversized bleed images, unclipped elements, or stray points from
     * throwing off the page alignment.
     */
    function getPageTrimBounds(item, abW, abH) {
        if (!item) return null;

        var TOL = 6; // tolerance in points

        function matchesTrim(w, h) {
            if (!abW || !abH) return false;
            return ((Math.abs(w - abW) <= TOL && Math.abs(h - abH) <= TOL) ||
                    (Math.abs(w - abH) <= TOL && Math.abs(h - abW) <= TOL));
        }

        // Tier 1: Check if item itself is a clipped group
        if (item.typename === "GroupItem" && item.clipped) {
            for (var c = 0; c < item.pageItems.length; c++) {
                if (item.pageItems[c].clipping) {
                    return item.pageItems[c].geometricBounds;
                }
            }
        }

        // Tier 2: Check inside the group for an exact trim-sized background element
        if (item.typename === "GroupItem" && item.pageItems && item.pageItems.length > 0) {
            for (var i = item.pageItems.length - 1; i >= 0; i--) {
                var ch = item.pageItems[i];
                var cb = ch.geometricBounds;
                var cw = Math.abs(cb[2] - cb[0]);
                var ch_h = Math.abs(cb[1] - cb[3]);
                if (matchesTrim(cw, ch_h)) {
                    return cb;
                }
            }

            for (var j = 0; j < item.pageItems.length; j++) {
                var ch2 = item.pageItems[j];
                if (ch2.typename === "GroupItem" && ch2.clipped && ch2.pageItems.length > 0) {
                    for (var k = 0; k < ch2.pageItems.length; k++) {
                        if (ch2.pageItems[k].clipping) {
                            var mb = ch2.pageItems[k].geometricBounds;
                            var mw = Math.abs(mb[2] - mb[0]);
                            var mh = Math.abs(mb[1] - mb[3]);
                            if (matchesTrim(mw, mh)) return mb;
                        }
                    }
                }
            }
        }

        // Tier 3: Fallback to item.geometricBounds
        return item.geometricBounds;
    }

    function getItemBounds(item) {
        return getPageTrimBounds(item);
    }

    // Sort artboards by true visual 4x4 spatial grid (Row 1..4, Col 1..4)
    function getSpatiallySortedArtboards(doc, requiredCount) {
        var abs = [];
        for (var i = 0; i < doc.artboards.length; i++) {
            var r = doc.artboards[i].artboardRect;
            abs.push({
                index: i,
                artboard: doc.artboards[i],
                cx: (r[0] + r[2]) / 2,
                cy: (r[1] + r[3]) / 2
            });
        }

        abs.sort(function (a, b) { return b.cy - a.cy; });
        var byX = function (a, b) { return a.cx - b.cx; };

        if (requiredCount === 16 && abs.length >= 16) {
            var r1 = abs.slice(0, 4);
            var r2 = abs.slice(4, 8);
            var r3 = abs.slice(8, 12);
            var r4 = abs.slice(12, 16);

            r1.sort(byX);
            r2.sort(byX);
            r3.sort(byX);
            r4.sort(byX);

            var grid16 = [];
            var rowList = [r1, r2, r3, r4];
            for (var rw = 0; rw < 4; rw++) {
                for (var cl = 0; cl < 4; cl++) {
                    grid16.push(rowList[rw][cl].artboard);
                }
            }
            return grid16;

        } else if (requiredCount === 8 && abs.length >= 8) {
            var top4 = abs.slice(0, 4);
            var bot4 = abs.slice(4, 8);
            top4.sort(byX);
            bot4.sort(byX);

            var grid8 = [];
            for (var t = 0; t < 4; t++) grid8.push(top4[t].artboard);
            for (var b = 0; b < 4; b++) grid8.push(bot4[b].artboard);
            return grid8;
        }

        var fallback = [];
        for (var f = 0; f < doc.artboards.length; f++) fallback.push(doc.artboards[f]);
        return fallback;
    }

    // Precise 2-Row Grid Sorter (for 16 pages placed in 2 rows of 8: Row 1 = 1..8, Row 2 = 9..16)
    function sortSelected16Pages(items) {
        var list = [];
        for (var i = 0; i < items.length; i++) {
            var b = getItemBounds(items[i]);
            var cx = (b[0] + b[2]) / 2;
            var cy = (b[1] + b[3]) / 2;
            list.push({ item: items[i], cx: cx, cy: cy });
        }

        list.sort(function (a, b) { return b.cy - a.cy; });

        if (items.length === 16) {
            var row1 = list.slice(0, 8);
            var row2 = list.slice(8, 16);
            row1.sort(function (a, b) { return a.cx - b.cx; });
            row2.sort(function (a, b) { return a.cx - b.cx; });

            var sorted16 = [];
            for (var r1 = 0; r1 < 8; r1++) sorted16.push(row1[r1].item);
            for (var r2 = 0; r2 < 8; r2++) sorted16.push(row2[r2].item);
            return sorted16;

        } else if (items.length === 8) {
            var rTop = list.slice(0, 4);
            var rBot = list.slice(4, 8);
            rTop.sort(function (a, b) { return a.cx - b.cx; });
            rBot.sort(function (a, b) { return a.cx - b.cx; });

            var sorted8 = [];
            for (var t = 0; t < 4; t++) sorted8.push(rTop[t].item);
            for (var u = 0; u < 4; u++) sorted8.push(rBot[u].item);
            return sorted8;
        }

        list.sort(function (a, b) { return a.cx - b.cx; });
        var fb = [];
        for (var j = 0; j < list.length; j++) fb.push(list[j].item);
        return fb;
    }

    /**
     * 16-Page Offset Imposition Plate Layout:
     *   Row 0: [ Slot 0: Page 8,  Slot 1: Page 1,  Slot 2: Page 2,  Slot 3: Page 7  ]
     *   Row 1: [ Slot 4: Page 9,  Slot 5: Page 16, Slot 6: Page 15, Slot 7: Page 10 ]
     *   Row 2: [ Slot 8: Page 12, Slot 9: Page 13, Slot 10: Page 14, Slot 11: Page 11 ]
     *   Row 3: [ Slot 12: Page 5, Slot 13: Page 4, Slot 14: Page 3, Slot 15: Page 6 ]
     */
    var PAGE_TO_SLOT_16 = {
        1: 1, 2: 2, 3: 14, 4: 13, 5: 12, 6: 15, 7: 3, 8: 0,
        9: 4, 10: 7, 11: 11, 12: 8, 13: 9, 14: 10, 15: 6, 16: 5
    };

    var PAGE_TO_SLOT_8 = {
        1: 1, 2: 2, 3: 6, 4: 5, 5: 4, 6: 7, 7: 3, 8: 0
    };

    /**
     * Exact User-Specified Column Rotations:
     * Col 0: 8, 9, 12, 5  -> Dan dike (Right / Clockwise = 270° or -90°)
     * Col 1: 1, 16, 13, 4 -> Bam dike (Left / Counter-Clockwise = 90°)
     * Col 2: 2, 15, 14, 3 -> Dan dike (Right / Clockwise = 270° or -90°)
     * Col 3: 7, 10, 11, 6 -> Bam dike (Left / Counter-Clockwise = 90°)
     */
    var PAGE_ROTATION_16 = {
        8: 270, 9: 270, 12: 270, 5: 270,
        1: 90,  16: 90, 13: 90,  4: 90,
        2: 270, 15: 270, 14: 270, 3: 270,
        7: 90,  10: 90, 11: 90,  6: 90
    };

    var PAGE_ROTATION_8 = {
        8: 270, 5: 270,
        1: 90,  4: 90,
        2: 270, 3: 270,
        7: 90,  6: 90
    };

    /**
     * Album 16-Page Front & Back (Jhuri) Imposition Mapping:
     * Left Sheet (Front):
     *   Row 1 (Top): Col 0: Page 5 (180°), Col 1: Page 12 (180°), Col 2: Page 9 (180°), Col 3: Page 8 (180°)
     *   Row 2 (Bot): Col 0: Page 4 (0°),   Col 1: Page 13 (0°),   Col 2: Page 16 (0°),  Col 3: Page 1 (0°)
     * Right Sheet (Back):
     *   Row 1 (Top): Col 0: Page 7 (180°), Col 1: Page 10 (180°), Col 2: Page 11 (180°), Col 3: Page 6 (180°)
     *   Row 2 (Bot): Col 0: Page 2 (0°),   Col 1: Page 15 (0°),   Col 2: Page 14 (0°),  Col 3: Page 3 (0°)
     */
    var ALBUM_TARGETS = {
        1:  { cx: 600,  cy: -732, rot: 0   }, // Left Sheet, Bot, Col 3
        2:  { cx: 1108, cy: -732, rot: 0   }, // Right Sheet, Bot, Col 0
        3:  { cx: 2426, cy: -732, rot: 0   }, // Right Sheet, Bot, Col 3
        4:  { cx: -717, cy: -732, rot: 0   }, // Left Sheet, Bot, Col 0
        5:  { cx: -717, cy: -96,  rot: 180 }, // Left Sheet, Top, Col 0 (5)
        6:  { cx: 2426, cy: -96,  rot: 180 }, // Right Sheet, Top, Col 3 (6)
        7:  { cx: 1108, cy: -96,  rot: 180 }, // Right Sheet, Top, Col 0 (7)
        8:  { cx: 600,  cy: -96,  rot: 180 }, // Left Sheet, Top, Col 3 (8)
        9:  { cx: 161,  cy: -96,  rot: 180 }, // Left Sheet, Top, Col 2 (9)
        10: { cx: 1548, cy: -96,  rot: 180 }, // Right Sheet, Top, Col 1 (10)
        11: { cx: 1987, cy: -96,  rot: 180 }, // Right Sheet, Top, Col 2 (11)
        12: { cx: -278, cy: -96,  rot: 180 }, // Left Sheet, Top, Col 1 (12)
        13: { cx: -278, cy: -732, rot: 0   }, // Left Sheet, Bot, Col 1 (13)
        14: { cx: 1987, cy: -732, rot: 0   }, // Right Sheet, Bot, Col 2 (14)
        15: { cx: 1548, cy: -732, rot: 0   }, // Right Sheet, Bot, Col 1 (15)
        16: { cx: 161,  cy: -732, rot: 0   }  // Left Sheet, Bot, Col 2 (16)
    };

    var ALBUM_16_ARTBOARD_RECTS = {
        1:  [380.75, -414.14, 819.95, -1050.62],  // Left Sheet, Bot, Col 3
        2:  [888.79, -414.14, 1327.99, -1050.62], // Right Sheet, Bot, Col 0
        3:  [2206.39, -414.14, 2645.59, -1050.62],// Right Sheet, Bot, Col 3
        4:  [-936.85, -414.14, -497.65, -1050.62],// Left Sheet, Bot, Col 0
        5:  [-936.85, 222.34, -497.65, -414.14],  // Left Sheet, Top, Col 0 (5)
        6:  [2206.39, 222.34, 2645.59, -414.14],  // Right Sheet, Top, Col 3 (6)
        7:  [888.79, 222.34, 1327.99, -414.14],   // Right Sheet, Top, Col 0 (7)
        8:  [380.75, 222.34, 819.95, -414.14],   // Left Sheet, Top, Col 3 (8)
        9:  [-58.45, 222.34, 380.75, -414.14],    // Left Sheet, Top, Col 2 (9)
        10: [1327.99, 222.34, 1767.19, -414.14],  // Right Sheet, Top, Col 1 (10)
        11: [1767.19, 222.34, 2206.39, -414.14],  // Right Sheet, Top, Col 2 (11)
        12: [-497.65, 222.34, -58.45, -414.14],   // Left Sheet, Top, Col 1 (12)
        13: [-497.65, -414.14, -58.45, -1050.62], // Left Sheet, Bot, Col 1 (13)
        14: [1767.19, -414.14, 2206.39, -1050.62],// Right Sheet, Bot, Col 2 (14)
        15: [1327.99, -414.14, 1767.19, -1050.62],// Right Sheet, Bot, Col 1 (15)
        16: [-58.45, -414.14, 380.75, -1050.62]   // Left Sheet, Bot, Col 2 (16)
    };

    function findArtboardForSlot(doc, target) {
        var bestAb = null;
        var minDist = 999999;
        for (var a = 0; a < doc.artboards.length; a++) {
            var ab = doc.artboards[a];
            var r = ab.artboardRect;
            var cx = (r[0] + r[2]) / 2;
            var cy = (r[1] + r[3]) / 2;
            var dist = Math.sqrt(Math.pow(cx - target.cx, 2) + Math.pow(cy - target.cy, 2));
            if (dist < minDist) {
                minDist = dist;
                bestAb = ab;
            }
        }
        return (minDist < 300) ? bestAb : null;
    }

    function getAlbum16ArtboardGrid(doc) {
        var abs = [];
        for (var a = 0; a < doc.artboards.length; a++) {
            var ab = doc.artboards[a];
            var r = ab.artboardRect;
            var cx = (r[0] + r[2]) / 2;
            var cy = (r[1] + r[3]) / 2;
            abs.push({ ab: ab, cx: cx, cy: cy });
        }

        if (abs.length < 16) return null;

        // 1. Sort by CX to separate Left 8 (Front Sheet) and Right 8 (Back Sheet)
        abs.sort(function (a, b) { return a.cx - b.cx; });
        var left8 = abs.slice(0, 8);
        var right8 = abs.slice(8, 16);

        // 2. Left Sheet: Sort by CY (top 4 vs bot 4)
        left8.sort(function (a, b) { return b.cy - a.cy; });
        var leftTop = left8.slice(0, 4);
        var leftBot = left8.slice(4, 8);
        // Sort each row from left to right (by CX)
        leftTop.sort(function (a, b) { return a.cx - b.cx; });
        leftBot.sort(function (a, b) { return a.cx - b.cx; });

        // 3. Right Sheet: Sort by CY (top 4 vs bot 4)
        right8.sort(function (a, b) { return b.cy - a.cy; });
        var rightTop = right8.slice(0, 4);
        var rightBot = right8.slice(4, 8);
        // Sort each row from left to right (by CX)
        rightTop.sort(function (a, b) { return a.cx - b.cx; });
        rightBot.sort(function (a, b) { return a.cx - b.cx; });

        return {
            leftTop: [leftTop[0].ab, leftTop[1].ab, leftTop[2].ab, leftTop[3].ab],
            leftBot: [leftBot[0].ab, leftBot[1].ab, leftBot[2].ab, leftBot[3].ab],
            rightTop: [rightTop[0].ab, rightTop[1].ab, rightTop[2].ab, rightTop[3].ab],
            rightBot: [rightBot[0].ab, rightBot[1].ab, rightBot[2].ab, rightBot[3].ab]
        };
    }

    function ensureAlbum16Artboards(doc) {
        while (doc.artboards.length > 1) {
            doc.artboards[doc.artboards.length - 1].remove();
        }
        doc.artboards[0].artboardRect = ALBUM_16_ARTBOARD_RECTS[1];
        doc.artboards[0].name = "01 - Artboard 1";

        for (var p = 2; p <= 16; p++) {
            var newAb = doc.artboards.add(ALBUM_16_ARTBOARD_RECTS[p]);
            newAb.name = (p < 10 ? "0" + p : p) + " - Artboard " + p;
        }
        doc.artboards.setActiveArtboardIndex(0);
    }

    function getArtboardForPage(doc, pageNum, sectionType, requiredPages) {
        if (sectionType === "album_16") {
            // Priority 1: Match by artboard name (e.g. "05 - Artboard 5", "Artboard 5", "12 - Artboard 12")
            for (var a = 0; a < doc.artboards.length; a++) {
                var abName = doc.artboards[a].name;
                var m = abName.match(/Artboard\s*(\d+)/i);
                if (m && parseInt(m[1], 10) === pageNum) {
                    return doc.artboards[a];
                }
            }
            // Priority 2: Match by exact slot position
            var tgt = ALBUM_TARGETS[pageNum];
            if (tgt) {
                var abBySlot = findArtboardForSlot(doc, tgt);
                if (abBySlot) return abBySlot;
            }
        }
        var spatial = getSpatiallySortedArtboards(doc, requiredPages);
        if (spatial && spatial.length >= requiredPages) {
            var slot = (requiredPages === 8) ? PAGE_TO_SLOT_8[pageNum] : PAGE_TO_SLOT_16[pageNum];
            if (slot !== undefined && spatial[slot]) {
                return spatial[slot];
            }
        }
        return (pageNum - 1 < doc.artboards.length) ? doc.artboards[pageNum - 1] : null;
    }

    function getPageRotation(pageNum, sectionType, requiredPages) {
        if (sectionType === "album_16") {
            return (ALBUM_TARGETS[pageNum] !== undefined) ? ALBUM_TARGETS[pageNum].rot : 0;
        }
        if (requiredPages === 8) {
            return (PAGE_ROTATION_8[pageNum] !== undefined) ? PAGE_ROTATION_8[pageNum] : 90;
        }
        return (PAGE_ROTATION_16[pageNum] !== undefined) ? PAGE_ROTATION_16[pageNum] : 90;
    }

    function repairRotatedClippingMasks(item) {
        if (!item || item.typename !== "GroupItem") return;
        try {
            if (item.clipped) {
                // If the clipped group contains a single-item Group wrapper, unwrap it to fix Illustrator clipping bug
                if (item.pageItems && item.pageItems.length === 2 && item.pageItems[1].typename === "GroupItem" && item.pageItems[1].pageItems.length === 1) {
                    var nested = item.pageItems[1];
                    var inner = nested.pageItems[0];
                    inner.move(item, ElementPlacement.PLACEATEND);
                    nested.remove();
                }
                item.clipped = false;
                item.clipped = true;
            }
            if (item.pageItems) {
                for (var i = 0; i < item.pageItems.length; i++) {
                    var ch = item.pageItems[i];
                    if (ch.typename === "GroupItem") {
                        repairRotatedClippingMasks(ch);
                    }
                }
            }
        } catch (e) {}
    }

    function releaseBrokenFrameOpacityMasks(doc, item) {
        if (!item) return;
        try {
            var name = (item.name || "").toLowerCase();
            if (name.indexOf("frame") !== -1 || name.indexOf("ribon") !== -1 || name.indexOf(".psd") !== -1) {
                try {
                    doc.selection = [item];
                    app.executeMenuCommand("releaseMask");
                } catch (eRel) {}
            }
            if (item.typename === "GroupItem" && item.pageItems) {
                for (var i = 0; i < item.pageItems.length; i++) {
                    releaseBrokenFrameOpacityMasks(doc, item.pageItems[i]);
                }
            }
        } catch (e) {}
    }

    function placeOnArtboard(item, artboard, rotAngle) {
        var doc = app.activeDocument;
        var abRect = artboard.artboardRect;
        var abW = Math.abs(abRect[2] - abRect[0]);
        var abH = Math.abs(abRect[1] - abRect[3]);

        if (rotAngle && rotAngle !== 0) {
            item.rotate(rotAngle, true, true, true, true, Transformation.CENTER);
            repairRotatedClippingMasks(item);
            releaseBrokenFrameOpacityMasks(doc, item);
        }

        var abTargetCX = (abRect[0] + abRect[2]) / 2;
        var abTargetCY = (abRect[1] + abRect[3]) / 2;

        var bAfter = getPageTrimBounds(item, abW, abH);
        var curTrimCX = (bAfter[0] + bAfter[2]) / 2;
        var curTrimCY = (bAfter[1] + bAfter[3]) / 2;

        item.translate(abTargetCX - curTrimCX, abTargetCY - curTrimCY);
    }

    function updatePlateSlugText(doc, jobNameBn) {
        if (!doc || !jobNameBn || jobNameBn.length === 0) return 0;
        var CHAPA = "\u099B\u09BE\u09AA\u09BE"; // ছাপা
        var AL = "\u0986\u09B2"; // আল
        var BYAK = "\u09AC\u09CD\u09AF\u09BE\u0995"; // ব্যাক
        var JHURI = "\u099C\u09C1\u09DC\u09BF"; // জুড়ি
        var FORMA = "\u09AB\u09B0\u09CD\u09AE\u09BE"; // ফর্মা

        var updatedCount = 0;
        for (var t = 0; t < doc.textFrames.length; t++) {
            var tf = doc.textFrames[t];
            var c = tf.contents;
            if (c.length < 100 && c.indexOf(FORMA) === -1 && (c.indexOf(CHAPA) !== -1 || c.indexOf(AL) !== -1 || c.indexOf(JHURI) !== -1 || c.indexOf(BYAK) !== -1)) {
                if (c.indexOf(jobNameBn) !== -1) {
                    updatedCount++;
                    continue;
                }
                var alIdx = c.indexOf(AL);
                if (alIdx !== -1) {
                    var suffix = c.substring(alIdx);
                    tf.contents = jobNameBn + " - " + suffix;
                } else if (c.indexOf("-") !== -1) {
                    var parts = c.split("-");
                    var sfx = parts.slice(1).join("-").replace(/^[\s\-_—]+/, "");
                    tf.contents = jobNameBn + " - " + sfx;
                } else {
                    tf.contents = jobNameBn + " - " + c.replace(/^[\s\-_—]+/, "");
                }
                updatedCount++;
            }
        }
        return updatedCount;
    }

    function isAlbumDoc(doc, sectionType) {
        if (!doc) return false;
        if (sectionType === "album_16" || sectionType === "album_8") return true;

        // 1. Check document name
        var lower = doc.name.toLowerCase();
        if (lower.indexOf("album") !== -1 || lower.indexOf("jhuri") !== -1 ||
            lower.indexOf("front & back") !== -1 || lower.indexOf("back to back") !== -1 ||
            doc.name.indexOf("\u0986\u09B2") !== -1 || // আল
            doc.name.indexOf("\u09AC\u09CD\u09AF\u09BE\u0995") !== -1 || // ব্যাক
            doc.name.indexOf("\u099C\u09C1\u09DC\u09BF") !== -1 || // জুড়ি
            doc.name.indexOf("\u099D\u09C1\u09DC\u09BF") !== -1) { // ঝুড়ি
            return true;
        }

        // 2. Check artboard names (e.g. "Front Sheet", "Back Sheet", or "05 - Artboard 5" at top-left)
        for (var a = 0; a < doc.artboards.length; a++) {
            var abName = doc.artboards[a].name.toLowerCase();
            if (abName.indexOf("front sheet") !== -1 || abName.indexOf("back sheet") !== -1) {
                return true;
            }
        }

        // 3. Check 16 artboards portrait orientation (Album pages are portrait, inner/note sheets are landscape)
        if (doc.artboards.length === 16) {
            var r = doc.artboards[0].artboardRect;
            var w = Math.abs(r[2] - r[0]);
            var h = Math.abs(r[1] - r[3]);
            if (h > w) return true;
        }

        // 4. Check text frame contents (looking for "ব্যাক টু ব্যাক", "আল - ", or "জুড়ি")
        try {
            for (var t = 0; t < doc.textFrames.length; t++) {
                var tc = doc.textFrames[t].contents;
                if (tc.indexOf("\u09AC\u09CD\u09AF\u09BE\u0995 \u099F\u09C1 \u09AC\u09CD\u09AF\u09BE\u0995") !== -1 || // ব্যাক টু ব্যাক
                    tc.indexOf("\u0986\u09B2 -") !== -1 || // আল -
                    tc.indexOf("\u099C\u09C1\u09DC\u09BF") !== -1 || // জুড়ি
                    tc.indexOf("Back to Back") !== -1) {
                    return true;
                }
            }
        } catch (e) {}

        return false;
    }

    function setupAlbumSheetArtboards(doc) {
        for (var l = 0; l < doc.layers.length; l++) {
            doc.layers[l].locked = false;
            doc.layers[l].visible = true;
        }
        try { app.executeMenuCommand("unlockAll"); } catch (e) {}
        try { app.executeMenuCommand("showAll"); } catch (e) {}

        // Exact horizontal divider between Left (Front) and Right (Back) sheets
        var DIVIDER_X = 854;

        var leftItems = [];
        var rightItems = [];
        var minX_L = 999999, maxX_L = -999999, minY_L = 999999, maxY_L = -999999;
        var minX_R = 999999, maxX_R = -999999, minY_R = 999999, maxY_R = -999999;
        var foundL = false, foundR = false;

        for (var iLay = 0; iLay < doc.layers.length; iLay++) {
            var lay = doc.layers[iLay];
            for (var j = 0; j < lay.pageItems.length; j++) {
                var it = lay.pageItems[j];
                if (it.guides) continue; // skip ruler guides
                var gb = it.geometricBounds;
                var cx = (gb[0] + gb[2]) / 2;

                if (cx < DIVIDER_X) {
                    leftItems.push(it);
                    if (gb[0] < minX_L) minX_L = gb[0];
                    if (gb[1] > maxY_L) maxY_L = gb[1];
                    if (gb[2] > maxX_L) maxX_L = gb[2];
                    if (gb[3] < minY_L) minY_L = gb[3];
                    foundL = true;
                } else {
                    rightItems.push(it);
                    if (gb[0] < minX_R) minX_R = gb[0];
                    if (gb[1] > maxY_R) maxY_R = gb[1];
                    if (gb[2] > maxX_R) maxX_R = gb[2];
                    if (gb[3] < minY_R) minY_R = gb[3];
                    foundR = true;
                }
            }
        }

        // Safe DOM grouping (never throws "Can't make a group of objects that are within different groups")
        var mainLay = doc.layers[0];
        var leftGroup = null;
        if (leftItems.length > 0) {
            try {
                leftGroup = mainLay.groupItems.add();
                leftGroup.name = "Front Sheet (Sheet 1)";
                for (var li = leftItems.length - 1; li >= 0; li--) {
                    try {
                        leftItems[li].move(leftGroup, ElementPlacement.PLACEATBEGINNING);
                    } catch (e) {}
                }
            } catch (e) {}
        }

        var rightGroup = null;
        if (rightItems.length > 0) {
            try {
                rightGroup = mainLay.groupItems.add();
                rightGroup.name = "Back Sheet (Sheet 2)";
                for (var ri = rightItems.length - 1; ri >= 0; ri--) {
                    try {
                        rightItems[ri].move(rightGroup, ElementPlacement.PLACEATBEGINNING);
                    } catch (e) {}
                }
            } catch (e) {}
        }

        var bLeft = foundL ? [minX_L, maxY_L, maxX_L, minY_L] : (leftGroup ? leftGroup.geometricBounds : null);
        var bRight = foundR ? [minX_R, maxY_R, maxX_R, minY_R] : (rightGroup ? rightGroup.geometricBounds : null);

        if (!bLeft || !bRight) {
            throw new Error("অ্যালবাম শিটের গ্রুপ তৈরি করা যায়নি!");
        }

        // 4. Remove extra artboards and set exactly 2 fitted artboards
        while (doc.artboards.length > 1) {
            doc.artboards[doc.artboards.length - 1].remove();
        }
        doc.artboards[0].artboardRect = bLeft;
        doc.artboards[0].name = "Front Sheet";

        var ab2 = doc.artboards.add(bRight);
        ab2.name = "Back Sheet";

        doc.artboards.setActiveArtboardIndex(0);
        app.redraw();

        var w1 = Math.round(((bLeft[2] - bLeft[0]) / 72) * 100) / 100;
        var h1 = Math.round(((bLeft[1] - bLeft[3]) / 72) * 100) / 100;
        var w2 = Math.round(((bRight[2] - bRight[0]) / 72) * 100) / 100;
        var h2 = Math.round(((bRight[1] - bRight[3]) / 72) * 100) / 100;

        return { w1: w1, h1: h1, w2: w2, h2: h2 };
    }

    function isItemInRoots(it, roots) {
        if (!it || !roots) return false;
        var curr = it;
        while (curr) {
            for (var r = 0; r < roots.length; r++) {
                if (curr === roots[r]) return true;
            }
            if (curr.parent && curr.parent.typename !== "Layer" && curr.parent.typename !== "Document") {
                curr = curr.parent;
            } else {
                break;
            }
        }
 
    }

    function isTemplateNumberCandidate(it) {
        if (!it) return false;
        if (it.guides || it.clipping || it.clipped) return false;
        var tn = it.typename;
        if (tn === "PlacedItem" || tn === "RasterItem" || tn === "MeshItem" || tn === "TextFrame") return false;

        if (tn === "GroupItem") {
            // Must have 1 to 5 children, none of which are images, text, or clipping masks
            if (!it.pageItems || it.pageItems.length === 0 || it.pageItems.length > 5) return false;
            for (var g = 0; g < it.pageItems.length; g++) {
                var ch = it.pageItems[g];
                var ctn = ch.typename;
                if (ctn === "PlacedItem" || ctn === "RasterItem" || ctn === "MeshItem" || ctn === "TextFrame" || ch.clipping || ch.clipped) {
                    return false;
                }
            }
            return true;
        }

        if (tn === "CompoundPathItem" || tn === "PathItem") {
            return true;
        }

        return false;
    }

    function cleanGridNumbers(doc, userSelItems) {
        var removed = 0;

        function checkAndRemove(it) {
            if (!it) return false;
            // NEVER touch anything that is part of the user's selected artwork!
            if (userSelItems && isItemInRoots(it, userSelItems)) return false;

            if (!isTemplateNumberCandidate(it)) return false;

            var gb;
            try { gb = it.geometricBounds; } catch (e) { return false; }
            if (!gb) return false;
            var w = Math.abs(gb[2] - gb[0]);
            var h = Math.abs(gb[1] - gb[3]);

            // Template guide numbers are 30-260 pt wide, 50-220 pt tall
            if (w < 30 || w > 260 || h < 50 || h > 220) return false;

            var cx = (gb[0] + gb[2]) / 2;
            var cy = (gb[1] + gb[3]) / 2;

            for (var p = 1; p <= 16; p++) {
                var tgt = ALBUM_TARGETS[p];
                // Match slot center within 40 pt
                if (Math.abs(cx - tgt.cx) < 40 && Math.abs(cy - tgt.cy) < 40) {
                    try {
                        it.remove();
                        removed++;
                        return true;
                    } catch (eRem) {}
                }
            }
            return false;
        }

        function scanItems(parent) {
            if (!parent || !parent.pageItems) return;
            for (var i = parent.pageItems.length - 1; i >= 0; i--) {
                var it = parent.pageItems[i];
                // NEVER scan inside user selected items!
                if (userSelItems && isItemInRoots(it, userSelItems)) continue;

                if (it.typename === "GroupItem") {
                    if (checkAndRemove(it)) continue;
                    scanItems(it);
                } else if (it.typename === "CompoundPathItem" || it.typename === "PathItem") {
                    checkAndRemove(it);
                }
            }
        }

        for (var l = 0; l < doc.layers.length; l++) {
            var lay = doc.layers[l];
            scanItems(lay);
        }
        return removed;
    }

    function getRootItemOnLayer(item) {
        var curr = item;
        while (curr.parent && curr.parent.typename !== "Layer" && curr.parent.typename !== "Document") {
            curr = curr.parent;
        }
        return curr;
    }

    function getUniqueRootSelectedItems(items) {
        if (!items) return [];
        var roots = [];
        for (var i = 0; i < items.length; i++) {
            var root = getRootItemOnLayer(items[i]);
            var already = false;
            for (var r = 0; r < roots.length; r++) {
                if (roots[r] === root) { already = true; break; }
                var b1 = roots[r].geometricBounds;
                var b2 = root.geometricBounds;
                if (b1[0] === b2[0] && b1[1] === b2[1] && b1[2] === b2[2] && b1[3] === b2[3]) {
                    already = true;
                    break;
                }
            }
            if (!already) {
                roots.push(root);
            }
        }
        return roots;
    }

    return {
        executeImposition: function (paramsJson) {
            try {
                if (app.documents.length === 0) {
                    return toJson({ success: false, error: "Illustrator-e kono document open nei!" });
                }

                var params = null;
                if (typeof paramsJson === "string") {
                    eval("params = " + paramsJson + ";");
                } else {
                    params = paramsJson;
                }
                if (!params) throw new Error("Invalid parameters.");

                var doc = app.activeDocument;
                var rawSel = doc.selection;
                var sel = getUniqueRootSelectedItems(rawSel);

                var is8Page = (params.sectionType === "album_8");
                var requiredPages = is8Page ? 8 : 16;

                if (!sel || sel.length === 0) {
                    return toJson({
                        success: false,
                        error: "আপনার ফাইলে " + requiredPages + "-টি পেজ এনে সিলেক্ট (Select) করুন!\nবর্তমানে কোনো অবজেক্ট সিলেক্ট করা নেই।"
                    });
                }

                if (sel.length !== requiredPages) {
                    return toJson({
                        success: false,
                        error: "ঠিক " + requiredPages + "-টি পেজ সিলেক্ট করুন!\nবর্তমানে সিলেক্ট করা আছে: " + sel.length + " টি।"
                    });
                }

                // If Album 16, clean template grid numbers (protecting user's selected artwork!)
                if (params.sectionType === "album_16") {
                    cleanGridNumbers(doc, sel);
                    if (doc.artboards.length < 16) {
                        ensureAlbum16Artboards(doc);
                    }
                } else {
                    if (doc.artboards.length < requiredPages) {
                        return toJson({
                            success: false,
                            error: "ডকুমেন্টে কমপক্ষে " + requiredPages + "-টি আর্টবোর্ড থাকতে হবে!\nবর্তমানে আছে: " + doc.artboards.length + " টি।"
                        });
                    }
                }

                // Sort selected pages in 1 to 16 sequence (Row 1: 1..8, Row 2: 9..16)
                var sortedPages = sortSelected16Pages(sel);

                if (params.sectionType === "album_16") {
                    var grid = getAlbum16ArtboardGrid(doc);
                    if (!grid) {
                        throw new Error("ডকুমেন্টে কমপক্ষে ১৬টি আর্টবোর্ড থাকতে হবে!");
                    }

                    // Precise physical slot mapping matching Image 3 & UI Preview:
                    var albumMappings = [
                        // Left Sheet (Front Sheet)
                        // Top Row (180°): Col 0 -> Page 5, Col 1 -> Page 12, Col 2 -> Page 9, Col 3 -> Page 8
                        { ab: grid.leftTop[0], pageNum: 5,  rot: 180, name: "05 - Artboard 5" },
                        { ab: grid.leftTop[1], pageNum: 12, rot: 180, name: "12 - Artboard 12" },
                        { ab: grid.leftTop[2], pageNum: 9,  rot: 180, name: "09 - Artboard 9" },
                        { ab: grid.leftTop[3], pageNum: 8,  rot: 180, name: "08 - Artboard 8" },
                        // Bot Row (0°):   Col 0 -> Page 4, Col 1 -> Page 13, Col 2 -> Page 16, Col 3 -> Page 1
                        { ab: grid.leftBot[0], pageNum: 4,  rot: 0,   name: "04 - Artboard 4" },
                        { ab: grid.leftBot[1], pageNum: 13, rot: 0,   name: "13 - Artboard 13" },
                        { ab: grid.leftBot[2], pageNum: 16, rot: 0,   name: "16 - Artboard 16" },
                        { ab: grid.leftBot[3], pageNum: 1,  rot: 0,   name: "01 - Artboard 1" },

                        // Right Sheet (Back Sheet)
                        // Top Row (180°): Col 0 -> Page 7, Col 1 -> Page 10, Col 2 -> Page 11, Col 3 -> Page 6
                        { ab: grid.rightTop[0], pageNum: 7,  rot: 180, name: "07 - Artboard 7" },
                        { ab: grid.rightTop[1], pageNum: 10, rot: 180, name: "10 - Artboard 10" },
                        { ab: grid.rightTop[2], pageNum: 11, rot: 180, name: "11 - Artboard 11" },
                        { ab: grid.rightTop[3], pageNum: 6,  rot: 180, name: "06 - Artboard 6" },
                        // Bot Row (0°):   Col 0 -> Page 2, Col 1 -> Page 15, Col 2 -> Page 14, Col 3 -> Page 3
                        { ab: grid.rightBot[0], pageNum: 2,  rot: 0,   name: "02 - Artboard 2" },
                        { ab: grid.rightBot[1], pageNum: 15, rot: 0,   name: "15 - Artboard 15" },
                        { ab: grid.rightBot[2], pageNum: 14, rot: 0,   name: "14 - Artboard 14" },
                        { ab: grid.rightBot[3], pageNum: 3,  rot: 0,   name: "03 - Artboard 3" }
                    ];

                    for (var m = 0; m < albumMappings.length; m++) {
                        var map = albumMappings[m];
                        var pageItem = sortedPages[map.pageNum - 1];
                        placeOnArtboard(pageItem, map.ab, map.rot);
                        map.ab.name = map.name;
                    }

                } else {
                    // Standard Inner / Note Imposition Mapping
                    for (var p = 1; p <= requiredPages; p++) {
                        var pageItem = sortedPages[p - 1];
                        var destAB = getArtboardForPage(doc, p, params.sectionType, requiredPages);
                        if (destAB) {
                            var rot = getPageRotation(p, params.sectionType, requiredPages);
                            placeOnArtboard(pageItem, destAB, rot);
                        }
                    }
                }

                if (params.jobNameBn && params.jobNameBn.length > 0) {
                    try { updatePlateSlugText(doc, params.jobNameBn); } catch(eSlug) {}
                }

                app.redraw();
                return toJson({
                    success: true,
                    message: "আলহামদুলিল্লাহ! পেজ ১ হতে " + requiredPages + " নিখুঁতভাবে আপনার চাহিদামতো রোটেশন সহ আর্টবোর্ডে সাজানো হয়েছে।"
                });

            } catch (ex) {
                return toJson({ success: false, error: ex.message });
            }
        },

        executePrintDemo: function (sectionType) {
            try {
                if (app.documents.length === 0) {
                    return toJson({ success: false, error: "কোনো ডকুমেন্ট খোলা নেই!" });
                }
                var doc = app.activeDocument;

                // Check Album (Jhuri / Front & Back)
                if (isAlbumDoc(doc, sectionType)) {
                    var albSheets = setupAlbumSheetArtboards(doc);
                    app.executeMenuCommand("Print");
                    return toJson({
                        success: true,
                        message: "অ্যালবাম ডেমো প্রিন্ট সম্পন্ন (সামনে: " + albSheets.w1 + "x" + albSheets.h1 + " in, পেছনে: " + albSheets.w2 + "x" + albSheets.h2 + " in)।"
                    });
                }

                // 1. Unlock all layers and items (instant native)
                for (var l = 0; l < doc.layers.length; l++) {
                    doc.layers[l].locked = false;
                    doc.layers[l].visible = true;
                }
                try { app.executeMenuCommand("unlockAll"); } catch (e) {}
                try { app.executeMenuCommand("showAll"); } catch (e) {}

                // 2. Keep only 1 artboard, remove the rest
                while (doc.artboards.length > 1) {
                    doc.artboards[doc.artboards.length - 1].remove();
                }
                doc.artboards.setActiveArtboardIndex(0);

                // 3. Fit remaining artboard to artwork bounds
                app.executeMenuCommand("Fit Artboard to artwork bounds");

                var rect = doc.artboards[0].artboardRect;
                var left = rect[0];
                var top = rect[1];
                var right = rect[2];
                var bottom = rect[3];

                var totalW = right - left;
                var totalH = top - bottom;
                var halfW = totalW / 2;

                // 4. Left half artboard (reference point left)
                doc.artboards[0].artboardRect = [left, top, left + halfW, bottom];
                doc.artboards[0].name = "01 - Left (Half)";

                // 5. Right half artboard
                var ab2 = doc.artboards.add([left + halfW, top, right, bottom]);
                ab2.name = "02 - Right (Half)";

                doc.artboards.setActiveArtboardIndex(0);
                app.redraw();

                // 6. Open Print Dialog (modal)
                app.executeMenuCommand("Print");

                // 7. After Print Dialog is closed: restore to single full sheet artboard
                while (doc.artboards.length > 1) {
                    doc.artboards[doc.artboards.length - 1].remove();
                }
                doc.artboards.setActiveArtboardIndex(0);
                app.executeMenuCommand("Fit Artboard to artwork bounds");
                app.redraw();

                var finalRect = doc.artboards[0].artboardRect;
                var finalW = Math.round(((finalRect[2] - finalRect[0]) / 72) * 100) / 100;
                var finalH = Math.round(((finalRect[1] - finalRect[3]) / 72) * 100) / 100;

                return toJson({
                    success: true,
                    message: "ডেমো প্রিন্ট সম্পন্ন এবং মূল শিট আর্টবোর্ডে (" + finalW + "x" + finalH + " in) রিস্টোর করা হয়েছে।"
                });

            } catch (ex) {
                return toJson({ success: false, error: ex.message });
            }
        },

        restoreFullSheet: function (sectionType) {
            try {
                if (app.documents.length === 0) {
                    return toJson({ success: false, error: "কোনো ডকুমেন্ট খোলা নেই!" });
                }
                var doc = app.activeDocument;

                // Check Album (Jhuri / Front & Back)
                if (isAlbumDoc(doc, sectionType)) {
                    var albSheets = setupAlbumSheetArtboards(doc);
                    return toJson({
                        success: true,
                        message: "অ্যালবাম ২টি শিট আর্টবোর্ড (সামনে: " + albSheets.w1 + "x" + albSheets.h1 + " in, পেছনে: " + albSheets.w2 + "x" + albSheets.h2 + " in) ফিট করা হয়েছে।"
                    });
                }

                // Unlock layers/items (instant native)
                for (var l = 0; l < doc.layers.length; l++) {
                    doc.layers[l].locked = false;
                    doc.layers[l].visible = true;
                }
                try { app.executeMenuCommand("unlockAll"); } catch (e) {}
                try { app.executeMenuCommand("showAll"); } catch (e) {}

                while (doc.artboards.length > 1) {
                    doc.artboards[doc.artboards.length - 1].remove();
                }
                doc.artboards.setActiveArtboardIndex(0);
                app.executeMenuCommand("Fit Artboard to artwork bounds");
                app.redraw();

                var finalRect = doc.artboards[0].artboardRect;
                var finalW = Math.round(((finalRect[2] - finalRect[0]) / 72) * 100) / 100;
                var finalH = Math.round(((finalRect[1] - finalRect[3]) / 72) * 100) / 100;

                return toJson({
                    success: true,
                    message: "আর্টবোর্ড সফলভাবে পুরো শিট বাউন্সে (" + finalW + "x" + finalH + " in) ফিট করা হয়েছে।"
                });

            } catch (ex) {
                return toJson({ success: false, error: ex.message });
            }
        },

        getActiveDocJobName: function () {
            try {
                if (app.documents.length === 0) return "";
                var name = app.activeDocument.name;
                var match = name.match(/@([^.]+)/);
                if (match && match[1]) {
                    var cand = match[1].replace(/^\s+|\s+$/g, "").replace(/\s*\d+$/, "");
                    if (cand.length > 0) return cand;
                }
                for (var i = 0; i < app.documents.length; i++) {
                    var dMatch = app.documents[i].name.match(/@([^.]+)/);
                    if (dMatch && dMatch[1]) {
                        var cand2 = dMatch[1].replace(/^\s+|\s+$/g, "").replace(/\s*\d+$/, "");
                        if (cand2.length > 0) return cand2;
                    }
                }
                return "";
            } catch (e) {
                return "";
            }
        },

        getActiveDocInfo: function () {
            try {
                if (app.documents.length === 0) return toJson({ hasDoc: false });
                var doc = app.activeDocument;
                var name = doc.name;
                var abCount = doc.artboards.length;
                var jobName = "";
                var match = name.match(/@([^.]+)/);
                if (match && match[1]) {
                    jobName = match[1].replace(/^\s+|\s+$/g, "").replace(/\s*\d+$/, "");
                }
                if (!jobName || jobName.length === 0) {
                    for (var i = 0; i < app.documents.length; i++) {
                        var dMatch = app.documents[i].name.match(/@([^.]+)/);
                        if (dMatch && dMatch[1]) {
                            var cand = dMatch[1].replace(/^\s+|\s+$/g, "").replace(/\s*\d+$/, "");
                            if (cand.length > 0) {
                                jobName = cand;
                                break;
                            }
                        }
                    }
                }

                var detectedType = "inner_16";
                var lower = name.toLowerCase();
                if (lower.indexOf("album") !== -1 || lower.indexOf("jhuri") !== -1 ||
                    lower.indexOf("front & back") !== -1 || lower.indexOf("back to back") !== -1 ||
                    name.indexOf("\u0986\u09B2") !== -1 || name.indexOf("\u09AC\u09CD\u09AF\u09BE\u0995") !== -1 ||
                    name.indexOf("\u099C\u09C1\u09DC\u09BF") !== -1 || name.indexOf("\u099D\u09C1\u09DC\u09BF") !== -1) {
                    detectedType = "album_16";
                } else if (lower.indexOf("note") !== -1 || name.indexOf("\u09A8\u09CB\u099F") !== -1) {
                    detectedType = "note_16";
                } else if (lower.indexOf("inner") !== -1 || name.indexOf("\u0987\u09A8\u09BE\u09B0") !== -1) {
                    detectedType = "inner_16";
                } else if (doc.artboards.length === 16) {
                    var r0 = doc.artboards[0].artboardRect;
                    var w0 = Math.abs(r0[2] - r0[0]);
                    var h0 = Math.abs(r0[1] - r0[3]);
                    if (h0 > w0) detectedType = "album_16";
                }

                // Also check text frame contents if still inner_16
                if (detectedType === "inner_16") {
                    try {
                        for (var tScan = 0; tScan < doc.textFrames.length; tScan++) {
                            var tcScan = doc.textFrames[tScan].contents;
                            if (tcScan.indexOf("\u09AC\u09CD\u09AF\u09BE\u0995 \u099F\u09C1 \u09AC\u09CD\u09AF\u09BE\u0995") !== -1 || 
                                tcScan.indexOf("\u0986\u09B2 -") !== -1 || 
                                tcScan.indexOf("\u099C\u09C1\u09DC\u09BF") !== -1 ||
                                tcScan.indexOf("Back to Back") !== -1) {
                                detectedType = "album_16";
                                break;
                            }
                        }
                    } catch (eScan) {}
                }

                return toJson({
                    hasDoc: true,
                    name: name,
                    jobName: jobName,
                    artboards: abCount,
                    detectedType: detectedType
                });
            } catch (e) {
                return toJson({ hasDoc: false, error: e.message });
            }
        },

        executeCtpPrep: function (paramsOrJobName) {
            try {
                if (app.documents.length === 0) {
                    return toJson({ success: false, error: "কোনো ডকুমেন্ট খোলা নেই!" });
                }
                var doc = app.activeDocument;
                var report = [];

                var params = {};
                if (typeof paramsOrJobName === "string" && paramsOrJobName.indexOf("{") === 0) {
                    try { eval("params = " + paramsOrJobName + ";"); } catch(e){}
                } else if (typeof paramsOrJobName === "object" && paramsOrJobName !== null) {
                    params = paramsOrJobName;
                } else {
                    params = { jobNameBn: paramsOrJobName };
                }

                var jobNameBn = params.jobNameBn || "";
                var sectionType = params.sectionType || "";
                var colorMode = params.colorMode || "auto"; // "auto", "4color", "2color"

                // 1. Unlock all layers and items so they can be processed (instant native)
                for (var l = 0; l < doc.layers.length; l++) {
                    doc.layers[l].locked = false;
                    doc.layers[l].visible = true;
                }
                try { app.executeMenuCommand("unlockAll"); } catch (e) {}
                try { app.executeMenuCommand("showAll"); } catch (e) {}

                // 2. Update Bottom Plate / Slug Text with Bengali Job Name
                if (jobNameBn && jobNameBn.length > 0) {
                    var slugUpdated = updatePlateSlugText(doc, jobNameBn);
                    if (slugUpdated) {
                        report.push("প্লেট টেক্সট আপডেট: " + jobNameBn);
                    } else {
                        report.push("প্লেট টেক্সট: স্লাগ ফ্রেম পাওয়া যায়নি");
                    }
                }

                // 4. Color Mode Check: 4-Color (CMYK Full Color) vs 2-Color (Cyan & Black Only)
                var is4Color = false;
                if (colorMode === "4color") {
                    is4Color = true;
                } else if (colorMode === "2color") {
                    is4Color = false;
                } else {
                    // Auto: Album and "4 Color" docs are 4-Color; Inner and Note are 2-Color
                    var docLower = doc.name.toLowerCase();
                    if (isAlbumDoc(doc, sectionType) || docLower.indexOf("4 color") !== -1 || docLower.indexOf("album") !== -1 || docLower.indexOf("jhuri") !== -1) {
                        is4Color = true;
                    }
                }

                if (is4Color) {
                    report.push("৪-কালার সিএমওয়াইকে: সম্পূর্ণ কালার অক্ষুণ্ণ রাখা হয়েছে");
                } else {
                    // Remove Magenta & Yellow (Clean for Cyan + Black 2-Color)
                    try {
                        for (var s = 0; s < doc.swatches.length; s++) {
                            var sw = doc.swatches[s];
                            if (sw.color && sw.color.typename === "CMYKColor") {
                                var swC = sw.color;
                                if (swC.magenta > 0 || swC.yellow > 0) {
                                    swC.magenta = 0;
                                    swC.yellow = 0;
                                    sw.color = swC;
                                }
                            }
                        }
                    } catch(e) {}

                    var cleanedColors = 0;
                    function cleanItemColor(item) {
                        if (!item) return;
                        try {
                            if (item.typename === "PathItem") {
                                if (item.filled && item.fillColor && item.fillColor.typename === "CMYKColor") {
                                    var fc = item.fillColor;
                                    if (fc.magenta > 0 || fc.yellow > 0) {
                                        fc.magenta = 0;
                                        fc.yellow = 0;
                                        item.fillColor = fc;
                                        cleanedColors++;
                                    }
                                }
                                if (item.stroked && item.strokeColor && item.strokeColor.typename === "CMYKColor") {
                                    var sc = item.strokeColor;
                                    if (sc.magenta > 0 || sc.yellow > 0) {
                                        sc.magenta = 0;
                                        sc.yellow = 0;
                                        item.strokeColor = sc;
                                        cleanedColors++;
                                    }
                                }
                            } else if (item.typename === "GroupItem") {
                                for (var g = 0; g < item.pageItems.length; g++) {
                                    cleanItemColor(item.pageItems[g]);
                                }
                            } else if (item.typename === "CompoundPathItem") {
                                for (var cp = 0; cp < item.pathItems.length; cp++) {
                                    cleanItemColor(item.pathItems[cp]);
                                }
                            } else if (item.typename === "TextFrame") {
                                for (var trIdx = 0; trIdx < item.textRanges.length; trIdx++) {
                                    var tr = item.textRanges[trIdx];
                                    if (tr.characterAttributes.fillColor && tr.characterAttributes.fillColor.typename === "CMYKColor") {
                                        var tfc = tr.characterAttributes.fillColor;
                                        if (tfc.magenta > 0 || tfc.yellow > 0) {
                                            tfc.magenta = 0;
                                            tfc.yellow = 0;
                                            tr.characterAttributes.fillColor = tfc;
                                            cleanedColors++;
                                        }
                                    }
                                    if (tr.characterAttributes.strokeColor && tr.characterAttributes.strokeColor.typename === "CMYKColor") {
                                        var tsc = tr.characterAttributes.strokeColor;
                                        if (tsc.magenta > 0 || tsc.yellow > 0) {
                                            tsc.magenta = 0;
                                            tsc.yellow = 0;
                                            tr.characterAttributes.strokeColor = tsc;
                                            cleanedColors++;
                                        }
                                    }
                                }
                            }
                        } catch(e) {}
                    }

                    for (var lyrIdx = 0; lyrIdx < doc.layers.length; lyrIdx++) {
                        var curLyr = doc.layers[lyrIdx];
                        for (var pi = 0; pi < curLyr.pageItems.length; pi++) {
                            cleanItemColor(curLyr.pageItems[pi]);
                        }
                    }
                    report.push("২-কালার: ম্যাজেন্টা ও ইয়েলো অপসারিত (" + cleanedColors + ")");
                }

                // 4. Embed all Linked Images (safely iterate backwards)
                var embedCount = 0;
                var embedMissing = 0;
                for (var pl = doc.placedItems.length - 1; pl >= 0; pl--) {
                    try {
                        doc.placedItems[pl].embed();
                        embedCount++;
                    } catch (eEmbed) {
                        embedMissing++;
                    }
                }
                var embedReport = "লিংকড ফাইল: " + embedCount + " টি এম্বেড সম্পন্ন";
                if (embedMissing > 0) embedReport += " (" + embedMissing + " টি লিংক মিসিং)";
                report.push(embedReport);

                // 5. Safe Text Outlining (Native DOM iteration - preserves all clipping masks & frames)
                var outlineCount = 0;
                for (var remTf = doc.textFrames.length - 1; remTf >= 0; remTf--) {
                    try {
                        doc.textFrames[remTf].createOutline();
                        outlineCount++;
                    } catch (eRem) {}
                }
                report.push("টেক্সট: সম্পূর্ণ ফন্ট আউটলাইন সম্পন্ন (" + outlineCount + " টি)");

                app.redraw();
                return toJson({
                    success: true,
                    message: "সিটিপি প্রস্তুতি সম্পন্ন!\n• " + report.join("\n• ")
                });

            } catch (ex) {
                return toJson({ success: false, error: ex.message });
            }
        }
    };
})();
var FormaEngine = $.global.FormaEngine;
