<template>
  <div class="nodeflow-components">
    <div class="node-wrap" v-if="nodeConfig.type != 4">
      <div class="node-wrap-box" v-if="nodeConfig.type && nodeConfig.type != 0" :class=" (nodeConfig.type == 0 ? 'start-node ' : '') + (isTried && nodeConfig.error ? 'active error' : '') ">
        <div @click="setPerson">
          <div class="title" :style="
                        'background: rgb(' + [ '87, 106, 149', '230, 162, 60', '72, 128, 255', ][nodeConfig.type] + ');' ">
            <span class="editable-title">{{ nodeConfig.nodeName }}</span>
            <i class="el-icon-close close" v-if="nodeConfig.type != 0" @click.stop="delNode()"></i>
          </div>
          <div class="content">
            <div class="text" v-if="nodeConfig.type == 1">
              <span class="placeholder" v-if="setApproverStr(nodeConfig) === ''">
                请选择{{ placeholderList[nodeConfig.type] }}
              </span>
              {{ setApproverStr(nodeConfig) }}
            </div>
            <div class="text" v-if="nodeConfig.type == 2">
              <span class="placeholder" v-if="setApproverStr(nodeConfig) === ''">
                请选择{{ placeholderList[nodeConfig.type] }}
              </span>
              {{ setApproverStr(nodeConfig) }}
            </div>
            <i class="el-icon-arrow-right arrow"></i>
          </div>
          <div class="error_tip" v-if="isTried && nodeConfig.error">
            <i class="iconfont icon-icon_remind" style="color: rgb(242, 86, 67);"></i>
          </div>
        </div>
      </div>
      <addNode :childNodeP.sync="nodeConfig.childNode"></addNode>
    </div>
    <div class="branch-wrap" v-if="nodeConfig.type == 4">
      <div class="branch-box-wrap">
        <div class="branch-box">
          <button class="add-branch" @click="addTerm">
            添加条件
          </button>
          <div class="col-box" v-for="(item, index) in nodeConfig.conditionNodes" :key="index">
            <div class="condition-node">
              <div class="condition-node-box">
                <div class="auto-judge" @click="setPerson(item.priorityLevel,item)" :class="isTried && item.error ? 'error active' : '' ">
                  <div class="sort-left" v-if="index != 0" @click.stop="arrTransfer(index, -1)">
                    &lt;
                  </div>
                  <div class="title-wrapper">
                    <span class="editable-title">{{ item.nodeName }}</span>
                    <span class="priority-title">优先级{{ item.priorityLevel }}</span>
                    <i class="el-icon-close close" @click.stop="delTerm(index)"></i>
                  </div>
                  <div class="sort-right" v-if=" index != nodeConfig.conditionNodes .length - 1 " @click.stop="arrTransfer(index)"> &gt; </div>
                  <div class="content">
                    {{ conditionStr(item, index) }}
                  </div>
                  <div class="error_tip" v-if="isTried && item.error">
                    <i class="iconfont icon-icon_remind" style="color: rgb(242, 86, 67);"></i>
                  </div>
                </div>
                <addNode :childNodeP.sync="item.childNode" :tip="'条件'"></addNode>
              </div>
            </div>
            <nodeWrap v-if="item.childNode && item.childNode" :dataFields="dataFields" :nodeConfig.sync="item.childNode" :isTried.sync="isTried"></nodeWrap>
            <div class="top-left-cover-line" v-if="index == 0"></div>
            <div class="bottom-left-cover-line" v-if="index == 0"></div>
            <div class="top-right-cover-line" v-if="index == nodeConfig.conditionNodes.length - 1"></div>
            <div class="bottom-right-cover-line" v-if="index == nodeConfig.conditionNodes.length - 1"></div>
          </div>
        </div>
        <addNode :childNodeP.sync="nodeConfig.childNode"></addNode>
      </div>
    </div>
    <nodeWrap v-if="nodeConfig.childNode && nodeConfig.childNode" :dataFields="dataFields" :nodeConfig.sync="nodeConfig.childNode" :isTried.sync="isTried"></nodeWrap>
    <el-drawer :visible.sync="approverDrawer" custom-class="set_promoter" append-to-body direction="rtl" size="560px" :before-close="saveApprover">
      <div slot="title" class="title flex">
        <span v-if="!approverConfig.titleInputFlag">{{ approverConfig.nodeName }}</span>
        <el-input maxlength="20" autofocus v-else v-model="approverConfig.nodeName" @blur="nodeNameBlur" placeholder=""></el-input>
        <!-- 默认条件不需编辑 -->
        <i v-if="!defaultApprovalDrawer" class="iconfont icon-icon_edit1 mainColor" @click="editNodename"></i>
      </div>
      <div>
        <div class="drawer-content" v-if="approverConfig.type == 1">
          <el-tabs :is-hide-nav="true">
            <el-tab-pane label="节点类型">
              <el-radio-group v-model="approverConfig.examineMode" @change="setExamineModeRadio">
                <el-radio v-for="item in examineModeList" :key="item.value" :label="item.value">
                  {{ item.label }}
                  <span class="mark">({{ item.mark }})</span>
                </el-radio>
              </el-radio-group>
            </el-tab-pane>
            <el-tab-pane label="审批人类型">
              <div v-if="approverConfig.examineMode === '3'">
                <p style="margin-bottom:16px">
                  连续多级部门主管<span style="color:#828282;margin-left:8px">(按照组织架构，发起人<span style="color:#4880FF;">向上的各级主管</span>依次审批)</span>
                </p>
                <el-radio-group v-model="approverConfig.nodeUserType.value">
                  <el-radio :label="`m-${directorLevel}`">
                    <span style="margin-right:8px">直到发起人向上的</span>
                    <el-select style="width:140px" v-model="directorLevel" placeholder="请选择">
                      <el-option v-for="(item, index) in directorLevelList" :key="index" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                  </el-radio>
                  <cptPopver :type="true"></cptPopver>
                  <el-radio :label="directorLevel">
                    <span style="margin-right:8px">直到</span>
                    <el-select style="width:140px" v-model="directorLevel" placeholder="请选择">
                      <el-option v-for="(item, index) in directorLevelList" :key="index" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                  </el-radio>
                  <cptPopver></cptPopver>
                </el-radio-group>
              </div>
              <div v-else>
                <el-radio-group v-model="approverConfig.nodeUserType.type" @change="setTypeRadio">
                  <el-radio label="manager">部门主管</el-radio>
                  <el-radio label="role">审批角色</el-radio>
                  <el-radio label="user">指定用户</el-radio>
                </el-radio-group>
                <div v-if=" approverConfig.nodeUserType.type && approverConfig.nodeUserType.type !== 'manager' ">
                  <el-form ref="form" label-width="90px">
                    <el-form-item :label="setTypeLabel">
                      <div v-if="approverConfig.nodeUserType.type === 'user'">
                        <el-select v-model="approverConfig.nodeUserType.valueList" remote :remote-method="remoteMethod" filterable multiple placeholder="请选择">
                          <el-option v-for="item in useroptions" :key="item.id" :label="item.userName" :value="item.id"> </el-option>
                        </el-select>
                      </div>
                      <div v-if="approverConfig.nodeUserType.type === 'role'">
                        <el-select v-model="approverConfig.nodeUserType.valueList" filterable multiple placeholder="请选择">
                          <el-option v-for="item in useroptions" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                        </el-select>
                      </div>
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class="drawer-content" v-if="approverConfig.type == 2">
          <el-tabs :is-hide-nav="true">
            <el-tab-pane label="抄送人类型">
              <div>
                <el-radio-group v-model="approverConfig.nodeUserType.type" @change="setTypeRadio">
                  <el-radio label="manager">连续多级部门主管</el-radio>
                  <el-radio label="role">抄送角色</el-radio>
                  <el-radio label="user">指定用户</el-radio>
                </el-radio-group>
                <div v-if=" approverConfig.nodeUserType.type !== 'manager' ">
                  <el-form ref="form" label-width="90px" v-if="approverConfig.nodeUserType.type">
                    <el-form-item :label="setTypeLabel">
                      <div v-if="approverConfig.nodeUserType.type === 'user'">
                        <el-select v-model="approverConfig.nodeUserType.valueList" remote :remote-method="remoteMethod" filterable multiple placeholder="请选择">
                          <el-option v-for="item in useroptions" :key="item.id" :label="item.userName" :value="item.id"> </el-option>
                        </el-select>
                      </div>
                      <div v-if="approverConfig.nodeUserType.type === 'role'">
                        <el-select v-model="approverConfig.nodeUserType.valueList" filterable multiple placeholder="请选择">
                          <el-option v-for="item in useroptions" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                        </el-select>
                      </div>
                    </el-form-item>
                  </el-form>
                </div>
                <div v-else>
                  <p style="margin-bottom:16px;font-size:14px">
                    按组织架构，发起人<span style="color:#4880FF;">向上的各级主管</span>依次抄送
                  </p>
                  <el-radio-group v-model=" approverConfig.nodeUserType.value ">
                    <el-radio :label="`m-${directorLevel}`">
                      <span style="margin-right:8px">直到发起人向上的</span>
                      <el-select style="width:140px" v-model="directorLevel" placeholder="请选择" @change=" approverConfig.nodeUserType.value = `m-${directorLevel}` ">
                        <el-option v-for="(item, index) in directorLevelList" :key="index" :label="item.label" :value="item.value"></el-option>
                      </el-select>
                    </el-radio>
                    <cptPopver :type="true"></cptPopver>
                    <el-radio :label="directorLevel">
                      <span style="margin-right:8px">直到</span>
                      <el-select style="width:140px" v-model="directorLevel" placeholder="请选择" @change=" approverConfig.nodeUserType.value = directorLevel ">
                        <el-option v-for="(item, index) in directorLevelList" :key="index" :label="item.label" :value="item.value"></el-option>
                      </el-select>
                    </el-radio>
                    <cptPopver></cptPopver>
                  </el-radio-group>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class="drawer-content drawer-content-condition" v-if="approverConfig.type == 3">
          <!-- 默认条件 -->
          <div v-if="defaultApprovalDrawer" class="default-style">其他情况</div>
          <div v-else>
            <div v-for="(item, index) in approverConfig.conditionList" :key="index">
              <div class="condition-conent-group">
                <div class="condition-group-title flex">
                  <div class="dang-style">条件组</div>
                  <div>
                    <i class="remove el-icon-delete" @click="removeCondition('group', index)"></i>
                  </div>
                </div>
                <div class="condition-group-select" v-for="(it, ind) in item.conditionChildrenNodes" :key="ind">
                  <div class="mg-bot-10">
                    <div v-if="ind === 0" class="flex flex-style">
                      <span class="dang-style">当</span>
                      <i class="remove el-icon-delete" @click=" removeCondition( 'oneCondition', index, ind ) "></i>
                    </div>
                    <div v-else class="flex">
                      <el-select style="width: 110px;" v-model="it.conditionOperator" placeholder="请选择">
                        <el-option label="且" :value="'&&'"></el-option>
                        <el-option label="或" :value="'||'"></el-option>
                      </el-select>
                      <i class="remove iconfont icon-icon_viewpicture_delete" @click=" removeCondition( 'oneCondition', index, ind ) "></i>
                    </div>
                  </div>
                  <el-row :gutter="5" class="mg-bot-10">
                    <el-col :span="8">
                      <el-select v-model="it.leftFileds" placeholder="请选择" @change="dataFieldsChange(it)">
                        <el-option v-for="item in dataFields" :label="item.name" :value="item.key" :key="item.key"></el-option>
                      </el-select>
                    </el-col>
                    <el-col :span="5">
                      <el-select v-model="it.centerFileds" placeholder="请选择">
                        <el-option v-for="item in operatorList" :label="item" :value="item" :key="item"></el-option>
                      </el-select>
                    </el-col>
                    <el-col :span="10">
                      <el-date-picker v-model="it.rightFileds" v-if="it.leftFiledsType === 'date'" type="date" placeholder="选择日期" value-format="yyyy-MM-dd">
                      </el-date-picker>
                      <el-input v-else v-model="it.rightFileds" placeholder="请输入"></el-input>
                    </el-col>
                  </el-row>
                </div>
                <div class="conditionbtn" @click="addConditionGroup('1', item)">
                  <el-button type="">
                    <i class="el-button-suffix el-icon-plus"></i>添加条件
                  </el-button>
                </div>
              </div>
              <div v-if=" index === 0 && approverConfig.conditionList.length > 1 " class="flex" style="height:54px;padding:0 24px">
                <el-select style="width: 110px;margin-top:7px" v-model="item.conditionGroupOperator" placeholder="请选择">
                  <el-option label="且" :value="'&&'"></el-option>
                  <el-option label="或" :value="'||'"></el-option>
                </el-select>
              </div>
            </div>
            <div class="conditionbtn">
              <el-button type="" @click="addConditionGroup('0')">
                <i class="el-button-suffix el-icon-plus"></i>添加条件组
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <div class="set_promoter_footer flex">
        <!-- 默认条件弹框只展示关闭按钮 -->
        <div v-if="defaultApprovalDrawer">
          <el-button type="primary" @click="approverDrawer = false">关闭</el-button>
        </div>
        <div class="flex" v-else>
          <el-button type="primary" @click="saveApprover">确定</el-button>
          <el-button @click="approverDrawer = false">取消</el-button>
        </div>
      </div>
    </el-drawer>

  </div>
</template>
<script>
import addNode from './addNode'
import cptPopver from './cptPopver'
// import {
//   companyRoles, //树状app角色
//   companyUsersList, //用户列表
// } from '@/api/company'
export default {
  name: 'nodeWrap',
  components: { addNode, cptPopver, },
  props: ['nodeConfig', 'isTried', 'dataFields'],
  data() {
    return {
      placeholderList: ['发起人', '审核人', '抄送人'],
      directorLevelList: [{
        value: '1',
        label: '第一级主管',
      },
      {
        value: '2',
        label: '第二级主管',
      },
      {
        value: '3',
        label: '第三级主管',
      },
      {
        value: '4',
        label: '第四级主管',
      },
      {
        value: '5',
        label: '第五级主管',
      },
      {
        value: '6',
        label: '第六级主管',
      },
      {
        value: '7',
        label: '第七级主管',
      },
      {
        value: '8',
        label: '第八级主管',
      },
      {
        value: '9',
        label: '第九级主管',
      },
      {
        value: '10',
        label: '第十级主管',
      },
      ],
      //审批弹框字段Obj
      approverConfig: {},
      searchUser: "",
      directorLevel: '1', //主管层级
      nodeUser: '', //审批人（stringList）
      approverDrawer: false, //审批弹框
      defaultApprovalDrawer: false, //默认条件弹框
      conditionDrawer: false, //条件弹框
      //条件弹框字段
      conditionsConfig: {},
      conditionConfig: {}, //条件弹框item
      useroptions: [
        { name: "admin", id: "1", userName: "admin" },
        { name: "Anna", id: "2", userName: "Anna" },
      ],
      userInfo: {
        data: [],
        total: 0
      },
      examineModeList: [{
        value: '1',
        label: '会签审批',
        mark: '需要所有审批人同意，该审批节点才通过',
      },
      {
        value: '2',
        label: '或签审批',
        mark: '任意一名审批人同意，该审批节点即通过',
      },
      {
        value: '3',
        label: '逐级审批',
        mark: '按人事部门层级逐级依次审批后，该审批节点才通过',
      },
      ],
      operatorList: ['=', '!=', '>', '>=', '<', '<='],
      // -----
      isInputList: [],
      isInput: false,
      hasFlag: false,
      conditionTip: '',
      bPriorityLevel: '',
      conditionList: [],
      pager: {
        current: 1,
        size: 10
      },
      selectionList: [], //表格选中id
      userOriginList: []

    }
  },
  watch: {
    approverDrawer(val) {
      if (!val) {
        this.defaultApprovalDrawer = false;
      }
    },
    approverDrawer(val) {
      if (!val) {
        this.hasFlag = false;
        this.conditionTip = "";
      }
    }
  },

  computed: {
    setTypeLabel() {
      if (this.approverConfig.nodeUserType.type === 'manager')
        return '部门主管：'
      if (
        this.approverConfig.nodeUserType.type === 'role' &&
        this.approverConfig.type === 1
      )
        return '审批角色：'
      if (
        this.approverConfig.nodeUserType.type === 'role' &&
        this.approverConfig.type === 2
      )
        return '抄送角色：'
      if (this.approverConfig.nodeUserType.type === 'user')
        return '指定用户：'
      return ''
    },
  },
  async mounted() {
    if (this.nodeConfig.type == 1) {
      this.nodeConfig.error = this.setApproverStr(this.nodeConfig) == ''
    } else if (this.nodeConfig.type == 2) {
      this.nodeConfig.error = this.setApproverStr(this.nodeConfig) === ''
    } else if (this.nodeConfig.type == 4) {
      for (var i = 0; i < this.nodeConfig.conditionNodes.length; i++) {
        this.nodeConfig.conditionNodes[i].error =
          this.conditionStr(this.nodeConfig.conditionNodes[i], i) ==
          '请设置条件'
      }
    }
  },
  methods: {
    remoteMethod(query) {
      this.searchUser = query;
      if (query !== '') {
        if (this.approverConfig.nodeUserType.type === 'user') {
          // this.companyUsersList();
        }
      } else {
        this.useroptions = this.userOriginList;
      }
    },
    selectionChange(val) {
      this.selectionList = val.map(item => item.id);
    },
    saveUserInfo() {
      this.approverConfig.nodeUserType.valueList = this.selectionList;
      // this.dialogFlag = false;
    },
    //删除条件组和条件
    removeCondition(conditonflag, index, ind) {
      if (conditonflag === 'group') {
        this.approverConfig.conditionList.splice(index, 1)
        return
      }
      this.approverConfig.conditionList[
        index
      ].conditionChildrenNodes.splice(ind, 1)
    },
    //审批选择节点
    setExamineModeRadio(val) {
      this.$set(this.approverConfig.nodeUserType, 'value', '')
      this.$set(this.approverConfig.nodeUserType, 'valueList', [])
      if (val === '3') {
        this.approverConfig.nodeUserType.type = 'manager'
      }
    },
    //添加条件组
    addConditionGroup(flag, item) {
      if (flag === '1') {
        item.conditionChildrenNodes.push({
          conditionOperator: '',
          leftFileds: '',
          centerFileds: '',
          rightFileds: '',
        })
        return
      }
      this.approverConfig.conditionList.push({
        conditionChildrenNodes: [],
        conditionGroupOperator: '',
      })
    },
    //节点类型
    setTypeRadio(val) {
      if (this.approverConfig.nodeUserType.valueList.length > 0) {
        this.approverConfig.nodeUserType.valueList = ''
      }
      // this.approverConfig.nodeUserType.value = ''
      if (val === 'role') {
        // this.companyRoles()
        return
      }
      if (val === 'user') {
        // this.companyUsersList()
        return
      }
      if (val === 'manager') {
        this.approverConfig.nodeUserType.value = '部门主管'
      }
    },
    //修改节点name
    editNodename() {
      this.$set(this.approverConfig, 'titleInputFlag', true)
    },
    nodeNameBlur() {
      this.$set(this.approverConfig, 'titleInputFlag', false)
    },
    //条件显示
    conditionStr(item, index) {
      let {
        conditionList, //条件组
        conditionString, //条件数据
        conditionStringName, //条件显示
      } = item
      let arr = [true] //判断条件是否有值
      if (conditionList.length === 0 || conditionString === '') {
        if (item.nodeName === '默认') {
          return '其他情况'
        }
        return '请设置条件'
      }
      if (conditionList.length !== 0) {
        if (conditionList.length === 1) {
          //当条件组为一个
          conditionList[0].conditionChildrenNodes &&
            conditionList[0].conditionChildrenNodes.forEach(
              (item, index) => {
                if (item.leftFileds == '' || item.centerFileds == '' || item.rightFileds == '') {
                  arr.push(false)
                }
                if (index !== 0 && item.conditionOperator == '') {
                  arr.push(false)
                }
              }
            )
        } else {
          //当条件组为多个（判断是否有运算符）
          conditionList.forEach((item, index) => {
            if (index != conditionList.length - 1) {
              //条件组不为最后一个.校验是否有条件运算符
              if (item.conditionGroupOperator == '')
                arr.push(false)
            }
            if (
              item.conditionChildrenNodes &&
              item.conditionChildrenNodes.length > 0
            ) {
              item.conditionChildrenNodes.forEach((it, ind) => {
                if (
                  it.leftFileds === '' ||
                  it.centerFileds === '' ||
                  it.rightFileds == ''
                )
                  arr.push(false)
                if (ind !== 0 && it.conditionOperator == '')
                  arr.push(false)
              })
            } else if (
              item.conditionChildrenNodes &&
              item.conditionChildrenNodes.length == 0
            ) {
              arr.push(false)
            }
          })
        }
        if (arr.includes(false)) {
          return '请设置条件'
        }
      }
      return conditionStringName
    },
    dealStr(str, obj) {
      let arr = []
      let list = str.split(',')
      for (var elem in obj) {
        list.map((item) => {
          if (item == elem) {
            arr.push(obj[elem].value)
          }
        })
      }
      return arr.join('或')
    },
    //审批人抄送人显示和校验
    setApproverStr(nodeConfig) {
      let type = '会签';
      let role = '部门主管';
      if (nodeConfig.nodeUserType.type === 'role') role = '角色';
      if (nodeConfig.nodeUserType.type === 'user') role = '用户';
      if (nodeConfig.nodeUserType.value == '') return '';
      if (nodeConfig.type === 1) {
        //审批
        if (nodeConfig.examineMode === '1') type = '会签'
        if (nodeConfig.examineMode === '2') type = '或签'
        if (nodeConfig.examineMode === '3') type = '逐级审批'
        if (nodeConfig.nodeUserType.type === 'manager' && nodeConfig.examineMode === '3') {
          if (nodeConfig.nodeUserType.value.indexOf('m') != -1) {
            return `由发起人向上的${nodeConfig.nodeUserType.valueName}审批`
          } else {
            return `由${nodeConfig.nodeUserType.valueName}审批`
          }
        }
        if (nodeConfig.nodeUserType.type === 'manager' && nodeConfig.examineMode !== '3') {
          return `由${role}${type}`
        }
        return `由${role}：${nodeConfig.nodeUserType.valueName}${type}`
      }
      if (nodeConfig.type === 2) {
        //抄送
        if (nodeConfig.nodeUserType.value == '') return ''
        if (nodeConfig.nodeUserType.type === 'manager') {
          //主管
          if (nodeConfig.nodeUserType.value.indexOf('m') != -1) {
            return `给发起人向上的${nodeConfig.nodeUserType.valueName}抄送`
          } else {
            return `给${nodeConfig.nodeUserType.valueName}抄送`
          }
        }
        // 角色、用户
        return `给${role}：${nodeConfig.nodeUserType.valueName}抄送`
      }
    },
    //保存弹框设置
    saveApprover() {
      if (this.approverConfig.type === 3) {
        this.saveCondition()
        return
      }
      let list = this.approverConfig.nodeUserType.valueList;
      let nameList = [] // 下拉框:审批角色是name，指定用户是userName
      if (list.length > 0) {
        this.useroptions.forEach((item) => {
          list.forEach((i) => {
            if (this.approverConfig.nodeUserType.type === 'role') {
              if (item.id === i) nameList.push(item.name);
            };
            if (this.approverConfig.nodeUserType.type === 'user') {
              if (item.id === i) nameList.push(item.userName);
            };
          })
        })
        this.approverConfig.nodeUserType.value = list.join(',')
        this.approverConfig.nodeUserType.valueName = nameList.join(',')
      } else if (this.approverConfig.nodeUserType.type !== 'manager') {
        this.approverConfig.nodeUserType.value = ''
        this.approverConfig.nodeUserType.valueName = ''
      }
      if (this.approverConfig.nodeUserType.type === 'manager') {
        //抄送 、审批人逐级审批
        if (this.approverConfig.type === 2 || this.approverConfig.type === 1) {
          let num = this.approverConfig.nodeUserType.value;
          if (num.indexOf('m') !== -1) {
            num = num.substring(2)
          }
          this.directorLevelList.forEach((item, index) => {
            if (index === num - 1)
              this.approverConfig.nodeUserType.valueName = item.label
          })
          // 默认值
          if (this.approverConfig.type === 1 && this.approverConfig.nodeUserType.type == 'manager' && !this.approverConfig.nodeUserType.value) {
            this.approverConfig.nodeUserType.value = '主管'
          }
        } else {
          this.approverConfig.nodeUserType.value = '主管'
        }
      }
      this.approverConfig.error = this.setApproverStr(this.approverConfig) === '';
      // 通过hasFlag区分添加节点后自动出现弹框及点击出现弹框
      if (this.hasFlag) {
        if (this.nodeConfig.conditionNodes && this.nodeConfig.conditionNodes.length > 0 && this.conditionTip) {  //条件分支
          this.nodeConfig.conditionNodes.forEach(element => {
            if (element.childNode && (!element.childNode.nodeUserType.value && element.childNode.nodeName === this.approverConfig.nodeName)) {  //条件分支节点赋值
              element.childNode = this.approverConfig;
            }
          });
        } else {
          this.nodeConfig.childNode = this.approverConfig;
        }
        this.$emit('update:nodeConfig', this.nodeConfig);
      } else {
        this.$emit('update:nodeConfig', this.approverConfig);
      }
      this.approverDrawer = false;
    },
    //保存条件设置
    saveCondition() {
      this.approverDrawer = false;
      let conditionString = ''; // 后端要的数据
      let conditionStringName = ''; //前端显示
      //条件循环设置
      if (this.approverConfig.conditionList.length > 0) {
        this.approverConfig.conditionList.forEach((item, indx) => {
          if (item.conditionChildrenNodes && item.conditionChildrenNodes.length > 0) {
            item.conditionChildrenNodes.forEach((it, ind) => {
              conditionString = conditionString + it.conditionOperator + it.leftFileds + it.centerFileds + it.rightFileds;
              conditionStringName = conditionStringName + it.conditionOperator + it.leftFiledsName + it.centerFileds + it.rightFileds;
            })
          }
          conditionString = conditionString + item.conditionGroupOperator;
          conditionStringName = conditionStringName + item.conditionGroupOperator;
        })
      }
      this.approverConfig.conditionString = conditionString;
      this.approverConfig.conditionStringName = conditionStringName;
      for (var i = 0; i < this.conditionsConfig.conditionNodes.length; i++) {
        this.conditionsConfig.conditionNodes[i].error =
          this.conditionStr(this.conditionsConfig.conditionNodes[i], i) == '请设置条件'
      }
      // 区分添加节点后自动出现弹框及点击出现弹框
      if (this.hasFlag) {
        this.nodeConfig.childNode = this.conditionsConfig;
        this.$emit('update:nodeConfig', this.nodeConfig);
      } else {
        this.$emit('update:nodeConfig', this.conditionsConfig)
      }
    },
    //条件字段显示name
    dataFieldsChange(it) {
      this.dataFields.forEach((item) => {
        if (item.key === it.leftFileds) {
          this.$set(it, 'leftFiledsName', item.name)
          this.$set(it, 'leftFiledsType', item.type)
        }
      })
    },
    //删除节点
    delNode() {
      this.$emit('update:nodeConfig', this.nodeConfig.childNode)
    },
    //添加条件
    addTerm() {
      let len = this.nodeConfig.conditionNodes.length;
      this.nodeConfig.conditionNodes.push({
        nodeName: '条件' + len,
        type: 3,
        priorityLevel: len + 1,
        conditionList: [],
        childNode: null,
      })
      for (var i = 0; i < this.nodeConfig.conditionNodes.length; i++) {
        this.nodeConfig.conditionNodes[i].error =
          this.conditionStr(this.nodeConfig.conditionNodes[i], i) ==
          '请设置条件' &&
          i != this.nodeConfig.conditionNodes.length - 1
      }
      this.$emit('update:nodeConfig', this.nodeConfig)
    },
    //删除条件
    delTerm(index) {
      this.nodeConfig.conditionNodes.splice(index, 1)
      for (var i = 0; i < this.nodeConfig.conditionNodes.length; i++) {
        this.nodeConfig.conditionNodes[i].error =
          this.conditionStr(this.nodeConfig.conditionNodes[i], i) ==
          '请设置条件' &&
          i != this.nodeConfig.conditionNodes.length - 1
      }
      this.$emit('update:nodeConfig', this.nodeConfig)
      if (this.nodeConfig.conditionNodes.length == 1) {
        if (this.nodeConfig.childNode) {
          if (this.nodeConfig.conditionNodes[0].childNode) {
            this.reData(
              this.nodeConfig.conditionNodes[0].childNode,
              this.nodeConfig.childNode
            )
          } else {
            this.nodeConfig.conditionNodes[0].childNode = this.nodeConfig.childNode
          }
        }
        this.$emit(
          'update:nodeConfig',
          this.nodeConfig.conditionNodes[0].childNode
        )
      }
    },
    reData(data, addData) {
      if (!data.childNode) {
        data.childNode = addData
      } else {
        this.reData(data.childNode, addData)
      }
    },
    //打开弹框
    setPerson(priorityLevel, item, data, tip) {
      this.approverDrawer = true;
      // 默认条件
      if (item && item.nodeName === '默认') {
        this.defaultApprovalDrawer = true;
      } else {
        this.defaultApprovalDrawer = false;
      }
      if (tip) {
        this.conditionTip = tip;
      }
      if (data) {   //添加节点自动出现弹框传值
        this.hasFlag = true;
        // 条件
        if (priorityLevel == 1) {
          this.bPriorityLevel = priorityLevel;
          this.conditionsConfig = JSON.parse(JSON.stringify(data));
          this.approverConfig = this.conditionsConfig.conditionNodes[priorityLevel - 1];
          return
        }
        // 审批人、抄送人
        this.approverConfig = JSON.parse(JSON.stringify(data));
      } else {  //点击出现弹框
        // 条件
        let { type } = this.nodeConfig;
        if (type == 4) {
          this.bPriorityLevel = priorityLevel;
          this.conditionsConfig = JSON.parse(JSON.stringify(this.nodeConfig));
          this.approverConfig = this.conditionsConfig.conditionNodes[priorityLevel - 1];
          return
        }
        // 审批人、抄送人
        this.approverConfig = JSON.parse(JSON.stringify(this.nodeConfig));
      }

      if (this.approverConfig.nodeUserType && this.approverConfig.nodeUserType.type === 'role') {
        // this.companyRoles()
        return
      }
      if (this.approverConfig.nodeUserType && this.approverConfig.nodeUserType.type === 'user') {
        // this.companyUsersList()
        return
      }
    },
    //获取角色
    // companyRoles() {
    //   companyRoles(this.$store.state.userInfo.companyId).then((res) => {
    //     res.data.forEach((item) => {
    //       if (item.application.appNum === this.$route.query.appNum) {
    //         this.useroptions = item.roleInfos
    //       }
    //     })
    //   })
    // },
    //获取用户(有效)
    // async companyUsersList() {
    //   let params = {
    //     companyId: this.$store.state.userInfo.companyId,
    //     // current: this.pager.current,
    //     size: 20000,
    //     status: "enable",
    //     nameLike: this.searchUser
    //     // ...this.filters    //搜索条件
    //   }
    //   let res = await companyUsersList(params);
    //   if (res.code === '200') {
    //     res.data.records.forEach((item) => {
    //       item.name = item.nickName ? item.nickName : item.userName
    //     })
    //     this.useroptions = res.data.records;
    //     this.userInfo.data = res.data.records;
    //     this.userInfo.total = res.data.total;
    //     return res.data.records;
    //   }

    // },
    arrTransfer(index, type = 1) {
      //向左-1,向右1
      this.nodeConfig.conditionNodes[index] = this.nodeConfig.conditionNodes.splice(index + type, 1, this.nodeConfig.conditionNodes[index])[0];
      this.nodeConfig.conditionNodes.map((item, index) => {
        item.priorityLevel = index + 1
      })
      for (var i = 0; i < this.nodeConfig.conditionNodes.length; i++) {
        this.nodeConfig.conditionNodes[i].error =
          this.conditionStr(this.nodeConfig.conditionNodes[i], i) ==
          '请设置条件' &&
          i != this.nodeConfig.conditionNodes.length - 1
      }
      this.$emit('update:nodeConfig', this.nodeConfig)
    },
  },
}
</script>
<style lang="less">
.el-dialog__title {
  font-size: 18px !important;
  font-weight: 600 !important;
}
.default-style {
  margin-left: 25px;
}
.search-style {
  label {
    width: 50px !important;
  }
  .el-row {
    padding-right: 0px !important;
  }
  .el-form-item__content {
    margin-left: 50px !important;
  }
}
.flex-style {
  display: flex;
  justify-content: space-between;
}
.dang-style {
  font-size: 14px;
}
.dialog-style {
  z-index: 99999 !important;
  background: rgba(0, 0, 0, 0.5);
}
.v-modal {
  background: none !important;
  z-index: -1 !important;
}
//弹框
.set_promoter {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 0 24px;
    border-bottom: 1px solid #ebebeb;

    .title {
      height: 64px;
      line-height: 64px;
      font-size: 20px;
      color: #333;
      justify-content: flex-start;

      i {
        margin-left: 8px;
        font-size: 30px;
      }
    }
  }

  .el-drawer__body {
    overflow-y: auto;
    max-height: calc(100% - 64px);
    padding-bottom: 80px;
  }

  .drawer-content {
    padding: 24px;

    .el-radio {
      margin-bottom: 16px;

      .mark {
        color: #828282;
      }

      &.is-checked {
        .mark {
          color: #4880ff;
        }
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .drawer-content-condition {
    padding: 24px 0;

    .condition-conent-group {
      border-bottom: solid 1px #ebebeb;
      padding-bottom: 20px;

      .condition-group-title {
        padding: 0 24px;
        background: #f7f8fa;
        height: 48px;
        border-top: solid 1px #ebebeb;
        border-bottom: solid 1px #ebebeb;
        margin-bottom: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .condition-group-select {
        padding: 0 24px;
      }

      .remove {
        color: #828282;

        &:hover {
          cursor: pointer;
          color: #4880ff;
        }
      }

      .mg-bot-10 {
        margin-bottom: 10px;
      }

      .conditionbtn {
        .el-button {
          border: 1px dashed #4880ff;
          width: 110px;
        }
      }
    }

    .conditionbtn {
      padding: 0 24px;
      margin-top: 26px;

      .el-button {
        border: solid 1px #4880ff;
        color: #4880ff;
        width: 123px;
      }
    }
  }

  .set_promoter_footer {
    height: 80px;
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 24px;
    justify-content: flex-end;
    background: #fff;
    width: 100%;
    border-top: 1px solid #ebebeb;
    z-index: 2;
  }

  .icon-icon_explain {
    color: #bfbfbf;
  }
}
.error_tip {
  position: absolute;
  top: 36px;
  right: 0px;
  transform: translate(150%, 0px);

  i {
    font-size: 24px;
  }
}

.add-node-popover-body {
  display: flex;
}

.el-drawer:focus,
.el-drawer__close-btn:focus {
  outline: none;
}
</style>