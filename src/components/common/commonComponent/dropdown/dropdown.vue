<template>
    <div class="nms-dropdown" @mouseenter="mouseenter" @mouseleave="mouseleave">
        <div class="nms-dropdown-selfdefine">
            <slot></slot>
            <svg
                t="1570759962108"
                style="vertical-align: middle;"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="6745"
                width="16"
                height="16"
            >
                <path
                    d="M824.001 335.037c-9.083-9.083-24.049-9.083-33.132 0l-278.991 279.094-279.094-279.09399999c-9.083-9.083-24.049-9.083-33.132-1e-8-9.083 9.083-9.083 24.049 0 33.13200001l292.92499999 292.92499999c0.723 1.032 1.548 2.064 2.47700002 2.993 4.645 4.645 10.734 6.915 16.82399999 6.812 6.09 0.103 12.179-2.168 16.824-6.812 0.929-0.929 1.755-1.961 2.477-2.993l292.822-292.925c9.083-9.083 9.083-24.049 0-33.132z"
                    p-id="6746"
                    fill="#2c2c2c"
                />
            </svg>
        </div>
        <div
            class="nms-dropdown-menu"
            :style="{ width: menuWidth, left, top, height }"
            ref="dropdown-menu"
        >
            <slot name="dropdown"></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: "nmsDropdown",
    data() {
        return {
            menu_width: "",
            left: "",
            top: "",
            height: "",
            dropHeight: 0
        };
    },
    computed: {
        menuWidth() {
            return this.width || this.menu_width;
        }
    },
    mounted() {
        //  正常状态下，下拉菜单位于触发元素正下方
        const c_rect = this.$el.getBoundingClientRect(),
            p_rect = this.$el.parentElement.getBoundingClientRect();
        const c_width = this.width || c_rect.width,
            p_width = p_rect.width;
        this.menu_width = `${p_width}px`;
        this.left = `-${Math.floor((p_width - c_width) / 2)}px`;
        this.dropHeight = this.$refs["dropdown-menu"].scrollHeight;
    },
    props: {
        width: {
            type: String
        },
        offsetY: {
            type: Number,
            default: 0
        }
    },
    methods: {
        mouseenter(e) {
            const { bottom, height } = this.$el.getBoundingClientRect();
            const { clientHeight } = document.documentElement;
            // 触发dropdown的元素离底部的高度 + dropdown高度 + 偏移量，超出屏幕显示范围时，在触发元素上方显示dropdown
            if (bottom + this.dropHeight + this.offsetY >= clientHeight) {
                this.top = `-${this.dropHeight}px`;
            }
            this.height = `${this.dropHeight}px`;
        },
        mouseleave(e) {
            this.height = "";
        }
    }
};
</script>

<style lang="less" scoped>
.nms-dropdown {
    box-sizing: border-box;
    position: relative;
    cursor: pointer;
}
.nms-dropdown-selfdefine {
    box-sizing: border-box;
}
.nms-dropdown-menu {
    background: #ffffff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.4);
    color: #444;
    box-sizing: border-box;
    border-radius: 5px;
    width: 100%;
    position: absolute;
    left: 0;
    height: 0;
    overflow: hidden;
    transition: height 0.1s ease-in;
    z-index: 1;
    > div {
        &:first-child {
            margin-top: 6px;
        }
        &:last-child {
            margin-bottom: 6px;
        }
    }
}
</style>