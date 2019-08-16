import { xmlNode } from './excel_exporter_es6';

var styles = Object.create(xmlNode);

styles.init = function _init() {
    var styleSheet = this.createXmlNode({
        nodeType: 'styleSheet',
        isRoot: true,
        fileName: 'styles.xml',
        attributes: {
            xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
            'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
            'mc:Ignorable': 'x14ac x16r2',
            'xmlns:x14ac': 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac',
            'xmlns:x16r2': 'http://schemas.microsoft.com/office/spreadsheetml/2015/02/main'
        }})
        .createChildReturnChild({ nodeType: 'numFmts', attributes: { count: 1 } })
        .createChildReturnRoot({ nodeType: 'numFmt', attributes: { numFmtId: 167, formatCode: '0.0000' }})
        .createChildReturnChild({ nodeType: 'fonts', attributes: { count: 1, 'x14ac:knownFonts': 1 }})
        .createChildReturnChild({ nodeType: 'font' })
        .createChild({ nodeType: 'sz', attributes: { val: 11 }})
        .createChild({ nodeType: 'color', attributes: { theme: 1 }})
        .createChild({ nodeType: 'name', attributes: { val: 'Calibri' }})
        .createChild({ nodeType: 'family', attributes: { val: 2 }})
        .createChildReturnRoot({ nodeType: 'scheme', attributes: { val: 'minor' }})
        .createChildReturnChild({ nodeType: 'fills', attributes: { count: 2 }})
        .createChildReturnChild({ nodeType: 'fill' })
        .createChildReturnParent({ nodeType: 'patternFill', attributes: { patternType: 'none'}})
        .createChildReturnChild({ nodeType: 'fill' })
        .createChildReturnRoot({ nodeType: 'patterFill', attributes: { patternType: 'gray125' }})
        .createChildReturnChild({ nodeType: 'borders', attributes: { count: 1 }})
        .createChildReturnChild({ nodeType: 'border' })
        .createChild({ nodeType: 'left' })
        .createChild({ nodeType: 'right' })
        .createChild({ nodeType: 'top' })
        .createChild({ nodeType: 'bottom' })
        .createChildReturnRoot({ nodeType: 'diagonal' })
        .createChildReturnChild({ nodeType: 'cellStyleXfs', attributes: { count: 1 }})
        .createChildReturnRoot({ nodeType: 'xf', attributes: { numFmtId: 0, fontId: 0, fillId: 0, borderId: 0 }})
        .createChildReturnChild({ nodeType: 'cellXfs', attributes: { count: 5 }})
        .createChild({ nodeType: 'xf', attributes: { numFmtId: 0, fontId: 0, fillId: 0, borderId: 0, xfId: 0 }})
        .createChild({ nodeType: 'xf', attributes: { numFmtId: 0, fontId: 0, fillId: 0, borderId: 0, xfId: 0, applyNumberFormat: 1 }})
        .createChild({ nodeType: 'xf', attributes: { numFmtId: 0, fontId: 0, fillId: 0, borderId: 0, xfId: 0, applyNumberFormat: 1 }})
        .createChild({ nodeType: 'xf', attributes: { numFmtId: 0, fontId: 0, fillId: 0, borderId: 0, xfId: 0, applyNumberFormat: 1 }})
        .createChildReturnRoot({ nodeType: 'xf', attributes: { numFmtId: 0, fontId: 0, fillId: 0, borderId: 0, xfId: 0, applyNumberFormat: 1 }})
        .createChildReturnChild({ nodeType: 'cellStyles' })
        .createChildReturnRoot({ nodeType: 'cellStyle', attributes: { name: 'Normal', xfId: 0, builtinId: 0 }})
        .createChildReturnChild({ nodeType: 'dxfs', attributes: { count: 5 }})
        .createChildReturnChild({ nodeType: 'dxf' })
        .createChildReturnParent({ nodeType: 'numFmt', attributes: { numFmtId: 167, formatCode: '0.00000' }})
        .createChildReturnChild({ nodeType: 'dxf' })
        .createChildReturnParent({ nodeType: 'numFmt', attributes: { numFmtId: 2, formatCode: '0.00' }})
        .createChildReturnChild({ nodeType: 'dxf' })
        .createChildReturnParent({ nodeType: 'numFmt', attributes: { numFmtId: 30, formatCode: '@' }})
        .createChildReturnChild({ nodeType: 'dxf' })
        .createChildReturnParent({ nodeType: 'numFmt' , attributes: { numFmtId: 30, formatCode: '@' }})
        .createChildReturnChild({ nodeType: 'dxf' })
        .createChildReturnRoot({ nodeType: 'numFmt', attributes: { numFmtId: 1, formatCode: 0 }})
        .createChild({ nodeType: 'tableStyles', attributes: { count: 0, defaultTableStyle: 'TableStyleMedium2', defaultPivotStyle: 'PivotStyleLight16' }})
        .createChildReturnChild({ nodeType: 'extLst' })
        .createChildReturnChild({ nodeType: 'ext', attributes: { uri: '{EB79DEF2-80B8-43e5-95BD-54CBDDF9020C}', 'xmlns:x14': 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/main' }})
        .createChildReturnParent({ nodeType: 'x14:slicerStyles', attributes: { defaultSliceStyle: 'SlicerStyleLight1' }})
        .createChildReturnChild({ nodeType: 'ext', attributes: { uri: '{9260A510-F301-46a8-8635-F512D64BE5F5}', 'xmlns:x15': 'http://schemas.microsoft.com/office/spreadsheetml/2010/11/main' } })
        .createChild({ nodeType: 'x15:timelineStyles', attributes: { defaultTimelineStyle: 'TimeSlicerStyleLight1', }});

    return this;
};