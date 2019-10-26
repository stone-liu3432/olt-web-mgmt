export default {
    name: "tableColumnSlots",
    props: {
        slots: {
            type: [Array, Function]
        },
        row: {
            type: Object,
            default: _ => ({})
        }
    },
    render(h) {
        //  普通插槽/作用域插槽
        return Array.isArray(this.slots)
            ? h("td", this.slots)
            : h("td", this.slots(this.row));
    }
};
