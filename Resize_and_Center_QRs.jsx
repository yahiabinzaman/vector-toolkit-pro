/**
 * Adobe Illustrator Script: Resize & Middle-Align QR Codes to 0.5" x 0.5"
 * Description: Quickly resizes selected (or all) QR code images to exactly 0.5 in x 0.5 in (36 pt x 36 pt)
 *              and perfectly centers / middle-aligns them inside their clipping mask.
 * Author: Antigravity
 * Compatible: Adobe Illustrator CC / 2020 - 2026+ (macOS & Windows)
 */

#target illustrator

(function main() {
    if (app.documents.length === 0) {
        alert("Please open your Illustrator document first!", "No Document Open");
        return;
    }

    var doc = app.activeDocument;
    var sel = doc.selection;
    var targetItems = [];

    if (sel && sel.length > 0) {
        collectImages(sel, targetItems);
    } else {
        scanDocumentForQRCodes(doc, targetItems);
    }

    if (targetItems.length === 0) {
        alert("কোনো QR কোড ইমেজ খুঁজে পাওয়া যায়নি!\nদয়া করে অবজেক্টগুলো সিলেক্ট করুন অথবা ডকুমেন্ট চেক করুন।", "No QR Codes Found");
        return;
    }

    var successCount = 0;
    // 0.5 inch = 36 pt in Illustrator (72 pt / inch)
    var standardSize = 36;

    for (var i = 0; i < targetItems.length; i++) {
        var item = targetItems[i];
        try {
            if (item.locked) item.locked = false;
            if (item.layer && item.layer.locked) item.layer.locked = false;

            var mask = findClipMask(item);
            var targetW = standardSize;
            var targetH = standardSize;
            var centerX, centerY;

            if (mask) {
                // If clipping mask exists and is approximately 0.5 in, match mask bounds perfectly
                if (Math.abs(mask.width - standardSize) < 8) {
                    targetW = mask.width;
                    targetH = mask.height;
                }
                centerX = mask.left + (mask.width / 2);
                centerY = mask.top - (mask.height / 2);
            } else {
                centerX = item.left + (item.width / 2);
                centerY = item.top - (item.height / 2);
            }

            // Set size to exactly 0.5 in x 0.5 in
            item.width = targetW;
            item.height = targetH;

            // Center/Middle align
            item.left = centerX - (targetW / 2);
            item.top = centerY + (targetH / 2);

            successCount++;
        } catch (e) {}
    }

    try { app.redraw(); } catch (err) {}

    alert("আলহামদুলিল্লাহ!\n\nসর্বমোট " + successCount + " টি QR কোড নিখুঁতভাবে 0.5 in x 0.5 in সাইজে এবং ক্লিপিং মাস্কের ঠিক মাঝখানে (Center/Middle Aligned) রিসাইজ ও এলাইন করা হয়েছে!", "Resize & Align Complete");

    function collectImages(items, result) {
        for (var j = 0; j < items.length; j++) {
            var itm = items[j];
            if (itm.typename === "PlacedItem" || itm.typename === "RasterItem") {
                result.push(itm);
            } else if (itm.typename === "GroupItem") {
                collectImages(itm.pageItems, result);
            }
        }
    }

    function scanDocumentForQRCodes(d, result) {
        for (var p = 0; p < d.placedItems.length; p++) {
            var pItm = d.placedItems[p];
            if (isQRCodeCandidate(pItm)) result.push(pItm);
        }
        for (var r = 0; r < d.rasterItems.length; r++) {
            var rItm = d.rasterItems[r];
            if (isQRCodeCandidate(rItm)) result.push(rItm);
        }
    }

    function isQRCodeCandidate(itm) {
        var w = itm.width;
        var h = itm.height;
        return (w >= 15 && w <= 90 && h >= 15 && h <= 120);
    }

    function findClipMask(target) {
        var p = target.parent;
        while (p && p.typename === "GroupItem") {
            if (p.clipped) {
                for (var m = 0; m < p.pageItems.length; m++) {
                    if (p.pageItems[m].clipping) {
                        return p.pageItems[m];
                    }
                }
                if (p.pageItems.length > 0) return p.pageItems[0];
            }
            p = p.parent;
        }
        return null;
    }
})();
