<template>
    <ul class="pagination" v-if="!hide">
        <li
            :class="index > 1 ? '' : 'disabled'"
            @click="changeIndex(1)"
            title="First"
        >
            &lt;&lt;
        </li>
        <li
            :class="index > 1 ? '' : 'disabled'"
            @click="changeIndex(index - 1)"
            title="Prev"
        >
            &lt;
        </li>
        <template v-if="page - index + 3 <= pageCount && page - 3 > 0">
            <li
                v-if="index - 4 + pageCount > page && index - 4 > 0"
                @click="changeIndex(index - 4)"
            >
                {{ index - 4 }}
            </li>
            <li
                v-if="index - 3 + pageCount > page && index - 3 > 0"
                @click="changeIndex(index - 3)"
            >
                {{ index - 3 }}
            </li>
        </template>
        <li v-if="index > 2" @click="changeIndex(index - 2)">
            {{ index - 2 }}
        </li>
        <li v-if="index > 1" @click="changeIndex(index - 1)">
            {{ index - 1 }}
        </li>
        <li class="actived" @click="changeIndex(index)">{{ index }}</li>
        <li v-if="page - 1 >= index" @click="changeIndex(index + 1)">
            {{ index + 1 }}
        </li>
        <li v-if="page - 2 >= index" @click="changeIndex(index + 2)">
            {{ index + 2 }}
        </li>
        <template v-if="index + 3 <= pageCount && page - 3 > 0">
            <li
                v-if="index + 3 <= pageCount && index + 3 <= page"
                @click="changeIndex(index + 3)"
            >
                {{ index + 3 }}
            </li>
            <li
                v-if="index + 4 <= pageCount && index + 4 <= page"
                @click="changeIndex(index + 4)"
            >
                {{ index + 4 }}
            </li>
        </template>
        <li
            :class="page - 1 >= index ? '' : 'disabled'"
            @click="changeIndex(index + 1)"
            title="Next"
        >
            &gt;
        </li>
        <li
            :class="page !== index ? '' : 'disabled'"
            @click="changeIndex(page)"
            title="End"
        >
            &gt;&gt;
        </li>
    </ul>
</template>

<script>
export default {
    name: "nmsPagination",
    data() {
        return {
            index: this.currentPage,
            // 显示的页码数
            pageCount: 5,
        };
    },
    computed: {
        page() {
            return Math.ceil(this.total / this.pageSize) || 1;
        },
        hide() {
            return this.hideOnSinglePage && this.total <= this.pageSize;
        },
    },
    props: {
        // 每页显示的条数
        pageSize: {
            type: Number,
            default: 20,
        },
        // 当前页
        currentPage: {
            type: Number,
            default: 1,
        },
        // 总条数
        total: {
            type: Number,
            required: true,
        },
        // 单页(总条数少于每页条数)时是否隐藏分页
        hideOnSinglePage: {
            type: Boolean,
            default: true,
        },
    },
    methods: {
        changeIndex(index) {
            if (this.index === index || index < 1 || index > this.page) {
                return;
            }
            this.index = index;
            this.$emit("current-change", index);
        },
    },
    watch: {
        currentPage() {
            this.index = this.currentPage;
        },
    },
};
</script>

<style lang="less" scoped>
ul.pagination {
    margin: 10px;
    user-select: none;
    display: inline-block;
    > li.disabled {
        cursor: not-allowed;
        box-shadow: none;
        opacity: 0.65;
    }
    &:after {
        content: "";
        display: table;
        clear: both;
    }
    > li {
        float: left;
        font-size: 16px;
        color: #666;
        margin-left: 10px;
        border-radius: 3px;
        padding: 3px 8px;
        border: 1px solid #333;
        cursor: pointer;
    }
    > li.actived {
        color: #67aef7;
        border-color: #67aef7;
    }
    li.paginations:after {
        content: "";
        display: table;
        clear: both;
    }
}
</style>