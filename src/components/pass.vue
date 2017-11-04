<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <div class="container">
      <div id="left">
          <h2>开发原因</h2>
          <center>在这个信息发达的时代，每一个人都拥有很多的平台的账号密码，我就有这种问题，多个平台通用一个密码，
            这样导致的问题是密码泄露，就会产生很严重的问题，基于自身信息的安全性避免每一个平台的密码相同而导致自身的信息暴露，故开发这样一个工具。</center>
          <h2>加密原理</h2>
          <center>此工具帮助您生成一个不可逆的密码，您只需要记住一个密码。加密原理：
            您所输入的平台号和密码为需要加密的文字。然后使用不可逆加密算法md5等等循环进行6到7次不可逆加密最后再用md5成你使用的密码，
            最后以MD5加密输出，截取0~8位小写，9~16位大写，最后加你所输入的特殊字符，6位数字计算为取之前17位加密方式的前6位数字。</center>
          <h2>存储原理</h2>
          <center>如果您选择存储密码，我们将会使用之前加密完毕的密码，使用可逆加密方式，加上一个key,这个Key值已经过md5加密后，再次加密，存放于浏览器的localstorage中
            ，当您再次访问网站时,我们会读取您的localstorage内存,然后进行解密，再次显示给您。平台名字也是使用该方式进行加密存储，只有当您选择对的加密算法，才可以解密。</center>
        </div>
      <div id="center">
        <mu-text-field label="平台名[必填]" hintText="请输入平台名字" labelFloat  v-model="stageType" />
        <mu-text-field label="密码[必填]" hintText="请输入密码" type="password" labelFloat  v-model="password" /></br>
        <mu-auto-complete filter="noFilter" label="请选择特殊符号[可选]" :maxHeight='height' @change="handleSpecial" openOnFocus labelFloat :dataSource="specialSign"/>
        <mu-checkbox :label="single ? '存储' : '不存储'" v-model="single"/></br>
        <mu-flat-button label="开始加密" class="demo-flat-button" secondary @click="crypepass"/></br>
        <div v-show="decpass">
          <mu-sub-header>生成的密钥为</mu-sub-header>
          <mu-content-block>
          全加密16位加特殊字符位： {{decpass}}</br>
          6位纯数字密码为：{{decpassN}}
          </mu-content-block>
        </div>
      </div>
      <div id="right">
        <h2>密码展示栏</h2>
        <mu-table multiSelectable :showCheckbox='isshow' ref="table">
          <mu-thead>
            <mu-tr>
              <mu-th>平台</mu-th>
              <mu-th>全加密密码</mu-th>
              <mu-th>数字密码</mu-th>
            </mu-tr>
          </mu-thead>
          <mu-tbody>
            <mu-tr v-for="data in tableData">
              <mu-td>{{data.stage}}</mu-td>
              <mu-td>{{data.pass}}</mu-td>
              <mu-td>{{data.pass6}}</mu-td>
            </mu-tr>
          </mu-tbody>
        </mu-table>
      </div>
    </div>
    <mu-dialog :open="dialog" title="提示信息" @close="close">
      请补全信息，除了特殊字符可选之外，其他三个选项都需要填写，才可以进行加密
      <mu-flat-button slot="actions" @click="close" primary label="取消"/>
      <mu-flat-button slot="actions" primary @click="close" label="确定"/>
    </mu-dialog>
  </div>
</template>

<script>
import crypto from "crypto-js";
export default {
  name: "pass",
  data() {
    return {
      msg: "密码生成器",
      height: 300,
      stageType: "",
      password: "",
      specialString: "",
      single:false,
      specialSign: [
        "~",
        "!",
        "@",
        "#",
        "$",
        "%",
        "……",
        "&",
        "*",
        "(",
        ")",
        "[",
        "]",
        "|",
        "/",
        "?",
        ",",
        "."
      ],
      dialog: false,
      decpass: "",
      decpassN: "",
      tableData: [],
      isshow: false
    };
  },
  methods: {
    handleSpecial(val) {
      this.specialString = val;
    },
    handleCryp(val) {
      this.crypt = val;
    },
    crypepass() {
      if (this.stageType && this.password) {
        const goodlife = crypto.MD5("goodlife").toString();
        const bestlife = crypto.RIPEMD160("bestlife").toString();
        const safePassword = crypto.RIPEMD160("safePassword").toString();
        const stageType = crypto.MD5(this.stageType).toString();
        const password = crypto.MD5(this.password).toString();
        // HmacSHA512 RIPEMD160 HmacRIPEMD160 EvpKDF HmacMD5 RIPEMD160 MD5
        let res = crypto
          .HmacSHA512(
            goodlife + password + safePassword,
            goodlife + stageType + bestlife
          )
          .toString();
        res = crypto.RIPEMD160(res).toString();
        res = crypto.HmacRIPEMD160(res, password + safePassword).toString();
        res = crypto.EvpKDF(res, stageType + goodlife).toString();
        res = crypto.HmacMD5(res, password + bestlife).toString();
        res = crypto.RIPEMD160(res).toString();
        res = crypto.MD5(res).toString();
        res = res.substr(0, 8) + res.substr(8, 8).toLocaleUpperCase();
        this.decpass = res + this.specialString;
        this.decpassN = res.replace(/[^\d]/g, "").substr(0, 6);
        if(this.single){
          this.save(this.stageType, this.decpass);
        }
      } else {
        this.open();
      }
    },
    save(stageType, decpass) {
      const goodlife = crypto.MD5("goodlife").toString();
      let res = crypto.RC4
        .encrypt(stageType + "@" + decpass, goodlife)
        .toString();
      for (let num = 1; num < 150; num++) {
        if (!this.$localStorage.get("" + num)) {
          this.$localStorage.set("" + num, res);
          break;
        }
      }
    },
    decrype() {
      const goodlife = crypto.MD5("goodlife").toString();
      for (let num = 1; num < 150; num++) {
        let res = this.$localStorage.get("" + num);
        if (res) {
          let dres = crypto.RC4
            .decrypt(res, goodlife)
            .toString(crypto.enc.Utf8);
          let mesg = dres.split("@");
          let mes = {
            stage: mesg[0],
            pass: mesg[1],
            pass6: mesg[1].replace(/[^\d]/g, "").substr(0, 6)
          };
          this.tableData.push(mes);
        }
      }
    },
    open() {
      this.dialog = true;
    },
    close() {
      this.dialog = false;
    }
  },
  mounted() {
    this.decrype();
  }
};
</script>
<style scoped>
h1,
h2 {
  font-weight: normal;
}
.container {
  display: flex;
  align-items: stretch;
}
#left {
  flex: 0 240px;
}
#right {
  flex: 0 450px;
}
#center {
  flex: 1 auto;
}
ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
