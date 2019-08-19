import { xmlNode } from "./xmlNode";
import { positionToLetterRef } from "./helpers";

/**
 * This represents an excel worksheet
 * @type {xmlNode} - Delegates to xmlNode for base properties and methods
 */
var workSheet = Object.create(xmlNode);

/**
 * Initializes a new worksheet by creating the base nodes
 * @param {Array} data - An array of data used to create a new table object
 * @param {Array} columns - An array of the columns to be displayed in the table
 * @param {string} workSheetName - The file name of the worksheet that was generated in the workbook
 * @param {string} tableId - The id of the table for the worksheet that was generated in the workbook
 * @returns {{worksheet: workSheet, sharedStrings: Array, table: table}}
 */
workSheet.init = function _init(data, columns, workSheetName, tableId) {
    var sharedStrings = [],
        sharedStringsMap = {},
        i, count = 0, total = columns.length;
    this.createXmlNode({
        nodeType: 'worksheet',
        fileName: workSheetName + '.xml',
        isRoot: true,
        attributes: {
            'xmlns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
            'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
            'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
            'mc:Ignorable': 'x14ac',
            'xmlns:x14ac': 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac'
        }
    });
    this.path = '/worksheets';
    this.name = workSheetName;

    if (!columns) {
        columns = [];
        for (var item in data[0]) {
            columns.push(item);
        }
    }
    this.data = data;
    this.columns = columns;
    var tableHeight = data.length + 1;

    var endPos = positionToLetterRef(columns.length, tableHeight),
        ref = 'A1:' + endPos;

    this.createChild({
        nodeType: 'dimension',
        attributes: {
            'ref': ref
        }
    }).createChildReturnChild({
        nodeType: 'sheetViews'
    }).createChildReturnChild({
        nodeType: 'sheetView',
        attributes: {
            'tabSelected': '1',
            'workbookViewId': '0'
        }
    }).createChildReturnRoot({
        nodeType: 'selection',
        attributes: {
            activeCell: 'A1',
            sqref: 'A1'
        }
    }).createChild({
        nodeType: 'sheetFormatPr',
        attributes: {
            defaultRowHeight: '15',
            'x14ac:dyDescent': '0.25'
        }
    });

    var colContainer = this.createChildReturnChild({ nodeType: 'cols' });
    var sheetdataNode = this.createChildReturnChild({ nodeType: 'sheetData' });

    var headerRow = sheetdataNode.createChildReturnChild({
        nodeType: 'row',
        attributes: {
            r: 1,
            spans: '1:' + columns.length,
            'x14ac:dyDescent': '0.25'
        }
    });

    var headerRowPos;

    for (i = 0; i < columns.length; i++) {
        var attrs = {};
        if (columns[i].width) attrs = { width: columns[i].width };
        attrs.min = i + 1;
        attrs.max = i + 1;
        attrs.width = '10';
        attrs.bestFit = '1';

        colContainer.createChild({
            nodeType: 'col',
            attributes: attrs
        });
        //TODO: Need to update logic here to check first if header is a string or not
        sharedStrings.push(columns[i].toString());
        sharedStringsMap[columns[i].toString()] = count.toString();
        headerRowPos = positionToLetterRef((i + 1), 1);

        headerRow.createChildReturnChild({
            nodeType: 'c',
            attributes: {
                r: headerRowPos,
                t: 's'
            }
        }).createChild({
            nodeType: 'v',
            textValue: count.toString()
        });
        count++;
    }

    for (i = 0; i < data.length; i++) {
        var row = sheetdataNode.createChildReturnChild({
            nodeType: 'row',
            attributes: {
                r: (i + 2).toString(),
                spans: '1:' + columns.length,
                'x14ac:dyDescent': '0.25'
            }
        });

        for (var j = 0; j < columns.length; j++) {
            var cellLoc = positionToLetterRef((j + 1), (i + 2));
            if (typeof data[i][columns[j]] !== 'number') {
                total += 1;
                var sharedString = (data[i][columns[j]] || '').toString();
                if (!sharedStringsMap[sharedString]) {
                    sharedStrings.push(sharedString);
                    sharedStringsMap[sharedString] = count.toString();

                    row.createChildReturnChild({
                        nodeType: 'c',
                        attributes: {
                            r: cellLoc,
                            t: 's'
                        }
                    }).createChild({
                        nodeType: 'v',
                        textValue: count.toString()
                    });
                    count++;
                }
                else {
                    row.createChildReturnChild({
                        nodeType: 'c',
                        attributes: {
                            r: cellLoc,
                            t: 's'
                        }
                    }).createChild({
                        nodeType: 'v',
                        textValue: sharedStringsMap[sharedString]
                    });
                }
            }
            else {
                row.createChildReturnChild({
                    nodeType: 'c',
                    attributes: {
                        r: cellLoc,
                        t: 'n'
                    }
                }).createChild({
                    nodeType: 'v',
                    textValue: data[i][columns[j]].toString()
                });
            }
        }
    }

    this.createChild({
        nodeType: 'pageMargins',
        attributes: {
            left: '0.7',
            right: '0.7',
            top: '0.75',
            bottom: '0.75',
            header: '0.3',
            footer: '0.3'
        }
    }).createChildReturnChild({
        nodeType: 'tableParts',
        attributes: {
            count: '1'
        }
    }).createChild({
        nodeType: 'tablePart',
        attributes: {
            'r:id': 'rId' + tableId
        }
    });

    var t = Object.create(table).init(columns, ref, tableId);
    return { worksheet: this, sharedStrings: sharedStrings, table: t, total: total === -1 ? 0 : total };
};

export { workSheet };