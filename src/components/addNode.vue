<template>
  <div class="add-node-btn-box">
    <div class="add-node-btn">
      <el-popover placement="right-start" popper-class="add-node-popover" v-model="visible">
        <div class="add-node-popover-body">
          <div class="add-node-popover-item approver" @click="addType(1)">
            <div class="item-wrapper">
              <img src="../assets/img/审批人.png" alt="" class="img-style">
            </div>
            <p>审批人</p>
          </div>
          <div class="add-node-popover-item notifier" @click="addType(2)">
            <div class="item-wrapper">
              <img src="../assets/img/抄送人.png" alt="" class="img-style">
            </div>
            <p>抄送人</p>
          </div>
          <div class="add-node-popover-item condition" @click="addType(4)">
            <div class="item-wrapper">
              <img src="../assets/img/条件.png" alt="" class="img-style">
            </div>
            <p>条件分支</p>
          </div>
        </div>
        <button class="btn" type="button" slot="reference">
          <i style="color:#fff" class="el-icon-plus"></i>
        </button>
      </el-popover>
    </div>
  </div>
</template>
<script>
export default {
  props: ["childNodeP", "nodeConfig", 'tip'],
  data() {
    return {
      visible: false,
      parentObj: {},
    }
  },
  methods: {
    addType(type) {
      this.visible = false;
      let data;
      if (type != 4) {
        if (type == 1) {
          data = {
            nodeName: "审核人",
            error: true,
            type: 1,
            nodeId: "approvalID",
            examineMode: "1",
            nodeUserType: {
              type: 'manager',
              value: '',
              valueList: [],
              valueName: '',
            },
            childNode: this.childNodeP,
          }
        } else if (type == 2) {
          data = {
            nodeName: "抄送人",
            error: true,
            type: 2,
            nodeId: "copyID",
            nodeUserType: {
              type: 'manager',
              value: 'm-1',
              valueName: '第一级主管',
              valueList: [],
            },
            childNode: this.childNodeP,
          }
        }
        this.$parent.setPerson('', '', data, this.tip);  //添加节点自动弹出弹框
      } else {
        data = {
          nodeName: "路由",
          type: 4,
          nodeId: "conditionID",
          childNode: this.childNodeP,
          conditionNodes: [{
            nodeName: "条件1",
            error: true,
            type: 3,
            priorityLevel: 1,
            conditionList: [],
            childNode: null,
          }, {
            nodeName: "默认",
            error: true,
            type: 3,
            priorityLevel: 2,
            conditionList: [],
            childNode: null
          }]
        }
        this.$parent.setPerson(1, '', data);//添加节点自动弹出弹框
      }
      this.$emit("update:childNodeP", data);
    }
  }
}
</script>
<style lang="less" scoped>
.add-node-btn-box {
  width: 240px;
  display: inline-flex;
  flex-shrink: 0;
  position: relative;
  &:first-child {
    margin-left: 16px;
  }
  &:before {
    content: "";
    position: absolute;
    top: 1px;
    left: 0px;
    right: 0;
    bottom: 0;
    z-index: -1;
    margin: auto;
    width: 1px;
    // height: 100%;
    background-color: #ebebeb;
  }
}
.img-style {
  width: 36px;
}
.add-node-popover {
  padding: 14px 26px;
  .add-node-popover-body {
    display: flex;
    .add-node-popover-item {
      margin-right: 20px;
      text-align: center;
      cursor: pointer;
      &:last-child {
        margin-right: 0;
      }
      i {
        font-size: 36px;
      }
      p {
        color: #333;
        margin-top: 4px;
      }
    }
    .approver {
      i {
        color: #e6a23c;
      }
    }
    .condition {
      i {
        color: #67c23a;
      }
    }
    .notifier {
      i {
        color: #4880ff;
      }
    }
  }
}
</style>