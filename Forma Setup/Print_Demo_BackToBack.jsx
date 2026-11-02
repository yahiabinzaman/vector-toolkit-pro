/**
 * ColorLab Print Demo (Back-to-Back Split & Print)
 * Author: Yahia Bin Zaman / ColorLab
 * Run via: File > Scripts > Other Script...
 */

#target illustrator

(function () {
    "use strict";

    if (app.documents.length === 0) {
        alert("কোনো ডকুমেন্ট খোলা নেই!\nদয়া করে ফর্মা ডকুমেন্ট ওপেন করুন।");
        return;
    }

    var doc = app.activeDocument;

    try {
        // 1. Unlock all layers and page items
        for (var l = 0; l < doc.layers.length; l++) {
            doc.layers[l].locked = false;
            doc.layers[l].visible = true;
        }
        try { app.executeMenuCommand("unlockAll"); } catch (e) {}
        try { app.executeMenuCommand("showAll"); } catch (e) {}

        var lower = doc.name.toLowerCase();
        var isAlbum = (lower.indexOf("album") !== -1 || lower.indexOf("jhuri") !== -1 || lower.indexOf("front & back") !== -1);
        if (!isAlbum && doc.artboards.length === 16) {
            var r0 = doc.artboards[0].artboardRect;
            if (Math.abs(r0[1] - r0[3]) > Math.abs(r0[2] - r0[0])) isAlbum = true;
        }

        if (isAlbum) {
            var lay = doc.layers[0];

            // 1. Calculate horizontal midpoint between Left and Right sheets
            var minX = 999999, maxX = -999999;
            for (var i = 0; i < lay.pageItems.length; i++) {
                var gb = lay.pageItems[i].geometricBounds;
                if (gb[0] < minX) minX = gb[0];
                if (gb[2] > maxX) maxX = gb[2];
            }
            var midX = (minX + maxX) / 2;

            // 2. Partition top-level items on layer 0 into Left (Front) and Right (Back)
            var leftItems = [];
            var rightItems = [];
            for (var j = 0; j < lay.pageItems.length; j++) {
                var it = lay.pageItems[j];
                var cx = (it.geometricBounds[0] + it.geometricBounds[2]) / 2;
                if (cx < midX) {
                    leftItems.push(it);
                } else {
                    rightItems.push(it);
                }
            }

            // 3. Native DOM grouping
            var leftGroup = null;
            if (leftItems.length > 1) {
                leftGroup = lay.groupItems.add();
                leftGroup.name = "Front Sheet (Sheet 1)";
                for (var li = leftItems.length - 1; li >= 0; li--) {
                    try {
                        leftItems[li].move(leftGroup, ElementPlacement.PLACEATBEGINNING);
                    } catch (e) {}
                }
            } else if (leftItems.length === 1) {
                leftGroup = leftItems[0];
            }

            var rightGroup = null;
            if (rightItems.length > 1) {
                rightGroup = lay.groupItems.add();
                rightGroup.name = "Back Sheet (Sheet 2)";
                for (var ri = rightItems.length - 1; ri >= 0; ri--) {
                    try {
                        rightItems[ri].move(rightGroup, ElementPlacement.PLACEATBEGINNING);
                    } catch (e) {}
                }
            } else if (rightItems.length === 1) {
                rightGroup = rightItems[0];
            }

            if (!leftGroup || !rightGroup) {
                throw new Error("অ্যালবাম শিটের গ্রুপ তৈরি করা যায়নি!");
            }

            var bLeft = leftGroup.geometricBounds;
            var bRight = rightGroup.geometricBounds;

            while (doc.artboards.length > 1) {
                doc.artboards[doc.artboards.length - 1].remove();
            }
            doc.artboards[0].artboardRect = bLeft;
            doc.artboards[0].name = "Front Sheet";

            var abAlbum2 = doc.artboards.add(bRight);
            abAlbum2.name = "Back Sheet";

            doc.artboards.setActiveArtboardIndex(0);
            app.redraw();

            app.executeMenuCommand("Print");
            return;
        }

        // Inner / Note: 1 big sheet split into left & right halves
        while (doc.artboards.length > 1) {
            doc.artboards[doc.artboards.length - 1].remove();
        }
        doc.artboards.setActiveArtboardIndex(0);

        app.executeMenuCommand("Fit Artboard to artwork bounds");

        var rect = doc.artboards[0].artboardRect;
        var left = rect[0];
        var top = rect[1];
        var right = rect[2];
        var bottom = rect[3];

        var totalW = right - left;
        var totalH = top - bottom;
        var halfW = totalW / 2;

        doc.artboards[0].artboardRect = [left, top, left + halfW, bottom];
        doc.artboards[0].name = "Left Half";

        var ab2 = doc.artboards.add([left + halfW, top, right, bottom]);
        ab2.name = "Right Half";

        doc.artboards.setActiveArtboardIndex(0);
        app.redraw();

        app.executeMenuCommand("Print");

        while (doc.artboards.length > 1) {
            doc.artboards[doc.artboards.length - 1].remove();
        }
        doc.artboards.setActiveArtboardIndex(0);
        app.executeMenuCommand("Fit Artboard to artwork bounds");
        app.redraw();

    } catch (ex) {
        alert("ত্রুটি: " + ex.message);
    }
})();
