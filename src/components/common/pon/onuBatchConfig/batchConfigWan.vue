<template>
    <div>
        <nms-table :rows="wanList" border>
            <nms-table-column :label="lanMap['onu_id']">
                <template slot-scope="rows">{{
                    `${rows.port_id}/${rows.onu_id}`
                }}</template>
            </nms-table-column>
            <nms-table-column
                :label="lanMap['name']"
                prop="onu_name"
            ></nms-table-column>
            <nms-table-column
                prop="macaddr"
                :label="lanMap['macaddr']"
            ></nms-table-column>
            <nms-table-column prop="status" :label="lanMap['status']">
                <template slot-scope="rows">{{
                    rows.status ? lanMap["online"] : lanMap["offline"]
                }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['wan_count']">
                <template slot-scope="rows">{{
                    `${rows.count}/${rows.wanmax}`
                }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['vlan_id']">
                <template slot-scope="rows">{{
                    rows.wan0 ? rows.wan0.vlan_id || "-" : "-"
                }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['ipmode']">
                <template slot-scope="rows">{{
                    rows.wan0 ? ipmodes[rows.wan0.ipmode] || "-" : "-"
                }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['ctype']">
                <template slot-scope="rows">{{
                    rows.wan0 ? ctypes[rows.wan0.ctype] || "-" : "-"
                }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['desc']">
                <template slot-scope="rows">{{
                    rows.wan0 ? rows.wan0.desc || "-" : "-"
                }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['config']">
                <template slot-scope="rows">
                    <a
                        href="javascript: void(0);"
                        class="btn-text"
                        @click="openDialog(rows)"
                        >{{ lanMap["detail"] }}</a
                    >
                </template>
            </nms-table-column>
        </nms-table>
        <nms-dialog :visible.sync="visible">
            <div slot="title">{{ lanMap["detail"] }}</div>
            <onu-wan-config
                :port-data="portData"
                style="height: 600px"
            ></onu-wan-config>
        </nms-dialog>
        <!-- <nms-dialog :visible.sync="batchVisible" width="660px">
            <div slot="title">{{ lanMap['config'] + lanMap['all'] }}</div>
            <wan-form ref="wan-form"></wan-form>
            <div slot="footer">
                <nms-button @click="submitBatch('wan-form')">{{ lanMap['apply'] }}</nms-button>
                <nms-button @click="batchVisible = false;">{{ lanMap['cancel'] }}</nms-button>
            </div>
        </nms-dialog>-->
    </div>
</template>

<script>
import { mapState } from "vuex";
import onuWanConfig from "./onuWanConfig";
// import wanForm from "./wanForm";
export default {
    name: "batchWan",
    components: { onuWanConfig /* wanForm */ },
    computed: {
        ...mapState(["lanMap"]),
    },
    props: {
        portid: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            wanList: [],
            visible: false,
            portData: {},
            ipmodes: ["Static IP", "DHCP", "PPPoE", "Bridge"],
            ctypes: {
                0x1: "TR069",
                0x2: "INTERNET",
                0x4: "Other",
                0x8: "VOICE",
            },
            batchVisible: false,
        };
    },
    created() {
        if (this.portid) {
            this.getData(this.portid);
        }
    },
    // mounted() {
    //     this.wanList = Array.from({ length: 30 }).map((item, index) => {
    //         return {
    //             port_id: 1,
    //             onu_id: index + 1,
    //             onu_name: "sadfas",
    //             macaddr: "38:3a:21:20:10:11",
    //             status: 1,
    //             count: 0,
    //             wanmax: 2,
    //             lanports: 4,
    //             wlan: 2,
    //             voip: 2,
    //             wan0: {
    //                 vlan_id: 100,
    //                 ipmode: 1,
    //                 ctype: 2,
    //                 desc: "123"
    //             }
    //         };
    //     });
    // },
    methods: {
        getData(port_id) {
            this.wanList = [];
            this.$http
                .get("/onumgmt", { params: { form: "wantab", port_id } })
                .then((res) => {
                    if (res.data.code === 1) {
                        if (res.data.data && res.data.data.length) {
                            this.wanList = res.data.data;
                        }
                    }
                })
                .catch((err) => {});
        },
        openDialog(row) {
            this.portData = {
                portid: row.port_id,
                onuid: row.onu_id,
                geports: row.lanports,
                wlan: row.wlan,
                voip: row.voip,
            };
            this.visible = true;
        },
        openBatchDialog() {
            this.batchVisible = true;
        },
        submitBatch(formName) {
            const loading = this.$loading();
            this.$refs[formName].validate((form) => {
                this.$http
                    .post("/ponmgmt?form=wan", {
                        method: "add",
                        param: {
                            port_id: this.portid,
                            onu_id: 0,
                            name: form.name,
                            index: -1,
                            ipmode: form.ipmode,
                            ctype: form.ctype,
                            mtu: form.mtu,
                            igmpproxy: form.igmpproxy,
                            ipproto: form.ipproto,
                            ipaddr: form.ipaddr,
                            ipmask: form.ipmask,
                            gateway: form.gateway,
                            pppoemode: form.pppoemode,
                            user: form.user,
                            password: form.password,
                            tagmode: form.tagmode,
                            vlan_id: form.vlan_id,
                            reqdns: form.reqdns,
                            pridns: form.pridns,
                            secdns: form.secdns,
                            portmap:
                                this.formData.ctype !== 8
                                    ? this.formData.portmap.sort(
                                          (a, b) => a - b
                                      )
                                    : null,
                        },
                    })
                    .then((res) => {
                        if (res.data.code === 1) {
                            this.$message.success(this.lanMap["setting_ok"]);
                            this.getData(this.portid);
                        } else {
                            this.$message.error(
                                `(${res.data.code}) ${res.data.message}`
                            );
                        }
                    })
                    .catch((err) => {})
                    .finally((_) => {
                        loading.close();
                        this.batchVisible = false;
                    });
            });
        },
        clearWan() {
            this.$confirm()
                .then((_) => {
                    this.$http
                        .post("/ponmgmt?form=wan", {
                            method: "clear",
                            param: {
                                port_id: this.portid,
                                onu_id: 0,
                            },
                        })
                        .then((res) => {
                            if (res.data.code === 1) {
                                this.$message.success(
                                    this.lanMap["clear"] +
                                        this.lanMap["st_success"]
                                );
                                this.getData();
                            } else {
                                this.$message.error(
                                    `(${res.data.code}) ${res.data.message}`
                                );
                            }
                        })
                        .catch((err) => {});
                })
                .catch((_) => {});
        },
    },
    watch: {
        portid() {
            if (this.portid) {
                this.getData(this.portid);
            }
        },
    },
};
</script>

<style lang="less" scoped>
</style>