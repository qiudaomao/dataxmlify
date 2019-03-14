"use strict";
exports.__esModule = true;
var xmldom_1 = require("xmldom");
function renderMustache(str, data, envdata) {
    if (envdata === void 0) { envdata = null; }
    //console.log("render:: %s", str)
    var mm = str.match(/^{{.+?}}$/);
    if (mm) {
        return renderMustacheStr(str, data, envdata);
    }
    var m = str.match(/({{.+?}})/);
    while (m) {
        var ans = renderMustacheStr(m[0], data, envdata);
        str = str.replace(/{{.+?}}/, ans);
        m = str.match(/({{.+?}})/);
    }
    return str;
}
function renderMustacheStr(str, data, envdata) {
    if (envdata === void 0) { envdata = null; }
    //console.log("render=> %s", str)
    var cmd = "";
    for (var _i = 0, _a = Object.keys(data); _i < _a.length; _i++) {
        var key = _a[_i];
        //console.log(`let ${key}=${JSON.stringify(data[key])}`)
        cmd = cmd + ";let " + key + "=" + JSON.stringify(data[key]);
        //eval(`var ${key}=${JSON.stringify(data[key])}`)
    }
    if (envdata) {
        for (var _b = 0, _c = Object.keys(envdata); _b < _c.length; _b++) {
            var key = _c[_b];
            //console.log(`let ${key}=${JSON.stringify(data[key])}`)
            cmd = cmd + ";let " + key + "=" + JSON.stringify(envdata[key]);
            //eval(`var ${key}=${JSON.stringify(data[key])}`)
        }
    }
    //console.log(`try running: ${cmd};${str}`)
    return eval(cmd + ";" + str);
}
function traversalNode(node, prefix, data, envStack, xml) {
    if (node.nodeType === node.TEXT_NODE)
        return;
    //prepare all envData
    var envData = {};
    for (var _i = 0, envStack_1 = envStack; _i < envStack_1.length; _i++) {
        var item = envStack_1[_i];
        Object.assign(envData, item);
    }
    //check js-for
    var attrs = {};
    for (var i = 0; i < node.attributes.length; i++) {
        attrs[node.attributes[i].name] = node.attributes[i].value;
    }
    // console.log("check: <%s> '%s' '%s'", node.tagName, JSON.stringify(attrs), (node.childNodes.length==1)?node.firstChild.nodeValue:"")
    if ("js-for" in attrs) {
        var forValue = renderMustache(attrs["js-for"], data, envData);
        var indexstr = attrs["js-for-index"] || "index";
        var itemstr = attrs["js-for-item"] || "item";
        //console.log("start js-for " + JSON.stringify(forValue))
        if (forValue instanceof Array) {
            for (var index = 0; index < forValue.length; index++) {
                //console.log("start js-for %d", index)
                var value = forValue[index];
                // console.log("js-for: %s => %d %s => %s", indexstr, index, itemstr, JSON.stringify(value))
                var envItem = {};
                envItem[indexstr] = index;
                envItem[itemstr] = value;
                envStack.push(envItem);
                Object.assign(envData, envItem);
                if (calculateCondition(node, data, envData, attrs)) {
                    //render children
                    renderNode(node, prefix, data, envStack, envData, xml);
                }
                envStack.splice(-1, 1);
                // console.log("end  js-for %d", index)
            }
        }
        // console.log("end  js-for")
    }
    else {
        if (calculateCondition(node, data, envData, attrs)) {
            //render children
            renderNode(node, prefix, data, envStack, envData, xml);
        }
    }
}
function calculateCondition(node, data, envData, attrs) {
    if ("js-if" in attrs) {
        var ifvalue = renderMustache(attrs["js-if"], data, envData);
        if (!ifvalue) {
            return false;
        }
    }
    else if ("js-elif" in attrs) {
        //if
        //elif
        //elif
        var pass = true;
        var ifvalue = renderMustache(attrs["js-elif"], data, envData);
        if (!ifvalue) {
            pass = false;
            return false;
        }
        if (typeof node.previousSibling.previousSibling === 'undefined') {
            return false;
        }
        var prev = node.previousSibling.previousSibling;
        while (prev) {
            var prevattrs = {};
            for (var i = 0; i < prev.attributes.length; i++) {
                prevattrs[prev.attributes[i].name] = prev.attributes[i].value;
            }
            if ("js-elif" in prevattrs) {
                var pref_ifvalue = renderMustache(prevattrs["js-elif"], data, envData);
                if (pref_ifvalue) {
                    pass = false;
                    break;
                }
            }
            else if ("js-if" in prevattrs) {
                var pref_ifvalue = renderMustache(prevattrs["js-if"], data, envData);
                if (pref_ifvalue) {
                    pass = false;
                    break;
                }
            }
            else {
                console.log("error <%s> not js-elif or js-if", prev.tagName);
                pass = false;
                break;
            }
            prev = prev.previousSibling.previousSibling;
        }
        if (!pass) {
            return false;
        }
    }
    else if ("js-else" in attrs) {
        //if
        //elif
        //elif
        //else
        var pass = true;
        if (typeof node.previousSibling.previousSibling === 'undefined') {
            return false;
        }
        var prev = node.previousSibling.previousSibling;
        while (prev) {
            var prevattrs = {};
            for (var i = 0; i < prev.attributes.length; i++) {
                prevattrs[prev.attributes[i].name] = prev.attributes[i].value;
            }
            if ("js-elif" in prevattrs) {
                var pref_ifvalue = renderMustache(prevattrs["js-elif"], data, envData);
                if (pref_ifvalue) {
                    pass = false;
                    break;
                }
            }
            else if ("js-if" in prevattrs) {
                var pref_ifvalue = renderMustache(prevattrs["js-if"], data, envData);
                if (pref_ifvalue) {
                    pass = false;
                    break;
                }
            }
            else {
                console.log("error <%s> not js-elif or js-if", prev.tagName);
                pass = false;
                return false;
            }
            prev = prev.previousSibling.previousSibling;
        }
        return pass;
    }
    return true;
}
function renderNode(node, prefix, data, envStack, envData, xml) {
    var attributes = "";
    if (node.attributes) {
        for (var i = 0; i < node.attributes.length; i++) {
            var attr = node.attributes[i];
            if (attr.name == "js-for"
                || attr.name == "js-for-index"
                || attr.name == "js-for-item"
                || attr.name == "js-if"
                || attr.name == "js-elif"
                || attr.name == "js-else")
                continue;
            var value = renderMustache(attr.value, data, envData);
            attributes += " " + attr.name + "=\"" + value + "\"";
        }
    }
    if (node.tagName != "block") {
        if (typeof node.childNodes !== 'undefined' && node.childNodes.length > 1) {
            // console.log("render %s<%s%s>", prefix, node.tagName, attributes)
            xml(prefix + "<" + node.tagName + attributes + ">\n");
        }
        else {
            var text = "";
            var hastext = false;
            if (node.firstChild) {
                text = node.firstChild.nodeValue;
                if (text.match(/{{.*}}/)) {
                    hastext = true;
                    text = renderMustache(text, data, envData);
                }
                else if (text.length > 0) {
                    hastext = true;
                }
            }
            // console.log("render %s<%s%s>%s</%s>", prefix, node.tagName, attributes, text, node.tagName)
            if (!hastext) {
                xml(prefix + "<" + node.tagName + attributes + ">" + text + "</" + node.tagName + ">\n");
            }
            else {
                xml(prefix + "<" + node.tagName + attributes + " has-text=\"true\">" + text + "</" + node.tagName + ">\n");
            }
        }
    }
    //render children
    var n = node.firstChild;
    while (n) {
        if (n.tagName != "block") {
            traversalNode(n, prefix + "   ", data, envStack, xml);
        }
        else {
            traversalNode(n, prefix, data, envStack, xml);
        }
        n = n.nextSibling;
    }
    //render </tag>
    if (node.tagName != "block" && typeof node.childNodes !== 'undefined' && node.childNodes.length > 1) {
        // console.log("render %s</%s>", prefix, node.tagName)
        xml(prefix + "</" + node.tagName + ">\n");
    }
}
function xmlify(data) {
    var doc = new xmldom_1.DOMParser().parseFromString(data.xml);
    var envStack = [];
    var xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n    ";
    traversalNode(doc.documentElement, "", data.data, envStack, function (str) {
        xml += str;
    });
    return xml;
}
module.exports = xmlify;
