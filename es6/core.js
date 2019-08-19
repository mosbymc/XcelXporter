import { xmlNode } from "./xmlNode";

var core = Object.create(xmlNode);

core.init = function _init() {
    var curDate = new Date().toISOString();
    this.createXmlNode({
        nodeType: 'cp:coreProperties',
        isRoot: true,
        fileName: 'core.xml',
        attributes: {
            'xmlns:cp': 'http://schemas.openxmlformats.org/package/2006/metadata/core-properties',
            'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
            'xmlns:dcterms': 'http://purl.org/dc/terms/',
            'xmlns:dcmitype': 'http://purl.org/dc/dcmitype/',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
        }
    }).createChild({ nodeType: 'dc:creator', textValue: 'XcelXporter' })
        .createChild({ nodeType: 'cp:lastModifiedBy', textValue: 'XcelXporter' })
        .createChild({
            nodeType: 'dcterms:created',
            textValue: curDate,
            attributes: {
                'xsi:type': 'dcterms:W3CDTF'
            }
        }).createChildReturnRoot({
        nodeType: 'dcterms:modified',
        textValue: curDate,
        attributes: {
            'xsi:type': 'dcterms:W3CDTF'
        }
    });
    return this;
};

export { core };
