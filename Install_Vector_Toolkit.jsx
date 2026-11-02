//@target illustrator

/**
 * ============================================================================
 * ONE-CLICK PERMANENT INSTALLER FOR VECTOR TOOLKIT & WORD CLOUD
 * ============================================================================
 */

(function () {
    var scriptFile = new File($.fileName);
    var scriptFolder = scriptFile.parent;

    var toolkitFile = new File(scriptFolder.fsName + "/Vector_Toolkit.jsx");
    var wordCloudFile = new File(scriptFolder.fsName + "/Random_Word_Cloud_Generator.jsx");
    var numProFile = new File(scriptFolder.fsName + "/Card_Numbering_Pro.jsx");
    var qrFile = new File(scriptFolder.fsName + "/Replace_QR_Codes.jsx");
    var qrResizeFile = new File(scriptFolder.fsName + "/Resize_and_Center_QRs.jsx");

    if (!toolkitFile.exists) {
        alert("Error: Vector_Toolkit.jsx was not found in:\n" + scriptFolder.fsName);
        return;
    }

    // Determine Illustrator Scripts directory
    var appFolder = Folder.appPackage; // macOS app path or main folder
    var scriptsFolder = null;

    // Common search paths for Illustrator Presets
    var possiblePaths = [
        appFolder.fsName + "/Presets.localized/en_US/Scripts",
        appFolder.fsName + "/Presets.localized/en_GB/Scripts",
        appFolder.fsName + "/Presets/en_US/Scripts",
        appFolder.fsName + "/Presets/en_GB/Scripts",
        Folder.startup.fsName + "/Presets.localized/en_US/Scripts",
        Folder.startup.fsName + "/Presets.localized/en_GB/Scripts",
        Folder.startup.fsName + "/Presets/en_US/Scripts",
        "/Applications/Adobe Illustrator 2024/Presets.localized/en_US/Scripts",
        "/Applications/Adobe Illustrator 2022/Presets.localized/en_GB/Scripts",
        "C:/Program Files/Adobe/Adobe Illustrator 2024/Presets/en_US/Scripts",
        "C:/Program Files/Adobe/Adobe Illustrator 2023/Presets/en_US/Scripts",
        "C:/Program Files/Adobe/Adobe Illustrator 2022/Presets/en_US/Scripts"
    ];

    for (var i = 0; i < possiblePaths.length; i++) {
        var testFolder = new Folder(possiblePaths[i]);
        if (testFolder.exists) {
            scriptsFolder = testFolder;
            break;
        }
    }

    var isMac = (File.fs === "Macintosh" || (typeof $.os !== "undefined" && $.os.indexOf("Mac") !== -1));

    if (scriptsFolder && scriptsFolder.exists) {
        var destToolkit = new File(scriptsFolder.fsName + "/Vector_Toolkit.jsx");
        var destCloud = new File(scriptsFolder.fsName + "/Random_Word_Cloud_Generator.jsx");
        var destNumPro = new File(scriptsFolder.fsName + "/Card_Numbering_Pro.jsx");
        var destQr = new File(scriptsFolder.fsName + "/Replace_QR_Codes.jsx");
        var destQrResize = new File(scriptsFolder.fsName + "/Resize_and_Center_QRs.jsx");

        var copiedToolkit = toolkitFile.copy(destToolkit);
        var copiedCloud = wordCloudFile.exists ? wordCloudFile.copy(destCloud) : false;
        var copiedNumPro = numProFile.exists ? numProFile.copy(destNumPro) : false;
        var copiedQr = qrFile.exists ? qrFile.copy(destQr) : false;
        var copiedQrResize = qrResizeFile.exists ? qrResizeFile.copy(destQrResize) : false;

        if (copiedToolkit) {
            alert("Success! Vector Toolkit Pro, Numbering Pro & QR Code Importer are now permanently installed!\n\nLocation: " + scriptsFolder.fsName + "\n\nAfter restarting Illustrator, you will find them in:\nFile > Scripts > Vector_Toolkit\nFile > Scripts > Card_Numbering_Pro\nFile > Scripts > Replace_QR_Codes");
            return;
        }
    }

    // If direct write was blocked by OS permissions on Mac
    if (isMac) {
        var cmdFile = new File(scriptFolder.fsName + "/Install_to_Illustrator.command");
        if (cmdFile.exists) {
            alert("macOS requires Admin Permission to copy into /Applications.\n\nPlease double-click 'Install_to_Illustrator.command' in your folder to install instantly with 1-click!");
            cmdFile.execute();
            return;
        }
    }

    alert("Could not automatically locate the Scripts folder.\nPlease manually copy 'Vector_Toolkit.jsx' into your Illustrator's Presets/Scripts folder.");
})();
