import { xmlNode } from './excel_exporter_es6';

var colors = [ '44546A', 'E7E6E6', '4472C4', 'ED7D31', 'A5A5A5', 'FFC000', '5B9BD5', '70AD47', '0563C1', '954F72' ];

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

/*
<a:dk1>
    <a:sysClr val="windowText" lastClr="000000"/>
</a:dk1>
<a:lt1>
    <a:sysClr val="window" lastClr="FFFFFF"/>
</a:lt1>
<a:dk2>
    <a:srgbClr val="44546A"/>
</a:dk2>
<a:lt2>
    <a:srgbClr val="E7E6E6"/>
</a:lt2>
<a:accent1>
    <a:srgbClr val="4472C4"/>
</a:accent1>
<a:accent2>
    <a:srgbClr val="ED7D31"/>
</a:accent2>
<a:accent3>
    <a:srgbClr val="A5A5A5"/>
</a:accent3>
<a:accent4>
    <a:srgbClr val="FFC000"/>
</a:accent4>
<a:accent5>
    <a:srgbClr val="5B9BD5"/>
</a:accent5>
<a:accent6>
    <a:srgbClr val="70AD47"/>
</a:accent6>
<a:hlink>
    <a:srgbClr val="0563C1"/>
</a:hlink>
<a:folHlink>
    <a:srgbClr val="954F72"/>
</a:folHlink>
 */

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
        .createChildReturnChild({ nodeType: 'a:gradFill', attributes: { rotWithShape: '1' }})
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
        );



                /*
                .createChildReturnChild({ nodeType: 'a:gs' })
                .addChild(this.createXmlNode({ nodeType: 'a:schemeClr', attributes: { val: 'phClr' }})
                    .createChild({ nodeType: 'a:lumMod', attributes: { val: 110000 }})
                    .createChild({ nodeType: 'a:satMod', attributes: { val: 105000 }})
                    .createChild({ nodeType: 'a:tint', attributes: { val: 67000 }})
                ).addChild(this.createXmlNode({ nodeType: 'a:gs', attributes: { pos: 50000 }})
                    .createChildReturnChild({ nodeType: 'a:schemeClr', attributes: { val: 'phClr' }})
                    .createChild({ nodeType: 'a:lumNod', attributes: { val: 105000 }})
                    .createChild({ nodeType: 'a:satMod', attributes: { val: 103000 }})
                    .createChild({ nodeType: 'a:tint', attributes: { val: 73000 }})
            ).addChild(this.createXmlNode({ nodeType: 'a:gs'})
                .createChildReturnChild({ nodeType: 'a:schemeClr', attributes: { val: 'phClr' }})
                .createChild({ nodeType: 'a:lumMod', attributes: { val: 105000 }})
                .createChild({ nodeType: 'a:satMod', attributes: { val: 109000 }})
                .createChild({ nodeType: 'a:tint', attributes: { val: 73000 }})
            )
        ).createChild({ nodeType: 'a:lin', attributes: { ang: 5400000, scaled: 0 }})




        .addChild(this.createXmlNode({ nodeType: ''}))


        .createChildReturnChild({ nodeType: 'a:gsList' })


        .createChildReturnChild({ nodeType: 'ags:' })
        .createChildReturnChild({ nodeType: 'a:schemeClr', attributes: { val: 'phClr' }})
        .createChild({ nodeType: 'a:lumMod', attributes: { val: 110000 }})
        .createChild({ nodeType: 'a:satMod', attributes: { val: 105000 }})
        .createChild({ nodeType: 'a:tint', attributes: { val: 67000 }});
        */
};