<template>
    <div class="pagination" v-if="totalPage > 0">
        <ul>
            <li v-if="currentPage !== 1" @click="jumpTo(1)">
                <!-- prev -->
                <
            </li>
            <li v-if="currentPage - 2 > 0" @click="jumpTo(currentPage - 2)">
                {{ currentPage - 2 }}
            </li>
            <li v-if="currentPage - 1 > 0" @click="jumpTo(currentPage - 1)">
                {{ currentPage - 1 }}
            </li>
            <li @click="jumpTo(currentPage)" class="actived">
                {{ currentPage }}
            </li>
            <li v-if="currentPage + 1 <= totalPage" @click="jumpTo(currentPage + 1)">
                {{ currentPage + 1 }}
            </li>
            <li v-if="currentPage + 2 <= totalPage" @click="jumpTo(currentPage + 2)">
                {{ currentPage + 2 }}
            </li>
            <li v-if="currentPage !==  totalPage" @click="jumpTo(totalPage)">
                <!-- next -->
                >
            </li>
        </ul>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'custom-pagination',
    props: ['pagesData'],
    data(){
        return {
            //  当前页
            currentPage: '',
            //  每页显示条数
            limit: 20,
            //  跳转页数
            goPage: '',
            // pagesData: {
            //     count: 201,
            //     limit: 20
            // }
        }
    },
    created(){
        this.init();
    },
    methods: {
        init(){
            if(this.pagesData.limit){
                this.limit = this.pagesData.limit;
            }
            this.currentPage = 1;
        },
        jumpTo(index){
            if(this.currentPage === index){
                return
            }
            this.currentPage = index;
            this.$emit('updatePage', index);
        }
    },
    computed: {
        ...mapState(['lanMap']),
        //  总页数
        totalPage(){
            return  Math.ceil(this.pagesData.count/this.limit);
        }
    }
}
</script>

<style lang="less" scoped>
.pagination{
    height: 30px;
    margin: 10px 0;
    user-select: none;
    ul{
        float: right;
        line-height: 30px;
        margin-right: 30px;
        >li{
            float: left;
            width: 32px;
            text-align: center;
            border-radius: 3px;
            cursor: pointer;
            &:hover{
                color: #007acc;
            }
        }
        .actived{
            color: #fff;
            background: #007ACC;
            &:hover{
                color: #fff;
            }
        }
        &::after{
            content: '';
            display: table;
            clear: both;
        }
    }
}
</style>
