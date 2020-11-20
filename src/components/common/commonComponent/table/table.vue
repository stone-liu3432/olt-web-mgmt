<script>
import tableColumnSlot from "./tableSlots";
import { removeItem } from "@/utils/common";
import nmsSortIcon from "../svg/sort";
import { isFunction } from "../../../../utils/common";
export default {
    name: "nmsTable",
    components: { tableColumnSlot, nmsSortIcon },
    props: {
        border: {
            type: Boolean,
            default: false,
        },
        stripe: {
            type: Boolean,
            default: false,
        },
        rows: {
            type: Array,
            default: (_) => [],
        },
        emptyText: {
            type: String,
            default: "No data",
        },
        rowStyle: {
            type: [Function, Object],
            default: (_) => ({}),
        },
        rowClass: {
            type: [Function, String],
            default: "",
        },
        showHeader: {
            type: Boolean,
            default: true,
        },
        draggable: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        type() {
            const row = this.columns.filter((item) => !!item.type);
            return row.length ? row[0].type : "";
        },
        typeIndex() {
            const row = this.columns.filter((item) => !!item.type);
            return this.columns.indexOf(row[0]);
        },
    },
    data() {
        return {
            cusIndex: 1,
            expandedRows: [],
            columns: [],
            colIndex: 0,
            selections: [],
            selectAll: false,
            dragRow: null,
            targetRow: null,
            tableRows: [],
            cacheRows: [],
        };
    },
    provide() {
        return {
            commit: this.commitData,
        };
    },
    created() {
        this.tableRows = this.rows;
        this.cacheRows = this.rows.slice(0);
    },
    methods: {
        commitData(col) {
            !this.columns.includes(col) && this.columns.push(col);
        },
        setRowStyle(row, rowIndex) {
            const rowStyle = this.rowStyle;
            if (typeof rowStyle === "function") {
                return rowStyle(row, rowIndex);
            }
            return rowStyle;
        },
        setRowClass(row, rowIndex) {
            const rowClass = this.rowClass;
            if (typeof rowClass === "function") {
                return rowClass(row, rowIndex);
            }
            return rowClass;
        },
        setCellStyle(row, col, colIndex) {
            const cellStyle = row.cellStyle;
            if (typeof cellStyle === "function") {
                return cellStyle(col, colIndex);
            }
            return cellStyle;
        },
        setCellClass(row, col, colIndex) {
            const cellClass = row.cellClass;
            if (typeof cellClass === "function") {
                return cellClass(col, colIndex);
            }
            return cellClass;
        },
        computedIndex(index) {
            if (typeof this.cusIndex === "number") {
                return this.cusIndex + index;
            }
            return this.cusIndex.call(this, index);
        },
        expandClick(row) {
            if (this.expandedRows.includes(row)) {
                removeItem(this.expandedRows, row);
            } else {
                this.expandedRows.push(row);
            }
            this.$emit("expand-change", row, this.expandedRows);
        },
        clearSelection() {
            this.selectAll = false;
            this.selections = [];
        },
        dragStart(e, row) {
            e.stopPropagation();
            // firefox
            e.dataTransfer.setData("text", " ");
            e.dataTransfer.effectAllowed = "move";
            this.dragRow = row;
        },
        dragEnd(e, row) {
            e.stopPropagation();
            if (this.targetRow === this.dragRow) {
                return;
            }
            this.$emit(
                "draggable",
                this.tableRows.indexOf(this.dragRow),
                this.tableRows.indexOf(this.targetRow)
            );
        },
        dragEnter(e, row) {
            e.stopPropagation();
            if (this.targetRow === e.target) {
                return;
            }
            e.dataTransfer.dropEffect = "move";
            this.targetRow = row;
        },
        dragLeave(e, row) {
            e.stopPropagation();
        },
        dragOver(e, row) {
            e.stopPropagation();
            e.dataTransfer.dropEffect = "move";
        },
        sortRows(row) {
            if (typeof row.sortMethod === "function") {
                this.tableRows.sort(row.sortMethod);
                this.$emit("sort-change", this.tableRows);
                return;
            }
            if (row.sortBy) {
                const sortMethods = {
                    ascending(a, b) {
                        return a[row.sortBy] - b[row.sortBy];
                    },
                    descending(a, b) {
                        return b[row.sortBy] - a[row.sortBy];
                    },
                };
                const func = sortMethods[row.sortOrders[row.sortFlags]];
                if (typeof func === "function") {
                    this.tableRows.sort(func);
                }
                if (row.sortOrders[row.sortFlags] === null) {
                    this.tableRows = this.cacheRows.slice(0);
                }
                row.sortFlags += 1;
                if (row.sortFlags >= row.sortOrders.length) {
                    row.sortFlags = 0;
                }
                this.$emit(
                    "sort-change",
                    this.tableRows,
                    row.sortBy,
                    row.sortOrders[row.sortFlags]
                );
            }
        },
    },
    render(h) {
        const emptySlot = () => {
            return (
                <tr>
                    <td
                        colspan={this.columns.length}
                        style="padding: 12px; color: #666; font-weight: 600;"
                    >
                        {this.$slots.empty || this.emptyText}
                    </td>
                </tr>
            );
        };
        const generateRowHeader = (row, index) => {
            const type = this.type;
            if (!type) {
                return null;
            }
            if (type === "selection") {
                return (
                    <td>
                        <input
                            type="checkbox"
                            value={index}
                            checked={this.selections.includes(row)}
                            onChange={(e) => {
                                const val = e.target.checked;
                                val
                                    ? this.selections.includes(row)
                                        ? ""
                                        : this.selections.push(row)
                                    : removeItem(this.selections, row);
                                if (
                                    this.selections.length ===
                                    this.tableRows.length
                                ) {
                                    this.selectAll = true;
                                } else {
                                    this.selectAll = false;
                                }
                                this.$emit("select", this.selections, row);
                                this.$emit("selection-change", this.selections);
                            }}
                        />
                    </td>
                );
            } else if (type === "expand") {
                return (
                    <td
                        class={[
                            "table-expand-icon",
                            {
                                "table-expanded-row": this.expandedRows.includes(
                                    row
                                ),
                            },
                        ]}
                        onClick={() => this.expandClick(row)}
                    >
                        <svg
                            viewBox="0 0 1024 1024"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                        >
                            <path
                                d="M384 349.866667l166.4 166.4L384 682.666667a41.258667 41.258667 0 0 0 0 59.733333 41.258667 41.258667 0 0 0 59.733333 0l196.266667-196.266667a41.258667 41.258667 0 0 0 0-59.733333l-196.266667-196.266667A42.24 42.24 0 1 0 384 349.866667z"
                                fill="#707070"
                            />
                        </svg>
                    </td>
                );
            } else {
                return <td>{this.computedIndex(index)}</td>;
            }
        };
        const generateRows = (row, index) => {
            const cols = this.columns.filter((item) => item.type !== "");
            return cols.map((col, colIndex) => {
                if (col.type) {
                    if (col.type === "index") {
                        this.cusIndex = col.index;
                    }
                    return null;
                }
                const _style = this.setCellStyle(col, row, colIndex),
                    _class = this.setCellClass(col, row, colIndex);
                if (!col.slots && !col.scopedSlots) {
                    return (
                        <td style={_style} class={_class}>
                            {col.formatters
                                ? col.formatters(
                                      row,
                                      col.prop || undefined,
                                      row[col.prop] || undefined,
                                      index
                                  )
                                : row[col.prop]}
                        </td>
                    );
                } else {
                    return (
                        <table-column-slot
                            slots={col.slots || col.scopedSlots}
                            row={row}
                            style={_style}
                            class={_class}
                        ></table-column-slot>
                    );
                }
            });
        };
        const generateExpandRow = (row, index) => {
            if (this.type !== "expand") {
                return null;
            }
            return this.columns.map((item) => {
                if (!item.type || !this.expandedRows.includes(row)) {
                    return null;
                }
                return (
                    <tr class="table-expand-content">
                        <td colspan={this.columns.length}>
                            {typeof item.expand === "function"
                                ? item.expand.call(this, row)
                                : item.expand}
                        </td>
                    </tr>
                );
            });
        };
        const generateTbody = () => {
            return this.tableRows.map((row, index) => {
                return [
                    <tr
                        style={this.setRowStyle(row, index)}
                        class={this.setRowClass(row, index)}
                        draggable={this.draggable}
                        onDragstart={(e) =>
                            this.draggable && this.dragStart(e, row)
                        }
                        onDragend={(e) =>
                            this.draggable && this.dragEnd(e, row)
                        }
                        onDragenter={(e) =>
                            this.draggable && this.dragEnter(e, row)
                        }
                        onDragleave={(e) =>
                            this.draggable && this.dragLeave(e, row)
                        }
                        onDragOner={(e) =>
                            this.draggable && this.dragOver(e, row)
                        }
                    >
                        {generateRowHeader(row, index)}
                        {generateRows(row, index)}
                    </tr>,
                    generateExpandRow(row, index),
                ];
            });
        };
        const generateThead = () => {
            if (!this.showHeader) {
                return null;
            }
            const res = [];
            if (this.type) {
                this.type === "selection"
                    ? res.push(
                          <th width="50px">
                              <input
                                  type="checkbox"
                                  checked={this.selectAll}
                                  onChange={(e) => {
                                      const val = e.target.checked;
                                      this.selectAll = val;
                                      if (val) {
                                          this.tableRows.forEach(
                                              (item, index) => {
                                                  !this.selections.includes(
                                                      item
                                                  ) &&
                                                      this.selections.push(
                                                          item
                                                      );
                                              }
                                          );
                                      } else {
                                          this.selections = [];
                                      }
                                      // 手动触发全选/反选时触发事件
                                      this.$emit("select-all", this.selections);
                                      this.$emit(
                                          "selection-change",
                                          this.selections
                                      );
                                  }}
                              />
                          </th>
                      )
                    : this.type === "index"
                    ? res.push(
                          <th>
                              {this.columns.filter(
                                  (item) => item.type === "index"
                              )[0].label || ""}
                          </th>
                      )
                    : res.push(<th></th>);
            }
            const cols = this.columns.filter((item) => item.type !== "");
            res.push.apply(
                res,
                cols.map((item) => {
                    return item.type ? null : (
                        <th
                            style={{
                                cursor: item.sortable ? "pointer" : "",
                                userSelect: item.sortable ? "none" : "",
                                ...item.headerStyle,
                            }}
                            onClick={(e) =>
                                item.sortable && this.sortRows(item)
                            }
                        >
                            {item.header ||
                                (item.label === undefined ? "" : item.label)}
                            {item.sortable && <nms-sort-icon></nms-sort-icon>}
                        </th>
                    );
                })
            );
            return res;
        };
        return (
            <table
                class={{
                    "has-border": this.border,
                    "has-stripe": this.stripe,
                }}
            >
                <thead>{generateThead()}</thead>
                {this.$slots.default}
                <tbody>
                    {this.tableRows.length ? generateTbody() : emptySlot()}
                </tbody>
            </table>
        );
    },
    watch: {
        rows() {
            this.tableRows = this.rows;
            this.cacheRows = this.rows.slice(0);
        },
    },
};
</script>

<style lang="less" scoped>
table {
    margin: 20px 10px;
    width: calc(~"100% - 20px");
    text-align: center;
}
.has-border {
    border: 1px solid @tableBorderColor;
    td,
    th {
        border: 1px solid @tableBorderColor;
    }
}
.has-stripe {
    tr:nth-child(even) {
        background: @stripeTableBgColor;
    }
}
td {
    padding: 6px 12px;
    word-break: break-word;
    box-sizing: border-box;
}
th {
    text-align: center;
    padding: 6px 12px;
    background: @tableHeaderBgColor;
    color: @tableHeaderColor;
    box-sizing: border-box;
}
tr:hover {
    background: @hoverTableBgColor;
}
.table-expand-icon {
    cursor: pointer;
    svg {
        transition: all 0.2s linear;
    }
}
.table-expand-content {
    &:hover {
        background-color: transparent;
    }
    > td {
        padding: 12px;
    }
}
.table-expanded-row {
    svg {
        transform: rotate(90deg);
    }
}
</style>