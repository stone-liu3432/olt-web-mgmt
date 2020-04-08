<script>
import tableColumnSlot from "./tableSlots";
import { removeItem } from "@/utils/common";
export default {
    name: "nmsTable",
    components: { tableColumnSlot },
    props: {
        border: {
            type: Boolean,
            default: false
        },
        stripe: {
            type: Boolean,
            default: false
        },
        rows: {
            type: Array,
            default: _ => []
        },
        emptyText: {
            type: String,
            default: "No data"
        },
        rowStyle: {
            type: [Function, Object],
            default: _ => ({})
        },
        rowClass: {
            type: [Function, String],
            default: ""
        },
        showHeader: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            type: "",
            cusIndex: 1,
            expandedRows: [],
            columns: [],
            colIndex: 0,
            selections: [],
            selectAll: false
        };
    },
    provide() {
        return {
            commit: this.commitData
        };
    },
    methods: {
        commitData(col) {
            !this.columns.includes(col) && this.columns.push(col);
            if (col.type) {
                this.type = col.type;
            }
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
        setCellStyle(row, cell) {
            const cellStyle = row.cellStyle;
            if (typeof cellStyle === "function") {
                return cellStyle(row, cell);
            }
            return cellStyle;
        },
        setCellClass(row, cell) {
            const cellClass = row.cellClass;
            if (typeof cellClass === "function") {
                return cellClass(row, cell);
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
        }
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
                            checked={this.selections.includes(index)}
                            onChange={e => {
                                const val = e.target.checked;
                                val
                                    ? this.selections.includes(index)
                                        ? ""
                                        : this.selections.push(index)
                                    : removeItem(this.selections, index);
                                if (
                                    this.selections.length === this.rows.length
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
                                )
                            }
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
            return this.columns.map((col, colIndex) => {
                if (col.type) {
                    if (col.type === "index") {
                        this.cusIndex = col.index;
                    }
                    return null;
                }
                if (!col.slots && !col.scopedSlots) {
                    return (
                        <td style={this.setCellStyle(row, colIndex)}>
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
                            style={this.setCellStyle(row, colIndex)}
                        ></table-column-slot>
                    );
                }
            });
        };
        const generateExpandRow = (row, index) => {
            if (this.type !== "expand") {
                return null;
            }
            return this.columns.map(item => {
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
            return this.rows.map((row, index) => {
                return [
                    <tr
                        style={this.setRowStyle(row, index)}
                        class={this.setRowClass(row, index)}
                    >
                        {generateRowHeader(row, index)}
                        {generateRows(row, index)}
                    </tr>,
                    generateExpandRow(row, index)
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
                          <th>
                              <input
                                  type="checkbox"
                                  checked={this.selectAll}
                                  onChange={e => {
                                      const val = e.target.checked;
                                      this.selectAll = val;
                                      if (val) {
                                          this.rows.forEach((item, index) => {
                                              !this.selections.includes(
                                                  index
                                              ) && this.selections.push(index);
                                          });
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
                    : res.push(<th></th>);
            }
            res.push(
                this.columns.map(item => {
                    return item.type ? null : (
                        <th style={item.headerStyle}>
                            {item.label === undefined ? "" : item.label}
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
                    "has-stripe": this.stripe
                }}
            >
                <thead>{generateThead()}</thead>
                {this.$slots.default}
                <tbody>
                    {this.rows.length ? generateTbody() : emptySlot()}
                </tbody>
            </table>
        );
    }
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