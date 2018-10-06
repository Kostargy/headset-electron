<template>
  <div id="module-container">
    <i class="fas fa-download"  @click='downloadSong'></i>
    <span class="connection" v-show='!connected'><i class="far fa-circle red-dot"></i>Mobile OFF</span>
    <span class="connection" v-show='connected'><i class="far fa-dot-circle green-dot"></i>Mobile ON</span>
    <div class="ytdownloader" v-show='showModal'>
      <div class="close-modal" @click.stop='closeModal'>
        <i class="fas fa-times"></i>
      </div>
      <div class="settings" @click.stop='showSettings'>
        <i class="fas fa-cogs"></i>
      </div>
      <div class="download-progress">
        <div class="percentage">
          {{progress}}%
        </div>
        <md-progress-bar md-mode="determinate" :md-value="progress"></md-progress-bar>
      </div>
    </div>
    <md-snackbar md-position="center" md-duration="3000" :md-active.sync="showSnackbar" md-persistent>
      <span>{{error_msg}}</span>
      <md-button class="md-primary" @click="showSnackbar = false">Close</md-button>
    </md-snackbar>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      showModal: false,
      progress: 0,
      error_msg: null,
      showSnackbar: false,
      connected: false,
    }
  },
  methods: {
    downloadSong: function(){
      ipcRenderer.send('downloadSong', 'download!!!!');
      if(!this.showModal) this.showModal = true;
    },
    closeModal: function(){
      this.showModal = !this.showModal;
    }
  },
  created: function(){
    let self = this;
    ipcRenderer.on('downloadSong', function (event, arg) {
      if(arg.status == 400){
        console.log(arg);
        self.error_msg = arg.msg;
        self.showSnackbar = true;
        self.showModal = false;
      }else if (arg.status == 200) {
        self.error_msg = arg.msg;
        self.showSnackbar = true;
      }
    });
    ipcRenderer.on('getSongData', function(e, args){
      console.log(args);
    });
    ipcRenderer.on('sendProgress', function(e,args){
      console.log(args);
      self.progress = args.progress.percentage.toFixed(2);
    });
    ipcRenderer.on('checkFtpConnection', function(e,args){
      console.log(args);
      if(args.status == 200){
        self.connected = args.isConnected;
      }else{
        self.connected = false;
      }
    });
  }
}
</script>

<style>
#module-container {
  position: absolute;
  top: 7px;
  left: 15px;
  width: 50px;
  height: 34px;
  color: #fff;
  z-index: 99999;
  /* padding-top: 7px; */
  font-size: 17px;
}
#module-container > i:hover{
  /*color: #5D7076;*/
  cursor: pointer;
}
.ytdownloader{
  width: 280px;
  height: 100px;
  margin-left: -15px;
  margin-top: 6px;
  background-color: #011f29;
  box-shadow: 0 10px 20px rgba(0,0,0,.19), 0 6px 6px rgba(0,0,0,.23);
  border-top: solid 1px red;
}
.download-progress{
  position: absolute;
  width: 244px;
  left: 2px;
  top: 50px;
}
.close-modal > i{
  float: right;
  margin-right: 7px;
  margin-top: 3px;
}
.connection{
  position: absolute;
  display: inline-flex;
  font-size: 12px;
  margin-left: 12px;
  margin-top: 1px;
  width: 100px;
  /* height: 22px; */
  font-weight: bold;
}
.connection > i {
  margin-right: 4px;
  line-height: 19px;
}
.red-dot{
  color: red;
}
.green-dot{
  color: #00ff00;
}
.close-modal > i:hover{
  /*color: #5D7076;*/
  cursor: pointer;
}
.settings > i{
  float: right;
  margin-right: 7px;
  margin-top: 3px;
}
.settings > i:hover{
  /*color: #5D7076;*/
  cursor: pointer;
}
.md-snackbar {
  background-color: #323232 !important;
  color: #fff !important;
}

.md-button-content {
  color: #fff !important;
}
.md-progress-bar-fill {
  background-color: #fff!important;
}
</style>
