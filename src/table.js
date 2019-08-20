import { xmlNode } from "./xmlNode";

/**
 * Object used for creating and modifying excel tables
 * @type {xmlNode}
 */
var table = Object.create(xmlNode);

/**
 * This initializes the table object; creates initial nodes
 * @param {Array} columns - A collection of columns to be displayed in the table
 * @param {string} ref - A string detailing the top-left and bottom-right cells of the table
 * @param {string|number} tableId - The Id of the table
 * @returns {table}
 */
table.init = function _init(columns, ref, tableId) {
    var name = 'table' + tableId;
    this.createXmlNode({
        nodeType: 'table',
        isRoot: true,
        fileName: 'table' + tableId + '.xml',
        attributes: {
            'xmlns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
            'id': tableId,
            'name': name,
            'displayName': name,
            'ref': ref,
            'totalsRowShown': '0'
        }
    }).createChild({
        nodeType: 'autoFilter',
        attributes: {
            'ref': ref
        }
    });

    var tableCols = this.createChildReturnChild({
        nodeType: 'tableColumns',
        attributes: {
            'count': columns.length
        }
    });

    for (var i = 0; i < columns.length; i++) {
        var columnName = '';
        if (typeof columns[i] === 'object') columnName = columns[i].displayName || columns[i].name;
        else columnName = columns[i];

        tableCols.createChild({
            nodeType: 'tableColumn',
            attributes: {
                id: (i+1),
                name: columnName
            }
        });
    }

    this.createChild({
        nodeType: 'tableStyleInfo',
        attributes: {
            name: 'TableStyleMedium2',
            showFirstColumn: '0',
            showLastColumn: '0',
            showRowStripes: '1',
            showColumnStripes: '0'
        }
    });

    this.columns = [columns];
    this.name = tableId;
    this.path = '/tables';
    return this;
};

export { table };