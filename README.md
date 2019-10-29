# OLT WEB管理界面

> 基于vue.js

> 项目原托管在[码云](https://www.gitee.com)上，后迁移至github

目前已有组件
- [table](#table props)
- [dialog](#dialog组件)
- [loading](#loading组件)
- [message](#message组件)
- [notify](#notify组件)
- [confirm](#confirm组件)

## table组件

#### table props
|参数|说明|类型|可选值|默认值|
|:---|:---|:---|:---|:---|
|row|显示的数据|array|--|[]|
|border|是否显示边框|boolean|--|false|
|stripe|是否隔行变色(斑马纹)|boolean|--|false|
|empty-text|数据为空时显示的文字,也可以通过slot="empty"来设置|string|--|"No data"|
|row-style|行的style回调，传入object时，为所有行设置一样的style|object,function(row, rowIndex)|--|--|
|row-class|行的className回调，传入string时，为所有行添加一个固定的className|string,function(row, rowIndex)|--|--|

#### table slots
|name|说明|
|:---|:---|
|empty|数据为空时显示的内容|

#### table-column props
|参数|说明|类型|可选值|默认值|
|:---|:---|:---|:---|:---|
|prop|列对应的字段名|string|--|--|
|label|列在表头显示的标题|string|--|--|
|formatter|格式化当前列的内容|function(row, colIndex, cellValue, rowIndex)|--|--|
|cell-style|列的style回调，传入object时，为所有行的当前列设置一样的style|object,function(row, colIndex)|--|--|
|cell-class|列的className回调，传入string时，为所有当前列添加一个固定的className|string|function(row, colIndex)|--|--|

#### table-column slot
|name|说明|
|:---|:---|
|default|自定义列显示的内容，参数为row(当前行的数据)|

## dialog组件
|参数|说明|类型|可选值|默认值|
|:---|:---|:---|:---|:---|
|visible|是否显示dialog，支持.sync修饰符|boolean|--|false|
|title|dialog的标题，也可通过slot="title"传入|string|--|--|
|show-close|是否显示关闭按钮|boolean|--|true|
|before-close|dialog关闭前的回调，会暂停dialog的关闭|function(done)，要关闭dialog，必须显式调用done()|--|--|
|custom-class|dialog的自定义className|string|--|--|

## loading组件
- 目前只支持服务方式调用, vm.$loading()，暂未支持参数配置

## message组件
### options选项
|参数|说明|类型|可选值|默认值|
|:---|:---|:---|:---|:---|
|text|要显示的消息主体|string|--|--|
|type|消息类型|string|success,info,warning,error|info|
|duration|消息自动关闭的时间(ms)，为0时表示不自动关闭|number|--|4000|
- 目前支持服务方式调用，vm.$message(options)，也提供快捷调用方式vm.$message.success(text)...

## notify组件
### options选项
|参数|说明|类型|可选值|默认值|
|:---|:---|:---|:---|:---|
|title|组件的标题|string|--|--|
|type|组件的类型|string|success,info,warning,error|info|
|message|消息主体|string|--|--|
|duration|消息自动关闭的时间|number|--|--|
|position|消息弹出的位置|string|top-left,top-right,bottom-left,bottom-right|bottom-right|
|cnclick|消息点击处理事件|function|--|--|
|onclose|关闭前的处理回调|function|--|--|
|verticalOffset|垂直偏移量|number|--|--|
- 目前支持服务方式调用，vm.$notify(options)，支持快捷调用方式vm.$message.success(message)

## confirm组件
### options选项
|参数|说明|类型|可选值|默认值|
|:---|:---|:---|:---|:---|
|content|消息主体|string|--|"Please confirm"|
|title|消息标题|string|--|"Notification"|
|confirmBtnText|确认按钮文字|string|--|ok|
|cancenBtnText|取消按钮文字|string|--|cancel|
- 提供服务方式调用，vm.$confirm(options)