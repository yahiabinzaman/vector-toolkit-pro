/**
 * ColorLab Forma Setup Pro - Core ExtendScript Engine
 * Author: Yahia Bin Zaman / ColorLab
 * Host: Adobe Illustrator (CC 2014 - 2026+)
 */

#target illustrator

var FormaEngine = (function () {
    "use strict";

    function toJson(obj) {
        if (obj === null) return "null";
        if (typeof obj === "undefined") return "undefined";
        if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
        if (typeof obj === "string") {
            return '"' + obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"';
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
     * Maps Page N -> Destination Artboard on the Sheet.
     * Universal 16-Page Offset Imposition Plate:
     *   Row 0: [ Slot 0: Page 8,  Slot 1: Page 1,  Slot 2: Page 2,  Slot 3: Page 7  ] (Head-to-Head)
     *   Row 1: [ Slot 4: Page 9,  Slot 5: Page 16, Slot 6: Page 15, Slot 7: Page 10 ] (Head-to-Head)
     *   Row 2: [ Slot 8: Page 12, Slot 9: Page 13, Slot 10: Page 14, Slot 11: Page 11 ] (Head-to-Head)
     *   Row 3: [ Slot 12: Page 5, Slot 13: Page 4, Slot 14: Page 3, Slot 15: Page 6 ] (Head-to-Head)
     */
    function getArtboardForPage(doc, pageNum, requiredPages) {
        var PAGE_TO_SLOT_16 = {
            1: 1, 2: 2, 3: 14, 4: 13, 5: 12, 6: 15, 7: 3, 8: 0,
            9: 4, 10: 7, 11: 11, 12: 8, 13: 9, 14: 10, 15: 6, 16: 5
        };
        var PAGE_TO_SLOT_8 = {
            1: 1, 2: 5, 3: 6, 4: 2, 5: 3, 6: 7, 7: 4, 8: 0
        };

        var spatial = getSpatiallySortedArtboards(doc, requiredPages);

        if (spatial && spatial.length >= requiredPages) {
            var slot = (requiredPages === 8) ? PAGE_TO_SLOT_8[pageNum] : PAGE_TO_SLOT_16[pageNum];
            if (slot !== undefined && spatial[slot]) {
                return spatial[slot];
            }
        }

        return (pageNum - 1 < doc.artboards.length) ? doc.artboards[pageNum - 1] : null;
    }

    // Determine the artboard row rotation:
    // Row 0 & 3 = 180° (Top & Bottom rows)
    // Row 1 & 2 = 0° (Middle rows)
    function getArtboardRowRotation(artboard, doc) {
        var abs = [];
        for (var i = 0; i < doc.artboards.length; i++) {
            var r = doc.artboards[i].artboardRect;
            abs.push({ cy: (r[1] + r[3]) / 2, ab: doc.artboards[i] });
        }
        abs.sort(function (a, b) { return b.cy - a.cy; });

        var rank = 0;
        for (var k = 0; k < abs.length; k++) {
            if (abs[k].ab === artboard) {
                rank = k;
                break;
            }
        }

        if (abs.length >= 16) {
            var row = Math.floor(rank / 4);
            return (row === 0 || row === 3) ? 180 : 0;
        } else if (abs.length >= 8) {
            var row8 = Math.floor(rank / 4);
            return (row8 === 0) ? 180 : 0;
        }

        return 0;
    }

    function placeOnArtboard(item, artboard, baseRot, orientationMode) {
        var abRect = artboard.artboardRect;
        var abW = Math.abs(abRect[2] - abRect[0]);
        var abH = Math.abs(abRect[1] - abRect[3]);
        var isLandscapeAB = (abW > abH);

        var bBefore = getPageTrimBounds(item, abW, abH);
        var itemW = Math.abs(bBefore[2] - bBefore[0]);
        var itemH = Math.abs(bBefore[1] - bBefore[3]);
        var isPortraitItem = (itemH > itemW);

        var finalRot = baseRot || 0;

        if (orientationMode === "rotate_90") {
            finalRot = (baseRot === 180) ? 270 : 90;
        } else if (orientationMode === "upright_0") {
            finalRot = baseRot;
        } else {
            // "auto" mode:
            // When artboard is Landscape (plate sheet) and page is Portrait:
            // Rotate to fit the sheet cells head-to-head:
            // Row 0 & 3 (baseRot 180) -> 270° (Head points Right / Downward)
            // Row 1 & 2 (baseRot 0)   -> 90°  (Head points Left / Upward)
            // Difference is 180° (Head-to-Head)!
            if (isLandscapeAB && isPortraitItem) {
                finalRot = (baseRot === 180) ? 270 : 90;
            } else {
                finalRot = baseRot;
            }
        }

        if (finalRot !== 0) {
            item.rotate(finalRot, true, true, true, true, Transformation.CENTER);
        }

        var abTargetCX = (abRect[0] + abRect[2]) / 2;
        var abTargetCY = (abRect[1] + abRect[3]) / 2;

        var bAfter = getPageTrimBounds(item, abW, abH);
        var curTrimCX = (bAfter[0] + bAfter[2]) / 2;
        var curTrimCY = (bAfter[1] + bAfter[3]) / 2;

        item.translate(abTargetCX - curTrimCX, abTargetCY - curTrimCY);
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
                var sel = doc.selection;

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

                if (doc.artboards.length < requiredPages) {
                    return toJson({
                        success: false,
                        error: "ডকুমেন্টে কমপক্ষে " + requiredPages + "-টি আর্টবোর্ড থাকতে হবে!\nবর্তমানে আছে: " + doc.artboards.length + " টি।"
                    });
                }

                // Sort selected pages in 1 to 16 sequence (Row 1: 1..8, Row 2: 9..16)
                var sortedPages = sortSelected16Pages(sel);
                var orientationMode = params.orientationMode || "auto";

                // Map Page N -> Artboard N
                for (var p = 1; p <= requiredPages; p++) {
                    var pageItem = sortedPages[p - 1];
                    var destAB = getArtboardForPage(doc, p, requiredPages);
                    if (destAB) {
                        var baseRot = getArtboardRowRotation(destAB, doc);
                        placeOnArtboard(pageItem, destAB, baseRot, orientationMode);
                    }
                }

                app.redraw();
                return toJson({
                    success: true,
                    message: "আলহামদুলিল্লাহ! পেজ ১ হতে " + requiredPages + " নিখুঁতভাবে আর্টবোর্ড ১ হতে " + requiredPages + "-এ সাজানো হয়েছে।"
                });

            } catch (ex) {
                return toJson({ success: false, error: ex.message });
            }
        }
    };
})();
