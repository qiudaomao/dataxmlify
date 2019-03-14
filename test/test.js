var xmlify = require('../lib/xmlify.js')

const str = xmlify({
    xml: `
        <view>
            <view>text Test: {{text}}</view>
            <block js-for="{{items}}" js-for-index="forIndex" js-for-item="item" js-if="{{forIndex%2==1}}">
                <block js-if="{{forIndex%2==0}}">
                    <view index="{{forIndex}}">div by 2 {{item.title}}</view>
                </block>
                <block js-elif="{{forIndex%3==0}}">
                    <view index="{{forIndex}}">div by 3 {{item.title}}</view>
                </block>
                <block js-elif="{{forIndex%5==0}}">
                    <view index="{{forIndex}}">div by 5 {{item.title}}</view>
                </block>
                <block js-else="">
                    <view index="{{forIndex}}">Others {{item.title}}</view>
                </block>
            </block>
        </view>
    `,
    data: {
        text: "hello",
        items: [
            {title: "0", value: "1"},
            {title: "1", value: "1"},
            {title: "2", value: "2"},
            {title: "3", value: "3"},
            {title: "4", value: "3"},
            {title: "5", value: "3"},
            {title: "6", value: "3"},
            {title: "7", value: "3"},
            {title: "8", value: "3"},
            {title: "9", value: "3"},
            {title: "10", value: "3"},
            {title: "11", value: "3"},
        ]
    }
})

console.log(str)
