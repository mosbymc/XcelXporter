import { xmlNode } from './xmlNode';

var t = [
    { parentNode: 'a:dk2', color: '44546A' },
    { parentNode: 'a:lt2', color: 'E7E6E6' },
    { parentNode: 'a:accent1', color: '4472C4' },
    { parentNode: 'a:accent2', color: 'ED7D31' },
    { parentNode: 'a:accent3', color: 'A5A5A5' },
    { parentNode: 'a:accent4', color: 'FFC000' },
    { parentNode: 'a:accent5', color: '5B9BD5' },
    { parentNode: 'a:accent6', color: '70AD47' },
    { parentNode: 'a:hlink', color: '0563C1' },
    { parentNode: 'a:folHlink', color: '954F72' }
];

var themes = Object.create(xmlNode);

themes.init = function _initThemes() {
    var colorScheme = this.createXmlNode({ nodeType: 'a:clrScheme', attributes: { name: 'Office' }})
        .createChildReturnChild({ nodeType: 'a:dk1' })
        .createChildReturnParent({ nodeType: 'a:sysClr', attributes: { val: 'windowText', lastClr: '000000' }})
        .createChildReturnChild({ nodeType: 'a:lt1' })
        .createChildReturnParent({ nodeType: 'a:sysClr', attributes: { val: 'window', lastClr: 'FFFFFF' }});

    t.reduce(function _colorReduction(curr, next) {
        return curr.createChildReturnChild({ nodeType: next.parentNode })
            .createChildReturnParent({ nodeType: 'a:srgbClr', attributes: { val: next.color }});
    }, colorScheme);

    var theme = this.createXmlNode({
        nodeType: 'a:theme',
        isRoot: true,
        fileName: 'theme1.xml',
        attributes: {
            'xmlns:a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
            name: 'Office Theme'
        }})
        .createChildReturnChild({ nodeType: 'a:themeElements' })
        .addChild(colorScheme)
        .createChildReturnChild({ nodeType: 'a:fontScheme', attributes: { name: 'Office' }})
        .createChildReturnChild({ nodeType: 'a:majorFont' })
        .createChild({ nodeType: 'a:latin', attributes: { typeface: 'Calibri Light', panose: '020F0302020204030204' }})
        .createChild({ nodeType: 'a:ae', attributes: { typeface: '' }})
        .createChildReturnParent({ nodeType: 'a:cs', attributes: { typeface: '' }})
        .createChildReturnChild({ nodeType: 'a:minorFont' })
        .createChildReturnParent({ nodeType: 'a:latin', attributes: { typeface: 'Calibri', panose: '020F0502020204030204' }});

    return this;
};

themes.createFormatScheme = function _createFormatScheme() {
    var format = this.createXmlNode({ nodeType: 'a:fmtScheme', attributes: { name: 'Office' }})
        .createChildReturnChild({ nodeType: 'a:fillStyleLst' })
        .createChildReturnChild({ nodeType: 'a:solidFill' })
        .createChildReturnParent({ nodeType: 'a:schemeClr', attributes: { val: 'phClr' }})
        .createChildReturnChild({ nodeType: 'a:gradFill', attributes: { rotWithShape: '1' }})
        .addChild(
            this.createXmlNode({ nodeType: 'a:gsLst' })
                .addChild(this.createXmlNode({ nodeType: 'a:gs', attributes: { pos: 0 }})
                    .createChildReturnChild({ nodeType: 'a:schemeClr', attributes: { val: 'phClr' }})
                    .createChild({ nodeType: 'a:lumMod', attributes: { val: 110000 }})
                    .createChild({ nodeType: 'a:satMod', attributes: { val: 105000 }})
                    .createChild({ nodeType: 'a:tint', attributes: { val: 67000 }})
                )
                .addChild(this.createXmlNode({ nodeType: 'a:gs', attributes: { pos: 50000 }})
                    .createChildReturnChild({ nodeType: 'a:schemeClr', attributes: { val: 'phClr' }})
                    .createChild({ nodeType: 'a:lumMod', attributes: { val: 105000 }})
                    .createChild({ nodeType: 'a:satMod', attributes: { val: 103000 }})
                    .createChild({ nodeType: 'a:tint', attributes: { val: 73000 }})
                )
                .addChild(this.createXmlNode({ nodeType: 'a:gs', attributes: { pos: 100000 }})
                    .createChildReturnChild({ nodeType: 'a:schemeClr', attributes: { val: 'phClr' }})
                    .createChild({ nodeType: 'a:lumMod', attributes: { val: 105000 }})
                    .createChild({ nodeType: 'a:satMod', attributes: { val: 109000 }})
                    .createChild({ nodeType: 'a:tint', attributes: { val: 81000 }})
                )
        ).createChildReturnParent({ nodeType: 'a:lin', attributes: { ang: '5400000', scaled: '0' }})
        .addChild(this.createXmlNode({ nodeType: 'a:gradFill', attributes: { rotWithShape: '1' }})
            .addChild(
                this.createXmlNode({ nodeType: 'a:gsLst' })
                    .addChild(this.createXmlNode({ nodeType: 'a:gs', attributes: { pos: 0 }})
                        .createChildReturnChild({ nodeType: 'a:schemeClr', attributes: { val: 'phClr' }})
                        .createChild({ nodeType: 'a:satMod', attributes: { val: 103000 }})
                        .createChild({ nodeType: 'a:lumMod', attributes: { val: 102000 }})
                        .createChild({ nodeType: 'a:tint', attributes: { val: 94000 }})
                    )
                    .addChild(this.createXmlNode({ nodeType: 'a:gs', attributes: { pos: 50000 }})
                        .createChildReturnChild({ nodeType: 'a:schemeClr', attributes: { val: 'phClr' }})
                        .createChild({ nodeType: 'a:satMod', attributes: { val: 110000 }})
                        .createChild({ nodeType: 'a:lumMod', attributes: { val: 100000 }})
                        .createChild({ nodeType: 'a:tint', attributes: { val: 100000 }})
                    )
                    .addChild(this.createXmlNode({ nodeType: 'a:gs', attributes: { pos: 100000 }})
                        .createChildReturnChild({ nodeType: 'a:schemeClr', attributes: { val: 'phClr' }})
                        .createChild({ nodeType: 'a:lumMod', attributes: { val: 99000 }})
                        .createChild({ nodeType: 'a:satMod', attributes: { val: 120000 }})
                        .createChild({ nodeType: 'a:tint', attributes: { val: 78000 }})
                    )
            )
            .createChildReturnParent({ nodeType: 'a:lin', attributes: { ang: 5400000, scaled: 0 }}));
};

export { themes };