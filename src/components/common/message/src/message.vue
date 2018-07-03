<template>
    <transition name="mei-message-fade">
        <div v-if="show" :class="['mei-message',type ? `mei-message-${ type }` : '']">
            <i v-if="type=='warning'" class="mei-message-icon">
               <svg t="1516780450055" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8101" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40"><defs></defs><path d="M560 528C560 554.496 538.624 576 512 576l0 0C485.568 576 464 554.496 464 528l0-224C464 277.44 485.568 256 512 256l0 0c26.624 0 48 21.44 48 48L560 528zM560 720c0-26.496-21.376-48-48-48-26.432 0-48 21.504-48 48S485.568 768 512 768C538.624 768 560 746.496 560 720zM512 64C264.64 64 64 264.64 64 512c0 247.424 200.64 448 448 448 247.488 0 448-200.576 448-448C960 264.64 759.488 64 512 64zM512 896.768c-212.48 0-384.768-172.224-384.768-384.768S299.52 127.232 512 127.232 896.64 299.52 896.64 512 724.48 896.768 512 896.768z" p-id="8102" fill="#ffffff"></path></svg>
            </i>
            <i v-if="type=='success'" class="mei-message-icon">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" t="1515656188050"
                style="" viewBox="0 0 1024 1024" version="1.1" p-id="2186" data-spm-anchor-id="a313x.7781069.0.i11" width="40" height="40"><path d="M887.904744 298.20852c-12.863647-12.063755-33.151673-11.487488-45.215428 1.408843L415.935493 753.983819 182.815858 524.287381c-12.607338-12.416396-32.8644-12.287381-45.280796 0.319957-12.416396 12.576374-12.256417 32.8644 0.352641 45.248112l256.479935 252.671415c0.096331 0.096331 0.223626 0.127295 0.319957 0.223626s0.127295 0.223626 0.223626 0.319957c2.016073 1.919742 4.448434 3.008628 6.784464 4.288456 1.152533 0.672598 2.143368 1.663432 3.359548 2.143368 3.775837 1.47249 7.775299 2.239699 11.743798 2.239699 4.192125 0 8.384249-0.832576 12.287381-2.496009 1.312512-0.543583 2.33603-1.663432 3.552211-2.368714 2.399677-1.408843 4.895686-2.59234 6.944443-4.67206 0.096331-0.096331 0.127295-0.25631 0.223626-0.352641 0.063647-0.096331 0.192662-0.127295 0.287273-0.223626L889.277463 343.420508C901.439269 330.591265 900.768391 310.335923 887.904744 298.20852z" p-id="2187" fill="#ffffff"/></svg>
            </i>
            <i v-if="type=='error'" class="mei-message-icon">
                <svg t="1516780106581" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7228" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40"><defs></defs><path d="M557.248 512l158.56 158.528a31.808 31.808 0 0 1-0.16 45.12 31.904 31.904 0 0 1-45.12 0.16L512 557.248l-158.528 158.56a31.808 31.808 0 0 1-45.12-0.16 31.904 31.904 0 0 1-0.16-45.12L466.752 512 308.16 353.472a31.808 31.808 0 0 1 0.16-45.12 31.904 31.904 0 0 1 45.12-0.16L512 466.752l158.528-158.56a31.808 31.808 0 0 1 45.12 0.16 31.904 31.904 0 0 1 0.16 45.12L557.248 512zM512 960C264.576 960 64 759.424 64 512S264.576 64 512 64s448 200.576 448 448-200.576 448-448 448z m0-64c212.064 0 384-171.936 384-384S724.064 128 512 128 128 299.936 128 512s171.936 384 384 384z" fill="#ffffff" p-id="7229"></path></svg>
            </i>
            <span class="mei-message-con">{{ text }}</span>
        </div>
    </transition>
</template>

<script type="text/babel">
const typeMap = {
    success: "success",
    info: "info",
    warning: "warning",
    error: "error"
};
export default {
    data() {
        return {
            show: false,
            text: "",
            type: ""
        };
    },
     computed: {
        iconClass() {
            return this.type ? `mei-message-icon mei-icon-${typeMap[this.type]}` : "";
        }
    }
};
</script>

<style lang="less" scoped>
.mei-message {
    position: fixed;
    min-width: 300px;
    max-width: 800px;
    border-radius: 4px;
    position: fixed;
    z-index: 9999;
    left: 50%;
    top: 90px;
    height: 40px;
    transform: translateX(-50%);
    transition: opacity 0.3s, transform 0.4s;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 10px 10px 10px 20px;
    background-color: #909399;
    color: #000;
}
.mei-message-success {
    background-color: #67c23a;
    color: #fff;
}
.mei-message-error {
    background-color: #ff5000;
    color: #fff;
}
.mei-message-warning {
    background-color: #e6a23c;
}
.mei-message-icon {
    width: 40px;
    height: 40px;
    float: left;
}
.mei-message-con {
    line-height: 40px;
    max-width: 800px;
    height: 40px;
    display: inline-block;
    margin-left: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
}
.mei-message-fade-enter-active {
    transition: all 0.3s linear;
}
.mei-message-fade-leave-active {
    transition: all 0.3s linear;
}
.mei-message-fade-enter,
.mei-message-fade-leave-to {
    opacity: 0;
}
</style>