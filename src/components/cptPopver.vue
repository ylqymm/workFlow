<template>
  <div class="approval-CptPopver">
    <el-popover placement="top" v-if="type" popper-class="set_promoter_explain_tip" width="270" trigger="hover">
      <div>
        <p class="explain_tip_title">以发起人的直接部门主管为第一级</p>
        <div class="explain_tip_flow flex">
          <div class="explain_tip_flow_list">
            <p>第四级主管</p>
            <p><i class="el-icon-top"></i></p>
          </div>
          <div class="explain_tip_flow_list">
            <p>第三级主管</p>
            <p><i class="el-icon-top"></i></p>
          </div>
          <div class="explain_tip_flow_list">
            <p>第二级主管</p>
            <p><i class="el-icon-top"></i></p>
          </div>
          <div class="explain_tip_flow_list">
            <p style="color:#4880FF">第一级主管</p>
            <p><i class="el-icon-top"></i></p>
          </div>
          <div class="explain_tip_flow_list">
            <p><i class="iconfont icon-icon_sponsor"></i> 发起人</p>
          </div>
        </div>
      </div>
      <i slot="reference" class="iconfont icon-icon_explain"></i>
    </el-popover>
    <el-popover v-else placement="top" popper-class="set_promoter_explain_tip" width="270" trigger="hover">
      <div>
        <p class="explain_tip_title">以公司的最高部门为第一级</p>
        <div class="explain_tip_flow flex">
          <div class="explain_tip_flow_list">
            <p style="color:#4880FF">第一级主管</p>
            <p><i class="el-icon-top"></i></p>
          </div>
          <div class="explain_tip_flow_list">
            <p>第二级主管</p>
            <p><i class="el-icon-top"></i></p>
          </div>
          <div class="explain_tip_flow_list">
            <p>第三级主管</p>
            <p><i class="el-icon-top"></i></p>
          </div>
          <div class="explain_tip_flow_list">
            <p>第四级主管</p>
            <p><i class="el-icon-top"></i></p>
          </div>
          <div class="explain_tip_flow_list">
            <p><i class="iconfont icon-icon_sponsor"></i> 发起人</p>
          </div>
        </div>
      </div>
      <i slot="reference" class="iconfont icon-icon_explain"></i>
    </el-popover>
  </div>
</template>

<script>
export default {
  props: ['type'],
};
</script>

<style lang="less">
.approval-CptPopver {
  display: inline-block;
}

.set_promoter_explain_tip {
  padding: 16px 21px;

  .explain_tip_title {
    color: #828282;
    margin-bottom: 11px;
  }

  .explain_tip_flow {
    padding: 21px 0;
    background-color: #f7f8fa;
    flex-direction: column;
    text-align: center;
    color: #828282;

    i {
      color: #bfbfbf;
      margin: 6px 0;
    }

    .icon-icon_sponsor {
      color: #828282;
    }
  }
}
</style>