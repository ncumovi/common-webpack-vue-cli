<template>
  <section class="china-map-wrap">
    <div id="chinaMap" :style="chinaMapStyle"></div>
    <div class="btn-group">
      <span @click="renderProvince">中国</span>

      <template v-if="curMap && curMap.mapName != '中国'">
        <span>{{ curMap.mapName }}</span>
      </template>
    </div>
    <div
      v-if="showMenuPop"
      class="menu-pop"
      :style="{ left: menuLeft + 'px', top: menuTop + 'px' }"
    >
      <section class="menu-pop-top">
        <p>
          {{ clickedMap.name
          }}<van-icon name="clear" @click="showMenuPop = false" />
        </p>
        <p>数量：{{ clickedMap.data.value }}</p>
      </section>
      <p class="menu-pop-bottom" v-if="showGoinBtn" @click="goInCity">钻取</p>
    </div>
  </section>
</template>
<script>
import echarts from "echarts";

export default {
  data() {
    return {
      chart: null,
      curMap: null,
      mapName: "中国",
      chinaMapdata: [],
      provinceMapData: [],
      showMenuPop: false,
      menuLeft: 0,
      menuTop: 0,
      clickedMap: null,
      showGoinBtn: true,
      chinaMapStyle: {
        width: "100%",
        height: "55vh",
      },
      //34个省、市、自治区的名字拼音映射数组
      provinces: {
        //23个省
        台湾: "taiwan",
        河北: "hebei",
        山西: "shanxi",
        辽宁: "liaoning",
        吉林: "jilin",
        黑龙江: "heilongjiang",
        江苏: "jiangsu",
        浙江: "zhejiang",
        安徽: "anhui",
        福建: "fujian",
        江西: "jiangxi",
        山东: "shandong",
        河南: "henan",
        湖北: "hubei",
        湖南: "hunan",
        广东: "guangdong",
        海南: "hainan",
        四川: "sichuan",
        贵州: "guizhou",
        云南: "yunnan",
        陕西: "shanxi1",
        甘肃: "gansu",
        青海: "qinghai",
        //5个自治区
        新疆: "xinjiang",
        广西: "guangxi",
        内蒙古: "neimenggu",
        宁夏: "ningxia",
        西藏: "xizang",
        //4个直辖市
        北京: "beijing",
        天津: "tianjin",
        上海: "shanghai",
        重庆: "chongqing",
        //2个特别行政区
        香港: "xianggang",
        澳门: "aomen",
      },
      //直辖市和特别行政区-只有二级地图，没有三级地图
      special: ["北京", "天津", "上海", "重庆", "香港", "澳门"],
      timeout: null,
      //未知变量
      titledata: [],
      sortData: [],
      areaList: [],
      mapStack: [],
    };
  },
  watch: {
    showMenuPop(v) {
      if (v) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          this.showMenuPop = false;
        }, 2000);
      }
    },
  },
  mounted() {
    this.initMap();
  },

  methods: {
    initMap() {
      //地图容器
      let that = this;
      that.chart = echarts.init(document.getElementById("chinaMap"), null, {
        renderer: "svg",
      });

      that.bindEchartsEvent();
      that.chart.showLoading();
      //获取中国地图josn文件
      that.axios.get("/map/china.json").then(function (res) {
        that.chart.hideLoading();
        that.chinaMapdata = res.data;

        //注册地图
        echarts.registerMap(that.mapName, that.chinaMapdata);
        //绘制地图，样式，第一次渲染
        that.renderMap(that.mapName, that.chinaMapdata);
        that.axios
          .get("/mock/province.json")
          .then(function (res1) {
            that.proviceNumber = res1.data;
            that.renderProvince();
          })
          .catch(function (err) {
            console.error("拿不到省份数据,原因：", err);
          });
      });
    },
    // //获取省份数据包括数量等级等 //获取省份数据(数量等级)
    renderProvince() {
      this.renderPrimaryMap(
        this.mapName,
        this.proviceNumber,
        this.chinaMapdata
      );
    },
    //获取省地图map.json
    getSecondMap(params) {
      let that = this;
      that.axios
        .get("/map/province/" + that.provinces[params.name] + ".json")
        .then(function ({ data }) {
          echarts.registerMap(params.name, data);
          that.renderMap(params.name, that.provinceMapData);
          if (params.data.id !== "undifiend") {
            that.getCityNumber(params.name, params.data.id, data);
          }
        });
    },
    /**
     * 获取城市数据 数量级
     * @param {省份} name
     * @param {省份id} id
     * @param {地图json数据} data
     */
    getCityNumber(name, id, provinceMapData) {
      if (!id) {
        return;
      }
      let that = this;

      return that.axios
        .get("/mock/city/" + id + ".json")
        .then(function ({ data }) {
          that.renderPrimaryMap(name, data, provinceMapData);
        })
        .catch(function (err) {
          that.renderPrimaryMap(name, provinceMapData, provinceMapData);
          console.error("请求市级数据失败", err);
        });
    },
    //钻取
    goInCity() {
      this.showMenuPop = false;
      this.getSecondMap(this.clickedMap);
    },
    bindEchartsEvent() {
      let that = this;
      // 当我们浏览器缩放的时候，图表也等比例缩放
      window.addEventListener("resize", function () {
        // 让我们的图表调用 resize这个方法
        that.chart.resize();
      });

      //地图单击事件
      that.chart.on("click", function (params) {
        that.showMenuPop = true;
        that.menuLeft =
          params.event.offsetX + 150 > window.innerWidth
            ? params.event.offsetX - 150
            : params.event.offsetX;
        that.menuTop = params.event.offsetY;
        that.clickedMap = params;
        that.showGoinBtn = true;
        if (params.seriesName != "中国" || !params.value) {
          // 有省id，市id才有下一级
          that.showGoinBtn = false;
          console.error("该地图没有下一级地区了");
          return;
        }

        /**
         * 绑定数据入栈事件
         */
        let n = 1;
        if (that.special.indexOf(params.seriesName) == -1) {
          n = 2;
        }
        // FiXED:  2级下钻会有问题， 函数顶部加入下钻层级判断
        if (that.mapStack.length < n) {
          //将上一级地图信息压入that.mapStack
          that.mapStack.push({
            mapName: that.curMap.mapName,
            mapJson: that.curMap.mapJson,
            colorMax: that.curMap.colorMax,
            sortData: that.curMap.sortData,
            titledata: that.curMap.titledata,
          });
          console.log("数据入栈", that.mapStack);
        }
      });
    },
    /**
     *
     * @param {地图标题} mapTitle
     * @param {客户数} customerNum
     * @param {地图json数据} mapJson
     * @param {最大颜色值} colorMax
     */
    renderMap(mapTitle, mapJson, customerNum, colorMax = 1500) {
      //地图配置参数，参数按顺序渲染
      let option = {
        backgroundColor: "#F7EED6", //地图画布背景颜色  "#F7EED6"米黄色  "#efefef"灰色
        title: {
          //地图文本
          // text: mapTitle,
          // subtext: "右键返回上一级",
          left: "center",
          textStyle: {
            color: "#000",
            fontSize: 18,
            fontWeight: "normal",
            fontFamily: "Microsoft YaHei",
          },
          subtextStyle: {
            color: "rgb(55, 75, 113)",
            fontSize: 18,
            fontWeight: "normal",
            fontFamily: "Microsoft YaHei",
          },
        },

        tooltip: {
          //提示框信息
          show: false,
          trigger: "item",
          formatter: "{b}\n{c}人",
        },
        toolbox: {
          //工具box
          show: true,
          orient: "vertical",
          left: "right",
          top: "center",
          right: 20,
          feature: {
            dataView: { readOnly: false, show: false },
            restore: {
              title: "",
            },
            saveAsImage: {
              show: false,
            },
            dataZoom: {
              show: false,
            },
          },
          iconStyle: {
            normal: {
              color: "#fff",
            },
          },
        },
        // 左下角的颜色条
        visualMap: {
          show: false,
          type: "piecewise",
          min: 0,
          max: colorMax,
          left: "left",
          top: "bottom",
          text: ["高", "低"], // 文本，默认为数值文本
          splitNumber: 6,
          calculable: true,
          pieces: [
            // 自定义每一段的范围，以及每一段的文字
            { gte: 200, color: "rgb(205, 25, 47)" }, // 不指定 max，表示 max 为无限大（Infinity）。
            { gte: 100, lte: 199, color: "rgb(219, 76, 94)" },
            { gte: 30, lte: 99, color: "rgb(231, 134, 146)" },
            { gte: 10, lte: 29, color: "rgb(243, 192, 198)" },
            { gte: 1, lte: 9, color: "rgb(244, 198, 203)" },
            { lte: 0, color: "rgb(204, 204, 204)" }, // 不指定 min，表示 min 为无限大（-Infinity）。
          ],
          dimension: 0,
        },
        grid: {
          show: false,
          left: -1300,
          top: 100,
          botton: 40,
          width: "10%",
          z: 0,
        },
        xAxis: [
          {
            position: "top",
            type: "value",
            boundaryGap: false,
            splitLine: {
              show: true,
            },
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              color: "#ff461f",
            },
          },
        ],
        yAxis: [
          {
            type: "category",
            data: this.titledata,
            triggerEvent: false,
            axisTick: {
              alignWithLabel: false,
            },
            axisLine: {
              show: false,
              lineStyle: {
                show: false,
                color: "#2ec7c9",
              },
            },
          },
        ],
        series: [
          {
            name: mapTitle, //上面的下钻用到seriesName绑定下一级，换name绑定
            type: "map",
            map: mapTitle,
            roam: true, //控制缩放
            height: "100%",
            zoom: 0.75,
            z: 1,

            scaleLimit: {
              min: 0.5,
              max: 3,
            },
            label: {
              //地图上的文本标签
              normal: {
                show: true,
                position: "inside", //文本标签显示的位置
                textStyle: {
                  color: "#fff", //文本颜色
                  fontSize: 10,
                },
                formatter: "", //文本上显示的值  data:[{name: "地名", value: 数据}],  {b}表示label信息,{c}代表value
              },
              emphasis: {
                show: true,
                position: "inside",
                textStyle: {
                  color: "#fff",
                  fontSize: 10,
                },
              },
            },
            itemStyle: {
              normal: {
                areaColor: "#5ab1ef", //地图块颜色#DCE2F1  浅蓝#2B91B7
                borderColor: "#EBEBE4", //#EBEBE4灰色
              },
              emphasis: {
                areaColor: "rgb(254,153,78)", //s鼠标放上去，地图块高亮显示的颜色
              },
            },
            data: customerNum,
          },
          {
            name: mapTitle,
            type: "bar",
            z: 4,
            label: {
              normal: {
                show: true,
              },
              empahsis: {
                show: true,
              },
            },
            itemStyle: {
              emphasis: {
                color: "rgb(254,153,78)",
              },
            },
            data: customerNum,
          },
        ],
        // 初始动画的时长，支持回调函数，可以通过每个数据返回不同的 delay 时间实现更戏剧的初始动画效果：
        animationDuration: 500,
        animationEasing: "cubicOut",
        // 数据更新动画的时长。
        animationDurationUpdate: 500,
      };

      //渲染地图
      this.chart.setOption(option);
      //保存当前状态数据，用于入栈出栈
      this.curMap = {
        mapName: mapTitle,
        mapJson: mapJson,
        colorMax: colorMax,
        sortData: [],
        titledata: [],
      };
      this.chart.dispatchAction({
        type: "restore",
      });
    },
    /**
     * @description: 渲染一级地图，省
     * @param {Array}  result=后台返回的地区关联数据
     * @param {Boolean} flag=不用后台数据渲染
     * @return:
     */
    renderPrimaryMap(mapName, result, originMapJsonData) {
      let tmp = [],
        that = this,
        mapJsonData = []; // 组装临时数据，用于地图上 label和value的渲染
      for (var i = 0; i < originMapJsonData.features.length; i++) {
        mapJsonData.push({
          id: originMapJsonData.features[i].id,
          name: originMapJsonData.features[i].properties.name,
        });
      }

      let proviceNumber = that.stringToJson(result);

      /**通过id关联地图上对应位置的数据 */
      mapJsonData.forEach(function (val) {
        let count = 0;
        proviceNumber.msg.forEach(function (val2, index) {
          if (val.id == val2.provinceid || val.id == val2.cityid) {
            count = val2.num;
          }
        });
        tmp.push({
          id: val.id,
          name: val.name,
          value: count,
        });
      });

      //获取最大值，并排序
      let maxData = this.getMaxDataAndSort(tmp);
      //绘制地图，拿到数据后再渲染一次
      this.renderMap(mapName, originMapJsonData, tmp, maxData.maxData);
    },
    /*
     * @param {未排序数据} originData
     * @return {倒序排序的数据} maxData
     */
    getMaxDataAndSort(originData) {
      if (originData == "undefined") {
        return;
      }
      this.titledata = [];
      this.sortData = [];
      this.sortData = originData.sort(function (a, b) {
        return a["value"] - b["value"];
      });
      let maxData = this.sortData.slice(-1)[0]["value"];
      let maxDataId = this.sortData.slice(-1)[0]["id"];
      if (!maxDataId) {
        maxDataId = this.sortData.slice(-1)[0]["cityid"]
          ? this.sortData.slice(-1)[0]["cityid"]
          : this.sortData.slice(-1)[0]["areaid"];
      }
      for (let i = 0; i < this.sortData.length; i++) {
        this.titledata.push(this.sortData[i].name);
      }
      this.areaList = [...this.sortData].reverse();
      return {
        maxDataId,
        maxData,
      };
    },
    stringToJson(data) {
      let result = _.cloneDeep(data);
      if (!_.isObject(result)) {
        try {
          result = JSON.parse(result);
        } catch {
          throw TypeError("数据转换成JSON出错");
        }
      }
      return result;
    },
  },
};
</script>
<style lang="less">
.china-map-wrap {
  position: relative;
  .btn-group {
    position: absolute;
    top: 0.2rem;
    left: 0.2rem;
    font-size: 0.426667rem;
    span {
      &:last-child {
        color: #1989fa;
      }
    }
  }
  .menu-pop {
    position: absolute;
    width: 4rem;
    height: 2.08rem;
    background: #fff;
    font-size: 0.16rem;
    p {
      margin: 0;
      // padding: 5px;
    }
    .menu-pop-top {
      padding: 5px;
      .van-icon {
        float: right;
        position: relative;
        top: 0.04rem;
        right: 0.04rem;
        font-size: 0.533333rem;
      }
    }
    .menu-pop-bottom {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 0.8rem;
      line-height: 0.8rem;
      margin-top: 0.04rem;
      background: #ccc;
      text-align: center;
      font-size: 0.16rem;
    }
  }
}
</style>