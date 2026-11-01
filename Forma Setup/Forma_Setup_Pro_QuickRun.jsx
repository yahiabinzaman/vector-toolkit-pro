/**
 * ColorLab Forma Setup Pro - Standalone Fast Script
 * Author: Yahia Bin Zaman / ColorLab
 * Run via: File > Scripts > Other Script...
 */

#target illustrator

(function () {
    "use strict";

    if (app.documents.length === 0) {
        alert("Illustrator-e kono document open nei!\nDoya kore document open korun.");
        return;
    }

    var doc = app.activeDocument;
    var sel = doc.selection;

    if (!sel || (sel.length !== 16 && sel.length !== 8)) {
        alert("দয়া করে খেয়াল করুন:\nঠিক ১৬-টি (অথবা ৮-টি) পেজ গ্রুপ সিলেক্ট থাকতে হবে!\nবর্তমানে সিলেক্ট করা আছে: " + (sel ? sel.length : 0) + " টি।");
        return;
    }

    var requiredPages = sel.length;

    if (doc.artboards.length < requiredPages) {
        alert("ডকুমেন্টে কমপক্ষে " + requiredPages + "-টি আর্টবোর্ড থাকতে হবে!\nবর্তমানে আছে: " + doc.artboards.length + " টি।");
        return;
    }

    function getPageTrimBounds(item, abW, abH) {
        if (!item) return null;

        var TOL = 6;

        function matchesTrim(w, h) {
            if (!abW || !abH) return false;
            return ((Math.abs(w - abW) <= TOL && Math.abs(h - abH) <= TOL) ||
                    (Math.abs(w - abH) <= TOL && Math.abs(h - abW) <= TOL));
        }

        if (item.typename === "GroupItem" && item.clipped) {
            for (var c = 0; c < item.pageItems.length; c++) {
                if (item.pageItems[c].clipping) {
                    return item.pageItems[c].geometricBounds;
                }
            }
        }

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

        return item.geometricBounds;
    }

    function getItemBounds(item) {
        return getPageTrimBounds(item);
    }

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

    var PAGE_TO_SLOT_16 = {
        1: 1, 2: 2, 3: 14, 4: 13, 5: 12, 6: 15, 7: 3, 8: 0,
        9: 4, 10: 7, 11: 11, 12: 8, 13: 9, 14: 10, 15: 6, 16: 5
    };

    var PAGE_TO_SLOT_8 = {
        1: 1, 2: 2, 3: 6, 4: 5, 5: 4, 6: 7, 7: 3, 8: 0
    };

    // User exact column rotation:
    // 8-9-12-5  -> Dan (Right = 270°)
    // 1-16-13-4 -> Bam (Left = 90°)
    // 2-15-14-3 -> Dan (Right = 270°)
    // 7-10-11-6 -> Bam (Left = 90°)
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

    function getArtboardForPage(doc, pageNum, requiredPages) {
        var spatial = getSpatiallySortedArtboards(doc, requiredPages);
        if (spatial && spatial.length >= requiredPages) {
            var slot = (requiredPages === 8) ? PAGE_TO_SLOT_8[pageNum] : PAGE_TO_SLOT_16[pageNum];
            if (slot !== undefined && spatial[slot]) {
                return spatial[slot];
            }
        }
        return (pageNum - 1 < doc.artboards.length) ? doc.artboards[pageNum - 1] : null;
    }

    function getPageRotation(pageNum, requiredPages) {
        if (requiredPages === 8) {
            return (PAGE_ROTATION_8[pageNum] !== undefined) ? PAGE_ROTATION_8[pageNum] : 90;
        }
        return (PAGE_ROTATION_16[pageNum] !== undefined) ? PAGE_ROTATION_16[pageNum] : 90;
    }

    function placeOnArtboard(item, artboard, rotAngle) {
        var abRect = artboard.artboardRect;
        var abW = Math.abs(abRect[2] - abRect[0]);
        var abH = Math.abs(abRect[1] - abRect[3]);

        if (rotAngle && rotAngle !== 0) {
            item.rotate(rotAngle, true, true, true, true, Transformation.CENTER);
        }

        var abTargetCX = (abRect[0] + abRect[2]) / 2;
        var abTargetCY = (abRect[1] + abRect[3]) / 2;

        var bAfter = getPageTrimBounds(item, abW, abH);
        var curTrimCX = (bAfter[0] + bAfter[2]) / 2;
        var curTrimCY = (bAfter[1] + bAfter[3]) / 2;

        item.translate(abTargetCX - curTrimCX, abTargetCY - curTrimCY);
    }

    var sortedPages = sortSelected16Pages(sel);

    for (var p = 1; p <= requiredPages; p++) {
        var pageItem = sortedPages[p - 1];
        var destAB = getArtboardForPage(doc, p, requiredPages);
        if (destAB) {
            var rot = getPageRotation(p, requiredPages);
            placeOnArtboard(pageItem, destAB, rot);
        }
    }

    app.redraw();
    alert("আলহামদুলিল্লাহ!\n১৬-টি পেজ সফলভাবে আপনার সুনির্দিষ্ট কলাম রোটেশন অনুযায়ী প্লেটে নিখুঁতভাবে সাজানো হয়েছে!");
})();
