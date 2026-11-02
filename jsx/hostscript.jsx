#target illustrator

// Safe JSON parser/serializer for ExtendScript (ES3)
if (typeof JSON !== "object") {
    JSON = {};
}
if (typeof JSON.stringify !== "function") {
    JSON.stringify = function(obj) {
        if (obj === null) return "null";
        if (typeof obj === "undefined") return "undefined";
        if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
        if (typeof obj === "string") {
            return '"' + obj.replace(/\\/g, '\\\\')
                            .replace(/"/g, '\\"')
                            .replace(/\r/g, '\\r')
                            .replace(/\n/g, '\\n')
                            .replace(/\t/g, '\\t') + '"';
        }
        if (obj instanceof Array) {
            var a = [];
            for (var i = 0; i < obj.length; i++) {
                a.push(JSON.stringify(obj[i]));
            }
            return "[" + a.join(",") + "]";
        }
        if (typeof obj === "object") {
            var o = [];
            for (var k in obj) {
                if (obj.hasOwnProperty(k)) {
                    o.push(JSON.stringify(k) + ":" + JSON.stringify(obj[k]));
                }
            }
            return "{" + o.join(",") + "}";
        }
        return String(obj);
    };
}
if (typeof JSON.parse !== "function") {
    JSON.parse = function(str) {
        if (!str) return null;
        return eval('(' + str + ')');
    };
}

var Bijoy2UnicodeEngine = (function () {
    var rawMapV1 = {
        "0": "\u09E6",
        "1": "\u09E7",
        "2": "\u09E8",
        "3": "\u09E9",
        "4": "\u09EA",
        "5": "\u09EB",
        "6": "\u09EC",
        "7": "\u09ED",
        "8": "\u09EE",
        "9": "\u09EF",
        "i\xA8": "\u09B0\u200C\u09CD\u09AF",
        "\xAA\xA8": "\u09CD\u09B0\u09CD\u09AF",
        "\xB2": "\u0995\u09CD\u09B7\u09CD\u09AE",
        "\xB0": "\u0995\u09CD\u0995",
        "\xB1": "\u0995\u09CD\u099F",
        "\xB3\xA1": "\u0995\u09CD\u09A4\u09CD\u09AC",
        "\xB3": "\u0995\u09CD\u09A4",
        "K\xA1": "\u0995\u09CD\u09AC",
        "\xAF\u0152": "\u09B8\u09CD\u0995\u09CD\u09B0",
        "\xB5": "\u0995\u09CD\u09B0",
        "\xAF\u2039\xAC": "\u09B8\u09CD\u0995\u09CD\u09B2",
        "K\xAC": "\u0995\u09CD\u09B2",
        "K\xE8": "\u0995\u09CD\u09A8",
        "\xB4": "\u0995\u09CD\u09AE",
        "\xB6\xE8": "\u0995\u09CD\u09B7\u09CD\u09A3",
        "\xB6\xA1": "\u0995\u09CD\u09B7\u09CD\u09AC",
        "\u2022\xB6": "\u0999\u09CD\u0995\u09CD\u09B7",
        "\xB6": "\u0995\u09CD\u09B7",
        "\xB7": "\u0995\u09CD\u09B8",
        "L\xA1": "\u0996\u09CD\u09AC",
        "\xB8": "\u0997\u09C1",
        "\xBA": "\u0997\u09CD\u09A6",
        "M\xA6": "\u0997\u09CD\u09AC",
        "\xBB": "\u0997\u09CD\u09A7",
        "M\u0153": "\u0997\u09CD\u09A8",
        "M\xA5": "\u0997\u09CD\u09AE",
        "M\xAD": "\u0997\u09CD\u09B2",
        "N\xA1": "\u0998\u09CD\u09AC",
        "N\u0153": "\u0998\u09CD\u09A8",
        "\xBC": "\u0999\u09CD\u0995",
        "\u2022g": "\u0999\u09CD\u09AE",
        "\u2022L": "\u0999\u09CD\u0996",
        "\xBD": "\u0999\u09CD\u0997",
        "\u2022N": "\u0999\u09CD\u0998",
        "\u2022": "\u0995\u09CD\u09B8",
        "\u201DQ\xA1": "\u099A\u09CD\u099B\u09CD\u09AC",
        "\u201DQ\xA6": "\u099A\u09CD\u099B\u09CD\u09AC",
        "\u201DP": "\u099A\u09CD\u099A",
        "\u201DQ": "\u099A\u09CD\u099B",
        "\u201DT": "\u099A\u09CD\u099E",
        "Q\xA1": "\u099B\u09CD\u09AC",
        "\xBE\xA1": "\u099C\u09CD\u099C\u09CD\u09AC",
        "\xBE": "\u099C\u09CD\u099C",
        "\xC0": "\u099C\u09CD\u099D",
        "\xC1": "\u099C\u09CD\u099E",
        "R\xA1": "\u099C\u09CD\u09AC",
        "\xC2": "\u099E\u09CD\u099A",
        "\xC3": "\u099E\u09CD\u099B",
        "\xC4": "\u099E\u09CD\u099C",
        "\xC5": "\u099E\u09CD\u099D",
        "\xC6": "\u099F\u09CD\u099F",
        "U\xA1": "\u099F\u09CD\u09AC",
        "U\xA5": "\u099F\u09CD\u09AE",
        "\xC7": "\u09A1\u09CD\u09A1",
        "\xC8": "\u09A3\u09CD\u099F",
        "\xC9": "\u09A3\u09CD\u09A0",
        "\u2212": "\u09A3\u09CD\u09A2",
        "Y\u0153": "\u09A3\u09CD\u09A3",
        "Y\xA5": "\u09A3\u09CD\u09AE",
        "\xDD": "\u09A8\u09CD\u09B8",
        "\xCA": "\u09A3\u09CD\u09A1",
        "\u0161\u2018": "\u09A8\u09CD\u09A4\u09C1",
        "Y^": "\u09A3\u09CD\u09AC",
        "\xCB\xA1": "\u09A4\u09CD\u09A4\u09CD\u09AC",
        "\xCB": "\u09A4\u09CD\u09A4",
        "\xCC": "\u09A4\u09CD\u09A5",
        "Z\u0153": "\u09A4\u09CD\u09A8",
        "\xCD": "\u09A4\u09CD\u09AE",
        "Z\xAC": "\u09A4\u09CD\u09B2",
        "\u0161\u2014\xA1": "\u09A8\u09CD\u09A4\u09CD\u09AC",
        "\xAF\u2014\xA1": "\u09B8\u09CD\u09A4\u09CD\u09AC",
        "Z\xA1": "\u09A4\u09CD\u09AC",
        "\xCE": "\u09A4\u09CD\u09B0",
        "_\xAD": "\u09A5\u09CD\u09B2",
        "_\xA1": "\u09A5\u09CD\u09AC",
        "\u203A\xD8": "\u09A8\u09CD\u09A6\u09CD\u09AC",
        "\u02DCM": "\u09A6\u09CD\u0997",
        "\u02DCN": "\u09A6\u09CD\u0998",
        "\xCF\xA1": "\u09A6\u09CD\u09A6\u09CD\u09AC",
        "\xCF": "\u09A6\u09CD\u09A6",
        "\xD7\xA1": "\u09A6\u09CD\u09A7\u09CD\u09AC",
        "\xD7": "\u09A6\u09CD\u09A7",
        "`\u0153": "\u09A6\u09CD\u09A8",
        "\xD8": "\u09A6\u09CD\u09AC",
        "\u2122\xA3": "\u09A6\u09CD\u09AD\u09CD\u09B0",
        "\u2122\xA2": "\u09A6\u09CD\u09AD",
        "\xD9": "\u09A6\u09CD\u09AE",
        "a\u0153": "\u09A7\u09CD\u09A8",
        "a\u0178": "\u09A7\u09CD\u09AC",
        "a\xA5": "\u09A7\u09CD\u09AE",
        "\u203AU": "\u09A8\u09CD\u099F",
        "\xDA": "\u09A8\u09CD\u09A0",
        "\xDB": "\u09A8\u09CD\u09A1",
        "\u0161\xCD": "\u09A8\u09CD\u09A4",
        "\u0161\u2014": "\u09A8\u09CD\u09A4",
        "\u0161\xBF": "\u09A8\u09CD\u09A4\u09CD\u09B0",
        "\u0161\u2019": "\u09A8\u09CD\u09A5",
        "\u203A`": "\u09A8\u09CD\u09A6",
        "\xDC": "\u09A8\u09CD\u09A7",
        "b\u0153": "\u09A8\u09CD\u09A8",
        "\u0161^": "\u09A8\u09CD\u09AC",
        "b\xA5": "\u09A8\u09CD\u09AE",
        "\xDE": "\u09AA\u09CD\u099F",
        "\xDF": "\u09AA\u09CD\u09A4",
        "c\u0153": "\u09AA\u09CD\u09A8",
        "\xE0": "\u09AA\u09CD\u09AA",
        "c\xA5": "\u09AA\u09CD\u09AE",
        "c\xAD": "\u09AA\u09CD\u09B2",
        "\xE1": "\u09AA\u09CD\u09B8",
        "d\xAC": "\u09AB\u09CD\u09B2",
        "\xE2": "\u09AC\u09CD\u099C",
        "\xE3": "\u09AC\u09CD\u09A6",
        "\xE4": "\u09AC\u09CD\u09A7",
        "e\u0178": "\u09AC\u09CD\u09AC",
        "e\xAD": "\u09AC\u09CD\u09B2",
        "f\xAC": "\u09AD\u09CD\u09B2",
        "\xE5": "\u09AD\u09CD\u09B0",
        "\xE6": "\u09AE\u09CD\u09A8",
        "\xA4\xFA": "\u09AE\u09CD\u09AA",
        "\xA4c": "\u09AE\u09CD\u09AA",
        "\xE7": "\u09AE\u09CD\u09AB",
        "\xAE^": "\u09B7\u09CD\u09AC",
        "\xA4^": "\u09AE\u09CD\u09AC",
        "\xA4\xA2": "\u09AE\u09CD\u09AD",
        "\xA4\xA3": "\u09AE\u09CD\u09AD\u09CD\u09B0",
        "\xA4\xA7": "\u09AE\u09CD\u09AE",
        "\xA4\xAA": "\u09AE\u09CD\u09B0",
        "\xA4\xAD": "\u09AE\u09CD\u09B2",
        "\xA4\xAC": "\u09AE\u09CD\u09B2",
        "\xE9": "\u09B2\u09CD\u0995",
        "\xEA": "\u09B2\u09CD\u0997",
        "\xEB": "\u09B2\u09CD\u099F",
        "\xEC": "\u09B2\u09CD\u09A1",
        "\xED": "\u09B2\u09CD\u09AA",
        "\xEE": "\u09B2\u09CD\u09AB",
        "j\xA6": "\u09B2\u09CD\u09AC",
        "j\xA5": "\u09B2\u09CD\u09AE",
        "j\xAD": "\u09B2\u09CD\u09B2",
        "\xEF": "\u09B6\u09C1",
        "\xF0": "\u09B6\u09CD\u099A",
        "\xF1": "\u09B6\u09CD\u099B",
        "k\u0153": "\u09B6\u09CD\u09A8",
        "k\xA6": "\u09B6\u09CD\u09AC",
        "k^": "\u09B6\u09CD\u09AC",
        "k\xA5": "\u09B6\u09CD\u09AE",
        "k\xAD": "\u09B6\u09CD\u09B2",
        "\xAE\u2039": "\u09B7\u09CD\u0995",
        "\xAE\u0152": "\u09B7\u09CD\u0995\u09CD\u09B0",
        "\xF3": "\u09B7\u09CD\u099F",
        "\xF4": "\u09B7\u09CD\u09A0",
        "\xF2": "\u09B7\u09CD\u09A3",
        "\xAE\xFA": "\u09B7\u09CD\u09AA",
        "\xAEc": "\u09B7\u09CD\u09AA",
        "\xF5": "\u09B7\u09CD\u09AB",
        "\xAE\xA7": "\u09B7\u09CD\u09AE",
        "\xAE\xAA": "\u09B7\u09CD\u09B0",
        "\xAF\u2039": "\u09B8\u09CD\u0995",
        "\xF7": "\u09B8\u09CD\u099F",
        "\xF6": "\u09B8\u09CD\u0996",
        "\xAF\u2014": "\u09B8\u09CD\u09A4",
        "\xAF\xCD": "\u09B8\u09CD\u09A4",
        "\xAF\u2018": "\u09B8\u09CD\u09A4\u09C1",
        "\xAF\xBF": "\u09B8\u09CD\u09A4\u09CD\u09B0",
        "\xAF\u2019": "\u09B8\u09CD\u09A5",
        "\xF8": "\u09CD\u09B2",
        "\xAF\xFA": "\u09B8\u09CD\u09AA",
        "\xAFc": "\u09B8\u09CD\u09AA",
        "\xF9": "\u09B8\u09CD\u09AB",
        "\xAF^": "\u09B8\u09CD\u09AC",
        "\xAF\xA7": "\u09B8\u09CD\u09AE",
        "\xAF\xAA": "\u09B8\u09CD\u09B0",
        "\xAF\xAD": "\u09B8\u09CD\u09B2",
        "\xAF\xAC": "\u09B8\u09CD\u09B2",
        "\xFB": "\u09B9\u09C1",
        "n\xE8": "\u09B9\u09CD\u09A3",
        "n\u0178": "\u09B9\u09CD\u09AC",
        "\xFD": "\u09B9\u09CD\u09A8",
        "\xFE": "\u09B9\u09CD\u09AE",
        "n\xAC": "\u09B9\u09CD\u09B2",
        "\xFC": "\u09B9\u09C3",
        "\xFF": "\u09DC\u09CD\u0997",
        "\xA9": "\u09B0\u09CD",
        "Av": "\u0986",
        "A": "\u0985",
        "B": "\u0987",
        "C": "\u0988",
        "D": "\u0989",
        "E": "\u098A",
        "F": "\u098B",
        "G": "\u098F",
        "H": "\u0990",
        "I": "\u0993",
        "J": "\u0994",
        "K": "\u0995",
        "L": "\u0996",
        "M": "\u0997",
        "N": "\u0998",
        "O": "\u0999",
        "P": "\u099A",
        "Q": "\u099B",
        "R": "\u099C",
        "S": "\u099D",
        "T": "\u099E",
        "U": "\u099F",
        "V": "\u09A0",
        "W": "\u09A1",
        "X": "\u09A2",
        "Y": "\u09A3",
        "Z": "\u09A4",
        "_": "\u09A5",
        "`": "\u09A6",
        "a": "\u09A7",
        "b": "\u09A8",
        "c": "\u09AA",
        "d": "\u09AB",
        "e": "\u09AC",
        "f": "\u09AD",
        "g": "\u09AE",
        "h": "\u09AF",
        "i": "\u09B0",
        "j": "\u09B2",
        "k": "\u09B6",
        "l": "\u09B7",
        "m": "\u09B8",
        "n": "\u09B9",
        "o": "\u09DC",
        "p": "\u09DD",
        "q": "\u09DF",
        "r": "\u09CE",
        "\\$": "\u09F3",
        "<<": "\u098D",
        ">>": "\u098E",
        "v": "\u09BE",
        "w": "\u09BF",
        "x": "\u09C0",
        "y": "\u09C1",
        "z": "\u09C1",
        "~": "\u09C2",
        "\u201A": "\u09C2",
        "\u0192": "\u09C2",
        "\u201E": "\u09C3",
        "\u201C": "\u09C1",
        "\u2021": "\u09C7",
        "\u2020": "\u09C7",
        "\u2030": "\u09C8",
        "\u02C6": "\u09C8",
        "\x88": "\u09C8",
        "ˆ": "\u09C8",
        "\u2030": "\u09C8",
        "‰": "\u09C8",
        "\u0160": "\u09D7",
        "\x8A": "\u09D7",
        "Š": "\u09D7",
        "š": "\u09D7",
        "\xD0": "-",
        "\xD4": "\u2019",
        "\xD5": "\u2019",
        "\\|": "\u0964",
        "\\\\": "\u0965",
        "\xD2": "\u201C",
        "\xD3": "\u201D",
        "s": "\u0982",
        "t": "\u0983",
        "u": "\u0981",
        "\xAA": "\u09CD\u09B0",
        "\xD6": "\u09CD\u09B0",
        "\xAB": "\u09CD\u09B0",
        "\xA8": "\u09CD\u09AF",
        "\xA6": "\u09CD\u09AC",
        "\xA1": "\u09CD\u09AC",
        "\xAC": "\u09CD\u09B2",
        "\xAD": "\u09CD\u09B2",
        "\xE8": "\u09CD\u09A8",
        "\u0153": "\u09CD\u09A8",
        "\\&": "\u09CD",
        "\u2026": "\u09C3",
        "|": "\u0964",
        "\u2018": "\u2019",
        "\u2019": "\u2019",
        "\xA2": "\u09AD",
        "\xA2e": "\u09AD\u09CD\u09AC"
    };

    var rawMapV2 = {
        "0": "\u09E6",
        "1": "\u09E7",
        "2": "\u09E8",
        "3": "\u09E9",
        "4": "\u09EA",
        "5": "\u09EB",
        "6": "\u09EC",
        "7": "\u09ED",
        "8": "\u09EE",
        "9": "\u09EF",
        "i\xA8": "\u09B0\u200C\u09CD\u09AF",
        "\xAA\xA8": "\u09CD\u09B0\u09CD\u09AF",
        "\xB2": "\u0995\u09CD\u09B7\u09CD\u09AE",
        "\xB0": "\u0995\u09CD\u0995",
        "\xB1": "\u0995\u09CD\u099F",
        "\xB3\xA1": "\u0995\u09CD\u09A4\u09CD\u09AC",
        "\xB3": "\u0995\u09CD\u09A4",
        "K\xA1": "\u0995\u09CD\u09AC",
        "\xAF\u0152": "\u09B8\u09CD\u0995\u09CD\u09B0",
        "\xB5": "\u0995\u09CD\u09B0",
        "\xAF\u2039\xAC": "\u09B8\u09CD\u0995\u09CD\u09B2",
        "K\xAC": "\u0995\u09CD\u09B2",
        "K\xE8": "\u0995\u09CD\u09A8",
        "\xB4": "\u0995\u09CD\u09AE",
        "\xFF\xA1": "\u0995\u09CD\u09B7\u09CD\u09AC",
        "\xFF\xE8": "\u0995\u09CD\u09B7\u09CD\u09A3",
        "\u2022\xFF": "\u0999\u09CD\u0995\u09CD\u09B7",
        "\xFF": "\u0995\u09CD\u09B7",
        "\xB7": "\u0995\u09CD\u09B8",
        "L\xA1": "\u0996\u09CD\u09AC",
        "\xB8": "\u0997\u09C1",
        "\xBA": "\u0997\u09CD\u09A6",
        "\xBB": "\u0997\u09CD\u09A7",
        "M\u0153": "\u0997\u09CD\u09A8",
        "M\xA6": "\u0997\u09CD\u09AC",
        "M\xA5": "\u0997\u09CD\u09AE",
        "M\xF8": "\u0997\u09CD\u09B2",
        "N\xA1": "\u0998\u09CD\u09AC",
        "N\u0153": "\u0998\u09CD\u09A8",
        "\xBC": "\u0999\u09CD\u0995",
        "\u2022g": "\u0999\u09CD\u09AE",
        "\u2022L": "\u0999\u09CD\u0996",
        "\xBD": "\u0999\u09CD\u0997",
        "\u2022N": "\u0999\u09CD\u0998",
        "\u2022": "\u0995\u09CD\u09B8",
        "\u201DQ\xA1": "\u099A\u09CD\u099B\u09CD\u09AC",
        "\u201DQ\xA6": "\u099A\u09CD\u099B\u09CD\u09AC",
        "\u201DP": "\u099A\u09CD\u099A",
        "\u201DQ": "\u099A\u09CD\u099B",
        "\u201DT": "\u099A\u09CD\u099E",
        "Q\xA1": "\u099B\u09CD\u09AC",
        "\xBE\xA1": "\u099C\u09CD\u099C\u09CD\u09AC",
        "\xBE": "\u099C\u09CD\u099C",
        "\xC0": "\u099C\u09CD\u099D",
        "\xC1": "\u099C\u09CD\u099E",
        "R\xA1": "\u099C\u09CD\u09AC",
        "\xC2": "\u099E\u09CD\u099A",
        "\xC3": "\u099E\u09CD\u099B",
        "\xC4": "\u099E\u09CD\u099C",
        "\xC5": "\u099E\u09CD\u099D",
        "\xC6": "\u099F\u09CD\u099F",
        "U\xA1": "\u099F\u09CD\u09AC",
        "U\xA5": "\u099F\u09CD\u09AE",
        "\xC7": "\u09A1\u09CD\u09A1",
        "\xC8": "\u09A3\u09CD\u099F",
        "\xC9": "\u09A3\u09CD\u09A0",
        "\u2212": "\u09A3\u09CD\u09A2",
        "Y\u0153": "\u09A3\u09CD\u09A3",
        "Y\xA5": "\u09A3\u09CD\u09AE",
        "\xDD": "\u09A8\u09CD\u09B8",
        "\xD0": "\u09A3\u09CD\u09A1",
        "\u0161\u2018": "\u09A8\u09CD\u09A4\u09C1",
        "Y^": "\u09A3\u09CD\u09AC",
        "\xCB\xA1": "\u09A4\u09CD\u09A4\u09CD\u09AC",
        "\xCB": "\u09A4\u09CD\u09A4",
        "\xCC": "\u09A4\u09CD\u09A5",
        "Z\xA5": "\u09A4\u09CD\u09AE",
        "Z\u0153": "\u09A4\u09CD\u09A8",
        "\u0161\xCD\xA1": "\u09A8\u09CD\u09A4\u09CD\u09AC",
        "\xAF\xCD\xA1": "\u09B8\u09CD\u09A4\u09CD\u09AC",
        "Z\xA1": "\u09A4\u09CD\u09AC",
        "\xCE": "\u09A4\u09CD\u09B0",
        "Z\xAC": "\u09A4\u09CD\u09B2",
        "_\xF8": "\u09A5\u09CD\u09B2",
        "_\xA1": "\u09A5\u09CD\u09AC",
        "\u203A\xD8": "\u09A8\u09CD\u09A6\u09CD\u09AC",
        "\u02DCM": "\u09A6\u09CD\u0997",
        "\u02DCN": "\u09A6\u09CD\u0998",
        "\xCF\xA1": "\u09A6\u09CD\u09A6\u09CD\u09AC",
        "\xCF": "\u09A6\u09CD\u09A6",
        "\xD7\xA1": "\u09A6\u09CD\u09A7\u09CD\u09AC",
        "\xD7": "\u09A6\u09CD\u09A7",
        "`\u0153": "\u09A6\u09CD\u09A8",
        "\xD8": "\u09A6\u09CD\u09AC",
        "\u2122\xA3": "\u09A6\u09CD\u09AD\u09CD\u09B0",
        "\u2122\xA2": "\u09A6\u09CD\u09AD",
        "\xD9": "\u09A6\u09CD\u09AE",
        "a\u0153": "\u09A7\u09CD\u09A8",
        "a\u0178": "\u09A7\u09CD\u09AC",
        "a\xA5": "\u09A7\u09CD\u09AE",
        "\u203AU": "\u09A8\u09CD\u099F",
        "\xDA": "\u09A8\u09CD\u09A0",
        "\xDB": "\u09A8\u09CD\u09A1",
        "\u0161\xCD": "\u09A8\u09CD\u09A4",
        "\u0161\xBF": "\u09A8\u09CD\u09A4\u09CD\u09B0",
        "\u0161\u2019": "\u09A8\u09CD\u09A5",
        "\u203A`": "\u09A8\u09CD\u09A6",
        "\xDC": "\u09A8\u09CD\u09A7",
        "b\u0153": "\u09A8\u09CD\u09A8",
        "\u0161^": "\u09A8\u09CD\u09AC",
        "b\xA5": "\u09A8\u09CD\u09AE",
        "\xDE": "\u09AA\u09CD\u099F",
        "\xDF": "\u09AA\u09CD\u09A4",
        "c\u0153": "\u09AA\u09CD\u09A8",
        "\xE0": "\u09AA\u09CD\u09AA",
        "c\xA5": "\u09AA\u09CD\u09AE",
        "c\xF8": "\u09AA\u09CD\u09B2",
        "\xE1": "\u09AA\u09CD\u09B8",
        "d\xAC": "\u09AB\u09CD\u09B2",
        "\xE2": "\u09AC\u09CD\u099C",
        "\xE3": "\u09AC\u09CD\u09A6",
        "\xE4": "\u09AC\u09CD\u09A7",
        "e\u0178": "\u09AC\u09CD\u09AC",
        "e\xF8": "\u09AC\u09CD\u09B2",
        "\xE5": "\u09AD\u09CD\u09B0",
        "f\xAC": "\u09AD\u09CD\u09B2",
        "\xA4\u0153": "\u09AE\u09CD\u09A8",
        "\xA4\xFA": "\u09AE\u09CD\u09AA",
        "\xA4c": "\u09AE\u09CD\u09AA",
        "\xE7": "\u09AE\u09CD\u09AB",
        "\xAE^": "\u09B7\u09CD\u09AC",
        "\xA4^": "\u09AE\u09CD\u09AC",
        "\xA4\xA2": "\u09AE\u09CD\u09AD",
        "\xA4\xA3": "\u09AE\u09CD\u09AD\u09CD\u09B0",
        "\xA4\xA7": "\u09AE\u09CD\u09AE",
        "\xA4\xAA": "\u09AE\u09CD\u09B0",
        "\xA4\xF8": "\u09AE\u09CD\u09B2",
        "\xA4\xAC": "\u09AE\u09CD\u09B2",
        "\xE9": "\u09B2\u09CD\u0995",
        "\xEA": "\u09B2\u09CD\u0997",
        "\xEB": "\u09B2\u09CD\u099F",
        "\xEC": "\u09B2\u09CD\u09A1",
        "\xED": "\u09B2\u09CD\u09AA",
        "\xEE": "\u09B2\u09CD\u09AB",
        "j\xA6": "\u09B2\u09CD\u09AC",
        "j\xA5": "\u09B2\u09CD\u09AE",
        "j\xF8": "\u09B2\u09CD\u09B2",
        "\xEF": "\u09B6\u09C1",
        "\xF0": "\u09B6\u09CD\u099A",
        "\xF1": "\u09B6\u09CD\u099B",
        "k\u0153": "\u09B6\u09CD\u09A8",
        "k\xA6": "\u09B6\u09CD\u09AC",
        "k^": "\u09B6\u09CD\u09AC",
        "k\xA5": "\u09B6\u09CD\u09AE",
        "k\xF8": "\u09B6\u09CD\u09B2",
        "\xAE\u2039": "\u09B7\u09CD\u0995",
        "\xAE\u0152": "\u09B7\u09CD\u0995\u09CD\u09B0",
        "\xF3": "\u09B7\u09CD\u099F",
        "\xF4": "\u09B7\u09CD\u09A0",
        "\xF2": "\u09B7\u09CD\u09A3",
        "\xAE\xFA": "\u09B7\u09CD\u09AA",
        "\xAEc": "\u09B7\u09CD\u09AA",
        "\xF5": "\u09B7\u09CD\u09AB",
        "\xAE\xA7": "\u09B7\u09CD\u09AE",
        "\xAE\xAA": "\u09B7\u09CD\u09B0",
        "\xAF\u2039": "\u09B8\u09CD\u0995",
        "\xF7": "\u09B8\u09CD\u099F",
        "\xF6": "\u09B8\u09CD\u0996",
        "\xAF\u2018": "\u09B8\u09CD\u09A4\u09C1",
        "\xAF\xCD": "\u09B8\u09CD\u09A4",
        "\xAF\xBF": "\u09B8\u09CD\u09A4\u09CD\u09B0",
        "\xAF\u2019": "\u09B8\u09CD\u09A5",
        "m\u0153": "\u09B8\u09CD\u09A8",
        "\xAF\xFA": "\u09B8\u09CD\u09AA",
        "\xAFc": "\u09B8\u09CD\u09AA",
        "\xF9": "\u09B8\u09CD\u09AB",
        "\xAF^": "\u09B8\u09CD\u09AC",
        "\xAF\xA7": "\u09B8\u09CD\u09AE",
        "\xAF\xAA": "\u09B8\u09CD\u09B0",
        "\xAF\xF8": "\u09B8\u09CD\u09B2",
        "\xAF\xAC": "\u09B8\u09CD\u09B2",
        "\xFB": "\u09B9\u09C1",
        "n\xE8": "\u09B9\u09CD\u09A3",
        "n\u0178": "\u09B9\u09CD\u09AC",
        "\xFD": "\u09B9\u09CD\u09A8",
        "\xFE": "\u09B9\u09CD\u09AE",
        "n\xAC": "\u09B9\u09CD\u09B2",
        "\xFC": "\u09B9\u09C3",
        "\u2014M": "\u09DC\u09CD\u0997",
        "\xA9": "\u09B0\u09CD",
        "Av": "\u0986",
        "A": "\u0985",
        "B": "\u0987",
        "C": "\u0988",
        "D": "\u0989",
        "E": "\u098A",
        "F": "\u098B",
        "G": "\u098F",
        "H": "\u0990",
        "I": "\u0993",
        "J": "\u0994",
        "K": "\u0995",
        "L": "\u0996",
        "M": "\u0997",
        "N": "\u0998",
        "O": "\u0999",
        "P": "\u099A",
        "Q": "\u099B",
        "R": "\u099C",
        "S": "\u099D",
        "T": "\u099E",
        "U": "\u099F",
        "V": "\u09A0",
        "W": "\u09A1",
        "X": "\u09A2",
        "Y": "\u09A3",
        "Z": "\u09A4",
        "_": "\u09A5",
        "`": "\u09A6",
        "a": "\u09A7",
        "b": "\u09A8",
        "c": "\u09AA",
        "d": "\u09AB",
        "e": "\u09AC",
        "f": "\u09AD",
        "g": "\u09AE",
        "h": "\u09AF",
        "i": "\u09B0",
        "j": "\u09B2",
        "k": "\u09B6",
        "l": "\u09B7",
        "m": "\u09B8",
        "n": "\u09B9",
        "o": "\u09DC",
        "p": "\u09DD",
        "q": "\u09DF",
        "r": "\u09CE",
        "\\$": "\u09F3",
        "<<": "\u098D",
        ">>": "\u098E",
        "v": "\u09BE",
        "w": "\u09BF",
        "x": "\u09C0",
        "y": "\u09C1",
        "z": "\u09C1",
        "~": "\u09C2",
        "\u201A": "\u09C2",
        "\u0192": "\u09C2",
        "\u201E": "\u09C3",
        "\xE6": "\u09C1",
        "\u2013": "\u09C1",
        "\u2021": "\u09C7",
        "\u2020": "\u09C7",
        "\u2030": "\u09C8",
        "\u02C6": "\u09C8",
        "\x88": "\u09C8",
        "ˆ": "\u09C8",
        "\u2030": "\u09C8",
        "‰": "\u09C8",
        "\u0160": "\u09D7",
        "\x8A": "\u09D7",
        "Š": "\u09D7",
        "š": "\u09D7",
        "\xD4": "\u2019",
        "\xD5": "\u2019",
        "\\|": "\u0964",
        "\\\\": "\u0965",
        "\xD2": "\u201C",
        "\xD3": "\u201D",
        "s": "\u0982",
        "t": "\u0983",
        "u": "\u0981",
        "\xAA": "\u09CD\u09B0",
        "\xD6": "\u09CD\u09B0",
        "\xAB": "\u09CD\u09B0",
        "\xA8": "\u09CD\u09AF",
        "\xA6": "\u09CD\u09AC",
        "\xA1": "\u09CD\u09AC",
        "\xAC": "\u09CD\u09B2",
        "\xF8": "\u09CD\u09B2",
        "\xE8": "\u09CD\u09A8",
        "\u0153": "\u09CD\u09A8",
        "\\&": "\u09CD",
        "\u2026": "\u09C3",
        "|": "\u0964",
        "\u2018": "\u2019",
        "\u2019": "\u2019",
        "\xA2": "\u09AD",
        "\xA2e": "\u09AD\u09CD\u09AC"
    };

    var rawMapV3 = {
        "0": "\u09E6",
        "1": "\u09E7",
        "2": "\u09E8",
        "3": "\u09E9",
        "4": "\u09EA",
        "5": "\u09EB",
        "6": "\u09EC",
        "7": "\u09ED",
        "8": "\u09EE",
        "9": "\u09EF",
        "\xEE\xFB\xC4": "\u09B0\u200C\u09CD\u09AF",
        "\xCA\xC4": "\u09CD\u09B0\u09CD\u09AF",
        "\"": "\u0995\u09CD\u09B7\u09CD\u09AE",
        "E\xFE": "\u0995\u09CD\u0995",
        "E": "\u0995\u09CD\u0995",
        "Q": "\u0995\u09CD\u099F",
        "_\xB4\xAB": "\u0995\u09CD\u09A4\u09CD\u09AC",
        "_\xAB": "\u0995\u09CD\u09A4",
        "\xF0\xFE": "\u0995\u09CD\u09AC",
        "\xF0": "\u0995\u09CD\u09AC",
        "\xDF\xFE;": "\u09B8\u09CD\u0995\u09CD\u09B0",
        "\xDF;": "\u09B8\u09CD\u0995\u09CD\u09B0",
        "e\xAB": "\u0995\u09CD\u09B0",
        "\xDF\xFE\xCF\xF1": "\u09B8\u09CD\u0995\u09CD\u09B2",
        "\u201E\xCF\xFE": "\u0995\u09CD\u09B2",
        "\u201E\xCF": "\u0995\u09CD\u09B2",
        "\u201E\xF8\xFE": "\u0995\u09CD\u09A8",
        "\u201E\xF8": "\u0995\u09CD\u09A8",
        "\xA9": "\u0995\u09CD\u09AE",
        "\xC7\xF8\xFE": "\u0995\u09CD\u09B7\u09CD\u09A3",
        "\xC7\xF8": "\u0995\u09CD\u09B7\u09CD\u09A3",
        "\xC7\xB4\xFE": "\u0995\u09CD\u09B7\u09CD\u09AC",
        "\xC7\xB4": "\u0995\u09CD\u09B7\u09CD\u09AC",
        "A\xC7\xFE": "\u0999\u09CD\u0995\u09CD\u09B7",
        "A\xC7": "\u0999\u09CD\u0995\u09CD\u09B7",
        "\xC7\xFE": "\u0995\u09CD\u09B7",
        "\xC7": "\u0995\u09CD\u09B7",
        ":": "\u0995\u09CD\u09B8",
        "\u2026\xB4": "\u0996\u09CD\u09AC",
        ">": "\u0997\u09CD\u0997",
        "@\u201D": "\u0997\u09CD\u09A6",
        "\\?\xFE": "\u0997\u09CD\u09A7",
        "\\?": "\u0997\u09CD\u09A7",
        "@\xC0": "\u0997\u09CD\u09A8",
        "@\xBB": "\u0997\u09CD\u09AC",
        "@\xC2": "\u0997\u09CD\u09AE",
        "@\xD5": "\u0997\u09CD\u09B2",
        "\u2021\xB4": "\u0998\u09CD\u09AC",
        "\u2021\xF8": "\u0998\u09CD\u09A8",
        "B\xFE": "\u0999\u09CD\u0995",
        "B": "\u0999\u09CD\u0995",
        "-": "\u0999\u09CD\u09AE",
        "C": "\u0999\u09CD\u0996",
        "D": "\u0999\u09CD\u0997",
        "A\u2021": "\u0999\u09CD\u0998",
        "F\u0160\xB4\xE9": "\u099A\u09CD\u099B\u09CD\u09AC",
        "F\u0160\xB4": "\u099A\u09CD\u099B\u09CD\u09AC",
        "F\u2030\xFE": "\u099A\u09CD\u099A",
        "F\u2030": "\u099A\u09CD\u099A",
        "F\u0160\xE9": "\u099A\u09CD\u099B",
        "F\u0160": "\u099A\u09CD\u099B",
        "\x8E\xFE": "\u099A\u09CD\u099E",
        "\x8E": "\u099A\u09CD\u099E",
        "\u0160\xB4\xE9": "\u099B\u09CD\u09AC",
        "\u0160\xB4": "\u099B\u09CD\u09AC",
        "I\xB5": "\u099C\u09CD\u099C\u09CD\u09AC",
        "I": "\u099C\u09CD\u099C",
        "J": "\u099C\u09CD\u099D",
        "K\xFE\xE9": "\u099C\u09CD\u099E",
        "K": "\u099C\u09CD\u099E",
        "\u2039\xB5": "\u099C\u09CD\u09AC",
        "L": "\u099C\u09CD\u09B0",
        "M\xFE\xE9": "\u099E\u09CD\u099A",
        "M": "\u099E\u09CD\u099A",
        "N\xFE": "\u099E\u09CD\u099B",
        "N": "\u099E\u09CD\u099B",
        "O": "\u099E\u09CD\u099C",
        "P": "\u099E\u09CD\u099D",
        "R": "\u099F\u09CD\u099F",
        "\xDD\xB4\xFE": "\u099F\u09CD\u09AC",
        "\xDD\xB4": "\u099F\u09CD\u09AC",
        "\x8F": "\u099F\u09CD\u09AE",
        "U\xFE": "\u09A1\u09CD\u09A1",
        "U": "\u09A1\u09CD\u09A1",
        "\\^\xF9\xDD\xFE": "\u09A3\u09CD\u099F",
        "\\^\xF9\xDD": "\u09A3\u09CD\u099F",
        "Z\xFE": "\u09A3\u09CD\u09A0",
        "Z": "\u09A3\u09CD\u09A0",
        "\\^\xE9W": "\u09A3\u09CD\u09A2",
        "\\]": "\u09A3\u09CD\u09A3",
        "\\^\xF9\xE9\xC2": "\u09A3\u09CD\u09AE",
        "\xAA": "\u09A8\u09CD\u09B8",
        "\\[\xFE": "\u09A3\u09CD\u09A1",
        "\\[": "\u09A3\u09CD\u09A1",
        "ls\xFE": "\u09A8\u09CD\u09A4\u09C1",
        "ls": "\u09A8\u09CD\u09A4\u09C1",
        "\\^\xE9\xBB": "\u09A3\u09CD\u09AC",
        "_\xB4": "\u09A4\u09CD\u09A4\u09CD\u09AC",
        "_\xC9\xAB": "\u0995\u09CD\u09A4\u09CD\u09B0",
        "_": "\u09A4\u09CD\u09A4",
        "a": "\u09A4\u09CD\u09A5",
        "b": "\u09A4\u09CD\u09A8",
        "d": "\u09A4\u09CD\u09AE",
        "\u201C\xCF\xFE": "\u09A4\u09CD\u09B2",
        "\u201C\xCF": "\u09A4\u09CD\u09B2",
        "gs\xFE": "\u09A8\u09CD\u09A4\u09CD\u09AC",
        "gs": "\u09A8\u09CD\u09A4\u09CD\u09AC",
        "g\xDF\xFE": "\u09B8\u09CD\u09A4\u09CD\u09AC",
        "g\xDF": "\u09B8\u09CD\u09A4\u09CD\u09AC",
        "c": "\u09A4\u09CD\u09AC",
        "e": "\u09A4\u09CD\u09B0",
        "\xED\xCF": "\u09A5\u09CD\u09B2",
        "\xED\xB4": "\u09A5\u09CD\u09AC",
        "rm": "\u09A8\u09CD\u09A6\u09CD\u09AC",
        "\xE5\u2020": "\u09A6\u09CD\u0997",
        "\xE5\u2021": "\u09A6\u09CD\u0998",
        "j\xB5": "\u09A6\u09CD\u09A6\u09CD\u09AC",
        "j": "\u09A6\u09CD\u09A6",
        "k\xB4\xFE": "\u09A6\u09CD\u09A7\u09CD\u09AC",
        "k\xB4": "\u09A6\u09CD\u09A7\u09CD\u09AC",
        "k\xFE": "\u09A6\u09CD\u09A7",
        "k": "\u09A6\u09CD\u09A7",
        "\u201D\xF8": "\u09A6\u09CD\u09A8",
        "m": "\u09A6\u09CD\u09AC",
        "\x9E": "\u09A6\u09CD\u09AD\u09CD\u09B0",
        "q": "\u09A6\u09CD\u09AD",
        "p": "\u09A6\u09CD\u09AE",
        "\u2022\xF8": "\u09A7\u09CD\u09A8",
        "\u2022\xB9": "\u09A7\u09CD\u09AC",
        "\x90": "\u09A7\u09CD\u09AE",
        "r\xDD\xFE": "\u09A8\u09CD\u099F",
        "r\xDD": "\u09A8\u09CD\u099F",
        "t\xFE": "\u09A8\u09CD\u09A0",
        "t": "\u09A8\u09CD\u09A0",
        "u\xFE": "\u09A8\u09CD\u09A1",
        "u": "\u09A8\u09CD\u09A1",
        "hs\xFE": "\u09A8\u09CD\u09A4",
        "hs": "\u09A8\u09CD\u09A4",
        "s\xFEf": "\u09A8\u09CD\u09A4\u09CD\u09B0",
        "s\xFEi": "\u09A8\u09CD\u09A5",
        "r\u201D": "\u09A8\u09CD\u09A6",
        "\xF5\xFE": "\u09A8\u09CD\u09A7",
        "\xF5": "\u09A8\u09CD\u09A7",
        "\xA7\xAC": "\u09A8\u09CD\u09A8",
        "\xA7\xBA": "\u09A8\u09CD\u09AC",
        "\xA7\xC3": "\u09A8\u09CD\u09AE",
        "\xB2Wz": "\u09AA\u09CD\u099F",
        "\xAE": "\u09AA\u09CD\u09A4",
        "\xB2\xC0": "\u09AA\u09CD\u09A8",
        "\xAF": "\u09AA\u09CD\u09AA",
        "\xB2\xD5": "\u09AA\u09CD\u09B2",
        "\xB0": "\u09AA\u09CD\u09B8",
        "\x81\xFE": "\u09AB\u09CD\u099F",
        "\x81": "\u09AB\u09CD\u099F",
        "\u0161\xCF\xFE": "\u09AB\u09CD\u09B2",
        "\u0161\xCF": "\u09AB\u09CD\u09B2",
        "\xB6": "\u09AC\u09CD\u099C",
        "\xB7": "\u09AC\u09CD\u09A6",
        "w": "\u09A8\u09CD\u09A6\u09CD\u09B0",
        "\xB8\xFE": "\u09AC\u09CD\u09A7",
        "\xB8": "\u09AC\u09CD\u09A7",
        "\xEE\xB9": "\u09AC\u09CD\u09AC",
        "\xEE\xCF": "\u09AC\u09CD\u09B2",
        "\xBC": "\u09AD\u09CD\u09B0",
        "\xA6\xCF\xFE": "\u09AD\u09CD\u09B2",
        "\xA6\xCF": "\u09AD\u09CD\u09B2",
        "\xC1\xAC": "\u09AE\u09CD\u09A8",
        "\xDF\xFE\xB1": "\u09B8\u09CD\u09AA\u09CD\u09B0",
        "\xC1\xB1": "\u09AE\u09CD\u09AA\u09CD\u09B0",
        "\xDC\xB1": "\u09B7\u09CD\u09AA\u09CD\u09B0",
        "\xC1\u2122": "\u09AE\u09CD\u09AA",
        "\xC1\xB3\xFE": "\u09AE\u09CD\u09AB",
        "\xC1\xB3": "\u09AE\u09CD\u09AB",
        "\xDC\xBA": "\u09B7\u09CD\u09AC",
        "\xC1\xBA": "\u09AE\u09CD\u09AC",
        "\xBD\xFE": "\u09AE\u09CD\u09AD",
        "\xBD": "\u09AE\u09CD\u09AD",
        "\xBE": "\u09AE\u09CD\u09AD\u09CD\u09B0",
        "\xC1\xBF": "\u09AE\u09CD\u09AE",
        "\xC1\xD4": "\u09AE\u09CD\u09B2",
        "\xCD\xF1": "\u09B2\u09CD\u0995",
        "\xD1": "\u09B2\u09CD\u0997",
        "\xCE\xA2": "\u09B2\u09CD\u09B8",
        "\xCE\xDD\xFE": "\u09B2\u09CD\u099F",
        "\xCE\xDD": "\u09B2\u09CD\u099F",
        "\xD3\xFE": "\u09B2\u09CD\u09A1",
        "\xD3": "\u201D",
        "\xD2": "\u201C",
        "\xCD\xB3\xFE": "\u09B2\u09CD\u09AB",
        "\xCD\xB3": "\u09B2\u09CD\u09AB",
        "\xCD\xBA": "\u09B2\u09CD\u09AC",
        "\xCD\xC3": "\u09B2\u09CD\u09AE",
        "\xCD\xD4": "\u09B2\u09CD\u09B2",
        "\xD6": "\u09B6\u09C1",
        "\xD8\xFE": "\u09B6\u09CD\u099A",
        "\xD8": "\u09B6\u09CD\u099A",
        "\xD9\u0160\xE9": "\u09B6\u09CD\u099B",
        "\xD9\u0160": "\u09B6\u09CD\u099B",
        "\xD9\xC0": "\u09B6\u09CD\u09A8",
        "\xD9\xBB": "\u09B6\u09CD\u09AC",
        "\xD9\xC2": "\u09B6\u09CD\u09AE",
        "\xD9\xD5": "\u09B6\u09CD\u09B2",
        "\xD7": "\u09B6\u09CD\u09B0",
        "\xDC\xF1": "\u09B7\u09CD\u0995",
        "\xDC;\xFE": "\u09B7\u09CD\u0995\u09CD\u09B0",
        "\xDC;": "\u09B7\u09CD\u0995\u09CD\u09B0",
        "\xDCT": "\u09B7\u09CD\u099F",
        "\xDB\xFE": "\u09B7\u09CD\u09A0",
        "\xDB": "\u09B7\u09CD\u09A0",
        "\xA1\u0152": "\u09B7\u09CD\u09A3",
        "\xDC\u2122": "\u09B7\u09CD\u09AA",
        "\xDC\xB3\xFE": "\u09B7\u09CD\u09AB",
        "\xDC\xB3": "\u09B7\u09CD\u09AB",
        "\xDC\xBF": "\u09B7\u09CD\u09AE",
        "\xDF\xFE\xF1": "\u09B8\u09CD\u0995",
        "\xDE\xDD\xFE": "\u09B8\u09CD\u099F",
        "\xDE\xDD": "\u09B8\u09CD\u099F",
        "\xDF\xFE<": "\u09B8\u09CD\u0996",
        "h\xDF\xFE": "\u09B8\u09CD\u09A4",
        "h\xDF": "\u09B8\u09CD\u09A4",
        "l\xDF\xFE": "\u09B8\u09CD\u09A4\u09C1",
        "l\xDF": "\u09B8\u09CD\u09A4\u09C1",
        "\xDF\xFEf": "\u09B8\u09CD\u09A4\u09CD\u09B0",
        "\xDF\xFEi": "\u09B8\u09CD\u09A5",
        "\xDF\xFE\xAC": "\u09B8\u09CD\u09A8",
        "\xDF\xFE\u2122": "\u09B8\u09CD\u09AA",
        "\xB2\xCC": "\u09AA\u09CD\u09B0",
        "\xDF\xFE\xB3\xFE": "\u09B8\u09CD\u09AB",
        "\xDF\xFE\xB3": "\u09B8\u09CD\u09AB",
        "\xDF\xFE\xBA": "\u09B8\u09CD\u09AC",
        "\xDF\xFE\xBF": "\u09B8\u09CD\u09AE",
        "\xDF\xFE\xD4": "\u09B8\u09CD\u09B2",
        "\xDF\xFE\xCB": "\u09B8\u09CD\u09B0",
        "\xFD": "\u09B9\u09C1",
        "\xE3": "\u09B9\u09CD\u09A3",
        "\xA3\xB9": "\u09B9\u09CD\u09AC",
        "\xA3\xAB": "\u09B9\u09CD\u09A8",
        "\xE1\xFE": "\u09B9\u09CD\u09AE",
        "\xE1": "\u09B9\u09CD\u09AE",
        "\xC1\xCB": "\u09AE\u09CD\u09B0",
        "\xE2": "\u09B9\u09CD\u09B2",
        "\xA3\\*": "\u09B9\u09C3",
        "X\u2020": "\u09DC\u09CD\u0997",
        "@\xF9\xCC": "\u0997\u09CD\u09B0",
        "\u20AC": "\u09B2\u09CD\u0997\u09C1",
        "=": "\u0997\u09C1",
        "\xC5": "\u09B0\u09CD",
        "xy": "\u0986",
        "x": "\u0985",
        "\xA3z": "\u0987",
        "{": "\u0988",
        "v\xFEz": "\u0989",
        "\\|": "\u098A",
        "}": "\u098B",
        "~": "\u098F",
        "\xFA": "\u0990",
        "\xE7": "\u0993",
        "\xE8": "\u0994",
        "Y": "\u09BC\u09C1",
        "\u201E\xFE": "\u0995",
        "\u201E": "\u0995",
        "\u2026": "\u0996",
        "\u2020": "\u0997",
        "\u2021": "\u0998",
        "\u02C6": "\u0999",
        "\u2030\xFE": "\u099A",
        "\u2030": "\u099A",
        "\u0160\xE9": "\u099B",
        "\u0160": "\u099B",
        "\u2039": "\u099C",
        "G\xFE": "\u099D",
        "G": "\u099D",
        "~\u0152": "\u099E",
        "\xDD\xFE": "\u099F",
        "\xDD": "\u099F",
        "\xE0\xFE": "\u09A0",
        "\xE0": "\u09A0",
        "v\xFE\xFC": "\u09DC",
        "v\xFE": "\u09A1",
        "v": "\u09A1",
        "\u2018\xFE\xFC": "\u09DD",
        "\u2018\xFE": "\u09A2",
        "\u2018": "\u2019",
        "\u2019": "\u2019",
        "\u201C\xFE": "\u09A4",
        "\u201C": "\u09A4",
        "\xED": "\u09A5",
        "\u201D": "\u09A6",
        "\u2022": "\u09A7",
        "\u02DC": "\u09A8",
        "\xFE\u2122": "\u09AA",
        "\u0161\xFE": "\u09AB",
        "\u0161": "\u09AB",
        "\xEE\xFB": "\u09B0",
        "\xEE": "\u09AC",
        "\xA6\xFE": "\u09AD",
        "\xA6": "\u09AD",
        "\u203A": "\u09AE",
        "\xEB\xFB": "\u09DF",
        "\xEB": "\u09AF",
        "\u0153": "\u09B2",
        "\u0178": "\u09B6",
        "\xA1\xEC": "\u09B7",
        "\xA2": "\u09AD",
        "\xA3": "\u09B9",
        "\xEA": "\u09CE",
        "\xFE": "",
        "\xE9": "",
        "y": "\u09BE",
        "!": "\u09BF",
        "#": "\u09C0",
        "%": "\u09C1",
        "\\)": "\u09C2",
        "\\(": "\u09C2",
        "&": "\u09C1",
        "\\$": "\u09C1",
        "\\*": "\u09C2",
        ",": "\u09C3",
        "\xF6\xEC": "\u09C7",
        "\xF6": "\u09C7",
        "\xF7\xEC": "\u09C8",
        "\xF7": "\u09C8",
        "\xEF": "\u09D7",
        "\xEC": "",
        "\xE6": "!",
        "S": "(",
        "V": ")",
        "\xA0": "*",
        "\u2013": ",",
        "\xE9\xF4\xE9": "-",
        "\xF4": "-",
        "\xD0": "\u0964",
        "\xAD": ":",
        "\u2014": ";",
        "\xDA": "?",
        "\xF2": "\u2018",
        "\xF3": "\u2019",
        "\u201A": "\u0982",
        "\u0192": "\u0983",
        "\xA4": "\u0981",
        "\xCA": "\u09CD\u09B0",
        "\xC6": "\u09CD\u09B0",
        "\xC8": "\u09CD\u09B0",
        "\xC9": "\u09CD\u09B0",
        "\xC4": "\u09CD\u09AF",
        "\xE4": "\u09CD",
        "|": "\u0964",
        "\\\\": "\u0965",
        "\xD4": "\u2019",
        "\xD5": "\u2019",
        "\xA2e": "\u09AD\u09CD\u09AC"
    };

    function compile(mapObj) {
        var keys = [];
        for (var k in mapObj) {
            keys.push(k);
        }
        keys.sort(function (a, b) {
            return b.length - a.length;
        });
        return {
            convert: function (str) {
                var s = str;
                for (var i = 0; i < keys.length; i++) {
                    var k = keys[i];
                    s = s.split(k).join(mapObj[k]);
                }
                return rearrange(s);
            }
        };
    }

    function isPreKar(c) { return c === "\u09BF" || c === "\u09C7" || c === "\u09C8"; }
    function isPostKar(c) { return c === "\u09BE" || c === "\u09C0" || c === "\u09C1" || c === "\u09C2" || c === "\u09C3" || c === "\u09CB" || c === "\u09CC" || c === "\u09D7"; }
    function isKar(c) { return isPreKar(c) || isPostKar(c); }
    function isPureConsonant(c) {
        if (!c) return false;
        var code = c.charCodeAt(0);
        return (code >= 0x0995 && code <= 0x09B9) || code === 0x09DC || code === 0x09DD || code === 0x09DF || code === 0x09CE;
    }
    function isHalant(c) { return c === "\u09CD"; }

    function rearrange(text) {
        var s = text;
        var i;

        // 1. Reph reordering: find "র" + "্" and shift backwards over preceding consonant cluster
        for (i = 0; i < s.length; i++) {
            if (i < s.length - 1 && s.charAt(i) === "\u09B0" && isHalant(s.charAt(i + 1)) && (i === 0 || !isHalant(s.charAt(i - 1)))) {
                var step = 1;
                while (i - step >= 0) {
                    var cur = s.charAt(i - step);
                    var prev = i - step - 1 >= 0 ? s.charAt(i - step - 1) : "";
                    if (isPureConsonant(cur) && isHalant(prev)) {
                        step += 2;
                    } else if (isKar(cur) || cur === "\u0981" || cur === "\u0982" || cur === "\u0983") {
                        step++;
                    } else if (isPureConsonant(cur)) {
                        step++;
                        break;
                    } else {
                        break;
                    }
                }
                if (step > 1) {
                    var targetIdx = i - step + 1;
                    var reph = s.substring(i, i + 2);
                    var cluster = s.substring(targetIdx, i);
                    var remainder = s.substring(i + 2);
                    s = s.substring(0, targetIdx) + reph + cluster + remainder;
                    i++;
                }
            }
        }

        // 2. Pre-Kar (ি, ে, ৈ) reordering
        for (i = 0; i < s.length; i++) {
            if (isPreKar(s.charAt(i)) && i < s.length - 1 && s.charAt(i + 1) !== " ") {
                var preKar = s.charAt(i);
                var step2 = 1;
                while (i + step2 < s.length && isPureConsonant(s.charAt(i + step2))) {
                    if (i + step2 + 1 < s.length && isHalant(s.charAt(i + step2 + 1))) {
                        step2 += 2;
                    } else {
                        step2 += 1;
                        break;
                    }
                }
                if (step2 > 1) {
                    var cluster2 = s.substring(i + 1, i + step2);
                    var extraKar = "";
                    var skip = 0;
                    var next1 = i + step2 < s.length ? s.charAt(i + step2) : "";
                    var next2 = i + step2 + 1 < s.length ? s.charAt(i + step2 + 1) : "";
                    if (preKar === "\u09C7" && next1 === "\u09BE") {
                        extraKar = "\u09CB";
                        skip = 1;
                    } else if (preKar === "\u09C7" && next1 === "\u0981" && next2 === "\u09BE") {
                        extraKar = "\u09CB\u0981";
                        skip = 2;
                    } else if (preKar === "\u09C7" && next1 === "\u09D7") {
                        extraKar = "\u09CC";
                        skip = 1;
                    } else if (preKar === "\u09C7" && next1 === "\u0981" && next2 === "\u09D7") {
                        extraKar = "\u09CC\u0981";
                        skip = 2;
                    } else {
                        extraKar = preKar;
                    }
                    s = s.substring(0, i) + cluster2 + extraKar + s.substring(i + step2 + skip);
                    i += (step2 - 1);
                }
            }
        }

        // 3. Chandrabindu and Modifier Canonicalization
        s = s.replace(/([\u0981\u0982\u0983])([\u09BE\u09BF\u09C0\u09C1\u09C2\u09C3\u09C7\u09C8\u09CB\u09CC\u09D7])/g, "$2$1");
        s = s.replace(/\u09C7([\u0981\u0982\u0983])\u09BE/g, "\u09CB$1");
        s = s.replace(/\u09C7([\u0981\u0982\u0983])\u09D7/g, "\u09CC$1");
        s = s.replace(/[\u200C\u200D]/g, "");
        s = s.replace(/\u09CD\u09CD+/g, "\u09CD");

        // 4. Refine Typist Typos: remove stray ampersands, duplicate viramas, etc.
        s = s.replace(/&{2,}/g, "");
        s = s.replace(/([\u0980-\u09FF])\s*&+\s*([\u0980-\u09FF])/g, "$1$2");
        s = s.replace(/([\u0980-\u09FF])\s*&+/g, "$1");
        s = s.replace(/&+\s*([\u0980-\u09FF])/g, "$1");

        // 5. Precomposed Nukta canonicalization
        s = s.replace(/\u09A1\u09BC/g, "\u09DC"); // ড + ় -> ড়
        s = s.replace(/\u09A2\u09BC/g, "\u09DD"); // ঢ + ় -> ঢ়
        s = s.replace(/\u09AF\u09BC/g, "\u09DF"); // য + ় -> য়

        // 6. Fix Unmapped ANSI residual tokens & ligatures
        // Sa + Ligatures (macron prefix: ¯' / ¯’ -> স্থ, ¯^ -> স্ব, ¯œ -> স্ন, ¯§ -> স্ম, ¯Í -> স্ত, ¯¿ -> স্ত্র)
        s = s.replace(/[\xAF¯][''’‘”\"ʻʼ`]/g, "\u09B8\u09CD\u09A5"); // ¯' / ¯’ -> স্থ
        s = s.replace(/[\xAF¯][\^\\^]/g, "\u09B8\u09CD\u09AC");         // ¯^ -> স্ব
        s = s.replace(/[\xAF¯]œ/g, "\u09B8\u09CD\u09A8");               // ¯œ -> স্ন
        s = s.replace(/[\xAF¯]§/g, "\u09B8\u09CD\u09AE");               // ¯§ -> স্ম
        s = s.replace(/[\xAF¯]Í/g, "\u09B8\u09CD\u09A4");               // ¯Í -> স্ত
        s = s.replace(/[\xAF¯]¿/g, "\u09B8\u09CD\u09A4\u09CD\u09B0");   // ¯¿ -> স্ত্র
        s = s.replace(/[\xAF¯]\u2039/g, "\u09B8\u09CD\u0995");          // ¯‹ -> স্ক
        s = s.replace(/[\xAF¯]/g, "");                                  // orphan macron cleanup

        // Yen / Tma ligatures (¥ -> ত্ম)
        s = s.replace(/\u09A4?[\xA5¥]/g, "\u09A4\u09CD\u09AE");        // ত¥ or ¥ -> ত্ম
        s = s.replace(/আত¥ীয়/g, "\u0986\u09A4\u09CD\u09AE\u09C0\u09DF"); // আত¥ীয় -> আত্মীয়
        s = s.replace(/আত¥া/g, "\u0986\u09A4\u09CD\u09AE\u09BE");         // আত¥া -> আত্মা
        s = s.replace(/পরমাত¥া/g, "\u09AA\u09B0\u09AE\u09BE\u09A4\u09CD\u09AE\u09BE");
        s = s.replace(/মহাত¥া/g, "\u09AE\u09B9\u09BE\u09A4\u09CD\u09AE\u09BE");

        // Broken Ma-ligatures / Chumbon typo (চুম্-ন -> চুম্বন, চুম্^ন -> চুম্বন)
        s = s.replace(/চুম্[\-\^]ন/g, "\u099A\u09C1\u09AE\u09CD\u09AC\u09A8");
        s = s.replace(/চুম্[\-\^]নের/g, "\u099A\u09C1\u09AE\u09CD\u09AC\u09A8\u09C7\u09B0");
        s = s.replace(/চুম্[\-\^]নে/g, "\u099A\u09C1\u09AE\u09CD\u09AC\u09A8\u09C7");
        s = s.replace(/[\u09AE\u09AE\u09CD]্?[\-\^]([\u09AC\u09A8])/g, "\u09AE\u09CD\u09AC$1");

        // 7. Fix Apostrophe / Quote before Kar Transposition (e.g., ক’াবায় -> কা’বায়, ক’াবাকে -> কা’বাকে, দ’ুআ -> দু’আ)
        s = s.replace(/([\u0985-\u09B9\u09DC-\u09DF])([’'\"“”\u2018\u2019\u201C\u201D\u02BC\u02BB])([\u09BE-\u09CC\u09D7])/g, "$1$3$2");

        // 8. Duplicate Kars (typos like াা, িি, ুু, েে)
        s = s.replace(/\u09BE\u09BE+/g, "\u09BE");
        s = s.replace(/\u09BF\u09BF+/g, "\u09BF");
        s = s.replace(/\u09C0\u09C0+/g, "\u09C0");
        s = s.replace(/\u09C1\u09C1+/g, "\u09C1");
        s = s.replace(/\u09C2\u09C2+/g, "\u09C2");
        s = s.replace(/\u09C7\u09C7+/g, "\u09C7");

        // 9. Universal Orthography & Bijoy Misconversion Auto-Fixes
        // All forms of legacy ড়্গ / ড়্ঘ / ঢ়্গ -> ক্ষ (পরীক্ষা, লক্ষ্য, শিক্ষা, দক্ষতা, ইত্যাদি)
        s = s.replace(/([\u09DC\u09DD]|\u09A1\u09BC|\u09A2\u09BC)\u09CD?[\u0997\u0998]/g, "\u0995\u09CD\u09B7");
        
        // All forms of broken legacy রম্ন -> রু (জরুরত, গুরুত্ব, দ্রুত, ইত্যাদি)
        s = s.replace(/\u09B0\u09AE\u09CD[\u09B0\u09A8]\u09C1?/g, "\u09B0\u09C1");
        s = s.replace(/\u09B0\u09AE\u09CD[\u09B0\u09A8]/g, "\u09B0\u09C1");

        // Khanda-Ta fix: ত্ at end of word or before space/punctuation -> ৎ
        s = s.replace(/\u09A4\u09CD(?=[\s\.,;:!\?\"'\-\(\)\[\]\{\}\/\\।\n\r]|$)/g, "\u09CE");
        
        // Classic Book Typo Refinements
        s = s.replace(/\u0986\u09B2\u09B8\u09CD\u09A8\u09BE\u09B9/g, "\u0986\u09B2\u09CD\u09B2\u09BE\u09B9"); // আলস্নাহ -> আল্লাহ
        s = s.replace(/\u09B8\u09BE\u09B2\u09B8\u09CD\u09A8\u09BE\u09B2\u09B8\u09CD\u09A8\u09BE\u09B9\u09C1/g, "\u09B8\u09BE\u09B2\u09CD\u09B2\u09BE\u09B2\u09CD\u09B2\u09BE\u09B9\u09C1"); // সালস্নালস্নাহু -> সাল্লাল্লাহু
        s = s.replace(/\u09B8\u09BE\u09B2\u09B8\u09CD\u09A8\u09BE\u09AE/g, "\u09B8\u09BE\u09B2\u09CD\u09B2\u09BE\u09AE"); // সালস্নাম -> সাল্লাম
        s = s.replace(/\u0985\u09B6\u09BF\u09B8\u09CD\u09A8\u09B2\u09A4\u09BE/g, "\u0985\u09B6\u09CD\u09B2\u09C0\u09B2\u09A4\u09BE"); // অশিস্নলতা -> অশ্লীলতা
        s = s.replace(/\u0985\u09B8\u09CD\u09A8\u09C0\u09B2\u09A4\u09BE/g, "\u0985\u09B6\u09CD\u09B2\u09C0\u09B2\u09A4\u09BE"); // অসস্নীলতা -> অশ্লীলতা
        s = s.replace(/\u0985\u09B8\u09CD\u09B2\u09C0\u09B2\u09A4\u09BE/g, "\u0985\u09B6\u09CD\u09B2\u09C0\u09B2\u09A4\u09BE"); // অস্লীলতা -> অশ্লীলতা
        s = s.replace(/\u0987\u09B8\u09CD\u09A8\u09BE\u09AE/g, "\u0987\u09B8\u09B2\u09BE\u09AE"); // ইস্নাম -> ইসলাম
        s = s.replace(/\u09AE\u09C1\u09B8\u09CD\u09B2\u09BF\u09AE/g, "\u09AE\u09C1\u09B8\u09B2\u09BF\u09AE"); // মুস্লিম -> মুসলিম
        s = s.replace(/\u09B8\u0982\u09B0\u09CD\u09B8\u09CD\u09AA\u09C7/g, "\u09B8\u0982\u09B8\u09CD\u09AA\u09B0\u09CD\u09B6\u09C7"); // সংর্স্পে -> সংস্পর্শে
        s = s.replace(/\u09B8\u0982\u09B0\u09CD\u09B8\u09CD\u09AA/g, "\u09B8\u0982\u09B8\u09CD\u09AA\u09B0\u09CD\u09B6"); // সংর্স্প -> সংস্পর্শ
        s = s.replace(/\u099C\u09C0\u09AC\u09A6\u09CD\u09AC\u09B6\u09BE\u09DF/g, "\u099C\u09C0\u09AC\u09A6\u09CD\u09A6\u09B6\u09BE\u09DF"); // জীবদ্বশায় -> জীবদ্দশায়
        s = s.replace(/\u0985\u09A7\u09BF\u09A8\u09B8\u09CD\u09A4/g, "\u0985\u09A7\u09C0\u09A8\u09B8\u09CD\u09A5"); // অধিনস্ত -> অধীনস্থ
        s = s.replace(/\u09B8\u09B0\u09CD\u09AC\u09B8\u09CD\u09A5\u09BE\u09DF/g, "\u09B8\u09B0\u09CD\u09AC\u09BE\u09AC\u09B8\u09CD\u09A5\u09BE\u09DF"); // সর্বস্থায় -> সর্বাবস্থায়
        
        // Common Typist Loan-Word & Spelling Auto-Fixes
        s = s.replace(/দ[’'\u2018\u2019]আ/g, "দু’আ"); // দ’আ -> দু’আ
        s = s.replace(/ক[’'\u2018\u2019]াবা/g, "কা’বা"); // ক’াবা -> কা’বা
        s = s.replace(/অব[’'\u2018\u2019]ায়/g, "অবস্থায়");
        s = s.replace(/অব¯’ায়/g, "অবস্থায়");
        s = s.replace(/আক্রোমণ/g, "আক্রমণ");
        s = s.replace(/মূহূর্ত/g, "মুহূর্ত");
        s = s.replace(/মূহুর্ত/g, "মুহূর্ত");
        s = s.replace(/মুখরীত/g, "মুখরিত");
        s = s.replace(/ব্যতিত/g, "ব্যতীত");
        s = s.replace(/সংগৃহিত/g, "সংগৃহীত");

        // 10. Halant and diacritic cleanup
        s = s.replace(/\u09CD\u09CD+/g, "\u09CD");
        s = s.replace(/\u09CD+(?=[\s\.,;:!\?\"'\-\(\)\[\]\{\}\/\\।\n\r]|$)/g, "");
        s = s.replace(/([\u09BE-\u09CC\u09D7])\u09CD+/g, "$1");

        return s;
    }

    
    function refineUnicodeText(s) {
        if (!s) return "";
        // 1. Broken word specific fixes BEFORE any general regex
        s = s.replace(/অব[’'\u2018\u2019\u02BC\u02BB]?[◌\u25CC]?ায়/g, "অবস্থায়");
        s = s.replace(/অব[¯\xAF][’'\u2018\u2019\u02BC\u02BB]?ায়/g, "অবস্থায়");
        s = s.replace(/অব[¯\xAF]ায়/g, "অবস্থায়");
        s = s.replace(/অবা[’'\u2018\u2019\u02BC\u02BB]য়/g, "অবস্থায়");

        // 2. Ma-ligature (ম্ব / ম্ন) unmapped and broken typist forms
        s = s.replace(/গ[¤\xA4][\^\\^]?[◌\u25CC]?ু?জ/g, "গম্বুজ");
        s = s.replace(/গম্ব[◌\u25CC]ুজ/g, "গম্বুজ");
        s = s.replace(/অবল[¤\xA4][\^\\^]?[◌\u25CC]?ন/g, "অবলম্বন");
        s = s.replace(/নিম্[\-\^]ন/g, "নিম্ন");
        s = s.replace(/নিম্[\-\^]নোক্ত/g, "নিম্নোক্ত");
        s = s.replace(/নিম্[\-\^]নলিখিত/g, "নিম্নলিখিত");
        s = s.replace(/নিম্[\-\^]নরূপ/g, "নিম্নরূপ");
        s = s.replace(/নিম্[\-\^]নবর্ণিত/g, "নিম্নবর্ণিত");
        s = s.replace(/চুম্[\-\^]ন/g, "চুম্বন");
        s = s.replace(/চুম্[\-\^]নের/g, "চুম্বনের");
        s = s.replace(/চুম্[\-\^]নে/g, "চুম্বনে");
        s = s.replace(/মাথা\s+মু[\-\^]য়ে/g, "মাথা মুড়িয়ে");
        s = s.replace(/মু[\-\^]য়ে/g, "মুড়িয়ে");
        s = s.replace(/ল[¤\xA4][\^\\^]?[◌\u25CC]?া/g, "লম্বা");
        s = s.replace(/ক[¤\xA4][\^\\^]?[◌\u25CC]?ল/g, "কম্বল");
        s = s.replace(/দ[¤\xA4][\^\\^]?[◌\u25CC]?/g, "দম্ভ");
        s = s.replace(/স[¤\xA4][\^\\^]?[◌\u25CC]?ল/g, "সম্বল");
        s = s.replace(/[¤\xA4][\^\\^]/g, "\u09AE\u09CD\u09AC");
        s = s.replace(/[¤\xA4]/g, "\u09AE\u09CD");

        // 3. Unmapped ANSI ligatures
        s = s.replace(/[\xAF¯][''’‘”\"ʻʼ`]/g, "\u09B8\u09CD\u09A5"); // ¯' / ¯’ -> স্থ
        s = s.replace(/[\xAF¯][\^\\^]/g, "\u09B8\u09CD\u09AC");         // ¯^ -> স্ব
        s = s.replace(/[\xAF¯]œ/g, "\u09B8\u09CD\u09A8");               // ¯œ -> স্ন
        s = s.replace(/[\xAF¯]§/g, "\u09B8\u09CD\u09AE");               // ¯§ -> স্ম
        s = s.replace(/[\xAF¯]Í/g, "\u09B8\u09CD\u09A4");               // ¯Í -> স্ত
        s = s.replace(/[\xAF¯]¿/g, "\u09B8\u09CD\u09A4\u09CD\u09B0");   // ¯¿ -> স্ত্র
        s = s.replace(/[\xAF¯]\u2039/g, "\u09B8\u09CD\u0995");          // ¯‹ -> স্ক
        s = s.replace(/[\xAF¯]/g, "");

        // 4. Yen / Tma fix
        s = s.replace(/আত[¥\xA5][◌\u25CC]?ীয়/g, "\u0986\u09A4\u09CD\u09AE\u09C0\u09DF");
        s = s.replace(/আত[¥\xA5][◌\u25CC]?া/g, "\u0986\u09A4\u09CD\u09AE\u09BE");
        s = s.replace(/ত?[¥\xA5][◌\u25CC]?/g, "\u09A4\u09CD\u09AE");

        // 5. Loan-word apostrophe fixes
        s = s.replace(/তাঁ['’]র/g, "তাঁর");
        s = s.replace(/দ[’'\u2018\u2019][◌\u25CC]?ু?আ/g, "দু’আ");
        s = s.replace(/ক[’'\u2018\u2019][◌\u25CC]?া?বা/g, "কা’বা");
        s = s.replace(/মূহূর্ত/g, "মুহূর্ত");
        s = s.replace(/মূহুর্ত/g, "মুহূর্ত");
        s = s.replace(/ব্যতিত/g, "ব্যতীত");
        s = s.replace(/সংগৃহিত/g, "সংগৃহীত");

        // 6. Dotted Circle & Quote Transposition
        s = s.replace(/([\u0985-\u09B9\u09DC-\u09DF])([’'\"“”\u2018\u2019\u201C\u201D\u02BC\u02BB])([\u09BE-\u09CC\u09D7])/g, "$1$3$2");

        // 7. Remove any leftover dotted circles
        s = s.replace(/[\u25CC◌]/g, "");

        return s;
    }

    function isMostlyUnicode(str) {
        if (!str) return false;
        var bengaliCount = (str.match(/[\u0980-\u09FF]/g) || []).length;
        var asciiCount = (str.match(/[a-zA-Z0-9\x80-\xFF]/g) || []).length;
        return bengaliCount > 10 && bengaliCount > asciiCount;
    }

    function evaluateBengali(str) {
        var score = 0;
        var unmappedMatch = str.match(/[\x80-\xFF\u2018\u2019\u201C\u201D\u2022\u02DC\u2122\u0161\u00AF\u2014\u0152\u2039\u2212\u0160\u0153\u201E\u2026]/g);
        if (unmappedMatch) {
            score -= unmappedMatch.length * 15;
        }
        if (str.indexOf("\u09B0\u09AE\u09CD\u09A8") !== -1) score -= 20;
        if (str.indexOf("\u09CD\u09CD") !== -1) score -= 30;

        var bMatch = str.match(/[\u0980-\u09FF]/g);
        if (bMatch) {
            score += bMatch.length;
        }
        return score;
    }

    var engineV1 = compile(rawMapV1);
    var engineV2 = compile(rawMapV2);
    var engineV3 = compile(rawMapV3);

    function convert(input) {
        if (!input) return "";
        if (isMostlyUnicode(input)) {
            return refineUnicodeText(input);
        }
        var res1 = refineUnicodeText(engineV1.convert(input));
        var res2 = refineUnicodeText(engineV2.convert(input));
        var res3 = refineUnicodeText(engineV3.convert(input));
        
        var score1 = evaluateBengali(res1);
        var score2 = evaluateBengali(res2);
        var score3 = evaluateBengali(res3);

        if (score3 > score1 && score3 > score2) return res3;
        if (score2 >= score1) return res2;
        return res1;
    }

    return {
        convert: convert,
        convertV1: function(str) { return isMostlyUnicode(str) ? refineUnicodeText(str) : refineUnicodeText(engineV1.convert(str)); },
        convertV2: function(str) { return isMostlyUnicode(str) ? refineUnicodeText(str) : refineUnicodeText(engineV2.convert(str)); },
        convertV3: function(str) { return isMostlyUnicode(str) ? refineUnicodeText(str) : refineUnicodeText(engineV3.convert(str)); }
    };
})();


function _findFontByName(fontName) {
    if (!fontName || fontName === "keep" || fontName === "none") return null;

    var aliases = {
        "siyamrupali": ["SiyamRupali", "Siyam Rupali", "SiyamRupali-Regular", "SiyamRupaliANSI"],
        "kalpurush": ["Kalpurush", "Kalpurush-Regular", "KalpurushANSI"],
        "solaimanlipi": ["SolaimanLipiNormal", "SolaimanLipi-Bold", "SolaimanLipi", "Solaiman Lipi"],
        "nikosh": ["Nikosh", "NikoshBAN", "Nikosh-Regular", "NikoshLight"],
        "adorsholipi": ["AdorshoLipi", "AdorshoLipi-Regular"],
        "notoserifbengali": ["NotoSerifBengali", "NotoSerifBengali-Regular", "NotoSerifBengali-Bold"],
        "notosansbengali": ["NotoSansBengali", "NotoSansBengali-Regular", "NotoSansBengali-Bold"],
        "bornomala": ["Bornomala-Regular", "Bornomala-Bold", "Bornomala", "Bornomala Regular"],
        "bornomala-regular": ["Bornomala-Regular", "Bornomala", "Bornomala Regular"],
        "bornomala-bold": ["Bornomala-Bold", "Bornomala Bold"]
    };

    var key = fontName.toLowerCase().replace(/[-_\s]/g, "");
    var candidates = [fontName];
    if (aliases[key]) {
        candidates = candidates.concat(aliases[key]);
    }

    // 1. Direct getByName test for each candidate
    for (var c = 0; c < candidates.length; c++) {
        try {
            var fDirect = app.textFonts.getByName(candidates[c]);
            if (fDirect) return fDirect;
        } catch (eDirect) {}
    }

    // 2. Safe iterative search with try-catch around every single property access (avoids GFKU crash)
    try {
        var totalFonts = app.textFonts.length;
        for (var i = 0; i < totalFonts; i++) {
            var f = null;
            try { f = app.textFonts[i]; } catch (eF) { continue; }
            if (!f) continue;

            var fName = "";
            var fFam = "";
            var fPost = "";
            try { fName = f.name; } catch (eN) {}
            try { fFam = f.family; } catch (eFam) {}
            try { fPost = f.postScriptName; } catch (eP) {}

            var combined = (fName + " " + fFam + " " + fPost).toLowerCase().replace(/[-_\s]/g, "");
            if (combined.indexOf(key) !== -1) {
                return f;
            }
        }
    } catch (eLoop) {}

    return null;
}

function _collectFrames(scope, doc) {
    var result = [];
    var seen = {};

    function addFrame(tf) {
        if (!tf) return;
        try {
            var id = tf.uuid || tf.id || (tf.contents ? tf.contents.substring(0, 10) + "_" + tf.left + "_" + tf.top : null) || ("tf_" + result.length);
            if (!seen[id]) {
                seen[id] = true;
                result.push(tf);
            }
        } catch (e) {
            result.push(tf);
        }
    }

    function traverse(item) {
        if (!item) return;
        if (item.typename === "TextFrame") {
            addFrame(item);
        } else if (item.typename === "TextRange") {
            try {
                if (item.story && item.story.textFrames) {
                    for (var st = 0; st < item.story.textFrames.length; st++) {
                        addFrame(item.story.textFrames[st]);
                    }
                } else if (item.parent && item.parent.typename === "TextFrame") {
                    addFrame(item.parent);
                }
            } catch (eTR) {}
        } else if (item.typename === "GroupItem") {
            try {
                for (var g = 0; g < item.pageItems.length; g++) {
                    traverse(item.pageItems[g]);
                }
            } catch (eG) {}
        } else if (item.pageItems && item.pageItems.length > 0) {
            try {
                for (var p = 0; p < item.pageItems.length; p++) {
                    traverse(item.pageItems[p]);
                }
            } catch (eP) {}
        }
    }

    var hasSelection = (doc.selection && doc.selection.length > 0);

    if (scope === "selected") {
        if (hasSelection) {
            for (var s = 0; s < doc.selection.length; s++) {
                traverse(doc.selection[s]);
            }
        }
        return result;
    }

    for (var tf = 0; tf < doc.textFrames.length; tf++) {
        addFrame(doc.textFrames[tf]);
    }
    return result;
}


var VectorToolkitHost = {
    // 1. Live Document Stats
    getDocStats: function () {
        if (app.documents.length === 0) {
            return JSON.stringify({
                success: false,
                docName: "No Active Document",
                totalEmbedded: 0,
                totalLinked: 0,
                totalGroups: 0,
                totalArtboards: 0,
                activeArtboardIndex: 0,
                selEmbedded: 0,
                selLinked: 0,
                selItemsCount: 0,
                selTextCount: 0,
                sampleWidth: 0,
                sampleHeight: 0,
                matchedSampleCount: 0
            });
        }

        var doc = app.activeDocument;
        var embeddedCount = doc.rasterItems.length;
        var linkedCount = doc.placedItems.length;
        var totalGroups = doc.groupItems.length;
        var totalArtboards = doc.artboards.length;
        var activeAbIdx = 0;
        try { activeAbIdx = doc.artboards.getActiveArtboardIndex(); } catch (eAb) {}

        var selEmbedded = 0;
        var selLinked = 0;
        var selItemsCount = 0;
        var sampleWidth = 0;
        var sampleHeight = 0;
        var matchedSampleCount = 0;

        if (doc.selection && doc.selection.length > 0) {
            selItemsCount = doc.selection.length;
            try {
                var effDim = this._getEffectiveDimensions(doc.selection[0]);
                sampleWidth = effDim.width;
                sampleHeight = effDim.height;
            } catch (e) {
                try {
                    sampleWidth = Math.abs(doc.selection[0].width);
                    sampleHeight = Math.abs(doc.selection[0].height);
                } catch (e2) {}
            }

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
                var matched = this._findMatchingDesigns(doc, sampleWidth, sampleHeight);
                matchedSampleCount = matched.length;
            }
        }

        var selTextList = (doc.selection && doc.selection.length > 0) ? this._extractTextFrames(doc.selection) : [];

        return JSON.stringify({
            success: true,
            docName: doc.name,
            totalEmbedded: embeddedCount,
            totalLinked: linkedCount,
            totalGroups: totalGroups,
            totalArtboards: totalArtboards,
            activeArtboardIndex: activeAbIdx + 1,
            selEmbedded: selEmbedded,
            selLinked: selLinked,
            selItemsCount: selItemsCount,
            selTextCount: selTextList.length,
            sampleWidth: sampleWidth,
            sampleHeight: sampleHeight,
            matchedSampleCount: matchedSampleCount
        });
    },

    // 2. Browse for File
    browseForImage: function () {
        var f = File.openDialog(
            "Select Background PSD or Image File:",
            function (item) {
                if (item instanceof Folder) return true;
                var ext = item.name.substring(item.name.lastIndexOf(".")).toLowerCase();
                return (ext === ".psd" || ext === ".psb" || ext === ".tif" || ext === ".tiff" || ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".ai" || ext === ".pdf");
            }
        );

        if (f) {
            return JSON.stringify({ success: true, filePath: f.fsName });
        }
        return JSON.stringify({ success: false });
    },

    // 3. Execute Relink
    executeRelink: function (paramsJson) {
        if (app.documents.length === 0) return JSON.stringify({ success: false, message: "No active document." });
        var doc = app.activeDocument;

        var params = {};
        try { params = eval("(" + paramsJson + ")"); } catch (e) {}

        var targetFile = new File(params.filePath);
        if (!targetFile.exists) return JSON.stringify({ success: false, message: "Target file not found." });

        var targetItems = [];
        if (params.selectedOnly && doc.selection && doc.selection.length > 0) {
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

        if (targetItems.length === 0) return JSON.stringify({ success: false, message: "No embedded raster items found." });

        var originalInteractionLevel = app.userInteractionLevel;
        app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

        var successCount = 0;
        var masterPlaced = null;

        try {
            masterPlaced = doc.placedItems.add();
            masterPlaced.file = targetFile;

            for (var j = targetItems.length - 1; j >= 0; j--) {
                var rItem = targetItems[j];
                try {
                    var parentContainer = rItem.parent;
                    var placed = masterPlaced.duplicate(parentContainer, ElementPlacement.PLACEBEFORE);

                    if (params.preserveDim) {
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
                } catch (e) {}
            }
        } catch (err) {
            return JSON.stringify({ success: false, message: err.message });
        } finally {
            if (masterPlaced) {
                try { masterPlaced.remove(); } catch (e) {}
            }
            app.userInteractionLevel = originalInteractionLevel;
        }

        app.redraw();
        return JSON.stringify({ success: true, successCount: successCount });
    },

    // 4. Execute Fast Embed
    executeFastEmbed: function (isSelectedOnly) {
        if (app.documents.length === 0) return JSON.stringify({ success: false, message: "No active document open." });
        var doc = app.activeDocument;

        var targetsToEmbed = [];
        function collectPlaced(items) {
            for (var i = 0; i < items.length; i++) {
                try {
                    if (items[i].typename === "PlacedItem") {
                        targetsToEmbed.push(items[i]);
                    } else if (items[i].typename === "GroupItem") {
                        collectPlaced(items[i].pageItems);
                    }
                } catch (e) {}
            }
        }

        if (isSelectedOnly && doc.selection && doc.selection.length > 0) {
            collectPlaced(doc.selection);
        } else {
            for (var i = 0; i < doc.placedItems.length; i++) {
                targetsToEmbed.push(doc.placedItems[i]);
            }
            if (targetsToEmbed.length === 0) {
                for (var l = 0; l < doc.layers.length; l++) {
                    collectPlaced(doc.layers[l].pageItems);
                }
            }
        }

        if (targetsToEmbed.length === 0) {
            return JSON.stringify({
                success: false,
                message: isSelectedOnly ? "No linked images found in your current selection." : "No linked images found in document (they may already be embedded)."
            });
        }

        var originalInteractionLevel = app.userInteractionLevel;
        app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

        var embeddedSuccess = 0;
        try {
            for (var idx = targetsToEmbed.length - 1; idx >= 0; idx--) {
                var pItem = targetsToEmbed[idx];
                try {
                    try { pItem.locked = false; } catch (eLk) {}
                    pItem.embed();
                    embeddedSuccess++;
                } catch (e) {}
            }
        } finally {
            app.userInteractionLevel = originalInteractionLevel;
        }

        app.redraw();
        return JSON.stringify({ success: true, embeddedCount: embeddedSuccess });
    },

    // 5. Execute Batch Rasterize
    executeBatchRasterize: function (paramsJson) {
        if (app.documents.length === 0) return JSON.stringify({ success: false, message: "No active document." });
        var doc = app.activeDocument;

        var params = {};
        try { params = eval("(" + paramsJson + ")"); } catch (e) {}

        var targetsToRasterize = [];
        if (params.scope === "selected" && doc.selection) {
            for (var s = 0; s < doc.selection.length; s++) targetsToRasterize.push(doc.selection[s]);
        } else if (params.scope === "sample" && doc.selection && doc.selection.length > 0) {
            var sampleDim = this._getEffectiveDimensions(doc.selection[0]);
            var sampleW = sampleDim.width;
            var sampleH = sampleDim.height;
            targetsToRasterize = this._findMatchingDesigns(doc, sampleW, sampleH);
        } else {
            for (var g = 0; g < doc.groupItems.length; g++) targetsToRasterize.push(doc.groupItems[g]);
        }

        if (targetsToRasterize.length === 0) return JSON.stringify({ success: false, message: "No matching designs found to rasterize." });

        var rastOptions = new RasterizeOptions();
        var ppiVal = parseFloat(params.ppi) || 300;
        rastOptions.resolution = ppiVal;
        rastOptions.transparency = (params.transparent !== false);
        rastOptions.padding = 0;

        if (params.colorModel === "RGB") rastOptions.colorModel = RasterizationColorModel.DEFAULTCOLORMODEL;
        else if (params.colorModel === "Grayscale") rastOptions.colorModel = RasterizationColorModel.GRAYSCALE;
        else rastOptions.colorModel = RasterizationColorModel.DEFAULTCOLORMODEL;

        if (params.antiAliasing === "Type") rastOptions.antiAliasingMethod = AntiAliasingMethod.TYPEOPTIMIZED;
        else if (params.antiAliasing === "None") rastOptions.antiAliasingMethod = AntiAliasingMethod.NONE;
        else rastOptions.antiAliasingMethod = AntiAliasingMethod.ARTOPTIMIZED;

        var rasterizedCount = 0;
        for (var i = targetsToRasterize.length - 1; i >= 0; i--) {
            var itm = targetsToRasterize[i];
            try {
                this._unlockArt(itm);
                var safeClipBounds = this._getStrictArtworkBounds(itm, sampleW, sampleH);
                if (safeClipBounds) {
                    doc.rasterize(itm, safeClipBounds, rastOptions);
                } else {
                    doc.rasterize(itm, undefined, rastOptions);
                }
                rasterizedCount++;
            } catch (e) {
                try {
                    doc.selection = [itm];
                    doc.rasterize(itm, undefined, rastOptions);
                    rasterizedCount++;
                } catch (e2) {}
            }
        }

        app.redraw();
        return JSON.stringify({ success: true, rasterizedCount: rasterizedCount });
    },

    // 6. Execute Typography Word Cloud
    executeWordCloud: function (paramsJson) {
        if (app.documents.length === 0) return JSON.stringify({ success: false, message: "No active document." });
        var doc = app.activeDocument;

        if (!doc.selection || doc.selection.length === 0) {
            return JSON.stringify({ success: false, message: "Please select your text before generating." });
        }

        var params = {};
        try { params = eval("(" + paramsJson + ")"); } catch (e) {}

        var selectedFrames = this._extractTextFrames(doc.selection);
        if (selectedFrames.length === 0) return JSON.stringify({ success: false, message: "No text objects found." });

        var sampleFont = this._getFrameFont(selectedFrames[0]);
        var fontVars = this._getFamilyFontVariants(sampleFont);
        var wordFrames = [];

        var origBounds = this._calculateBounds(selectedFrames);
        var centerX = (origBounds[0] + origBounds[2]) / 2;
        var centerY = (origBounds[1] + origBounds[3]) / 2;

        // Extract
        if (params.splitMode === 0) { // Line by line
            for (var i = 0; i < selectedFrames.length; i++) {
                var tf = selectedFrames[i];
                var rawText = tf.contents;
                if (!rawText || rawText.replace(/\s+/g, "").length === 0) continue;

                var font = this._getFrameFont(tf) || sampleFont;
                var lines = rawText.split(/\r\n|\r|\n/);

                for (var l = 0; l < lines.length; l++) {
                    var lineStr = this._cleanText(lines[l], params.textCase);
                    if (!lineStr) continue;

                    var newTf = doc.textFrames.add();
                    newTf.contents = lineStr;
                    this._applyFont(newTf, font);
                    wordFrames.push(newTf);
                }
                tf.remove();
            }
        } else if (params.splitMode === 1) { // Word by word
            for (var j = 0; j < selectedFrames.length; j++) {
                var tf2 = selectedFrames[j];
                var rawText2 = tf2.contents;
                if (!rawText2 || rawText2.replace(/\s+/g, "").length === 0) continue;

                var font2 = this._getFrameFont(tf2) || sampleFont;
                var words = rawText2.match(/[^\s\r\n]+/g);
                if (!words || words.length === 0) continue;

                for (var w = 0; w < words.length; w++) {
                    var wordStr = this._cleanText(words[w], params.textCase);
                    if (!wordStr) continue;

                    var newTf2 = doc.textFrames.add();
                    newTf2.contents = wordStr;
                    this._applyFont(newTf2, font2);
                    wordFrames.push(newTf2);
                }
                tf2.remove();
            }
        } else {
            wordFrames = selectedFrames.slice();
            for (var k = 0; k < wordFrames.length; k++) {
                var cleaned = this._cleanText(wordFrames[k].contents, params.textCase);
                if (cleaned) wordFrames[k].contents = cleaned;
            }
        }

        if (wordFrames.length === 0) return JSON.stringify({ success: false, message: "No valid text items to process." });

        // Sizes
        this._assignSizes(wordFrames, params);

        // Mix Font Weights
        if (params.mixFontWeights && fontVars && fontVars.allList.length > 1) {
            this._assignFontWeights(wordFrames, fontVars, params);
        }

        // Tracking
        if (typeof params.tracking !== "undefined") {
            for (var t = 0; t < wordFrames.length; t++) {
                try { wordFrames[t].textRange.characterAttributes.tracking = params.tracking; } catch (e) {}
            }
        }

        // Rotation
        this._applyRotation(wordFrames, params);

        // Color Palette
        this._applyPalette(doc, wordFrames, params.palette);

        // Cloud Packing
        if (params.mode === "cloud") {
            this._arrangeWordCloud(wordFrames, centerX, centerY, params);
        }

        // Group
        var group = doc.groupItems.add();
        group.name = "Word Cloud Generated";
        for (var g = 0; g < wordFrames.length; g++) {
            wordFrames[g].moveToBeginning(group);
        }

        doc.selection = [group];
        app.redraw();

        return JSON.stringify({
            success: true,
            itemCount: wordFrames.length,
            fontFamily: sampleFont ? sampleFont.family : "Default"
        });
    },

    // 7. NEW: Smart Auto-Align & Fit to Artboards (from AutoalignV6.jsx)
    executeAutoAlign: function (autoEmbed) {
        if (app.documents.length === 0) return JSON.stringify({ success: false, message: "No active document." });
        var doc = app.activeDocument;
        var sel = doc.selection;

        if (!sel || sel.length === 0) {
            return JSON.stringify({ success: false, message: "Please select the images/placed items on canvas first." });
        }

        var items = [];
        for (var i = 0; i < sel.length; i++) {
            if (sel[i].typename === "PlacedItem" || sel[i].typename === "RasterItem") {
                items.push(sel[i]);
            }
        }

        if (items.length === 0) {
            return JSON.stringify({ success: false, message: "No placed or raster images found in selection." });
        }

        var self = this;
        // Sort using smart number extraction
        items.sort(function(a, b) {
            var nameA = self._getNameFromItem(a);
            var nameB = self._getNameFromItem(b);
            return self._extractSmartNumber(nameA) - self._extractSmartNumber(nameB);
        });

        var count = 0;
        var totalAb = doc.artboards.length;

        for (var k = 0; k < items.length; k++) {
            if (k < totalAb) {
                var item = items[k];
                var ab = doc.artboards[k];
                var abRect = ab.artboardRect;
                var abLeft = abRect[0];
                var abTop = abRect[1];
                var abRight = abRect[2];
                var abBottom = abRect[3];

                var abWidth = Math.abs(abRight - abLeft);
                var abHeight = Math.abs(abTop - abBottom);

                item.position = [abLeft, abTop];
                item.width = abWidth;
                item.height = abHeight;

                if (autoEmbed && item.typename === "PlacedItem") {
                    try { item.embed(); } catch (eEmb) {}
                }
                count++;
            }
        }

        doc.selection = null;
        app.redraw();

        return JSON.stringify({
            success: true,
            alignedCount: count,
            artboardCount: totalAb
        });
    },

    // 8. NEW: Direct Artboard Duplicator (from DuplicatingArtboardWin.jsx)
    executeDuplicateArtboard: function (paramsJson) {
        if (app.documents.length === 0) return JSON.stringify({ success: false, message: "No active document." });
        var doc = app.activeDocument;

        var params = {};
        try { params = eval("(" + paramsJson + ")"); } catch (e) {}
        var gap = parseFloat(params.gap) || 50;
        var copies = parseInt(params.copies, 10) || 1;

        // Force unlock and unhide
        for (var i = 0; i < doc.layers.length; i++) {
            doc.layers[i].locked = false;
            doc.layers[i].visible = true;
        }
        try { app.executeMenuCommand('unlockAll'); } catch (eUn1) {}
        try { app.executeMenuCommand('showAll'); } catch (eSh1) {}

        var activeAbIndex = doc.artboards.getActiveArtboardIndex();
        var activeAb = doc.artboards[activeAbIndex];
        var abRect = activeAb.artboardRect; // [left, top, right, bottom]
        var abWidth = Math.abs(abRect[2] - abRect[0]);

        doc.selection = null;
        doc.artboards.setActiveArtboardIndex(activeAbIndex);
        doc.selectObjectsOnActiveArtboard();

        var selectedItems = doc.selection;
        if (!selectedItems || selectedItems.length === 0) {
            return JSON.stringify({ success: false, message: "Active artboard appears empty." });
        }

        var totalCreated = 0;
        var lastRight = abRect[2];

        for (var c = 0; c < copies; c++) {
            var newLeft = lastRight + gap;
            var newRight = newLeft + abWidth;
            doc.artboards.add([newLeft, abRect[1], newRight, abRect[3]]);

            var moveX = newLeft - abRect[0];
            var moveY = 0;

            for (var j = 0; j < selectedItems.length; j++) {
                var itm = selectedItems[j];
                try {
                    var newItem = itm.duplicate(itm, ElementPlacement.PLACEBEFORE);
                    newItem.translate(moveX, moveY);
                } catch (eDup) {}
            }

            lastRight = newRight;
            totalCreated++;
        }

        doc.selection = null;
        app.redraw();

        return JSON.stringify({
            success: true,
            duplicatedCount: totalCreated,
            totalArtboards: doc.artboards.length
        });
    },

    // 9. NEW: Keyring & Quantity Counter (from Keyring Couter V.2.jsx)
    executeKeyringCounter: function (maxLimit) {
        if (app.documents.length === 0) return JSON.stringify({ success: false, message: "No active document." });
        var doc = app.activeDocument;
        var sel = doc.selection;

        if (!sel || sel.length === 0) {
            return JSON.stringify({ success: false, message: "Please select the text frames with numbers on canvas." });
        }

        var limit = parseFloat(maxLimit) || 500;
        var totalSum = 0;
        var count = 0;
        var ignoredCount = 0;
        var frequency = {};

        // Helper to normalize Bengali, Arabic, and Persian digits to standard ASCII digits 0-9
        function normalizeDigits(str) {
            if (!str) return "";
            var bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
            var arDigits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
            var faDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
            var res = String(str);
            for (var d = 0; d < 10; d++) {
                res = res.split(bnDigits[d]).join(String(d));
                res = res.split(arDigits[d]).join(String(d));
                res = res.split(faDigits[d]).join(String(d));
            }
            return res;
        }

        // Helper to recursively collect all TextFrames from selection (including inside GroupItems)
        var textFrames = [];
        function extractTextFrames(items) {
            if (!items) return;
            for (var j = 0; j < items.length; j++) {
                var itm = items[j];
                if (itm.typename === "TextFrame") {
                    textFrames.push(itm);
                } else if (itm.typename === "GroupItem") {
                    extractTextFrames(itm.pageItems);
                }
            }
        }
        extractTextFrames(sel);

        if (textFrames.length === 0) {
            return JSON.stringify({
                success: false,
                message: "No text frames found in selection."
            });
        }

        for (var i = 0; i < textFrames.length; i++) {
            var item = textFrames[i];
            var rawText = "";
            try { rawText = String(item.contents); } catch(e) { rawText = ""; }
            if (!rawText) continue;

            var normalized = normalizeDigits(rawText);
            // Match all numeric values (integer or decimal)
            var numbers = normalized.match(/\d+(?:\.\d+)?/g);
            if (!numbers || numbers.length === 0) continue;

            for (var n = 0; n < numbers.length; n++) {
                var val = parseFloat(numbers[n]);
                if (!isNaN(val)) {
                    if (val > 0 && val <= limit) {
                        totalSum += val;
                        count++;
                        var key = String(val);
                        if (frequency[key] === undefined) frequency[key] = 0;
                        frequency[key]++;
                    } else {
                        ignoredCount++;
                    }
                }
            }
        }

        if (count === 0) {
            return JSON.stringify({
                success: false,
                message: "No numbers (1 to " + limit + ") were found in selection." + (ignoredCount > 0 ? " (Ignored " + ignoredCount + " numbers > " + limit + ")" : "")
            });
        }

        var sortedKeys = [];
        for (var key in frequency) {
            if (frequency.hasOwnProperty(key)) sortedKeys.push(parseFloat(key));
        }
        sortedKeys.sort(function(a, b) { return a - b; });

        var breakdownList = [];
        for (var k = 0; k < sortedKeys.length; k++) {
            var num = sortedKeys[k];
            breakdownList.push({
                amount: num,
                pcs: frequency[num]
            });
        }

        return JSON.stringify({
            success: true,
            totalItems: count,
            totalSum: totalSum,
            ignoredCount: ignoredCount,
            breakdown: breakdownList
        });
    },

    // Internal Helpers
    _getNameFromItem: function(item) {
        if (item.typename === "PlacedItem") {
            try { return item.file.name; } catch(e) { return item.name; }
        } else {
            return item.name;
        }
    },

    _extractSmartNumber: function(str) {
        if (!str) return 999999;
        var specificMatch = str.match(/Artboard\s*[-_]?\s*(\d+)/i);
        if (specificMatch) {
            return parseInt(specificMatch[1], 10);
        }
        var allNumbers = str.match(/(\d+)/g);
        if (allNumbers && allNumbers.length > 0) {
            return parseInt(allNumbers[0], 10);
        }
        return 999999;
    },

    _getStrictArtworkBounds: function (art, sampleW, sampleH) {
        if (!art) return null;
        var b = null;
        try {
            if (art.typename === "GroupItem") {
                // 1. Direct clipping mask
                if (art.clipped) {
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

                // 2. If not clipped or clipping mask not found, search from bottom to top
                if (!b && art.pageItems.length > 0) {
                    // 2a. If sample dimensions provided, find matching child item
                    if (sampleW && sampleH && sampleW > 0 && sampleH > 0) {
                        var tolW = Math.max(sampleW * 0.15, 8);
                        var tolH = Math.max(sampleH * 0.15, 8);
                        for (var i = art.pageItems.length - 1; i >= 0; i--) {
                            var item = art.pageItems[i];
                            var iw = Math.abs(item.width);
                            var ih = Math.abs(item.height);
                            if (Math.abs(iw - sampleW) <= tolW && Math.abs(ih - sampleH) <= tolH) {
                                if (item.typename === "GroupItem" && item.clipped) {
                                    b = this._getStrictArtworkBounds(item, sampleW, sampleH);
                                } else {
                                    b = item.geometricBounds;
                                }
                                if (b) break;
                            }
                        }
                    }

                    // 2b. Check bottom items for base background PathItem / RasterItem
                    if (!b) {
                        for (var j = art.pageItems.length - 1; j >= 0; j--) {
                            var child = art.pageItems[j];
                            if (child.typename === "PathItem" || child.typename === "RasterItem") {
                                var cw = Math.abs(child.width) * 0.352778;
                                var ch = Math.abs(child.height) * 0.352778;
                                if (cw > 30 && ch > 20) {
                                    b = child.geometricBounds;
                                    break;
                                }
                            }
                        }
                    }

                    // 2c. Check if any child has clipping === true
                    if (!b) {
                        for (var c = 0; c < art.pageItems.length; c++) {
                            if (art.pageItems[c].clipping) {
                                b = art.pageItems[c].geometricBounds;
                                break;
                            }
                        }
                    }
                }
            } else if (art.clipping) {
                b = art.geometricBounds;
            }
        } catch (eClip) {}

        if (!b) {
            try { b = art.geometricBounds; } catch (eGB) {}
        }
        if (!b) {
            try { b = art.visibleBounds; } catch (eVB) {}
        }

        if (b && b.length === 4) {
            var l = Math.min(b[0], b[2]);
            var r = Math.max(b[0], b[2]);
            var t = Math.max(b[1], b[3]);
            var bot = Math.min(b[1], b[3]);
            if ((r - l) > 0.1 && (t - bot) > 0.1) {
                return [l, t, r, bot];
            }
        }
        return null;
    },

    _getEffectiveDimensions: function (item, sampleW, sampleH) {
        if (!item) return { width: 0, height: 0 };
        var b = this._getStrictArtworkBounds(item, sampleW, sampleH);
        if (b && b.length === 4) {
            return {
                width: Math.abs(b[2] - b[0]),
                height: Math.abs(b[1] - b[3])
            };
        }
        try {
            return {
                width: Math.abs(item.width),
                height: Math.abs(item.height)
            };
        } catch (e) {
            return { width: 0, height: 0 };
        }
    },

    _unlockArt: function (art) {
        if (!art) return;
        try { art.locked = false; } catch (e) {}
        try { art.hidden = false; } catch (e) {}
        if (art.typename === "GroupItem") {
            try {
                for (var u = 0; u < art.pageItems.length; u++) {
                    this._unlockArt(art.pageItems[u]);
                }
            } catch (eG) {}
        }
    },

    _findMatchingDesigns: function (doc, sampleW, sampleH) {
        var results = [];
        if (!sampleW || !sampleH || sampleW <= 0 || sampleH <= 0) return results;

        var tolW = Math.max(sampleW * 0.15, 10);
        var tolH = Math.max(sampleH * 0.15, 10);
        var self = this;

        function isSizeMatch(item) {
            try {
                if (item.locked || item.hidden || item.guides) return false;
                var dim = self._getEffectiveDimensions(item, sampleW, sampleH);
                var w = dim.width;
                var h = dim.height;
                if (w <= 0 || h <= 0) return false;
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
                if (isSizeMatch(pItem)) results.push(pItem);
            }
        }

        if (results.length === 0) {
            for (var g = 0; g < doc.groupItems.length; g++) {
                var grp = doc.groupItems[g];
                if (isSizeMatch(grp)) results.push(grp);
            }
        }
        return results;
    },

    _extractTextFrames: function (items) {
        var frames = [];
        if (!items) return frames;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.typename === "TextFrame") {
                frames.push(item);
            } else if (item.typename === "GroupItem") {
                for (var j = 0; j < item.pageItems.length; j++) {
                    if (item.pageItems[j].typename === "TextFrame") {
                        frames.push(item.pageItems[j]);
                    }
                }
            }
        }
        return frames;
    },

    _getFrameFont: function (tf) {
        try {
            return tf.textRange.characterAttributes.textFont;
        } catch (e) {
            return null;
        }
    },

    _applyFont: function (tf, font) {
        if (!font) return;
        try {
            tf.textRange.characterAttributes.textFont = font;
        } catch (e) {}
    },

    _getFamilyFontVariants: function (baseFont) {
        var variants = { allList: [], boldList: [], regularList: [] };
        if (!baseFont) return variants;

        var familyName = baseFont.family;
        var total = app.textFonts.length;

        for (var i = 0; i < total; i++) {
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
    },

    _assignFontWeights: function (frames, fontVars, params) {
        var min = params.minSize || 14;
        var max = params.maxSize || 58;
        var threshold = min + (max - min) * 0.45;

        for (var i = 0; i < frames.length; i++) {
            var tf = frames[i];
            var sz = tf.textRange.characterAttributes.size || min;
            var chosen = null;

            if (sz >= threshold) {
                chosen = (Math.random() < 0.8) ? this._getRandom(fontVars.boldList) : this._getRandom(fontVars.regularList);
            } else {
                chosen = (Math.random() < 0.7) ? this._getRandom(fontVars.regularList) : this._getRandom(fontVars.boldList);
            }

            if (chosen) {
                try {
                    tf.textRange.characterAttributes.textFont = chosen;
                } catch (e) {}
            }
        }
    },

    _getRandom: function (arr) {
        if (!arr || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    },

    _cleanText: function (str, caseOption) {
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
    },

    _assignSizes: function (frames, params) {
        var min = params.minSize || 14;
        var max = params.maxSize || 58;
        var total = frames.length;

        for (var s = total - 1; s > 0; s--) {
            var j = Math.floor(Math.random() * (s + 1));
            var temp = frames[s];
            frames[s] = frames[j];
            frames[j] = temp;
        }

        for (var i = 0; i < total; i++) {
            var size = min;
            var rank = i / total;
            if (params.sizeDist === 0) { // Hero
                if (rank < 0.1) size = max * (0.85 + Math.random() * 0.15);
                else if (rank < 0.3) size = min + (max - min) * (0.5 + Math.random() * 0.3);
                else if (rank < 0.6) size = min + (max - min) * (0.25 + Math.random() * 0.25);
                else size = min + (max - min) * (Math.random() * 0.2);
            } else if (params.sizeDist === 2) { // 3-Tier
                if (rank < 0.12) size = max;
                else if (rank < 0.45) size = min + (max - min) * 0.5;
                else size = min;
            } else {
                size = min + Math.random() * (max - min);
            }

            size = Math.round(size * 10) / 10;
            try {
                frames[i].textRange.characterAttributes.size = size;
            } catch (e) {}
        }
    },

    _applyRotation: function (frames, params) {
        var prob = (typeof params.verticalProb !== "undefined") ? params.verticalProb : 0.3;
        for (var i = 0; i < frames.length; i++) {
            var tf = frames[i];
            var angle = 0;
            var isVert = Math.random() < prob;

            if (params.rotationMode === 0) {
                angle = isVert ? (Math.random() < 0.5 ? 90 : -90) : 0;
            } else if (params.rotationMode === 1) {
                angle = isVert ? 90 : 0;
            } else if (params.rotationMode === 2) {
                angle = 0;
            } else if (params.rotationMode === 3) {
                var arr = [0, 90, -90, 45, -45];
                angle = arr[Math.floor(Math.random() * arr.length)];
            } else {
                angle = Math.floor(Math.random() * 360);
            }

            if (angle !== 0) {
                try {
                    tf.rotate(angle, true, true, true, true, Transformation.CENTER);
                } catch (e) {}
            }
        }
    },

    _applyPalette: function (doc, frames, paletteIdx) {
        var isCMYK = (doc.documentColorSpace === DocumentColorSpace.CMYK);

        for (var i = 0; i < frames.length; i++) {
            try {
                if (paletteIdx === 0) { // Monochrome Black/Gray
                    var blackPct = 40 + Math.floor(Math.random() * 61);
                    if (isCMYK) {
                        var c = new CMYKColor(); c.cyan = 0; c.magenta = 0; c.yellow = 0; c.black = blackPct;
                        frames[i].textRange.characterAttributes.fillColor = c;
                    } else {
                        var rgbVal = Math.round(255 * (1 - (blackPct / 100)));
                        var r = new RGBColor(); r.red = rgbVal; r.green = rgbVal; r.blue = rgbVal;
                        frames[i].textRange.characterAttributes.fillColor = r;
                    }
                } else if (paletteIdx === 1) { // Cyberpunk Neon
                    var colors = [
                        [0, 242, 254],   // Cyan
                        [255, 0, 128],   // Neon Pink
                        [255, 230, 0],   // Neon Yellow
                        [168, 85, 247],  // Neon Purple
                        [0, 255, 136]    // Neon Green
                    ];
                    var clr = colors[Math.floor(Math.random() * colors.length)];
                    var rgb2 = new RGBColor(); rgb2.red = clr[0]; rgb2.green = clr[1]; rgb2.blue = clr[2];
                    frames[i].textRange.characterAttributes.fillColor = rgb2;
                } else if (paletteIdx === 2) { // Vintage Warm
                    var warmColors = [
                        [184, 51, 42],   // Terracotta
                        [212, 143, 56],  // Mustard
                        [43, 76, 89],    // Deep Teal
                        [139, 94, 60],   // Rust Brown
                        [56, 78, 59]     // Forest Green
                    ];
                    var clr2 = warmColors[Math.floor(Math.random() * warmColors.length)];
                    var rgb3 = new RGBColor(); rgb3.red = clr2[0]; rgb3.green = clr2[1]; rgb3.blue = clr2[2];
                    frames[i].textRange.characterAttributes.fillColor = rgb3;
                }
            } catch (e) {}
        }
    },

    _arrangeWordCloud: function (frames, startCenterX, startCenterY, params) {
        frames.sort(function (a, b) {
            var sizeA = a.textRange.characterAttributes.size || 12;
            var sizeB = b.textRange.characterAttributes.size || 12;
            return sizeB - sizeA;
        });

        var placedRects = [];
        var padding = (typeof params.padding !== "undefined") ? params.padding : 3;
        var aspect = params.aspectRatio || 0.7;

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
            var spiralStep = 1.3;
            var maxSteps = 3000;

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
                    var r2 = placedRects[p];
                    if (!(candidate.left > r2.right || candidate.right < r2.left || candidate.bottom > r2.top || candidate.top < r2.bottom)) {
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
    },

    
    

    
    

    
    _findFontByName: function (fontName) {
        if (!fontName || fontName === "keep" || fontName === "none") return null;

        var clean = fontName.toLowerCase().replace(/[^a-z0-9]/g, "");
        var candidates = [];

        if (clean === "bornomalabold" || clean.indexOf("bornomalabold") !== -1 || fontName === "Bornomala-Bold") {
            candidates = ["Bornomala-Bold", "BornomalaBold"];
        } else if (clean === "bornomala" || clean === "bornomalar" || clean === "bornomalaregular" || fontName === "Bornomala-Regular") {
            candidates = ["Bornomala-Regular", "BornomalaRegular", "Bornomala"];
        } else if (clean.indexOf("siyam") !== -1) {
            candidates = ["SiyamRupali", "Siyam Rupali", "SiyamRupali-Regular"];
        } else if (clean.indexOf("kalpurush") !== -1) {
            candidates = ["Kalpurush", "Kalpurush-Regular"];
        } else if (clean.indexOf("solaiman") !== -1) {
            candidates = ["SolaimanLipi", "SolaimanLipi-Regular", "Solaiman Lipi"];
        } else {
            candidates = [fontName, fontName + "-Regular", fontName + "-Bold"];
        }

        try {
            var total = app.textFonts.length;
            
            // 1. Exact candidate match
            for (var k = 0; k < candidates.length; k++) {
                var cClean = candidates[k].toLowerCase().replace(/[^a-z0-9]/g, "");
                for (var j = 0; j < total; j++) {
                    try {
                        var fObj = app.textFonts[j];
                        var fName = fObj.name;
                        var fClean = fName.toLowerCase().replace(/[^a-z0-9]/g, "");
                        
                        // If searching for Unicode Bornomala, do NOT match ANSI
                        if (clean.indexOf("ansi") === -1 && fClean.indexOf("ansi") !== -1) {
                            continue;
                        }
                        
                        if (fName === candidates[k] || fClean === cClean) {
                            return fObj;
                        }
                    } catch (e1) {}
                }
            }

            // 2. Substring match (with ANSI protection)
            for (var j2 = 0; j2 < total; j2++) {
                try {
                    var fObj2 = app.textFonts[j2];
                    var fClean2 = fObj2.name.toLowerCase().replace(/[^a-z0-9]/g, "");
                    if (clean.indexOf("ansi") === -1 && fClean2.indexOf("ansi") !== -1) {
                        continue;
                    }
                    if (fClean2.indexOf(clean) !== -1 || clean.indexOf(fClean2) !== -1) {
                        return fObj2;
                    }
                } catch (e2) {}
            }
        } catch (eLoop) {}

        return null;
    },

        convertBijoyToUnicode: function (configJSON) {
        try {
            if (app.documents.length === 0) {
                return JSON.stringify({ success: false, error: "No active document open in Illustrator." });
            }

            var doc = app.activeDocument;
            var cfg = {};
            try {
                if (typeof configJSON === "string") {
                    cfg = eval("(" + configJSON + ")");
                    if (typeof cfg === "string") {
                        cfg = eval("(" + cfg + ")");
                    }
                } else {
                    cfg = configJSON || {};
                }
            } catch (eCfg) {
                cfg = {};
            }

            var scope = cfg.scope || "selected";
            var version = cfg.engineVersion || "auto";
            var targetFontName = cfg.targetFont || "Bornomala-Regular";

            if (cfg.unlockLayers) {
                try {
                    for (var l = 0; l < doc.layers.length; l++) {
                        doc.layers[l].locked = false;
                        doc.layers[l].visible = true;
                    }
                } catch (eLay) {}
            }

            var frames = _collectFrames(scope, doc);

            if (frames.length === 0) {
                if (scope === "selected") {
                    return JSON.stringify({ success: false, error: "No text frames found in your selection! Please select text frames to convert." });
                } else {
                    return JSON.stringify({ success: false, error: "No text frames found in the document." });
                }
            }

            var targetFont = null;
            if (targetFontName && targetFontName !== "keep" && targetFontName !== "none") {
                targetFont = _findFontByName(targetFontName);
            }

            var convertedCount = 0;
            for (var i = 0; i < frames.length; i++) {
                var item = frames[i];
                if (item.typename === "TextFrame") {
                    var originalText = item.contents;
                    if (originalText && originalText.length > 0) {
                        var unicodeText = "";
                        if (version === "v1") {
                            unicodeText = Bijoy2UnicodeEngine.convertV1(originalText);
                        } else if (version === "v2") {
                            unicodeText = Bijoy2UnicodeEngine.convertV2(originalText);
                        } else if (version === "v3") {
                            unicodeText = Bijoy2UnicodeEngine.convertV3(originalText);
                        } else {
                            unicodeText = Bijoy2UnicodeEngine.convert(originalText);
                        }

                        item.contents = unicodeText;
                        if (targetFont) {
                            try { item.textRange.characterAttributes.textFont = targetFont; } catch (eF1) {}
                            try { item.story.textRange.characterAttributes.textFont = targetFont; } catch (eF2) {}
                            try {
                                for (var p = 0; p < item.paragraphs.length; p++) {
                                    item.paragraphs[p].characterAttributes.textFont = targetFont;
                                }
                            } catch (eF3) {}
                        }
                        convertedCount++;
                    }
                }
            }

            var appliedName = targetFont ? (targetFont.name || targetFontName) : (targetFontName === "keep" ? "Current Font" : targetFontName);
            return JSON.stringify({
                success: true,
                count: convertedCount,
                total: frames.length,
                fontApplied: appliedName
            });
        } catch (err) {
            return JSON.stringify({ success: false, error: err.toString() });
        }
    },

        executePageNumbers: function (jsonStr) {
        try {
            if (app.documents.length === 0) {
                return JSON.stringify({ success: false, error: "No active document found." });
            }
            var doc = app.activeDocument;
            var config = (typeof jsonStr === "string") ? eval("(" + jsonStr + ")") : jsonStr;

            var mode = config.mode || "insert"; // "insert" or "replace"
            var startNum = parseInt(config.startNum, 10);
            if (isNaN(startNum)) startNum = 1;

            var templateStr = config.template || "*00p*";
            var count = doc.artboards.length;

            function padDigits(num, size) {
                var s = num + "";
                while (s.length < size) s = "0" + s;
                return s;
            }

            function getDateStr() {
                var d = new Date();
                return (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
            }

            function getTimeStr() {
                var d = new Date();
                var h = d.getHours();
                var m = d.getMinutes();
                if (m < 10) m = "0" + m;
                var ampm = h >= 12 ? "PM" : "AM";
                h = h % 12;
                h = h ? h : 12;
                return h + ":" + m + " " + ampm;
            }

            function formatPageString(tmpl, abIdx, start, total) {
                var cur = abIdx + start;
                var res = tmpl;
                res = res.replace(/\*000p\*/g, padDigits(cur, 4));
                res = res.replace(/\*00p\*/g, padDigits(cur, 3));
                res = res.replace(/\*0p\*/g, padDigits(cur, 2));
                res = res.replace(/\*page\*/g, cur);

                res = res.replace(/\*000pages\*/g, padDigits(total, 4));
                res = res.replace(/\*00pages\*/g, padDigits(total, 3));
                res = res.replace(/\*0pages\*/g, padDigits(total, 2));
                res = res.replace(/\*pages\*/g, total);

                res = res.replace(/\*date\*/g, getDateStr());
                res = res.replace(/\*time\*/g, getTimeStr());
                res = res.replace(/\*fname\*/g, doc.path === "" ? "Full Name: <unsaved document>" : doc.fullName);
                res = res.replace(/\*file\*/g, doc.name);
                return res;
            }

            function isInsideArtboard(tf, bounds) {
                var l = tf.left, t = tf.top;
                return (l >= bounds[0] - 10 && l <= bounds[2] + 10 && t <= bounds[1] + 10 && t >= bounds[3] - 10);
            }

            if (mode === "replace") {
                var findTarget = config.findText || "000";
                var updatedCount = 0;
                for (var i = 0; i < count; i++) {
                    var ab = doc.artboards[i];
                    var rect = ab.artboardRect;
                    var formatted = formatPageString(templateStr, i, startNum, count);

                    for (var j = 0; j < doc.textFrames.length; j++) {
                        var tf = doc.textFrames[j];
                        if (isInsideArtboard(tf, rect)) {
                            if (tf.contents === findTarget || tf.contents.indexOf(findTarget) !== -1) {
                                tf.contents = tf.contents.replace(findTarget, formatted);
                                updatedCount++;
                                break;
                            }
                        }
                    }
                }
                app.redraw();
                return JSON.stringify({ success: true, count: updatedCount, total: count, mode: "replace" });
            } else {
                var pLayer;
                try {
                    pLayer = doc.layers["Page Numbers"];
                } catch (e) {
                    pLayer = doc.layers.add();
                    pLayer.name = "Page Numbers";
                }

                var marginPt = (parseFloat(config.margin) || 0.25) * 72;
                var vPos = config.vPos || "bottom";
                var hPos = config.hPos || "right";

                for (var i = 0; i < count; i++) {
                    var formatted = formatPageString(templateStr, i, startNum, count);
                    var itext = pLayer.textFrames.add();
                    itext.contents = formatted;
                    var fontSize = itext.textRange.characterAttributes.size;

                    var ab = doc.artboards[i];
                    var r = ab.artboardRect;

                    var abLeft = r[0] + marginPt;
                    var abTop = r[1] - marginPt;
                    var abRight = r[2] - marginPt;
                    var abBottom = r[3] + marginPt + fontSize;
                    var abCenter = abLeft + (abRight - abLeft) / 2;

                    if (hPos === "right") {
                        itext.left = abRight;
                        itext.textRange.paragraphAttributes.justification = Justification.RIGHT;
                    } else if (hPos === "center") {
                        itext.left = abCenter;
                        itext.textRange.paragraphAttributes.justification = Justification.CENTER;
                    } else {
                        itext.left = abLeft;
                        itext.textRange.paragraphAttributes.justification = Justification.LEFT;
                    }

                    if (vPos === "top") {
                        itext.top = abTop;
                    } else {
                        itext.top = abBottom;
                    }
                }
                app.redraw();
                return JSON.stringify({ success: true, count: count, total: count, mode: "insert" });
            }
        } catch (err) {
            return JSON.stringify({ success: false, error: err.toString() });
        }
    },

    _calculateBounds: function (items) {
        var minX = Infinity, maxY = -Infinity, maxX = -Infinity, minY = Infinity;
        for (var i = 0; i < items.length; i++) {
            var b = items[i].geometricBounds;
            if (b[0] < minX) minX = b[0];
            if (b[1] > maxY) maxY = b[1];
            if (b[2] > maxX) maxX = b[2];
            if (b[3] < minY) minY = b[3];
        }
        return [minX, maxY, maxX, minY];
    },

    // ========================================================
    // TAB 10: NUMBERING PRO (CARD NUMBERING PRO ENGINE)
    // Specially designed for auto-numbering cards & badges:
    // 1. Automatically finds card number badges / text frames across artboards or selection.
    // 2. Fixes duplicate numbers (e.g. copied template with '1' on all cards).
    // 3. Fixes broken / jumped sequences (e.g. 1-8 correct, then jumps to 12-16).
    // 4. Arranges 100+ cards into perfect sequential order in 1 click!
    // 5. Orders cards across artboards in natural grid reading order:
    //      Row-by-Row: 1 - 2, 3 - 4, 5 - 6 ...
    //      Column-by-Column: 1 - 5, 2 - 6 ...
    // 6. Supports Unicode Bengali (১, ২, ৩... ১০০), ANSI SutonnyMJ, and English.
    // 7. Strictly preserves font, size, leading, tracking, color, and center alignment.
    // ========================================================
    _isItemSafeAndVisible: function (item) {
        if (!item) return false;
        try {
            if (item.hidden || item.locked) return false;
            var p = item.parent;
            while (p && p.typename !== "Document") {
                if (p.hidden || p.locked) return false;
                p = p.parent;
            }
            return true;
        } catch (e) {
            return false;
        }
    },

    _testCardSerialTF: function (tf, cardBounds, customPlaceholder) {
        if (!tf || tf.typename !== "TextFrame") return { valid: false, score: 0 };
        var txt = "";
        try {
            txt = tf.contents ? tf.contents.replace(/^\s+|\s+$/g, "") : "";
        } catch (e) {
            return { valid: false, score: 0 };
        }
        if (!txt || txt.length === 0) return { valid: false, score: 0 };

        // Exclude multi-line texts
        if (txt.indexOf("\r") !== -1 || txt.indexOf("\n") !== -1) return { valid: false, score: 0 };
        try {
            if (tf.lines && tf.lines.length > 1) return { valid: false, score: 0 };
        } catch (le) {}

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

        // Custom placeholder match (if specified and not empty / "auto")
        if (customPlaceholder && customPlaceholder.length > 0 && customPlaceholder.toLowerCase() !== "auto") {
            if (txt === customPlaceholder) score += 60;
            if ((customPlaceholder === "00" || customPlaceholder === "\u09E6\u09E6") && (txt === "00" || txt === "\u09E6\u09E6")) score += 60;
        }

        // Pure digits get very high priority
        var isAllDigits = /^[0-9]+$/.test(txt) || /^[০-৯]+$/.test(txt);
        if (isAllDigits) score += 40;

        // Known serial number tokens or placeholders
        if (/^(?:00|0|000|০০|০|০০০|#|sl|নং|১|1)$/i.test(txt)) score += 30;

        // Spatial position relative to card boundaries
        if (cardBounds) {
            try {
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
            } catch (spErr) {}
        }

        // Check text frame dimensions (serial badges are small)
        try {
            var tgb = tf.geometricBounds;
            var tw = Math.abs(tgb[2] - tgb[0]);
            var th = Math.abs(tgb[1] - tgb[3]);
            if (tw < 75 && th < 55) score += 20;
        } catch (dimErr) {}

        return { valid: (score >= 40), score: score };
    },

    _collectAllSubTextFrames: function (container, outArr) {
        if (!container || !this._isItemSafeAndVisible(container)) return;
        if (container.typename === "TextFrame") {
            outArr.push(container);
            return;
        }
        if (container.typename === "GroupItem" || container.pageItems) {
            for (var i = 0; i < container.pageItems.length; i++) {
                this._collectAllSubTextFrames(container.pageItems[i], outArr);
            }
        }
    },

    _detectCardSerialsInternal: function (config) {
        if (app.documents.length === 0) return { error: "❌ কোনো ইলাস্ট্রেটর ডকুমেন্ট খোলা নেই!\nঅনুগ্রহ করে প্রথমে আপনার কার্ডের ফাইলটি ওপেন করুন।" };
        var doc = app.activeDocument;
        var numABs = doc.artboards.length;
        var activeABIdx = doc.artboards.getActiveArtboardIndex();

        var scope = config.scope || "all_artboards";
        var order = config.order || "row";
        var placeholder = config.placeholder || "";
        var startNum = parseInt(config.startNum, 10);
        if (isNaN(startNum)) startNum = 1;
        var padDigits = parseInt(config.padding, 10);
        if (isNaN(padDigits)) padDigits = 1;
        var digitLang = config.digitLang || "bn";
        var prefix = config.prefix || "";
        var suffix = config.suffix || "";

        var targetAB = (scope === "artboard" || scope === "active_artboard") ? activeABIdx : null;

        function getArtboardIndexForBounds(gb) {
            if (!gb || numABs === 0) return 0;
            var midX = (gb[0] + gb[2]) / 2;
            var midY = (gb[1] + gb[3]) / 2;
            var closestAB = 0;
            var minDist = 999999999;

            for (var a = 0; a < numABs; a++) {
                var r = doc.artboards[a].artboardRect;
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

        var detected = [];
        var attachedTF = {};

        // Scope 1: Selection
        if (scope === "selection") {
            var sel = doc.selection;
            if (!sel || sel.length === 0) {
                return { error: "❌ কোনো কার্ড বা অবজেক্ট সিলেক্ট করা নেই!\nঅনুগ্রহ করে কার্ড সিলেক্ট করুন অথবা 'All Artboards' অপশনটি বেছে নিন।" };
            }

            for (var s = 0; s < sel.length; s++) {
                var sItem = sel[s];
                if (!this._isItemSafeAndVisible(sItem)) continue;

                if (sItem.typename === "GroupItem") {
                    var sgb = sItem.geometricBounds;
                    var sTfs = [];
                    this._collectAllSubTextFrames(sItem, sTfs);
                    var bestTF = null;
                    var bestScore = -1;

                    for (var t = 0; t < sTfs.length; t++) {
                        var tf = sTfs[t];
                        var testRes = this._testCardSerialTF(tf, sgb, placeholder);
                        if (testRes.valid && testRes.score > bestScore) {
                            bestScore = testRes.score;
                            bestTF = tf;
                        }
                    }

                    if (bestTF) {
                        detected.push({
                            card: sItem,
                            textFrame: bestTF,
                            bounds: sgb,
                            centerX: (sgb[0] + sgb[2]) / 2,
                            centerY: (sgb[1] + sgb[3]) / 2,
                            width: Math.abs(sgb[2] - sgb[0]),
                            height: Math.abs(sgb[1] - sgb[3]),
                            artboardIndex: getArtboardIndexForBounds(sgb)
                        });
                        attachedTF[bestTF] = true;
                    }
                } else if (sItem.typename === "TextFrame") {
                    var tgb = sItem.geometricBounds;
                    var tRes = this._testCardSerialTF(sItem, null, placeholder);
                    if (tRes.valid) {
                        detected.push({
                            card: sItem,
                            textFrame: sItem,
                            bounds: tgb,
                            centerX: (tgb[0] + tgb[2]) / 2,
                            centerY: (tgb[1] + tgb[3]) / 2,
                            width: Math.abs(tgb[2] - tgb[0]),
                            height: Math.abs(tgb[1] - tgb[3]),
                            artboardIndex: getArtboardIndexForBounds(tgb)
                        });
                        attachedTF[sItem] = true;
                    }
                }
            }
        } else {
            // Scope 2: All Artboards or Active Artboard
            // Phase 1: Scan for Card Groups
            for (var l = 0; l < doc.layers.length; l++) {
                var lyr = doc.layers[l];
                if (!lyr.visible || lyr.locked) continue;

                for (var p = 0; p < lyr.pageItems.length; p++) {
                    var pItem = lyr.pageItems[p];
                    if (!this._isItemSafeAndVisible(pItem)) continue;

                    if (pItem.typename === "GroupItem") {
                        var cgb = pItem.geometricBounds;
                        var cW = Math.abs(cgb[2] - cgb[0]);
                        var cH = Math.abs(cgb[1] - cgb[3]);

                        // Exclude gigantic artboard-sized wrapper groups or tiny icon groups
                        if (cW > 600 && cH > 600) continue;
                        if (cW < 60 || cH < 30) continue;

                        var itemAB = getArtboardIndexForBounds(cgb);
                        if (targetAB !== null && itemAB !== targetAB) continue;

                        var gTfs = [];
                        this._collectAllSubTextFrames(pItem, gTfs);
                        var gBestTF = null;
                        var gBestScore = -1;

                        for (var gt = 0; gt < gTfs.length; gt++) {
                            var gtf = gTfs[gt];
                            var gRes = this._testCardSerialTF(gtf, cgb, placeholder);
                            if (gRes.valid && gRes.score > gBestScore) {
                                gBestScore = gRes.score;
                                gBestTF = gtf;
                            }
                        }

                        if (gBestTF) {
                            detected.push({
                                card: pItem,
                                textFrame: gBestTF,
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
                if (!this._isItemSafeAndVisible(dtf) || attachedTF[dtf]) continue;

                var dgb = dtf.geometricBounds;
                var dw = Math.abs(dgb[2] - dgb[0]);
                var dh = Math.abs(dgb[1] - dgb[3]);
                if (dw > 85 || dh > 55) continue;

                var dAB = getArtboardIndexForBounds(dgb);
                if (targetAB !== null && dAB !== targetAB) continue;

                var dRes = this._testCardSerialTF(dtf, null, placeholder);
                if (dRes.valid && dRes.score >= 50) {
                    detected.push({
                        card: dtf,
                        textFrame: dtf,
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
            return {
                error: "❌ কোনো কার্ডের সিরিয়াল নম্বর শনাক্ত করা যায়নি!\n\nপরামর্শ:\n1. কার্ডগুলো সিলেক্ট করে 'Selected Cards' দিয়ে চেষ্টা করুন।\n2. অথবা নিশ্চিত করুন কার্ডের নিচের নম্বরের টেক্সট ফ্রেমটি লক বা হাইড করা নেই।"
            };
        }

        // Group by Artboard
        var byAB = {};
        var abKeys = [];
        for (var i = 0; i < detected.length; i++) {
            var ab = detected[i].artboardIndex;
            if (!byAB[ab]) {
                byAB[ab] = [];
                abKeys.push(ab);
            }
            byAB[ab].push(detected[i]);
        }
        abKeys.sort(function(a, b) { return a - b; });

        var sortedResult = [];

        for (var k = 0; k < abKeys.length; k++) {
            var abItems = byAB[abKeys[k]];

            if (order === "column") {
                // Column-by-Column: Col 1 (top to bottom), Col 2 (top to bottom)...
                abItems.sort(function(a, b) { return a.centerX - b.centerX; });
                var cols = [];
                for (var ci = 0; ci < abItems.length; ci++) {
                    var itm = abItems[ci];
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
                for (var ri = 0; ri < abItems.length; ri++) {
                    var rItem = abItems[ri];
                    var rPlaced = false;
                    for (var r = 0; r < rows.length; r++) {
                        var row = rows[r];
                        var rThresh = Math.max(25, row.avgH * 0.45);
                        if (Math.abs(rItem.centerY - row.avgY) <= rThresh) {
                            row.items.push(rItem);
                            var sumY = 0, sumH = 0;
                            for (var rm = 0; rm < row.items.length; rm++) {
                                sumY += row.items[rm].centerY;
                                sumH += row.items[rm].height;
                            }
                            row.avgY = sumY / row.items.length;
                            row.avgH = sumH / row.items.length;
                            rPlaced = true;
                            break;
                        }
                    }
                    if (!rPlaced) {
                        rows.push({ avgY: rItem.centerY, avgH: rItem.height, items: [rItem] });
                    }
                }
                rows.sort(function(a, b) { return b.avgY - a.avgY; });
                for (var r = 0; r < rows.length; r++) {
                    rows[r].items.sort(function(a, b) { return a.centerX - b.centerX; });
                    for (var rc = 0; rc < rows[r].items.length; rc++) {
                        sortedResult.push(rows[r].items[rc]);
                    }
                }
            }
        }

        var bnDigits = ['\u09E6', '\u09E7', '\u09E8', '\u09E9', '\u09EA', '\u09EB', '\u09EC', '\u09ED', '\u09EE', '\u09EF'];

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
            } else if (styleMode === "en" || styleMode === "eng") {
                useBengali = false;
            } else {
                var cur = tf ? (tf.contents || "") : "";
                if (/[\u09E6-\u09EF]/.test(cur) || /bornomala|kalpurush|solaiman|siyam|bangla/i.test(fontName)) {
                    useBengali = true;
                }
            }

            // SutonnyMJ Safety: ASCII digits produce Bengali glyphs in SutonnyMJ
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

        return {
            items: sortedResult,
            startNum: startNum,
            padDigits: padDigits,
            digitLang: digitLang,
            prefix: prefix,
            suffix: suffix,
            formatNumber: formatCardNumber,
            artboardsCount: abKeys.length
        };
    },

    scanCardSerials: function (configJson) {
        try {
            var cfg = (typeof configJson === "string") ? eval("(" + configJson + ")") : (configJson || {});
            var data = this._detectCardSerialsInternal(cfg);
            if (data.error) {
                return JSON.stringify({ success: false, error: data.error });
            }

            var items = data.items;
            var previewList = [];
            var maxPreview = Math.min(items.length, 12);

            for (var i = 0; i < maxPreview; i++) {
                var unit = items[i];
                var curVal = unit.textFrame ? unit.textFrame.contents.replace(/^\s+|\s+$/g, "") : "";
                var targetVal = data.prefix + data.formatNumber(data.startNum + i, data.padDigits, data.digitLang, unit.textFrame) + data.suffix;
                previewList.push({
                    index: i + 1,
                    artboard: unit.artboardIndex + 1,
                    currentVal: curVal,
                    newVal: targetVal
                });
            }

            var endNumVal = data.startNum + items.length - 1;
            var sampleStart = data.prefix + data.formatNumber(data.startNum, data.padDigits, data.digitLang, items[0].textFrame) + data.suffix;
            var sampleEnd = data.prefix + data.formatNumber(endNumVal, data.padDigits, data.digitLang, items[items.length - 1].textFrame) + data.suffix;

            return JSON.stringify({
                success: true,
                count: items.length,
                artboardsCount: data.artboardsCount,
                range: sampleStart + " থেকে " + sampleEnd,
                preview: previewList
            });
        } catch (err) {
            return JSON.stringify({ success: false, error: err.toString() });
        }
    },

    executeCardSerial: function (configJson) {
        try {
            var cfg = (typeof configJson === "string") ? eval("(" + configJson + ")") : (configJson || {});
            var data = this._detectCardSerialsInternal(cfg);
            if (data.error) {
                return JSON.stringify({ success: false, error: data.error });
            }

            var items = data.items;
            var modifiedCount = 0;

            for (var i = 0; i < items.length; i++) {
                var unit = items[i];
                var tf = unit.textFrame;
                if (!tf) continue;

                var numVal = data.startNum + i;
                var finalStr = data.prefix + data.formatNumber(numVal, data.padDigits, data.digitLang, tf) + data.suffix;

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

                    if (tf.paragraphs && tf.paragraphs.length > 0 && tf.paragraphs[0].paragraphAttributes) {
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

                    if (origJust !== null && tf.paragraphs && tf.paragraphs.length > 0 && tf.paragraphs[0].paragraphAttributes) {
                        tf.paragraphs[0].paragraphAttributes.justification = origJust;
                    }

                    modifiedCount++;
                } catch(modErr) {}
            }

            try { app.redraw(); } catch(reErr) {}

            var endNumVal = data.startNum + items.length - 1;
            var sampleStart = data.prefix + data.formatNumber(data.startNum, data.padDigits, data.digitLang, items[0].textFrame) + data.suffix;
            var sampleEnd = data.prefix + data.formatNumber(endNumVal, data.padDigits, data.digitLang, items[items.length - 1].textFrame) + data.suffix;

            return JSON.stringify({
                success: true,
                count: modifiedCount,
                total: items.length,
                artboardsCount: data.artboardsCount,
                range: sampleStart + " থেকে " + sampleEnd
            });
        } catch (err) {
            return JSON.stringify({ success: false, error: err.toString() });
        }
    },

    launchCardNumberingProDialog: function () {
        try {
            var curFile = new File($.fileName);
            var extFolder = curFile.parent.parent;
            var scriptFile = new File(extFolder.fsName + "/Card_Numbering_Pro.jsx");
            if (!scriptFile.exists) {
                scriptFile = new File(extFolder.fsName + "/Auto_Card_Serial_Number.jsx");
            }
            if (scriptFile.exists) {
                $.evalFile(scriptFile);
                return JSON.stringify({ success: true });
            } else {
                return JSON.stringify({ success: false, error: "Card_Numbering_Pro.jsx file not found in extension directory." });
            }
        } catch (e) {
            return JSON.stringify({ success: false, error: e.toString() });
        }
    },
    // ========================================================
    // TAB 11: MASTER QR CODE IMPORTER & REPLACER ENGINE
    // ========================================================
    browseForQRFolder: function () {
        var fldr = Folder.selectDialog("আপনার QR কোডের ফোল্ডারটি সিলেক্ট করুন");
        if (fldr) {
            var fls = fldr.getFiles(function (file) {
                if (file instanceof Folder) return false;
                return /\.(png|jpe?g|svg|tif|tiff)$/i.test(file.name);
            });
            return JSON.stringify({
                success: true,
                folderPath: fldr.fsName,
                fileCount: fls.length
            });
        }
        return JSON.stringify({ success: false });
    },

    _getQRImageFiles: function (fldr) {
        var fls = fldr.getFiles(function (file) {
            if (file instanceof Folder) return false;
            return /\.(png|jpe?g|svg|tif|tiff)$/i.test(file.name);
        });
        fls.sort(function (a, b) {
            var nameA = decodeURI(a.name);
            var nameB = decodeURI(b.name);
            var re = /(\d+)|(\D+)/g, aParts = [], bParts = [], m;
            while ((m = re.exec(nameA)) !== null) aParts.push(m[1] ? parseInt(m[1], 10) : m[2].toLowerCase());
            re.lastIndex = 0;
            while ((m = re.exec(nameB)) !== null) bParts.push(m[1] ? parseInt(m[1], 10) : m[2].toLowerCase());
            var len = Math.min(aParts.length, bParts.length);
            for (var idx = 0; idx < len; idx++) {
                if (aParts[idx] !== bParts[idx]) {
                    if (typeof aParts[idx] === "number" && typeof bParts[idx] === "number") {
                        return aParts[idx] - bParts[idx];
                    }
                    return aParts[idx] < bParts[idx] ? -1 : 1;
                }
            }
            return aParts.length - bParts.length;
        });
        return fls;
    },

    _collectQRImages: function (items, result) {
        for (var j = 0; j < items.length; j++) {
            var itm = items[j];
            if (itm.typename === "PlacedItem" || itm.typename === "RasterItem") {
                result.push(itm);
            } else if (itm.typename === "GroupItem") {
                this._collectQRImages(itm.pageItems, result);
            }
        }
    },

    _scanDocForQRCodes: function (d, result) {
        for (var p = 0; p < d.placedItems.length; p++) {
            var pItm = d.placedItems[p];
            if (this._isQRCodeCandidate(pItm)) result.push(pItm);
        }
        for (var r = 0; r < d.rasterItems.length; r++) {
            var rItm = d.rasterItems[r];
            if (this._isQRCodeCandidate(rItm)) result.push(rItm);
        }
    },

    _isQRCodeCandidate: function (itm) {
        var w = itm.width;
        var h = itm.height;
        return (w >= 15 && w <= 70 && h >= 15 && h <= 100);
    },

    _findClipMask: function (item) {
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
    },

    _getSortedVisualArtboards: function (d) {
        var abs = [];
        for (var i = 0; i < d.artboards.length; i++) {
            abs.push({
                index: i,
                left: d.artboards[i].artboardRect[0],
                rect: d.artboards[i].artboardRect
            });
        }
        abs.sort(function (a, b) { return a.left - b.left; });
        return abs;
    },

    _getArtboardIndexVisual: function (item, d) {
        var cx = item.left + (item.width / 2);
        var cy = item.top - (item.height / 2);
        var visAbs = this._getSortedVisualArtboards(d);

        for (var k = 0; k < visAbs.length; k++) {
            var r = visAbs[k].rect;
            if (cx >= r[0] && cx <= r[2] && cy <= r[1] && cy >= r[3]) {
                return k;
            }
        }
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
    },

    _sortCardsSmart: function (items, d) {
        if (items.length <= 1) return items;

        var visAbs = this._getSortedVisualArtboards(d);
        var abGroups = {};

        for (var i = 0; i < items.length; i++) {
            var itm = items[i];
            var ab = this._getArtboardIndexVisual(itm, d);
            if (!abGroups[ab]) abGroups[ab] = [];
            abGroups[ab].push(itm);
        }

        var sortedResult = [];

        function getRowAvgTop(row) {
            var sum = 0;
            for (var i = 0; i < row.length; i++) sum += row[i].top;
            return sum / row.length;
        }

        for (var abIdx = 0; abIdx < visAbs.length; abIdx++) {
            var group = abGroups[abIdx];
            if (!group || group.length === 0) continue;

            group.sort(function (a, b) { return b.top - a.top; });

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

            rows.sort(function (rowA, rowB) {
                return getRowAvgTop(rowB) - getRowAvgTop(rowA);
            });

            for (var rIdx = 0; rIdx < rows.length; rIdx++) {
                rows[rIdx].sort(function (a, b) {
                    return a.left - b.left;
                });
                for (var k = 0; k < rows[rIdx].length; k++) {
                    sortedResult.push(rows[rIdx][k]);
                }
            }
        }

        return sortedResult;
    },

    scanQRCodes: function (configJson) {
        try {
            if (app.documents.length === 0) {
                return JSON.stringify({ success: false, error: "কোনো ইলাস্ট্রেটর ডকুমেন্ট খোলা নেই!" });
            }
            var doc = app.activeDocument;
            var cfg = (typeof configJson === "string") ? eval("(" + configJson + ")") : (configJson || {});

            var folderPath = cfg.folderPath || "";
            if (!folderPath) {
                return JSON.stringify({ success: false, error: "অনুগ্রহ করে প্রথমে QR কোডের ফোল্ডার সিলেক্ট করুন।" });
            }

            var fldr = new Folder(folderPath);
            if (!fldr.exists) {
                return JSON.stringify({ success: false, error: "সিলেক্ট করা ফোল্ডারটি খুঁজে পাওয়া যায়নি!" });
            }

            var imageFiles = this._getQRImageFiles(fldr);
            if (imageFiles.length === 0) {
                return JSON.stringify({ success: false, error: "ফোল্ডারে কোনো ইমেজ ফাইল (png, jpg, svg) পাওয়া যায়নি!" });
            }

            var targetItems = [];
            var scope = cfg.scope || "selection";

            if (scope === "selection") {
                var sel = doc.selection;
                if (!sel || sel.length === 0) {
                    return JSON.stringify({ success: false, error: "কোনো অবজেক্ট সিলেক্ট করা নেই! দয়া করে কার্ডগুলো সিলেক্ট করুন অথবা 'All Document QRs' বেছে নিন।" });
                }
                this._collectQRImages(sel, targetItems);
            } else {
                this._scanDocForQRCodes(doc, targetItems);
            }

            if (targetItems.length === 0) {
                return JSON.stringify({ success: false, error: "ডকুমেন্টে কোনো ম্যাচিং QR কোড অবজেক্ট পাওয়া যায়নি!" });
            }

            var sortedTargets = this._sortCardsSmart(targetItems.slice(0), doc);
            var maxLen = Math.min(sortedTargets.length, imageFiles.length);

            var previewLines = [];
            var maxPreview = Math.min(maxLen, 12);

            for (var i = 0; i < maxPreview; i++) {
                var abIdx = this._getArtboardIndexVisual(sortedTargets[i], doc);
                var fName = decodeURI(imageFiles[i].name);
                previewLines.push("[" + (i + 1) + "] " + fName + " ➔ (Page " + (abIdx + 1) + ")");
            }

            return JSON.stringify({
                success: true,
                targetCount: sortedTargets.length,
                fileCount: imageFiles.length,
                matchCount: maxLen,
                preview: previewLines
            });
        } catch (err) {
            return JSON.stringify({ success: false, error: err.toString() });
        }
    },

    executeReplaceQRCodes: function (configJson) {
        try {
            if (app.documents.length === 0) {
                return JSON.stringify({ success: false, error: "কোনো ইলাস্ট্রেটর ডকুমেন্ট খোলা নেই!" });
            }
            var doc = app.activeDocument;
            var cfg = (typeof configJson === "string") ? eval("(" + configJson + ")") : (configJson || {});

            var folderPath = cfg.folderPath || "";
            if (!folderPath) {
                return JSON.stringify({ success: false, error: "অনুগ্রহ করে QR কোডের ফোল্ডার সিলেক্ট করুন।" });
            }

            var fldr = new Folder(folderPath);
            if (!fldr.exists) {
                return JSON.stringify({ success: false, error: "ফোল্ডার খুঁজে পাওয়া যায়নি!" });
            }

            var imageFiles = this._getQRImageFiles(fldr);
            if (imageFiles.length === 0) {
                return JSON.stringify({ success: false, error: "ফোল্ডারে কোনো ইমেজ ফাইল পাওয়া যায়নি!" });
            }

            var targetItems = [];
            var scope = cfg.scope || "selection";

            if (scope === "selection") {
                var sel = doc.selection;
                if (!sel || sel.length === 0) {
                    return JSON.stringify({ success: false, error: "কোনো অবজেক্ট সিলেক্ট করা নেই!" });
                }
                this._collectQRImages(sel, targetItems);
            } else {
                this._scanDocForQRCodes(doc, targetItems);
            }

            if (targetItems.length === 0) {
                return JSON.stringify({ success: false, error: "কোনো QR কোড অবজেক্ট পাওয়া যায়নি!" });
            }

            targetItems = this._sortCardsSmart(targetItems, doc);
            var shouldEmbed = (cfg.shouldEmbed !== false);

            var count = Math.min(targetItems.length, imageFiles.length);
            var successCount = 0;

            for (var i = 0; i < count; i++) {
                var target = targetItems[i];
                var newFile = imageFiles[i];

                try {
                    var targetParent = target.parent;

                    if (target.locked) target.locked = false;
                    if (target.layer && target.layer.locked) target.layer.locked = false;

                    // 0.5 inch = 36 pt
                    var targetW = 36;
                    var targetH = 36;

                    var mask = this._findClipMask(target);
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

            return JSON.stringify({
                success: true,
                count: successCount,
                total: count
            });
        } catch (err) {
            return JSON.stringify({ success: false, error: err.toString() });
        }
    },

    launchReplaceQRCodeDialog: function () {
        try {
            var curFile = new File($.fileName);
            var extFolder = curFile.parent.parent;
            var scriptFile = new File(extFolder.fsName + "/Replace_QR_Codes.jsx");
            if (scriptFile.exists) {
                $.evalFile(scriptFile);
                return JSON.stringify({ success: true });
            } else {
                return JSON.stringify({ success: false, error: "Replace_QR_Codes.jsx not found in extension directory." });
            }
        } catch (e) {
            return JSON.stringify({ success: false, error: e.toString() });
        }
    }

};

function openWebUrl(url) {
    try {
        var isMac = (File.fs === "Macintosh" || (typeof $.os !== "undefined" && $.os.indexOf("Mac") !== -1));
        if (isMac) {
            var opened = false;
            try {
                if (typeof app.system === "function") {
                    app.system('/usr/bin/open "' + url + '"');
                    opened = true;
                }
            } catch (err1) {}

            if (!opened) {
                try {
                    var webloc = new File(Folder.temp.fsName + "/open_vt_link.webloc");
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
            } catch (err3) {}

            if (!openedWin) {
                try {
                    var urlFile = new File(Folder.temp.fsName + "/open_vt_link.url");
                    urlFile.open("w");
                    urlFile.write('[InternetShortcut]\r\nURL=' + url + '\r\n');
                    urlFile.close();
                    urlFile.execute();
                } catch (err4) {}
            }
        }
    } catch (e) {}
}

