import { escape } from "./helpers";

/**
 * This is the base object to which all other excel object delegate for
 * creating themselves, adding/creating child node, and toXmlString()-ing themselves
 * @type {Object}
 */
var xmlNode = {
    /**
     * Create a new xmlNode, setting base attributes
     * @param {Object} props - A list of properties for the node
     * @returns {xmlNode}
     */
    createXmlNode: function _createXmlNode(props) {
        this.textValue = props.textValue || null;
        this.attributes = props.attributes || null;
        this.nodeType = props.nodeType;
        this.children = [];
        this.isRoot = props.isRoot || false;
        if (this.isRoot) this.fileName = props.fileName;
        this.parent = props.parent || null;
        return this;
    },
    /**
     * Adds additional attributes to an xmlNode after its creation. Will
     * overwrite any existing attributes if new attributes share the same name
     * @param {Object} attrs - A collection of attributes to add to the node
     * @returns {xmlNode}
     */
    addAttributes: function _addAttributes(attrs) {
        var newAttributes = this.attributes || {};
        for (var attr in attrs) {
            newAttributes[attr] = attrs[attr];
        }
        this.attributes = newAttributes;
        return this;
    },
    /**
     * Creates a child node of the current node and adds it to the list of children
     * @param {Object} props - The list of properties for the child node
     * @returns {xmlNode}
     */
    createChild: function _createChild(props) {
        props.parent = this;
        return this.addChild(Object.create(xmlNode).createXmlNode(props));
    },
    /**
     * Creates a child node, but returns the child node instance rather than the instance that call this function.
     * Used for chaining to create children of the child
     * @param {Object} props - The list of properties for the child node
     * @returns {xmlNode}
     */
    createChildReturnChild: function _createChildReturnChild(props) {
        props.parent = this;
        var child = Object.create(xmlNode).createXmlNode(props);
        this.addChild(child);
        return child;
    },
    createChildReturnRoot: function _createChildReturnRoot(props) {
        props.parent = this;
        this.addChild(Object.create(xmlNode).createXmlNode(props));
        var node = this;
        if (!node.isRoot && node.parent) {
            while (!node.isRoot && node.parent) {
                node = node.parent;
            }
            return node;
        }
    },
    createChildReturnParent: function _createChildReturnParent(props) {
        props.parent = this;
        this.addChild(Object.create(xmlNode).createXmlNode(props));
        return this.parent;
    },
    /**
     * Adds an xmlNode to the list of children
     * @param {xmlNode} childNode - The node to be added as a child
     * @returns {xmlNode}
     */
    addChild: function _addChild(childNode) {
        if (!xmlNode.isPrototypeOf(childNode)) return this;
        this.children.push(childNode);
        return this;
    },
    /**
     * Sets the text value for the node
     * @param {string} val - The text
     * @returns {xmlNode}
     */
    setValue: function _setTextValue(val) {
        this.textValue = val;
        return this;
    },
    /**
     * Turns the workbook into an xml string. If running in a browser that has the XMLSerializer,
     * it will prefer that method; otherwise it will just .toString() every node.
     * @returns {string} - returns the workbook as an xml string
     */
    toXml: function _toXml() {
        if (global.document && global.document.implementation) {
            var xmlDomDocument = this.toXmlDocument();
            return (new XMLSerializer()).serializeToString(xmlDomDocument);
        }
        else return this.toXmlString();
    },
    /**
     * Creates an xml string representation of the current node and all its children
     * @returns {string} - The product of the toString operation
     */
    toXmlString: function _toXmlString() {
        var string = '';
        string += '<' + this.nodeType;
        for(var attr in this.attributes) {
            string = string + ' ' + attr + '="' + escape(this.attributes[attr]) + '"';
        }

        var childContent = '';
        for(var i = 0; i < this.children.length; i++) {
            childContent += this.children[i].toXmlString();
        }

        if (this.textValue != null || childContent) string += '>' + (this.textValue || '') + childContent + '</' + this.nodeType + '>';
        else string += '/>';

        var content = string.replace(/xmlns=""/g, '');
        content = content.replace(/NS[\d]+:/g, '');
        content = content.replace(/xmlns:NS[\d]+=""/g, '');
        if (this.isRoot)
            content = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + content;

        return content;
    },
    /**
     * Creates an XML DOM Document of the current node and all its children.
     * @returns {Object} - The product of the toXmlDocument operation
     */
    toXmlDocument: function _toXmlDocument() {
        var xmlDomDocument = document.implementation.createDocument(null, null);
        xmlDomDocument.appendChild(xmlDomDocument.createProcessingInstruction('xml', 'version="1.0" encoding="UTF-8" standalone="yes"'));
        xmlDomDocument.appendChild(this.getXmlNode(xmlDomDocument));
        return xmlDomDocument;

    },
    /**
     * Creates an XML DOM Element of the current node and all its children.
     * @returns {Element} - The product of the getXmlNode operation
     */
    getXmlNode: function _getXmlNode(xmlDomDocument) {
        xmlDomDocument = xmlDomDocument || document.implementation.createDocument();
        var domNode = xmlDomDocument.createElement(this.nodeType);
        for (var attr in this.attributes) {
            domNode.setAttribute(attr, this.attributes[attr]);
        }
        if (this.textValue != null) {
            domNode.appendChild(xmlDomDocument.createTextNode(this.textValue));
        }
        for (var i = 0; i < this.children.length; i++) {
            var childNode = this.children[i].getXmlNode(xmlDomDocument);
            domNode.appendChild(childNode);
        }
        return domNode;
    }
};

export { xmlNode };