<template>
    <div
        :class="['notify-message', horizontalClass]"
        :style="positionStyle"
        @click="click"
        v-if="visible"
    >
        <p v-if="title !== ''">{{ title }}</p>
        <p :class="type">{{ message }}</p>
        <div class="notify-close" @click="close">
            <svg
                t="1570527287769"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="1795"
                width="24"
                height="24"
            >
                <path
                    d="M515.236 491.069l-136.96-136.96a17.092 17.092 0 1 0-24.18 24.155l136.961 136.972-136.96 136.972a17.092 17.092 0 1 0 24.167 24.167l136.972-136.96 136.972 136.96a17.092 17.092 0 1 0 24.167-24.156l-136.96-136.983 136.96-136.96a17.092 17.092 0 1 0-24.167-24.168l-136.96 136.96z"
                    p-id="1796"
                    fill="#2c2c2c"
                />
            </svg>
        </div>
    </div>
</template>

<script>
export default {
    name: "notify",
    data() {
        return {
            visible: true,
            title: "",
            type: "info",
            message: "",
            duration: 4500,
            //  top-left    top-right   bottom-left   bottom-right
            position: "bottom-right",
            onClick: null,
            onClose: null,
            closed: false,
            verticalOffset: 0,
            _timeout: null
        };
    },
    computed: {
        horizontalClass() {
            return this.position.indexOf("right") > -1 ? "right" : "left";
        },
        verticalPosition() {
            return this.position.indexOf("top") > -1 ? "top" : "bottom";
        },
        positionStyle() {
            return {
                [this.verticalPosition]: `${this.verticalOffset}px`
            };
        }
    },
    mounted() {
        const el = this.$el;
        el.addEventListener("mouseover", this.mouseoverCb);
        el.addEventListener("mouseout", this.mouseoutCb);
        this.$once("hook:beforeDestroy", _ => {
            el.removeEventListener("mouseover", this.mouseoverCb);
            el.removeEventListener("mouseout", this.mouseoutCb);
            document.body.removeChild(el);
        });
        //  duration 为0时表示不自动关闭
        if (this.duration) {
            this._timeout = setTimeout(_ => {
                this.close();
            }, this.duration);
        }
    },
    methods: {
        close() {
            this.visible = false;
            if (typeof this.onClose === "function") {
                this.onClose();
            }
            this.$destroy();
        },
        click() {
            if (typeof this.onClick === "function") {
                this.onClick();
            }
        },
        mouseoverCb(e) {
            if (this.duration && this._timeout) {
                clearTimeout(this._timeout);
            }
        },
        mouseoutCb(e) {
            if (this.duration) {
                this._timeout = setTimeout(_ => {
                    this.close();
                }, this.duration);
            }
        }
    }
};
</script>

<style lang="less" scope>
.notify-message {
    position: fixed;
    width: 330px;
    padding: 14px 26px 14px 13px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    transition: opacity 0.3s, transform 0.3s, left 0.3s, right 0.3s, top 0.4s,
        bottom 0.3s;
    > p {
        line-height: 21px;
        word-break: break-word;
        font-size: 16px;
    }
    p.info {
        color: @infoColor;
    }
    p.success {
        color: @successColor;
    }
    p.warning {
        color: @warningColor;
    }
    p.error {
        color: @errorColor;
    }
}
.right {
    right: 32px;
}
.left {
    left: 32px;
}
.notify-close {
    text-align: center;
    cursor: pointer;
    width: 24px;
    height: 24px;
    position: absolute;
    top: 50%;
    right: 6px;
    transform: translateY(-50%);
}
</style>