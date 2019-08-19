import { xmlNode } from "./xmlNode";

var app = Object.create(xmlNode);

app.init = function _init() {
    var heading = this.createXmlNode({
        nodeType: 'Properties',
        isRoot: true,
        fileName: 'app.xml',
        attributes: {
            xmlns: 'http://schemas.openxmlformats.org/officeDocument/2006/extended-properties',
            'xmlns:vt': 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes'
        }
    }).createChild({ nodeType: 'Application', textValue: 'Microsoft Excel' })
        .createChild({ nodeType: 'DocSecurity', textValue: '0' })
        .createChild({ nodeType: 'ScaleCrop', textValue: 'false' })
        .createChildReturnChild({ nodeType: 'HeadingPairs' });

    var vector = heading.createChildReturnChild({
        nodeType: 'vt:vector',
        attributes: {
            size: '2',
            baseType: 'variant'
        }
    });

    vector.createChildReturnChild({ nodeType: 'vt:variant' })
        .createChildReturnParent({ nodeType: 'vt:lpstr', textValue: 'Worksheets' })
        .createChildReturnChild({ nodeType: 'vt:variant' })
        .createChildReturnRoot({ nodeType: 'vt:i4', textValue: '1' })
        .createChildReturnChild({ nodeType: 'TitlesOfParts' })
        .createChildReturnChild({
            nodeType: 'vt:vector',
            attributes: {
                size: '1',
                baseType: 'lpstr'
            }
        }).createChildReturnRoot({ nodeType: 'vt:lpstr', textValue: 'sheet1' })
        .createChild({ nodeType: 'Company', textValue: '' })
        .createChild({ nodeType: 'LinksUpToDate', textValue: 'false' })
        .createChild({ nodeType: 'SharedDoc', textValue: 'false' })
        .createChild({ nodeType: 'HyperlinksChanged', textValue: 'false' })
        .createChildReturnRoot({ nodeType: 'AppVersion', textValue: '15.0300' });
    return this;
};

export { app };