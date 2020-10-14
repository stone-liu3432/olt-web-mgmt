<template>
    <a
        href="javascript: void(0);"
        :class="[{ disabled: disabled || loading }, type, `button-${size}`]"
        v-bind="$attrs"
        v-on="disabled ? '' : $listeners"
    >
        <template v-if="loading">
            <svg
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                xmlns:xlink="http://www.w3.org/1999/xlink"
            >
                <path
                    d="M512 0c-7.5 0-14.8 3-20.1 8.3-5.3 5.3-8.3 12.6-8.3 20.1V256c0 15.7 12.7 28.4 28.4 28.4s28.4-12.7 28.4-28.4V28.4c0-7.5-3-14.8-8.3-20.1C526.8 3 519.5 0 512 0z m0 739.6c-7.5 0-14.8 3-20.1 8.3-5.3 5.3-8.3 12.6-8.3 20.1v227.6c0 15.7 12.7 28.4 28.4 28.4s28.4-12.7 28.4-28.4V768c0-7.5-3-14.8-8.3-20.1-5.3-5.4-12.6-8.4-20.1-8.3zM190.2 150c-11.1-11.1-29.1-11.1-40.2 0-11.1 11.1-11.1 29.1 0 40.2l160.9 160.9c7.2 7.2 17.7 10 27.5 7.4 9.8-2.6 17.5-10.3 20.1-20.1 2.6-9.8-0.2-20.3-7.4-27.5L190.2 150z m522.9 522.9c-11.1-11.1-29.1-11.1-40.2 0-11.1 11.1-11.1 29.1 0 40.2L833.8 874c11.1 11.1 29.1 11.1 40.2 0 11.1-11.1 11.1-29.1 0-40.2L713.1 672.9zM284.4 512c0-7.6-3-14.8-8.3-20.1-5.3-5.3-12.6-8.3-20.1-8.3H28.4C12.7 483.6 0 496.3 0 512s12.7 28.4 28.4 28.4H256c7.5 0 14.8-3 20.1-8.3 5.4-5.3 8.4-12.6 8.3-20.1z m711.2-28.4H768c-15.7 0-28.4 12.7-28.4 28.4s12.7 28.4 28.4 28.4h227.6c15.7 0 28.4-12.7 28.4-28.4s-12.7-28.4-28.4-28.4zM310.9 672.9L150 833.8c-7.2 7.2-10 17.7-7.4 27.5 2.6 9.8 10.3 17.5 20.1 20.1 9.8 2.6 20.3-0.2 27.5-7.4l160.9-160.9c11.1-11.1 11.1-29.1 0-40.2-11.1-11.1-29.1-11.1-40.2 0zM693 359.4c7.5 0 14.8-3 20.1-8.3L874 190.2c7.2-7.2 10-17.7 7.4-27.5a28.36 28.36 0 0 0-20.1-20.1c-9.8-2.6-20.3 0.2-27.5 7.4L672.9 310.9c-8.1 8.1-10.6 20.4-6.2 31 4.5 10.6 14.8 17.5 26.3 17.5z m0 0"
                    fill="#8a8a8a"
                />
            </svg>
        </template>
        <span>
            <slot></slot>
        </span>
    </a>
</template>

<script>
export default {
    name: "nmsButton",
    props: {
        type: {
            type: String,
        },
        size: {
            type: String,
            default: "small",
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

<style lang="less" scoped>
a {
    transition: all 0.1s linear;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    line-height: 1;
    height: auto;
    padding: 9px 15px;
}
.button-mini {
    font-size: 12px;
    padding: 7px 12px;
}
.button-small {
    font-size: 14px;
    padding: 9px 15px;
}
.disabled {
    background: #c8c9cc;
    cursor: not-allowed;
    color: #ffffff;
    border-color: #c8c9cc;
}
.text {
    border-color: transparent;
    color: #409eff;
    background: transparent;
    padding-left: 0;
    padding-right: 0;
    &:active {
        color: #3a8ee6;
    }
    &.disabled {
        color: #a1a2a5;
        background-color: transparent;
        border-color: transparent;
    }
}
.primary {
    background: #409eff;
    color: #fff;
    &:hover {
        background: #66b1ff;
    }
    &:active {
        background: #3a8ee6;
    }
    &.disabled {
        background-color: #a0cfff;
        border-color: #a0cfff;
    }
}
.warning {
    background: #e6a23c;
    color: #fff;
    &:hover {
        background: #ebb563;
    }
    &:active {
        background: #cf9236;
    }
    &.disabled {
        background-color: #f3d19e;
        border-color: #f3d19e;
    }
}
.success {
    background: #67c23a;
    color: #fff;
    &:hover {
        background: #85ce61;
    }
    &:active {
        background: #5daf34;
    }
    &.disabled {
        background-color: #b3e19d;
        border-color: #b3e19d;
    }
}
.danger {
    background: #f56c6c;
    color: #fff;
    &:hover {
        background: #f78989;
    }
    &:active {
        background: #dd6161;
    }
    &.disabled {
        background-color: #fab6b6;
        border-color: #fab6b6;
    }
}

svg {
    vertical-align: sub;
    & + span {
        margin-left: 5px;
    }
}
path {
    animation: rotating 2s linear infinite;
    transform-origin: 50% 50%;
}
@keyframes rotating {
    0% {
        transform: rotate(0deg);
    }
    25% {
        transform: rotate(90deg);
    }
    50% {
        transform: rotate(180deg);
    }
    75% {
        transform: rotate(270deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>