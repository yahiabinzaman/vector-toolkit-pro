/**
 * Adobe Illustrator Script: Master QR Code Importer (61 Cards with Folder Browser)
 * Description: Directly imports clean square QR codes (01 to 61).
 *              Allows folder selection, decodes Bengali filenames,
 *              defaults to current 61-item selection, and visually sorts pages Left-to-Right.
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

    // Default path to generated clean QR codes
    var defaultPath = "/Volumes/990 Pro 2TB SSD/Diary 2027/Malibagh 27/Asset/QR/Generated_QRs";
    var folder = new Folder(defaultPath);

    // If default path doesn't exist or user wants to browse, ask for folder
    if (!folder.exists) {
        folder = Folder.selectDialog("আপনার QR কোডের ফোল্ডারটি সিলেক্ট করুন");
        if (!folder) return;
    }

    var imageFiles = getImageFiles(folder);

    // Collect currently selected QR items
    var sel = doc.selection;
    var selectedQrItems = [];
    if (sel && sel.length > 0) {
        collectImages(sel, selectedQrItems);
    }

    // Also scan document
    var docQrItems = [];
    scanDocumentForQRCodes(doc, docQrItems);

    // Build UI Dialog
    var dlg = new Window("dialog", "QR Code Importer (৬১ টি কার্ড)");
    dlg.orientation = "column";
    dlg.alignChildren = ["fill", "top"];
    dlg.spacing = 10;
    dlg.margins = 16;

    // Folder Path & Change Button
    var pnlFolder = dlg.add("panel", undefined, "ফোল্ডার লোকেশন:");
    pnlFolder.orientation = "column";
    pnlFolder.alignChildren = ["fill", "top"];
    pnlFolder.margins = 10;

    var grpFolderRow = pnlFolder.add("group");
    grpFolderRow.orientation = "row";
    var txtFolderPath = grpFolderRow.add("edittext", undefined, decodeURI(folder.fsName), { readonly: true });
    txtFolderPath.size = [360, 24];

    var btnBrowse = grpFolderRow.add("button", undefined, "ফোল্ডার বদলান...");
    btnBrowse.onClick = function () {
        var newFolder = Folder.selectDialog("অন্য ফোল্ডার সিলেক্ট করুন", folder);
        if (newFolder) {
            folder = newFolder;
            txtFolderPath.text = decodeURI(folder.fsName);
            imageFiles = getImageFiles(folder);
            updateStatusAndList();
        }
    };

    var lblFileCount = pnlFolder.add("statictext", undefined, "ফোল্ডারে মোট ইমেজ ফাইল: " + imageFiles.length + " টি");
    lblFileCount.graphics.font = ScriptUI.newFont("dialog", "bold", 11);

    // Target Selection Mode
    var pnlMode = dlg.add("panel", undefined, "কোথায় বসাতে চান:");
    pnlMode.orientation = "column";
    pnlMode.alignChildren = ["left", "top"];
    pnlMode.margins = 10;

    var rbSel = pnlMode.add("radiobutton", undefined, "বর্তমানে সিলেক্ট করা অবজেক্টগুলোতে রিপ্লেস করুন (" + selectedQrItems.length + " টি)");
    var rbAll = pnlMode.add("radiobutton", undefined, "পুরো ডকুমেন্টের সব QR কোড একসাথে অটো-ম্যাচ (" + docQrItems.length + " টি)");

    // If user has items selected, default to selection!
    if (selectedQrItems.length > 0) {
        rbSel.value = true;
    } else {
        rbAll.value = true;
    }

    // Preview Mapping List Box (Decodes URI for Bangla)
    var pnlPreview = dlg.add("panel", undefined, "ম্যাপিং তালিকা (০১ থেকে ৬১ ক্রমানুসারে):");
    pnlPreview.orientation = "column";
    pnlPreview.alignChildren = ["fill", "top"];
    pnlPreview.margins = 10;

    var txtPreview = pnlPreview.add("edittext", undefined, "", { multiline: true, readonly: true });
    txtPreview.size = [470, 150];

    var lblSizeNote = pnlPreview.add("statictext", undefined, "সাইজ: 0.5 in x 0.5 in (ক্লিপিং মাস্কের ঠিক মাঝখানে মিডল-এলাইন হবে)");
    lblSizeNote.graphics.font = ScriptUI.newFont("dialog", "italic", 11);

    function updateStatusAndList() {
        lblFileCount.text = "ফোল্ডারে মোট ইমেজ ফাইল: " + imageFiles.length + " টি";
        var activeItems = rbSel.value ? selectedQrItems : docQrItems;
        var sorted = sortCardsSmart(activeItems.slice(0), doc);
        var lines = [];

        var maxLen = Math.min(sorted.length, imageFiles.length);
        for (var i = 0; i < maxLen; i++) {
            var abIdx = getArtboardIndexVisual(sorted[i], doc);
            var fName = decodeURI(imageFiles[i].name);
            lines.push("[" + (i + 1) + "] " + fName + "  -->  (Page " + (abIdx + 1) + ")");
        }
        lines.push("--------------------------------------------------");
        lines.push("সর্বমোট " + maxLen + " টি কার্ডে QR কোড রিপ্লেস হবে।");
        txtPreview.text = lines.join("\n");
    }

    rbSel.onClick = updateStatusAndList;
    rbAll.onClick = updateStatusAndList;
    updateStatusAndList();

    var chkEmbed = dlg.add("checkbox", undefined, "নতুন QR কোডগুলো ডকুমেন্টে 'Embed' করতে চান?");
    chkEmbed.value = true;

    var btnGroup = dlg.add("group");
    btnGroup.alignment = ["fill", "bottom"];
    var btnCancel = btnGroup.add("button", undefined, "বাতিল (Cancel)", { name: "cancel" });
    var btnOk = btnGroup.add("button", undefined, "ইমপোর্ট ও রিপ্লেস করুন (Apply)", { name: "ok" });

    if (dlg.show() !== 1) return;

    var targetItems = rbSel.value ? selectedQrItems : docQrItems;
    if (targetItems.length === 0) {
        alert("কোনো QR কোড অবজেক্ট সিলেক্ট করা নেই!", "Error");
        return;
    }

    targetItems = sortCardsSmart(targetItems, doc);
    var shouldEmbed = chkEmbed.value;

    var count = Math.min(targetItems.length, imageFiles.length);
    var successCount = 0;

    for (var i = 0; i < count; i++) {
        var target = targetItems[i];
        var newFile = imageFiles[i];

        try {
            var targetParent = target.parent;

            if (target.locked) target.locked = false;
            if (target.layer && target.layer.locked) target.layer.locked = false;

            // 0.5 inch = 36 pt (1 in = 72 pt)
            var targetW = 36;
            var targetH = 36;

            var mask = findClipMask(target);
            var centerX, centerY;

            if (mask) {
                if (Math.abs(mask.width - 36) < 8) {
                    targetW = mask.width;
                    targetH = mask.height;
                }
                centerX = mask.left + (mask.width / 2);
                centerY = mask.top - (mask.height / 2);
            } else {
                centerX = target.left + (target.width / 2);
                centerY = target.top - (target.height / 2);
            }

            var newPlaced = targetParent.placedItems.add();
            newPlaced.file = newFile;
            newPlaced.move(target, ElementPlacement.PLACEBEFORE);

            newPlaced.width = targetW;
            newPlaced.height = targetH;
            newPlaced.left = centerX - (targetW / 2);
            newPlaced.top = centerY + (targetH / 2);

            if (shouldEmbed) {
                try { newPlaced.embed(); } catch (embErr) {}
            }

            target.remove();
            successCount++;
        } catch (e) {}
    }

    try { app.redraw(); } catch (err) {}

    alert("আলহামদুলিল্লাহ!\n\nসবগুলো " + successCount + " টি QR কোড নিখুঁতভাবে ইমপোর্ট ও রিপ্লেস সম্পন্ন হয়েছে!", "Success");

    function getImageFiles(fldr) {
        var fls = fldr.getFiles(function (file) {
            if (file instanceof Folder) return false;
            return /\.(png|jpe?g|svg|tif|tiff)$/i.test(file.name);
        });
        fls.sort(naturalCompare);
        return fls;
    }

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
        return (w >= 15 && w <= 70 && h >= 15 && h <= 100);
    }

    function findClipMask(item) {
        var p = item.parent;
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

    // Visual Artboard Sorting: Sort artboards Left to Right by their X coordinate
    function getSortedVisualArtboards(d) {
        var abs = [];
        for (var i = 0; i < d.artboards.length; i++) {
            abs.push({
                index: i,
                left: d.artboards[i].artboardRect[0],
                rect: d.artboards[i].artboardRect
            });
        }
        abs.sort(function(a, b) { return a.left - b.left; });
        return abs;
    }

    function getArtboardIndexVisual(item, d) {
        var cx = item.left + (item.width / 2);
        var cy = item.top - (item.height / 2);
        var visAbs = getSortedVisualArtboards(d);

        for (var k = 0; k < visAbs.length; k++) {
            var r = visAbs[k].rect;
            if (cx >= r[0] && cx <= r[2] && cy <= r[1] && cy >= r[3]) {
                return k;
            }
        }
        // Fallback: closest by X coordinate
        var bestIdx = 0;
        var minDiff = 999999;
        for (var m = 0; m < visAbs.length; m++) {
            var diff = Math.abs(cx - visAbs[m].left);
            if (diff < minDiff) {
                minDiff = diff;
                bestIdx = m;
            }
        }
        return bestIdx;
    }

    function sortCardsSmart(items, d) {
        if (items.length <= 1) return items;

        var visAbs = getSortedVisualArtboards(d);
        var abGroups = {};

        for (var i = 0; i < items.length; i++) {
            var itm = items[i];
            var ab = getArtboardIndexVisual(itm, d);
            if (!abGroups[ab]) abGroups[ab] = [];
            abGroups[ab].push(itm);
        }

        var sortedResult = [];

        // Loop through artboards in VISUAL Left-to-Right order
        for (var abIdx = 0; abIdx < visAbs.length; abIdx++) {
            var group = abGroups[abIdx];
            if (!group || group.length === 0) continue;

            group.sort(function(a, b) { return b.top - a.top; });

            var rowTolerance = 110;
            var rows = [];

            for (var g = 0; g < group.length; g++) {
                var itm = group[g];
                var placedInRow = false;

                for (var r = 0; r < rows.length; r++) {
                    var avgRowTop = getRowAvgTop(rows[r]);
                    if (Math.abs(itm.top - avgRowTop) <= rowTolerance) {
                        rows[r].push(itm);
                        placedInRow = true;
                        break;
                    }
                }

                if (!placedInRow) {
                    rows.push([itm]);
                }
            }

            rows.sort(function(rowA, rowB) {
                return getRowAvgTop(rowB) - getRowAvgTop(rowA);
            });

            for (var rIdx = 0; rIdx < rows.length; rIdx++) {
                rows[rIdx].sort(function(a, b) {
                    return a.left - b.left;
                });
                for (var k = 0; k < rows[rIdx].length; k++) {
                    sortedResult.push(rows[rIdx][k]);
                }
            }
        }

        return sortedResult;
    }

    function getRowAvgTop(row) {
        var sum = 0;
        for (var i = 0; i < row.length; i++) sum += row[i].top;
        return sum / row.length;
    }

    function naturalCompare(a, b) {
        var nameA = decodeURI(a.name);
        var nameB = decodeURI(b.name);
        var re = /(\d+)|(\D+)/g, aParts = [], bParts = [], m;
        while ((m = re.exec(nameA)) !== null) aParts.push(m[1] ? parseInt(m[1], 10) : m[2].toLowerCase());
        re.lastIndex = 0;
        while ((m = re.exec(nameB)) !== null) bParts.push(m[1] ? parseInt(m[1], 10) : m[2].toLowerCase());
        var len = Math.min(aParts.length, bParts.length);
        for (var idx = 0; idx < len; idx++) {
            if (aParts[idx] !== bParts[idx]) {
                if (typeof aParts[idx] === 'number' && typeof bParts[idx] === 'number') {
                    return aParts[idx] - bParts[idx];
                }
                return aParts[idx] < bParts[idx] ? -1 : 1;
            }
        }
        return aParts.length - bParts.length;
    }
})();
