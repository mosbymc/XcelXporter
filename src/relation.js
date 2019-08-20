import { xmlNode } from "./xmlNode";
import { generateId, relationTypes } from "./helpers";

/**
 * Object used for creating excel relations
 * @type {xmlNode} - Delegates to xmlNode object
 */
var relation = Object.create(xmlNode);

/**
 * Initializes a new instance of the relation object, setting up the default nodes.
 * Called when a new workbook is initialized or when a table is added to a worksheet.
 * @param {boolean} createRootRelation - Indicates that the init function should create a root
 * relation rather than a table/stylesheet/worksheet/etc relation
 * @param {string|undefined} fileName - The name of the xml file for this relation
 * @returns {relation}
 */
relation.init = function _init(createRootRelation, fileName) {
    this.createXmlNode({
        nodeType: 'Relationships',
        isRoot: true,
        fileName: fileName,
        attributes: {
            xmlns: 'http://schemas.openxmlformats.org/package/2006/relationships'
        }
    });

    if (createRootRelation) {
        this.addRelation(generateId('rId'), 'app', 'docProps/app.xml')
            .addRelation(generateId('rId'), 'core', 'docProps/core.xml')
            .addRelation(generateId('rId'), 'workbook', 'xl/workbook.xml');
    }
    return this;
};

/**
 * Adds a new relation node to the existing relationship object
 * @param {string} rId - The relation id that the new relation refers to
 * @param {string} type - The type of the relation
 * @param {string} target - The location of the relation object
 * @returns {relation}
 */
relation.addRelation = function _addRelation(rId, type, target) {
    this.createChild({
        nodeType: 'Relationship',
        attributes: {
            Id: rId,
            Type: relationTypes[type],
            Target: target
        }
    });
    return this;
};

export { relation };