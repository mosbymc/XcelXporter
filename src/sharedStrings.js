import { xmlNode } from "./xmlNode";

/**
 * Object used for creating sharedStrings
 * @type {xmlNode} - Delegates to xmlNode object
 */
var sharedStrings = Object.create(xmlNode);

/**
 * Initializes a new sharedStrings object. Called when a new
 * workbook is initialized
 * @returns {sharedStrings}
 */
sharedStrings.init = function _init() {
    this.createXmlNode({
        nodeType: 'sst',
        isRoot: true,
        fileName: 'sharedStrings.xml',
        attributes: {
            'xmlns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
        }
    });
    return this;
};

/**
 * Function for adding new shared string nodes (xmlNode objects)
 * to this sharedString instance
 * @param {Array} values - An array of string to be added as children of
 * this xmlNode instance
 * @param {number} count - The number of shared string references
 * @returns {sharedStrings}
 */
sharedStrings.addEntries = function _addEntries(values, count) {
    for (var i = 0; i < values.length; i++) {
        this.createChildReturnChild({ nodeType: 'si' })
            .createChild({
                nodeType: 't',
                textValue: values[i]
            });
    }
    this.addAttributes({
        uniqueCount: values.length,
        count: count
    });
    return this;
};

export { sharedStrings };