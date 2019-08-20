import { xmlNode } from "./xmlNode";
import { workSheet } from "./worksheet";
import { styles } from './styles';
import { relation } from "./relation";
import { sharedStrings } from "./sharedStrings";
import { contentType } from "./contentType";
import { core } from "./core";
import { app } from "./app";
import { generateId, file_DirectoryMap } from "./helpers";

/**
 * This is the base excel object. All other excel objects are created though this object or its children.
 * @type {xmlNode} - Delegates to xmlNode for base properties and methods
 */
var workbook = Object.create(xmlNode);

/**
 * Initializes a new instance of the workbook
 * @returns {workbook}
 */
workbook.init = function _initWorkbook() {
    this.directory = {
        _rels: {},
        xl: {
            worksheets: {
                _rels: {}
            },
            tables: {},
            _rels: {},
            theme: {}
        },
        docProps: {}
    };

    return this.createXmlNode({
        nodeType: 'workbook',
        isRoot: true,
        fileName: 'workbook.xml',
        attributes: {
            'xmlns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
            'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
            'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
            'mc:Ignorable': 'x15',
            'xmlns:x15': 'http://schemas.microsoft.com/office/spreadsheetml/2010/11/main'
        }
    }).createChild({
        nodeType: 'fileVersion',
        attributes: {
            appName: 'xl',
            lastEdited: '6',
            lowestEdited: '6',
            rupBuild: '14420'
        }
    }).createChild({
        nodeType: 'workbookPr',
        attributes: {
            defaultThemeVersion: '153222'
        }
    }).createChildReturnChild({
        nodeType: 'mc:AlternateContent',
        attributes: {
            'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006'
        }
    }).createChildReturnChild({
        nodeType: 'mc:Choice',
        attributes: {
            Requires: 'x15'
        }
    }).createChildReturnRoot({
        nodeType: 'x15ac:absPath',
        attributes: {
            url: 'C:\\',
            'xmlns:x15ac': 'http://schemas.microsoft.com/office/spreadsheetml/2010/11/ac'
        }
    }).createChildReturnChild({
        nodeType: 'bookViews'
    }).createChildReturnRoot({
        nodeType: 'workbookView',
        attributes: {
            xWindow: '0',
            yWindow: '0',
            windowWidth: '28800',
            windowHeight: '12435'
        }
    })._createCoreFileObject()._createAppFileObject()
        ._createRelation('root-rel', '.rels')._createRelation('workbook-rel', 'workbook.xml.rels')._createSharedStrings()
        ._createContentType()._insertObjectIntoDirectory(this, 'workbook');
};

/**
 * Creates and adds a new worksheet for the workbook
 * @param {Array} data - The collection of data to be displayed in a table
 * @param {Array} columns - The list of columns to display in the table
 * @param {string|undefined} name - Ths name of the worksheet
 * @returns {workbook}
 */
workbook.createWorkSheet = function __createWorkSheet(data, columns, name) {
    if (!data || data.constructor !== Array) return this;
    var sheetId = generateId(),
        tableId = generateId(),
        workSheetName = name || 'sheet' + sheetId,
        relWorkSheet = workSheetName + '.xml.rels';
    var ws = Object.create(workSheet).init(data, columns, workSheetName, tableId);
    this._insertObjectIntoDirectory(ws.worksheet, 'worksheet')
        ._insertObjectIntoDirectory(ws.table, 'table')
        ._createRelation('worksheet-rel', relWorkSheet)
        .createChildReturnChild({
            nodeType: 'sheets'
        })
        .createChildReturnRoot({
            nodeType: 'sheet',
            attributes: {
                name: workSheetName,
                sheetId: sheetId,
                'r:id': 'rId' + sheetId
            }
        }).createChild({
        nodeType: 'calcPr',
        attributes: {
            calcId: '152511'
        }
    }).createChildReturnChild({
        nodeType: 'extLst'
    }).createChildReturnChild({
        nodeType: 'ext',
        attributes: {
            uri: '{140A7094-0E35-4892-8432-C4D2E57EDEB5}',
            'xmlns:x15': 'http://schemas.microsoft.com/office/spreadsheetml/2010/11/main'
        }
    }).createChildReturnRoot({
        nodeType: 'x15:workbookPr',
        attributes: {
            chartTrackingRefBase: '1'
        }
    }).directory.xl._rels['workbook.xml.rels'].addRelation('rId' + sheetId, 'worksheet', 'worksheets/' + workSheetName + '.xml');
    this.directory.xl._rels['workbook.xml.rels'].addRelation(generateId('rId'), 'sharedStrings', 'sharedStrings.xml');
    this.directory.xl.worksheets._rels[relWorkSheet].addRelation('rId' + tableId, 'table', '../tables/table' + tableId + '.xml');
    this.directory.xl['sharedStrings.xml'].addEntries(ws.sharedStrings, ws.total);
    this.directory['[Content_Types].xml'].addContentType('/xl/worksheets/' + workSheetName + '.xml', 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml');
    this.directory['[Content_Types].xml'].addContentType('/xl/tables/table' + tableId + '.xml', 'application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml');

    return this;
};

/**
 * Creates a new stylesheet for the workbook
 * @param {Object} styles - The styles to be applied to the stylesheet
 * @returns {workbook}
 */
workbook._createStyleSheet = function __createStyleSheet(styles) {
    if (this.directory['styles.xml']) return this;
    this._insertObjectIntoDirectory(Object.create(styles).init(styles), 'stylesheet');
    this.directory.xl._rels.addRelation(generateId('rId'), 'stylesheet', 'styles.xml');
    return this;
};

/**
 * Creates a new relation for the workbook
 * @param {string} relationType - Denotes what type of relation this is; root, worksheet, table, etc...
 * @param {string} fileName - The name of the file for this relation
 * @returns {workbook}
 */
workbook._createRelation = function __createRelation(relationType, fileName) {
    var createRoot = false;
    if (relationType === 'root-rel') createRoot = true;
    return this._insertObjectIntoDirectory(Object.create(relation).init(createRoot, fileName), relationType);
};

/**
 * Creates a new sharedStrings xmlNode instance and adds it to
 * the workbook directory
 * @returns {workbook}
 */
workbook._createSharedStrings = function __createSharedStrings() {
    if (this.directory.xl['sharedStrings.xml']) return this;
    return this._insertObjectIntoDirectory(Object.create(sharedStrings).init(), 'sharedStrings');
};

/**
 * Create a new contentType xmlNode instance and adds it to
 * the workbook directory
 * @returns {workbook}
 */
workbook._createContentType = function __createContentType() {
    if (this.directory['[Content_Types].xml']) return this;
    return this._insertObjectIntoDirectory(Object.create(contentType).init(), '[Content_Types]');
};

/**
 * Creates an instance of the core file object and inserts into the directory
 * @returns {workbook}
 */
workbook._createCoreFileObject = function __createCoreFileObject() {
    if (this.directory.docProps['core.xml']) return this;
    return this._insertObjectIntoDirectory(Object.create(core).init(), 'core');
};

/**
 * Creates an instance of the app file object and inserts it into the directory
 * @returns {workbook}
 */
workbook._createAppFileObject = function __createAppFileObject() {
    if (this.directory.docProps['app.xml']) return this;
    return this._insertObjectIntoDirectory(Object.create(app).init(), 'app');
};

workbook._createStylesFileObject = function __createStylesFileObject() {
    if (this.directory['styles.xml']) return this;
    return this._insertObjectIntoDirectory(Object.create(styles).init(), 'styles');
};

/**
 * Inserts a root xmlNode instance into the workbook directory
 * based on its file_DirectoryMap lookup value
 * @param {xmlNode} object - A root xmlNode instance that represents a future
 * file to be exported
 * @param {string} objectType - The type of the xmlNode instance
 * @returns {workbook}
 */
workbook._insertObjectIntoDirectory = function __insertObjectIntoDirectory(object, objectType) {
    if (!xmlNode.isPrototypeOf(object)) return this;
    var loc = file_DirectoryMap[objectType];
    if (!loc) {
        this.directory[object.fileName] = object;
        return this;
    }
    else {
        var paths = loc.split('.'),
            insertionPoint = this.directory[paths[0]];

        for (var i = 1; i < paths.length; i++) {
            insertionPoint = insertionPoint[paths[i]];
        }
        if (insertionPoint && insertionPoint.constructor === Array) insertionPoint.push(object);
        else insertionPoint[object.fileName] = object;
        return this;
    }
};

export { workbook };