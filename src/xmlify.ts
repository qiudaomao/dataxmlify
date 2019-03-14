import {DOMParser} from "xmldom"

function renderMustache(str: string, data: any, envdata:any = null) {
    //console.log("render:: %s", str)
    let mm = str.match(/^{{.+?}}$/)
    if (mm) {
        return renderMustacheStr(str, data, envdata)
    }
    let m = str.match(/({{.+?}})/)
    while (m) {
        let ans = renderMustacheStr(m[0], data, envdata)
        str = str.replace(/{{.+?}}/, ans)
        m = str.match(/({{.+?}})/)
    }
    return str
}

function renderMustacheStr(str: string, data: any, envdata: any = null) {
    //console.log("render=> %s", str)
    let cmd = ""
    for (let key of Object.keys(data)) {
        //console.log(`let ${key}=${JSON.stringify(data[key])}`)
        cmd = `${cmd};let ${key}=${JSON.stringify(data[key])}`
        //eval(`var ${key}=${JSON.stringify(data[key])}`)
    }
    if (envdata) {
        for (let key of Object.keys(envdata)) {
            //console.log(`let ${key}=${JSON.stringify(data[key])}`)
            cmd = `${cmd};let ${key}=${JSON.stringify(envdata[key])}`
            //eval(`var ${key}=${JSON.stringify(data[key])}`)
        }
    }
    //console.log(`try running: ${cmd};${str}`)
    return eval(`${cmd};${str}`)
}

function traversalNode(node: HTMLElement, prefix: string, data: any, envStack: any[], xml: (str: string)=>void) {
    if (node.nodeType === node.TEXT_NODE) return;

    //prepare all envData
    let envData = {}
    for (let item of envStack) {
        (<any>Object).assign(envData, item)
    }

    //check js-for
    let attrs:any = {}
    for (let i=0; i<node.attributes.length; i++) {
        attrs[node.attributes[i].name] = node.attributes[i].value
    }
    // console.log("check: <%s> '%s' '%s'", node.tagName, JSON.stringify(attrs), (node.childNodes.length==1)?node.firstChild.nodeValue:"")
    if ("js-for" in attrs) {
        const forValue:any = renderMustache(attrs["js-for"], data, envData)
        let indexstr = attrs["js-for-index"] || "index"
        let itemstr = attrs["js-for-item"] || "item"
        //console.log("start js-for " + JSON.stringify(forValue))
        if (forValue instanceof Array) {
            for (let index=0; index<forValue.length; index++) {
                //console.log("start js-for %d", index)
                let value = forValue[index]
                // console.log("js-for: %s => %d %s => %s", indexstr, index, itemstr, JSON.stringify(value))
                let envItem:any = {}
                envItem[indexstr] = index
                envItem[itemstr] = value
                envStack.push(envItem);
                (<any>Object).assign(envData, envItem)
                if (calculateCondition(node, data, envData, attrs)) {
                    //render children
                    renderNode(node, prefix, data, envStack, envData, xml)
                }
                envStack.splice(-1, 1)
                // console.log("end  js-for %d", index)
            }
        }
        // console.log("end  js-for")
    } else {
        if (calculateCondition(node, data, envData, attrs)) {
            //render children
            renderNode(node, prefix, data, envStack, envData, xml)
        }
    }
}

function calculateCondition(node: HTMLElement, data: any, envData: any, attrs: any) {
    if ("js-if" in attrs) {
        let ifvalue = renderMustache(attrs["js-if"], data, envData)
        if (!ifvalue) {
            return false
        }
    } else if ("js-elif" in attrs) {
        //if
        //elif
        //elif
        let pass = true
        let ifvalue = renderMustache(attrs["js-elif"], data, envData)
        if (!ifvalue) {
            pass = false
            return false
        }
        if (typeof node.previousSibling.previousSibling === 'undefined') {
            return false
        }
        let prev:any = node.previousSibling.previousSibling
        while (prev) {
            let prevattrs:any = {}
            for (let i = 0; i < prev.attributes.length; i++) {
                prevattrs[prev.attributes[i].name] = prev.attributes[i].value
            }
            if ("js-elif" in prevattrs) {
                let pref_ifvalue = renderMustache(prevattrs["js-elif"], data, envData)
                if (pref_ifvalue) {
                    pass = false
                    break
                }
            } else if ("js-if" in prevattrs) {
                let pref_ifvalue = renderMustache(prevattrs["js-if"], data, envData)
                if (pref_ifvalue) {
                    pass = false
                    break
                }
            } else {
                console.log("error <%s> not js-elif or js-if", prev.tagName)
                pass = false
                break
            }
            prev = prev.previousSibling.previousSibling
        }
        if (!pass) {
            return false
        }
    } else if ("js-else" in attrs) {
        //if
        //elif
        //elif
        //else
        let pass = true
        if (typeof node.previousSibling.previousSibling === 'undefined') {
            return false
        }
        let prev:any = node.previousSibling.previousSibling
        while (prev) {
            let prevattrs:any = {}
            for (let i = 0; i < prev.attributes.length; i++) {
                prevattrs[prev.attributes[i].name] = prev.attributes[i].value
            }
            if ("js-elif" in prevattrs) {
                let pref_ifvalue = renderMustache(prevattrs["js-elif"], data, envData)
                if (pref_ifvalue) {
                    pass = false
                    break
                }
            } else if ("js-if" in prevattrs) {
                let pref_ifvalue = renderMustache(prevattrs["js-if"], data, envData)
                if (pref_ifvalue) {
                    pass = false
                    break
                }
            } else {
                console.log("error <%s> not js-elif or js-if", prev.tagName)
                pass = false
                return false
            }
            prev = prev.previousSibling.previousSibling
        }
        return pass
    }
    return true
}

function renderNode(node: HTMLElement, prefix: string, data: any, envStack: any[], envData: any, xml: (str: string)=>void) {
    let attributes = ""
    if (node.attributes) {
        for (let i = 0; i < node.attributes.length; i++) {
            let attr = node.attributes[i]
            if (attr.name == "js-for"
                || attr.name == "js-for-index"
                || attr.name == "js-for-item"
                || attr.name == "js-if"
                || attr.name == "js-elif"
                || attr.name == "js-else") continue
            const value = renderMustache(attr.value, data, envData)
            attributes += ` ${attr.name}="${value}"`
        }
    }
    if (node.tagName != "block") {
        if (typeof node.childNodes !== 'undefined' && node.childNodes.length > 1) {
            // console.log("render %s<%s%s>", prefix, node.tagName, attributes)
            xml(`${prefix}<${node.tagName}${attributes}>\n`)
        } else {
            let text = ""
            let hastext = false
            if (node.firstChild) {
                text = node.firstChild.nodeValue
                if (text.match(/{{.*}}/)) {
                    hastext = true
                    text = renderMustache(text, data, envData)
                } else if (text.length > 0) {
                    hastext = true
                }
            }
            // console.log("render %s<%s%s>%s</%s>", prefix, node.tagName, attributes, text, node.tagName)
            if (!hastext) {
                xml(`${prefix}<${node.tagName}${attributes}>${text}</${node.tagName}>\n`)
            } else {
                xml(`${prefix}<${node.tagName}${attributes} has-text="true">${text}</${node.tagName}>\n`)
            }
        }
    }
    //render children
    let n:any = node.firstChild
    while (n) {
        if (n.tagName != "block") {
            traversalNode(n, prefix + "   ", data, envStack, xml)
        } else {
            traversalNode(n, prefix, data, envStack, xml)
        }
        n = n.nextSibling
    }
    //render </tag>
    if (node.tagName!="block" && typeof node.childNodes !== 'undefined' && node.childNodes.length > 1) {
        // console.log("render %s</%s>", prefix, node.tagName)
        xml(`${prefix}</${node.tagName}>\n`)
    }
}

interface renderDataObject {
    xml: string;
    data: any;
}

function xmlify(data: renderDataObject) {
    const doc = new DOMParser().parseFromString(data.xml)
    let envStack: any[] = []
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
    `
    traversalNode(doc.documentElement, "", data.data, envStack, (str: string)=>{
        xml += str
    })
    return xml
}

module.exports = xmlify
