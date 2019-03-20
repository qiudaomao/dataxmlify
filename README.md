# xmlify

A simple xml template engine.


## Usage

npm install dataxmlify
```javascript
const xmlify = require('dataxmlify')

const xmlstr = xmlify({
xml: `
    <text>hello: {{value}}</text>
    <colortext js-if="{{colored}}">withcolor</colortext>
    <nocolortext js-else="">nocolor</nocolortext>
    <ul>
        <li js-for="{{items}}">{{index}} - {{item}}</li>
    </ul>
    <block js-for="{{[0, 1, 2]}}" js-for-index="idx" js-for-item="obj">
        <label>conditionlabel {{idx}} {{obj}}</label>
    </block>
`,
data: {
    value: "world",
    colored: false,
    items: [
        "a",
        "b",
        "c",
    ]
})
```
render result:
```xml
<text>hello: world</text>
<nocolortext></nocolortext>
<li>0 - a</li>
<li>1 - b</li>
<li>2 - c</li>
<label>conditionLabel 0 0</label>
<label>conditionLabel 1 1</label>
<label>conditionLabel 2 2</label>
```

## Feature List
### Mustache style
```xml
<text>hello: {{value}}</text>
```
with data {value: "abc"}

render result:
```xml
<text>hello: abc</text>
```

### Condition render
```xml
<tag js-if="{{false}}">ifvalue</tag>
<tag js-elif="{{false}}">elifvalue</tag>
<tag js-else="{{}}">elsevalue</tag>
```

render result `<tag>elsevalue</tag>`

### Loop render
```xml
<tag js-for={{items}}>tag-{{index}}: {{item}}</tag>
```
```javascript
{
    items: [
       "a",
       "b",
    ]
}
```

Render result
```xml
    <tag>tag-0: a</tag>
    <tag>tag-1: b</tag>
```

### fake node block
```xml
    <block>
        <label>text</label>
    <block>
```
render result:
```xml
<label>text</label>
```
