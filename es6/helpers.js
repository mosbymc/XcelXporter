function escape(string) {
    string = baseToString(string);
    var reHasUnescapedHtml = new RegExp('[&<>"\']');
    return (string && reHasUnescapedHtml.test(string)) ? string.replace(/[&<>"']/g, escapeHtmlChar) : string;
}

function baseToString(value) {
    return value == null ? '' : (value + '');
}

function escapeHtmlChar(chr) {
    return htmlEscapes[chr];
}

var htmlEscapes = {
    '"': '&quot;',
    '\'': '&apos;',
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
};

var LETTER_REFS = {};

function positionToLetterRef(pos1, pos2) {
    var digit = 1, index, num = pos1, string = "", alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if(LETTER_REFS[pos1]) {
        return LETTER_REFS[pos1].concat(pos2);
    }
    while (num > 0) {
        num -= Math.pow(26, digit -1);
        index = num % Math.pow(26, digit);
        num -= index;
        index = index / Math.pow(26, digit - 1);
        string = alphabet.charAt(index) + string;
        digit += 1;
    }
    LETTER_REFS[pos1] = string;
    return string.concat(pos2);
}

var generateId = (function guid(seed) {
    return function _generateId(value) {
        var prefix = value || '';
        return prefix + (seed++).toString();
    };
})(1);

var relationTypes = {
    worksheet: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet',
    sharedStrings: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings',
    stylesheet: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
    styles: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
    table: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/table',
    core: 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
    workbook: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
    app: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties',
    theme: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme'
};

var file_DirectoryMap = {
    '[Content_Types]': '',
    workbook: 'xl',
    stylesheet: 'xl',
    sharedStrings: 'xl',
    styles: 'xl',
    worksheet: 'xl.worksheets',
    'worksheet-rel': 'xl.worksheets._rels',
    table: 'xl.tables',
    theme: 'xl.theme',
    'workbook-rel': 'xl._rels',
    app: 'docProps',
    core: 'docProps',
    'root-rel': '_rels'
};

export { escape, baseToString, escapeHtmlChar, htmlEscapes, LETTER_REFS, positionToLetterRef, generateId, relationTypes, file_DirectoryMap };