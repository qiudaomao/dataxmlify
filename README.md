# xmlify

A simple xml template engine.


## Usage

npm install xmlify
```javascript
const xmlify = require('xmlify')

const xmlstr = xmlify({
xml: `
    <text>hello: {{value}}</text>
    <colortext js-if="{{colored}}">withcolor</colortext>
    <nocolortext js-else="">nocolor</nocolortext>
`,
data: {
    value: "world",
    colored: false
})
```
render result:
```xml
<text>hello: world</text>
<nocolortext></nocolortext>
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
<tag js-for{{items}}>tag-{{index}}: {{item}}</tag>
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
