import nmsTable from "./table";
import nmsTableColumn from "./tableColumn";

export default {
    install(Vue) {
        Vue.component("nmsTable", nmsTable);
        Vue.component("nmsTableColumn", nmsTableColumn);
    }
};
