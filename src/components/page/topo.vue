<template>
    <div class="topo" :style="{ 'height': height + 'px' }">
        <canvas ref="topo" :width="width" :height="height"></canvas>
        <nms-popover
            :visible.sync="visible"
            :position="position"
            :placement="placement"
            :width="ctxMenuWidth"
            @command="commandHandle"
            ref="popover"
        >
            <template v-if="popoverType === 'popover'">
                <template v-if="devType === 'pon'">
                    <div class="device-info">
                        <div>
                            <span>{{ lanMap['port_id'] }}:</span>
                            <span>{{ popoverData.port_id | getPortName }}</span>
                        </div>
                        <div>
                            <span>{{ lanMap['status'] }}:</span>
                            <span>{{ popoverData.status ? lanMap['online'] : lanMap['offline'] }}</span>
                        </div>
                        <div>
                            <span>{{ lanMap['online'] }}:</span>
                            <span>{{ popoverData.online }}</span>
                        </div>
                        <div>
                            <span>{{ lanMap['offline'] }}:</span>
                            <span>{{ popoverData.offline }}</span>
                        </div>
                    </div>
                </template>
                <template v-if="devType === 'onu'">
                    <div class="device-info">
                        <div>
                            <span>{{ lanMap['onu_name'] }}:</span>
                            <span :title="onuName">{{ onuName }}</span>
                        </div>
                        <div>
                            <span>{{ lanMap['macaddr'] }}:</span>
                            <span>{{ popoverData.macaddr }}</span>
                        </div>
                        <div>
                            <span>{{ lanMap['status'] }}:</span>
                            <span>{{ popoverData.status }}</span>
                        </div>
                        <div>
                            <span>{{ lanMap['auth_state'] }}:</span>
                            <span>{{ popoverData.auth_state ? 'true' : 'false' }}</span>
                        </div>
                    </div>
                </template>
            </template>
            <template v-if="popoverType === 'contextmenu'">
                <template v-if="devType === 'pon'">
                    <nms-dropdown-item
                        style="cursor: pointer;"
                        :command="composeData('pon', 'sla_cfg')"
                    >{{ lanMap['sla_cfg'] }}</nms-dropdown-item>
                    <nms-dropdown-item
                        style="cursor: pointer;"
                        :command="composeData('pon', 'pon_setting')"
                    >{{ lanMap['pon_setting'] }}</nms-dropdown-item>
                    <nms-dropdown-item
                        style="cursor: pointer;"
                        :command="composeData('pon', 'pon_optical')"
                    >{{ lanMap['pon_optical'] }}</nms-dropdown-item>
                    <nms-dropdown-item
                        style="cursor: pointer;"
                        :command="composeData('pon', 'batch_config')"
                    >{{ lanMap['batch_config'] }}</nms-dropdown-item>
                </template>
                <template v-if="devType === 'onu'">
                    <nms-dropdown-item
                        style="cursor: pointer;"
                        :command="composeData('onu', 'detail')"
                    >{{ lanMap['detail'] }}</nms-dropdown-item>
                    <nms-dropdown-item
                        style="cursor: pointer;"
                        :command="composeData('onu', 'onu_port_cfg')"
                    >{{ lanMap['onu_port_cfg'] }}</nms-dropdown-item>
                    <nms-dropdown-item
                        style="cursor: pointer;"
                        :command="composeData('onu', 'del_onu')"
                    >{{ lanMap['del_onu'] }}</nms-dropdown-item>
                    <nms-dropdown-item
                        style="cursor: pointer;"
                        :command="composeData('onu', 'add_to_deny')"
                    >{{ lanMap['add_to_deny'] }}</nms-dropdown-item>
                    <nms-dropdown-item
                        style="cursor: pointer;"
                        :command="composeData('onu', 'reboot_onu')"
                    >{{ lanMap['reboot_onu'] }}</nms-dropdown-item>
                </template>
            </template>
        </nms-popover>
        <div class="topo-toolbar">
            <span @click="refreshImage">{{ lanMap['refreshOrReset'] }}</span>
            <span @click="saveAsImage">{{ lanMap['saveAsImage'] }}</span>
            <input type="text" placeholder="mac / name" v-model="findStr" />
            <span style="width: 80px;">
                <template v-if="!find">{{ lanMap['no_result'] }}</template>
                <template v-else>
                    <span>{{ index + 1 }}</span>
                    /
                    <span>{{ nodes.length }}</span>
                </template>
            </span>
            <span style="padding: 6px 0;" @click="changeNode('next')">
                <svg
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    :fill="find ? '#000' : '#aaa'"
                >
                    <path
                        d="M512 849.691045c-8.142447 0-15.950274-3.234671-21.707394-8.991792l-255.82655-255.82655c-11.988032-11.989055-11.988032-31.425733 0-43.414789 11.989055-11.990079 31.426757-11.990079 43.415812 0l234.118132 234.118132 234.119155-234.118132c11.988032-11.990079 31.426757-11.990079 43.414789 0 11.989055 11.989055 11.989055 31.425733 0 43.414789l-255.82655 255.82655C527.950274 846.456375 520.141424 849.691045 512 849.691045z"
                    />
                    <path
                        d="M512 849.691045c-16.954137 0-30.699186-13.745049-30.699186-30.699186l0-613.983719c0-16.954137 13.745049-30.699186 30.699186-30.699186s30.699186 13.745049 30.699186 30.699186l0 613.983719C542.699186 835.945997 528.954137 849.691045 512 849.691045z"
                    />
                </svg>
            </span>
            <span style="padding: 6px 0;" @click="changeNode('prev')">
                <svg
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    :fill="find ? '#000' : '#aaa'"
                >
                    <path
                        d="M512 174.30895499c8.142447 0 15.950274 3.234671 21.707394 8.99179201l255.82655 255.82655c11.988032 11.989055 11.988032 31.425733 0 43.414789-11.989055 11.990079-31.426757 11.990079-43.415812 1e-8l-234.118132-234.118132-234.11915501 234.11813199c-11.988032 11.990079-31.426757 11.990079-43.41478899 0-11.989055-11.989055-11.989055-31.425733 0-43.414789l255.82655-255.82655C496.049726 177.543625 503.85857601 174.308955 512 174.30895499z"
                    />
                    <path
                        d="M512 174.30895499c16.954137 0 30.699186 13.745049 30.699186 30.69918601l0 613.983719c0 16.954137-13.745049 30.699186-30.699186 30.699186s-30.699186-13.745049-30.699186-30.699186l0-613.983719C481.300814 188.054003 495.045863 174.308955 512 174.30895499z"
                    />
                </svg>
            </span>
            <span @click="findNode">{{ lanMap['find'] }}</span>
        </div>
    </div>
</template>

<script>
import { throttle, debounce } from "@/utils/common";
import { mapState, mapMutations } from "vuex";
import "../../../static/jtopo-0.4.8-min";
export default {
    name: "topo",
    data() {
        return {
            clientWidth: 0,
            clientHeight: 0,
            stage: null,
            allOnuScene: null,
            singlePonScene: null,
            // 点击pon口时保存触发点击的pon节点
            ponNode: null,
            // 换行递增的高度
            baseStep: 100,
            onuContainerWidth: 0,
            onuContainerOffset: 0,
            onuContainerGutter: 10,
            ponList: [],
            onuList: [],
            height: 0,
            // "all", "pon" -> canvas内显示的列表类型
            pageType: "all",
            visible: false,
            // "popover", "contextmenu"  -> popover类型
            popoverType: "popover",
            position: { x: 0, y: 0 },
            // "pon", "onu"  -> popover要显示的设备类型
            devType: "",
            placement: "",
            popoverData: {},
            findStr: "",
            findFlag: false,
            // 搜索结果
            nodes: [],
            index: 0
        };
    },
    computed: {
        ...mapState(["lanMap", "change_url"]),
        width() {
            // 去除右侧滚动条宽度
            //  页面最小宽度，去除滚动条宽度 1280 - 17
            let width = this.clientWidth - 17;
            return width < 1263 ? 1263 : width;
        },
        onuMap() {
            let list = {};
            if (this.onuList.length) {
                list = this.onuList.reduce((prev, item) => {
                    if (!prev[item.port_id]) {
                        prev[item.port_id] = [];
                    }
                    prev[item.port_id].push(item);
                    return prev;
                }, {});
            }
            return list;
        },
        // 弹出菜单宽度
        ctxMenuWidth() {
            if (this.popoverType === "popover") {
                if (this.devType === "onu") {
                    return "240px";
                }
            }
            return "180px";
        },
        onuName() {
            return (
                this.popoverData.onu_name ||
                `ONU${this.popoverData.port_id}/${this.popoverData.onu_id}`
            );
        },
        find() {
            if (!this.findStr) {
                this.findFlag = false;
                this.index = 0;
                this.nodes = [];
            }
            return this.findFlag && !!this.findStr;
        }
    },
    created() {
        // 测试数据，测试数据量大小时的表现
        // if (process.env.NODE_ENV == "development") {
        //     this.getPon()
        //         .then(res => {
        //             this.ponList = Object.freeze(res.data.data);
        //             import("../../../simulation_data/onuAllowFilter")
        //                 .then(data => {
        //                     const list = data.default;
        //                     this.onuList = Object.freeze(list);
        //                     this.$nextTick(_ => {
        //                         this.draw();
        //                     });
        //                 })
        //                 .catch(err => {});
        //         })
        //         .catch(err => {});
        //     return;
        // }
        this.getData();
    },
    mounted() {
        this.setRect();
        const fn = throttle(this.setRect, 300, this);
        // 鼠标弹起时，若目标节点没有绑定事件处理，则隐藏popover
        const mouseup = e => {
            // 全局鼠标事件捕捉
            if (this.visible) {
                const scene =
                    this.pageType === "all"
                        ? this.allOnuScene
                        : this.singlePonScene;
                if (!scene.selectedElements.length) {
                    this.visible = false;
                } else {
                    const len = scene.selectedElements.length;
                    const node = scene.selectedElements[len - 1];
                    if (node.elementType !== "node" || node.text === "root") {
                        this.visible = false;
                        // 防止按住ctrl多选节点
                        scene.selectedElements = [];
                    }
                }
            }
        };
        // 滚动时隐藏popover和node上触发的右键菜单
        const scrollFn = throttle(
            _ => {
                if (this.visible) {
                    this.visible = false;
                }
            },
            300,
            this
        );
        window.addEventListener("resize", fn, true);
        window.addEventListener("mouseup", mouseup, false);
        window.addEventListener("scroll", scrollFn, true);
        this.$once("hook:beforeDestroy", _ => {
            window.removeEventListener("resize", fn);
            window.removeEventListener("mouseup", mouseup);
            window.removeEventListener("scroll", scrollFn);
        });
        this.stage = new JTopo.Stage(this.$refs.topo);
    },
    methods: {
        getData() {
            Promise.all([this.getPon(), this.getOnu()])
                .then(vals => {
                    const [ponlist, onulist] = vals;
                    this.ponList = Object.freeze(ponlist.data.data) || [];
                    this.onuList = Object.freeze(onulist.data.data) || [];
                    this.$nextTick(_ => {
                        this.draw();
                    });
                })
                .catch(er => {});
        },
        getPon() {
            return this.$http.get(this.change_url.pon);
        },
        getOnu() {
            return this.$http.get(this.change_url.onu_allow_all);
        },
        //  检测页面宽高，调整canvas的大小
        setRect() {
            const { width, height } = document.body.getBoundingClientRect();
            this.clientWidth = width;
            // 去除头部导航栏高度(70px)以及底部footer高度(30px)
            this.clientHeight = height - 100;
            this.height = height - 100;
            this.$nextTick(_ => {
                this.draw();
            });
        },
        draw() {
            this.initScene();
            const scene =
                this.pageType === "all"
                    ? this.allOnuScene
                    : this.singlePonScene;
            this.initView(scene);
        },
        // 初始化场景
        initScene() {
            if (this.pageType === "all") {
                if (this.allOnuScene) {
                    this.allOnuScene.clear();
                    this.allOnuScene = null;
                }
                this.allOnuScene = new JTopo.Scene(this.stage);
                this.allOnuScene.translate = false;
            } else {
                if (this.singlePonScene) {
                    this.singlePonScene.clear();
                    this.singlePonScene = null;
                }
                this.singlePonScene = new JTopo.Scene(this.stage);
                this.singlePonScene.translate = false;
            }
        },
        createNode(label, data, scene, flag = false) {
            const node = new JTopo.Node();
            node.fontColor = "0,0,0";
            if (data) {
                if (
                    data.status === 0 ||
                    (typeof data.status === "string" &&
                        data.status.toLowerCase() !== "online")
                ) {
                    node.fontColor = "255, 0, 0";
                }
            }
            node.text = label;
            node.data = data;
            node.dragable = flag;
            scene.add(node);
            return node;
        },
        addLine(nodeA, nodeZ, scene) {
            const link = new JTopo.Link(nodeA, nodeZ);
            link.strokeColor = "204,204,204";
            link.lineWidth = 1;
            scene.add(link);
            return link;
        },
        initView(scene) {
            if (!this.ponList.length && !Object.keys(this.onuMap).length) {
                return;
            }
            // root node
            const root = this.createNode("root", null, scene);
            this.deployNode(root, "root");
            // PON nodes
            const ponNum = this.ponList.length;
            // 存在onu列表的pon数量
            const onuArea = Object.values(this.onuMap).filter(
                item => item && item.length
            ).length;
            this.onuContainerWidth =
                (this.width - (onuArea + 1) * this.onuContainerGutter) /
                onuArea;

            // 部分pon下无onu时，计算容器偏移量
            let _index = 0;
            this.ponList.forEach((item, index) => {
                //  ONU nodes
                const onulist = this.onuMap[item.port_id] || [];
                const onuCount = onulist.length;
                onulist.sort(
                    (a, b) =>
                        a.status.toLowerCase() === "online" &&
                        b.status.toLowerCase() !== "online"
                );
                const title = `PON${
                    item.port_id > 9 ? item.port_id : "0" + item.port_id
                }`;
                const pon = this.createNode(title, item, scene);
                this.deployNode(pon, "pon", ponNum, item, index);
                this.addLine(root, pon, scene);
                this.onuContainerOffset =
                    this.onuContainerWidth * _index +
                    this.onuContainerGutter * (_index + 1);
                // 分组容器
                if (!!onuCount) {
                    _index++;
                    if (this.pageType === "all") {
                        this.drawAllOnu(onulist, title, _index, pon);
                    }
                }
            });
            if (this.ponNode) {
                this.drawSinglePon(this.ponNode.data, this.ponNode);
            }
        },
        deployNode(node, type, count, data, index) {
            this.bindEvent(node, type, data);
            const { width, height } = node.getBound();
            const Actions = {
                root() {
                    const root_y = this.baseStep;
                    const x = (this.width - width) / 2,
                        y = root_y;
                    node.setLocation(x, y);
                },
                pon(data) {
                    const pon_y = this.baseStep * 2;
                    const baseWidth = this.width / count;
                    const x = (baseWidth - width) / 2 + index * baseWidth,
                        y = pon_y;
                    node.setLocation(x, y);
                },
                onu(data) {
                    if (this.pageType !== "all") {
                        let baseWidth = width * 2;
                        const count = Math.floor(this.width / baseWidth);
                        baseWidth = Math.floor(this.width / count);
                        const x =
                            (baseWidth - width) / 2 +
                            (index % count) * baseWidth;
                        const y =
                            this.baseStep * 3 +
                            Math.floor(index / count) * this.baseStep;
                        node.setLocation(x, y);
                    }
                }
            };
            typeof Actions[type] === "function" &&
                Actions[type].call(this, data);
        },
        bindEvent(node, type, data) {
            const Actions = {
                root() {
                    node.click(e => {
                        this.ponNode = null;
                        this.changeView("all");
                    });
                },
                pon(data) {
                    node.click(e => {
                        this.ponNode = node;
                        this.changeView("pon");
                    });
                    node.mouseover(e => {
                        this.mouseover(node, "pon");
                    });
                    node.mouseout(e => {
                        this.mouseout(node, "pon");
                    });
                    node.mouseup(e => {
                        if (e.button === 2) {
                            this.contextMenu(node, "pon", e);
                        }
                    });
                },
                onu(data) {
                    // to do
                    node.mouseover(e => {
                        this.mouseover(node, "onu");
                    });
                    node.mouseout(e => {
                        this.mouseout(node, "onu");
                    });
                    node.mouseup(e => {
                        if (e.button === 2) {
                            this.contextMenu(node, "onu", e);
                        }
                    });
                }
            };
            typeof Actions[type] === "function" &&
                Actions[type].call(this, data);
        },
        changeView(flag) {
            if (this.pageType !== flag) {
                this.pageType = flag;
            }
            this.index = 0;
            this.nodes = [];
            this.findStr = "";
            this.draw();
            if (flag === "all") {
                this.allOnuScene && (this.allOnuScene.visible = true);
                this.singlePonScene && (this.singlePonScene.visible = false);
            } else {
                this.allOnuScene && (this.allOnuScene.visible = false);
                this.singlePonScene && (this.singlePonScene.visible = true);
            }
        },
        // 全景
        drawAllOnu(onulist, title, index, parentNode) {
            const onuCount = onulist.length;
            // init container
            const container = new JTopo.Container(title);
            container.alpha = 1;
            container.dragable = false;
            container.showSelected = false;
            container.textPosition = "Top_Center";
            container.fontColor = "0, 0, 0";
            // 相临container背景色区分
            container.fillColor =
                index % 2 === 1 ? "224, 239, 231" : "198, 219, 209";
            container.borderColor = "204, 204, 204";
            container.borderWidth = 1;
            container.width = this.onuContainerWidth;

            const _width = parentNode.getBound().width;
            const baseWidth = _width + _width * 0.6;

            const count = Math.floor(this.onuContainerWidth / baseWidth);
            const height = this.baseStep * Math.ceil(onuCount / count);
            container.height = height;
            if (height + this.baseStep * 3 + 100 > this.height) {
                this.height = height + this.baseStep * 3 + 100;
            }

            container.layout = JTopo.layout.GridLayout(
                Math.ceil(onuCount / count),
                count
            );
            container.setLocation(this.onuContainerOffset, this.baseStep * 3);

            // pon下的onu列表
            onulist.forEach((node, idx) => {
                const title = `ONU${node.port_id}/${node.onu_id}`;
                const onu = this.createNode(title, node, this.allOnuScene);
                onu.$parentNode = parentNode;
                this.deployNode(onu, "onu", onuCount, node, idx);
                container.add(onu);
            });
            this.allOnuScene.add(container);
        },
        // 单PON口
        drawSinglePon(data, parentNode) {
            this.height = this.clientHeight;
            const onulist = this.onuMap[data.port_id] || [];
            const baseWidth = parentNode.getBound().width * 2;
            if (onulist.length) {
                onulist.forEach((item, index) => {
                    const title = `ONU${item.port_id}/${item.onu_id}`;
                    const onu = this.createNode(
                        title,
                        item,
                        this.singlePonScene,
                        true
                    );
                    this.deployNode(onu, "onu", onulist.length, item, index);
                    this.addLine(onu, parentNode, this.singlePonScene);
                });
            }
        },
        mouseover(node, type) {
            this.popoverType = "popover";
            this.devType = type;
            this.popoverData = node.data;
            // 不加nextTick时，菜单大小还未调整完成，会导致菜单错位
            this.$nextTick(_ => {
                this.position = this.computedPosition(node, this.popoverType);
                this.visible = true;
            });
        },
        mouseout(node, type) {
            if (this.popoverType === "popover") {
                this.visible = false;
            }
        },
        contextMenu(node, type, e) {
            // 先隐藏，调整好弹出位置再显示
            this.visible = false;
            this.popoverType = "contextmenu";
            this.devType = type;
            this.popoverData = node.data;
            this.$nextTick(_ => {
                this.position = this.computedPosition(
                    node,
                    this.popoverType,
                    e
                );
                this.visible = true;
            });
        },
        computedPosition(node, type, e) {
            const {
                left,
                right,
                top,
                bottom,
                width,
                height: _height
            } = node.getBound();
            // popover离节点的高度
            const baseGutter = 10;
            // 滚动条偏移量
            const scrollHeight = this.$root.$el.scrollTop;
            // 顶部菜单高度
            const topMenuHeight = 70;
            //  12为文本高度
            const height = _height + 12;
            // 页面可视区域宽高
            const clientWidth = this.width,
                clientHeight = this.clientHeight;
            // popover的宽高
            const { width: popwidth, height: popheight } = this.$refs[
                "popover"
            ].$el.getBoundingClientRect();
            let offset_x = 0,
                offset_y = 0;
            if (type === "popover") {
                let placement;
                if (top - scrollHeight > popheight) {
                    offset_y = top - popheight - baseGutter;
                    placement = "top";
                } else {
                    offset_y = top + height + baseGutter;
                    placement = "bottom";
                }
                offset_x = left - (popwidth - width) / 2;
                if (offset_x < 0) {
                    offset_x = left;
                    placement += "-start";
                }
                if (offset_x + popwidth > clientWidth) {
                    offset_x = right - popwidth;
                    placement += "-end";
                }
                this.placement = placement;
            }
            if (type === "contextmenu") {
                this.placement = "";
                const { clientX, clientY } = e;
                (offset_x = clientX),
                    (offset_y = clientY + scrollHeight - topMenuHeight);
                if (offset_x + popwidth > clientWidth) {
                    offset_x = offset_x - popwidth;
                }
                if (offset_y + popheight > clientHeight + scrollHeight) {
                    offset_y = offset_y - popheight;
                }
            }
            return { x: offset_x, y: offset_y };
        },
        composeData(devType, action) {
            return {
                type: devType,
                action,
                data: this.popoverData
            };
        },
        commandHandle(command) {
            const { type, action, data } = command;
            if (type === "pon") {
                sessionStorage.setItem("pid", data.port_id);
            }
            const TYPES = {
                pon: {
                    sla_cfg() {
                        this.$router.push("/sla_cfg");
                    },
                    pon_setting() {
                        this.$router.push("/pon_setting");
                    },
                    pon_optical() {
                        this.$router.push("/pon_optical");
                    },
                    batch_config() {
                        this.$router.push("/batch_config");
                    }
                },
                onu: {
                    detail(data) {
                        const url = `/onu_basic_info?form=base-info&port_id=${data.port_id}&onu_id=${data.onu_id}`;
                        this.$router.push(url);
                    },
                    onu_port_cfg(data) {
                        sessionStorage.setItem("pid", data.port_id);
                        sessionStorage.setItem("oid", data.onu_id);
                        this.$router.push(`/onu_port_cfg`);
                    },
                    del_onu(data) {
                        this.$confirm(this.lanMap["tips_del_onu"])
                            .then(_ => {
                                const url = "/onu_allow_list";
                                const post_params = {
                                    method: "delete",
                                    param: {
                                        port_id: data.port_id,
                                        onu_id: data.onu_id,
                                        macaddr: data.macaddr
                                    }
                                };
                                this.postData(url, post_params);
                            })
                            .catch(_ => {});
                    },
                    add_to_deny(data) {
                        this.$confirm(this.lanMap["tips_add_deny_onu"])
                            .then(_ => {
                                const url = "/onu_allow_list";
                                const post_params = {
                                    method: "reject",
                                    param: {
                                        port_id: data.port_id,
                                        onu_id: data.onu_id,
                                        macaddr: data.macaddr
                                    }
                                };
                                this.postData(url, post_params);
                            })
                            .catch(_ => {});
                    },
                    reboot_onu(data) {
                        this.$confirm(this.lanMap["confirm_reboot_onu"])
                            .then(_ => {
                                const url = "/onumgmt?form=config";
                                const post_params = {
                                    method: "set",
                                    param: {
                                        port_id: data.portid,
                                        onu_id: data.onu_id,
                                        flags: 1,
                                        fec_mode: 1
                                    }
                                };
                                this.postData(
                                    url,
                                    post_params,
                                    `${this.lanMap["reboot_onu"]}${
                                        this.lanMap["st_success"]
                                    }`
                                );
                            })
                            .catch(_ => {});
                    }
                }
            };
            if (TYPES[type] && typeof TYPES[type][action] === "function") {
                TYPES[type][action].call(this, data);
            }
            this.visible = false;
        },
        postData(url, data, suc_text) {
            const message = suc_text || this.lanMap["setting_ok"];
            this.$http
                .post(url, data)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message.success(message);
                        this.getData();
                    } else {
                        this.$message.error(
                            `(${res.data.code}) ${res.data.message}`
                        );
                    }
                })
                .catch(err => {});
        },
        refreshImage() {
            this.findStr = "";
            this.index = 0;
            this.nodes = [];
            this.$root.$el.scrollTo(0, 0);
            debounce(this.draw, 1000, this);
        },
        saveAsImage() {
            this.stage.saveImageInfo();
        },
        findNode() {
            this.findFlag = true;
            const scene =
                this.pageType === "all"
                    ? this.allOnuScene
                    : this.singlePonScene;
            this.nodes = scene.childs.filter(item => {
                let flag = false;
                if (item.data) {
                    if (typeof item.data.onu_name === "string") {
                        if (
                            item.data.onu_name
                                .toLowerCase()
                                .indexOf(this.findFlag.toLowerCase()) > -1
                        ) {
                            flag = true;
                        }
                    }
                    if (typeof item.data.macaddr === "string") {
                        if (
                            item.data.macaddr
                                .toLowerCase()
                                .indexOf(this.findStr.toLowerCase()) > -1
                        ) {
                            flag = true;
                        }
                    }
                }
                return item instanceof JTopo.Node && flag;
            });
            if (!this.nodes.length) {
                this.findFlag = false;
            }
            this.jumpToNode();
        },
        jumpToNode() {
            if (this.nodes.length) {
                const node = this.nodes[this.index];
                node.selected = true;
                const { top } = node.getBound();
                const scrollTop = top - this.clientHeight / 2;
                this.$root.$el.scrollTo(0, scrollTop);
                this.nodeFlash(node, 10);
            }
        },
        changeNode(flag) {
            const len = this.nodes.length;
            if (len === 0 || len === 1) return;
            if (flag === "prev") {
                this.index--;
                if (this.index < 0) {
                    this.index = len - 1;
                }
            } else {
                this.index++;
                if (this.index >= len) {
                    this.index = 0;
                }
            }
            this.jumpToNode();
        },
        nodeFlash(node, n) {
            if (n === 0) {
                node.visible = true;
                node.alarm = null;
                return;
            }
            node.visible = !node.visible;
            node.visible
                ? (node.alarm = node.data.macaddr)
                : (node.alarm = null);
            setTimeout(_ => {
                this.nodeFlash(node, n - 1);
            }, 300);
        }
    }
};
</script>

<style lang="less" scoped>
.topo {
    width: 100%;
    height: 100%;
    margin-top: 70px;
    position: relative;
}
.device-info {
    > div {
        display: table;
        width: 100%;
        span {
            display: table-cell;
            width: 40%;
            padding: 6px 0;
            text-align: center;
            &:last-child {
                text-align: left;
                width: 57%;
                word-wrap: break-word;
                word-break: break-word;
            }
        }
        &:after {
            content: "";
            display: table;
            clear: both;
        }
    }
}
.topo-toolbar {
    position: fixed;
    top: 70px;
    right: 15px;
    background: #ddd;
    padding: 6px 12px;
    user-select: none;
    border-radius: 3px;
    border-bottom: 1px solid #ccc;
    > span {
        display: inline-block;
        padding: 0 12px;
        cursor: pointer;
        vertical-align: middle;
        &:hover {
            color: @hoverButtonColor;
        }
    }
    svg {
        vertical-align: middle;
    }
    input {
        vertical-align: middle;
    }
    input + span:hover {
        color: @color;
    }
}
</style>