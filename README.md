# OLT WEB 管理界面

> 基于 vue.js

> 项目原托管在[码云](https://www.gitee.com)上，后迁移至 github

目前已有组件

-   [table](#table组件)
-   [dialog](#dialog组件)
-   [loading](#loading组件)
-   [message](#message组件)
-   [notify](#notify组件)
-   [confirm](#confirm组件)
-   [popover](#popover组件)
-   [tabs](#tabs组件)

## table 组件

#### table props

| 参数        | 说明                                                                  | 类型                           | 可选值 | 默认值    |
| :---------- | :-------------------------------------------------------------------- | :----------------------------- | :----- | :-------- |
| rows        | 显示的数据                                                            | array                          | --     | []        |
| border      | 是否显示边框                                                          | boolean                        | --     | false     |
| stripe      | 是否隔行变色(斑马纹)                                                  | boolean                        | --     | false     |
| empty-text  | 数据为空时显示的文字,也可以通过 slot="empty"来设置                    | string                         | --     | "No data" |
| row-style   | 行的 style 回调，传入 object 时，为所有行设置一样的 style             | object,function(row, rowIndex) | --     | --        |
| row-class   | 行的 className 回调，传入 string 时，为所有行添加一个固定的 className | string,function(row, rowIndex) | --     | --        |
| show-header | 是否显示表头                                                          | boolean                        | --     | true      |
| draggable   | 是否允许行拖拽排序                                                    | boolean                        | --     | false     |

#### table Events

| 事件名           | 说明                                          | 参数                                |
| :--------------- | :-------------------------------------------- | :---------------------------------- |
| sort-change      | 数组排序改变时触发                            | 排序后的数组                        |
| select           | type="selection"并且选择某一项时触发          | 当前所有已选择项,当前选择项         |
| selection-change | type="selection"并且选中或反选某项时触发      | 当前所有已选择项                    |
| select-all       | type="selection"并且点击表头选择项时触发      | 当前所有已选择项                    |
| expand-change    | type="expand"并且点击打开或折叠 expand 时触发 | 当前打开或折叠的项,当前所有打开的项 |
| draggable        | 拖拽时触发                                    | 被拖拽的项的 index,目标项的 index   |

#### table slots

| name  | 说明                 |
| :---- | :------------------- |
| empty | 数据为空时显示的内容 |

#### table-column props

| 参数        | 说明                                                                      | 类型                                         | 可选值                                                  | 默认值                            |
| :---------- | :------------------------------------------------------------------------ | :------------------------------------------- | :------------------------------------------------------ | :-------------------------------- |
| prop        | 列对应的字段名                                                            | string                                       | --                                                      | --                                |
| label       | 列在表头显示的标题                                                        | string                                       | --                                                      | --                                |
| formatter   | 格式化当前列的内容                                                        | function(row, colIndex, cellValue, rowIndex) | --                                                      | --                                |
| cell-style  | 列的 style 回调，传入 object 时，为所有行的当前列设置一样的 style         | object,function(row, colIndex)               | --                                                      | --                                |
| cell-class  | 列的 className 回调，传入 string 时，为所有当前列添加一个固定的 className | string                                       | function(row, colIndex)                                 | --                                | -- |
| type        | 表格类型                                                                  | string                                       | selection, index, expand                                | --                                | -- |
| index       | 行的 index,配合 type="index"使用                                          | number,function(index)                       | --                                                      | --                                |
| sortable    | 是否允许排序                                                              | boolean                                      | --                                                      | false                             |
| sort-method | 自定义的排序回调,与 Array.sort 表现一致                                   | function(a, b)                               | --                                                      | --                                |
| sort-by     | 自定义排序列字段,在传入 sort-method 时无效                                | string                                       | --                                                      | --                                |
| sort-orders | 数据在排序时所使用排序策略的轮转顺序，仅当 sortable 为 true 时有效。      | array                                        | ascending: 升序，descending: 降序，null: 还原为原始顺序 | ['ascending', 'descending', null] |

#### table-column slot

| name    | 说明                                         |
| :------ | :------------------------------------------- |
| default | 自定义列显示的内容，参数为 row(当前行的数据) |

## dialog 组件

| 参数         | 说明                                      | 类型                                               | 可选值 | 默认值 |
| :----------- | :---------------------------------------- | :------------------------------------------------- | :----- | :----- |
| visible      | 是否显示 dialog，支持.sync 修饰符         | boolean                                            | --     | false  |
| width        | dialog 的内容区的宽度                     | string                                             | --     | --     |
| title        | dialog 的标题，也可通过 slot="title"传入  | string                                             | --     | --     |
| show-close   | 是否显示关闭按钮                          | boolean                                            | --     | true   |
| before-close | dialog 关闭前的回调，会暂停 dialog 的关闭 | function(done)，要关闭 dialog，必须显式调用 done() | --     | --     |
| custom-class | dialog 的自定义 className                 | string                                             | --     | --     |

## loading 组件

-   目前只支持服务方式调用, vm.\$loading()，暂未支持参数配置

## message 组件

### options 选项

| 参数     | 说明                                          | 类型   | 可选值                     | 默认值 |
| :------- | :-------------------------------------------- | :----- | :------------------------- | :----- |
| text     | 要显示的消息主体                              | string | --                         | --     |
| type     | 消息类型                                      | string | success,info,warning,error | info   |
| duration | 消息自动关闭的时间(ms)，为 0 时表示不自动关闭 | number | --                         | 4000   |

-   目前支持服务方式调用，vm.$message(options)，也提供快捷调用方式vm.$message.success(text)...

## notify 组件

### options 选项

| 参数           | 说明               | 类型     | 可选值                                      | 默认值       |
| :------------- | :----------------- | :------- | :------------------------------------------ | :----------- |
| title          | 组件的标题         | string   | --                                          | --           |
| type           | 组件的类型         | string   | success,info,warning,error                  | info         |
| message        | 消息主体           | string   | --                                          | --           |
| duration       | 消息自动关闭的时间 | number   | --                                          | --           |
| position       | 消息弹出的位置     | string   | top-left,top-right,bottom-left,bottom-right | bottom-right |
| cnclick        | 消息点击处理事件   | function | --                                          | --           |
| onclose        | 关闭前的处理回调   | function | --                                          | --           |
| verticalOffset | 垂直偏移量         | number   | --                                          | --           |

-   目前支持服务方式调用，vm.$notify(options)，支持快捷调用方式vm.$message.success(message)

## confirm 组件

### options 选项

| 参数           | 说明         | 类型   | 可选值 | 默认值           |
| :------------- | :----------- | :----- | :----- | :--------------- |
| content        | 消息主体     | string | --     | "Please confirm" |
| title          | 消息标题     | string | --     | "Notification"   |
| confirmBtnText | 确认按钮文字 | string | --     | ok               |
| cancenBtnText  | 取消按钮文字 | string | --     | cancel           |

-   提供服务方式调用，vm.\$confirm(options)

## popover 组件

### options 选项

| 参数      | 说明                             | 类型    | 可选值                                                                                                                            | 默认值       |
| :-------- | :------------------------------- | :------ | :-------------------------------------------------------------------------------------------------------------------------------- | :----------- |
| position  | popover 出现的位置               | object  | --                                                                                                                                | {x: 0, y: 0} |
| visible   | 控制 popover 显示隐藏            | boolean | true, false                                                                                                                       | false        |
| width     | popover 的宽度                   | string  | --                                                                                                                                | 150px        |
| placement | 控制小箭头的显示方位，默认不显示 | string  | "top","top-start","top-end","bottom","bottom-start","bottom-end","left","left-start","left-end","right","right-start","right-end" | ''           |

## tabs 组件

| 参数       | 说明                  | 类型   | 可选值     | 默认值 |
| :--------- | :-------------------- | :----- | :--------- | :----- |
| tab        | tabs 要显示的项的数组 | array  | --         | []     |
| v-model    | 当前显示项            | --     | --         | --     |
| show_index | 当前显示项            | string | tab 第一项 | --     |

#### tabs Events

| 事件名     | 说明                       | 参数         |
| :--------- | :------------------------- | :----------- |
| togglePage | 当前 tabs 焦点项切换时触发 | 当前的焦点项 |
