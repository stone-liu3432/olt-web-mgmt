<template>
    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
        <path
            d="M521.237333 112.064l184.213334 319.957333a10.666667 10.666667 0 0 1-9.237334 15.978667h-368.426666a10.666667 10.666667 0 0 1-9.237334-16l184.213334-319.936a10.666667 10.666667 0 0 1 18.474666 0z m0 799.872a10.666667 10.666667 0 0 1-18.474666 0L318.549333 592a10.666667 10.666667 0 0 1 9.237334-15.978667h368.426666a10.666667 10.666667 0 0 1 9.237334 16l-184.213334 319.936z"
            :fill="color"
        />
    </svg>
</template>

<script>
export default {
    name: "nmsSort",
    props: {
        color: {
            type: String,
            default: "#ffffff"
        }
    }
};
</script>

<style lang="less" scoped>
svg {
    display: inline-block;
    vertical-align: text-top;
    margin: 0 0 0 3px;
}
</style>