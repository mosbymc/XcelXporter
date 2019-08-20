import { xmlNode } from "./xmlNode";

/**
 * Object used for creating the [Content-Types] file
 * @type {xmlNode} - Delegates to xmlNode object
 */
var contentType = Object.create(xmlNode);

/**
 * Initializes the object with all required types. Called when a new
 * workbook is initialized
 * @returns {contentType}
 */
contentType.init = function _init() {
    this.createXmlNode({
        nodeType: 'Types',
        isRoot: true,
        fileName: '[Content_Types].xml',
        attributes: {
            xmlns: 'http://schemas.openxmlformats.org/package/2006/content-types'
        }
    }).createChild({
        nodeType: 'Default',
        attributes: {
            'Extension': 'rels',
            'ContentType': 'application/vnd.openxmlformats-package.relationships+xml'
        }
    }).createChild({
        nodeType: 'Default',
        attributes: {
            'Extension': 'xml',
            'ContentType': 'application/xml'
        }
    }).createChild({
        nodeType: 'Override',
        attributes: {
            PartName: '/xl/workbook.xml',
            ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml'
        }
    }).createChild({
        nodeType: 'Override',
        attributes: {
            PartName: '/xl/sharedStrings.xml',
            ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml'
        }
    }).createChild({
        nodeType: 'Override',
        attributes: {
            PartName: '/docProps/core.xml',
            ContentType: 'application/vnd.openxmlformats-package.core-properties+xml'
        }
    }).createChildReturnRoot({
        nodeType: 'Override',
        attributes: {
            PartName: '/docProps/app.xml',
            ContentType: 'application/vnd.openxmlformats-officedocument.extended-properties+xml'
        }
    });
    return this;
};

/**
 * Adds a new content type as an xml node to the [Content-Types] file
 * @param {string} partName - The name of the part
 * @param {string} type - The type of content
 * @returns {contentType}
 */
contentType.addContentType = function _addContentType(partName, type) {
    this.createChildReturnRoot({
        nodeType: 'Override',
        attributes: {
            PartName: partName,
            ContentType: type
        }
    });
    return this;
};

export { contentType };