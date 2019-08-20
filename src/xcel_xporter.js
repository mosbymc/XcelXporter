import { workbook } from "./workbook";

var xcelXporter = {
    /**
     * Creates a new workbook instance. From this all other excel types/files may be added (worksheet, table, stylesheet, etc.)
     * @returns {workbook} - Returns an object that delegates to the workbook object which itself delegates to the xmlNode object.
     */
    createWorkBook: function _createWorkBook() {
        return Object.create(workbook).init();
    },
    /**
     * Takes a workbook object as its argument and exports the data as an xml file.
     * @param wb
     */
    exportWorkBook: function _exportWorkBook(wb) {
        if (!workbook.isPrototypeOf(wb)) return;
        var files = {};
        buildFiles('', wb.directory, files);

        var zip = new JSZip();
        for (var file in files) {
            zip.file(file.substr(1), files[file], { base64: false });
        }

        zip.generateAsync({ compression: 'DEFLATE', type: 'base64', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            .then(function jsZipPromiseCallback(content) {
                var string = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + content;
                //saveAs(content, "hello.xlsx");
                location.href = string;
                //saveAs(content, 'excelFile.xlsx');
                /*var fileSaver = document.createElement('a');
                 fileSaver.download = 'sample.xlsx';
                 fileSaver.href = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                 var e = new MouseEvent('click', 0);
                 //e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                 fileSaver.dispatchEvent(e);*/
                //URL.revokeObjectURL(dataURI);
                //var a = document.createElement("a");
                //a.href = URL.createObjectURL(content);
                //a.download = 'excelFile.xlsx';
                //a.click();

                //var dataURI = URL.createObjectURL(string);
                /*var blob = content;
                 if (typeof content == 'string') {
                 var parts = content.split(';base64,');
                 var contentType = parts[0];
                 var base64 = atob(parts[1]);
                 var array = new Uint8Array(base64.length);
                 for (var idx = 0; idx < base64.length; idx++) {
                 array[idx] = base64.charCodeAt(idx);
                 }
                 blob = new Blob([array.buffer], { type: contentType });
                 }
                 saveAsBlob(blob, fileName);*/
            });
    }
};

/*
function exportWorkBook(wb) {
    if (!workbook.isPrototypeOf(wb)) return;
    var files = {};
    buildFiles('', wb.directory, files);

    var zip = new JSZip();
    for (var file in files) {
        zip.file(file.substr(1), files[file], { base64: false });
    }

    zip.generateAsync({ compression: 'DEFLATE', type: 'base64', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        .then(function jsZipPromiseCallback(content) {
            var string = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + content;
            location.href = string;
        });
}
 */

/**
 * Builds out the file object with xml string representation of the nodes
 * @param {string} path - The path of the .xml/.rels files inside the excel directory
 * @param {Object} directory - The directory built up by the workbook instance
 * @param {Object} files - The object holding each .xml/.rels file
 */
function buildFiles(path, directory, files) {
    path = path + '/';
    for (var file in directory) {
        if (xmlNode.isPrototypeOf(directory[file]))
            files[path + directory[file].fileName] = directory[file].toXml();
        else if (directory[file].constructor === Array) {
            for (var i = 0; i < directory[file].length; i++) {
                files[path + directory[file][i][directory[file].fileName]] = directory[file][i].toXml();
            }
        }
        else if (typeof directory[file] === 'object') buildFiles(path + file, directory[file], files);
    }
}

export { xcelXporter };