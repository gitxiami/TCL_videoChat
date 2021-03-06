var webrtcroom = require('../../utils/webrtcroom.js')
var imHandler = require('./im_handler.js')
var webim = require('./webim_wx');
var fadeActionTimer;

const SHOWINTERACT_TYPE = {
  BOARD: 1, // 白板
  COMMENT: 2 // 聊天
}

const ROLE_TYPE = {
  AUDIENCE: 'audience', // 观众， 可以看到白板
  PRESENTER: 'presenter' // 主播， 没有白板，暂时不支持小程序端作为老师
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    template: 'bigsmall',
    webrtcroomComponent: null,
    roomID: '', // 房间id
    roomname: '', // 房间名称
    beauty: 5,
    muted: false,
    debug: false,
    hd:false,
    minBitrate: 800,
    maxBitrate:1000,
    frontCamera: true,
    fadeAction: '',
    role: ROLE_TYPE.AUDIENCE, // presenter 代表主播，audience 代表观众
    userID: '',
    userSig: '',
    sdkAppID: '',
    accountType: null,
    roomCreator: '',
    comment: [],
    toview: null,
    showInteractType: SHOWINTERACT_TYPE.COMMENT, // 标识不展示
    // 互动类型
    SHOWINTERACT_TYPE: SHOWINTERACT_TYPE,
    ROLE_TYPE: ROLE_TYPE,
    sketchpad: {
      width: 0,
      height: 0
    },
    isErrorModalShow: false,
    heartBeatFailCount: 0, //心跳失败次数
    qmtapi:0
  },

  /**
   * 监听 IM 事件
   */
  onIMEvent: function (e) {
    const CONSTANT = this.data.webrtcroomComponent.data.CONSTANT;
    let code = e.detail.code;
    let tag = e.detail.tag;
    let data = e.detail.detail;

    switch (tag) {
      // 登录事件
      case CONSTANT.IM.LOGIN_EVENT:
        if (code) {
          wx.showToast({
            icon: 'none',
            title: `登录IM失败，ErrCode: ${code}`
          });
          console.error(`登录IM失败，ErrCode: ${code}`);
        } else {
          wx.showToast({
            title: '登录IM成功'
          });
          console.log('登录IM成功');
        }
        break;
        // 创建群|进群状态
      case CONSTANT.IM.JOIN_GROUP_EVENT:
        if (code) {
          wx.showToast({
            icon: 'none',
            title: `创建群|进群失败，ErrCode: ${code}`
          });
          console.error(`创建群|进群失败，ErrCode: ${code}`);
        } else {
          wx.showToast({
            title: '创建群|进群成功'
          });
          console.log('创建群|进群成功');
        }
        break;
        // 连接状态
      case CONSTANT.IM.CONNECTION_EVENT:
        switch (code) {
          case webim.CONNECTION_STATUS.ON:
            console.log('连接状态正常...');
            break;
          case webim.CONNECTION_STATUS.OFF:
            console.error('连接已断开，无法收到新消息，请检查下你的网络是否正常');
            break;
          default:
            console.error('未知连接状态,status=' + code);
            break;
        }
        break;

      case CONSTANT.IM.GROUP_SYSTEM_NOTIFYS: // 监听（多终端同步）群系统消息事件，必填
        console.log(`群系统消息事件，code:${code}`);
        break;

      case CONSTANT.IM.GROUP_INFO_CHANGE_NOTIFY: // 监听群资料变化事件，选填
        console.log("执行 群资料变化 回调： " + JSON.stringify(groupInfo));
        var groupId = groupInfo.GroupId;
        var newFaceUrl = groupInfo.GroupFaceUrl; //新群组图标, 为空，则表示没有变化
        var newName = groupInfo.GroupName; //新群名称, 为空，则表示没有变化
        var newOwner = groupInfo.OwnerAccount; //新的群主id, 为空，则表示没有变化
        var newNotification = groupInfo.GroupNotification; //新的群公告, 为空，则表示没有变化
        var newIntroduction = groupInfo.GroupIntroduction; //新的群简介, 为空，则表示没有变化

        if (newName) {
          console.log("群id=" + groupId + "的新名称为：" + newName);
        }
        break;
      case CONSTANT.IM.BIG_GROUP_MSG_NOTIFY: // 接收到IM大群消息
        console.log('接收到大群(直播聊天室)消息通知');
        console.debug('成员进入或退出通知');
        var msgs = data;
        imHandler.handleGroupMessage(msgs, (msg) => {
          if (!msg.content) {
            return;
          }
          
          var time = new Date();
          var h = time.getHours() + '',
            m = time.getMinutes() + '',
            s = time.getSeconds() + '';
          h.length == 1 ? (h = '0' + h) : '';
          m.length == 1 ? (m = '0' + m) : '';
          s.length == 1 ? (s = '0' + s) : '';
          time = h + ':' + m + ':' + s;
          msg.time = time;

          if (msg.fromAccountNick == '@TIM#SYSTEM') {
            msg.fromAccountNick = '';
            msg.content = msg.content.split(';');

            var roomInOutInfo = JSON.parse(msg.content[1]);
            if(roomInOutInfo.type == 1){//进入房间
              if (this.data.userID != roomInOutInfo.userIdList){
                webrtcroom.imInTclRoomNotify(roomInOutInfo.userIdList, this.data.token, this.data.timestamp, function (res) {
                  if (res.status == 200) {
                    var roles = { 'anchor': '坐席', 'supporter': '支援工程师', 'company': '客户' };
                    wx.showToast({
                      title: roles[res.data.role] + '进入房间',
                      icon: 'success',
                      duration: 3000
                    })
                  } else {
                    console.log(res.msg)
                  }
                }, function (error) {
                  console.debug(error)
                });
              }
            }else if(roomInOutInfo.type == 2){//退出房间
              webrtcroom.imQuitTclRoomNotify(roomInOutInfo.userIdList, this.data.token, this.data.timestamp, function (res) {
                if (res.status == 200) {
                  wx.showModal({
                    title: '提示',
                    content: res.msg,
                    showCancel: false,
                    complete:function(){
                      if (res.data.role == 'anchor'){
                        wx.redirectTo({
                          url: '/pages/error/error'
                        })
                      }
                    }
                  })
                } else {
                  console.log(res.msg)
                }
              }, function (error) {
                console.debug(error)
              });
            }

            msg.content = msg.content[0];

            this.updateComment({
              roomID: this.data.roomID,
              userID: msg.fromAccountNick,
              userName: msg.userName,
              userAvatar: msg.userAvatar,
              message: msg.content,
              time: msg.time
            });
          } else {
            // 自定义消息
            var content = JSON.parse(msg.content);
            var data = content.data;
            var desc = null;
            try {
              desc = JSON.parse(content.desc);
            } catch (error) {
              desc = {};
            }
            var ext = content.ext;
            if (ext === 'TXWhiteBoardExt') { // 如果是白板消息
              var whiteBoardCom = this.selectComponent('#white_board');
              if (whiteBoardCom) {
                var data = JSON.parse(data);
                if (data.action === 'currentBoard') {
                  whiteBoardCom.updateCurrentBoard(data.currentBoard);
                } else {
                  whiteBoardCom.addData(data);
                }
              }
            } else if (ext === 'TEXT') { // 如果是普通消息
              this.updateComment({
                roomID: this.data.roomID,
                userID: msg.fromAccountNick,
                userName: desc.nickName,
                message: data,
                time: msg.time
              });
            }
          }
        });
        break;
    }
  },

  /**
   * 监听房间事件
   */
  onRoomEvent: function (e) {
    console.log(e);
    var self = this;
    switch (e.detail.tag) {
      case 'error':
        if (this.data.isErrorModalShow) {
          return;
        }
        if (e.detail.code === -10) { // 进房失败，一般为网络切换的过程中
          this.data.isErrorModalShow = true;
          wx.showModal({
            title: '提示',
            content: e.detail.detail,
            confirmText: '重试',
            cancelText: '退出',
            success: function (res) {
              self.data.isErrorModalShow = false
              if (res.confirm) {
                self.joinRoom();
              } else if (res.cancel) { //
                self.goBack();
              }
            }
          });
        } else {
          // 在房间内部才显示提示
          console.error("error:", e.detail.detail);
          var pages = getCurrentPages();
          console.log(pages, pages.length, pages[pages.length - 1].__route__);
          if (pages.length > 1 && (pages[pages.length - 1].__route__ == 'pages/webrtcroom/room/room')) {
            this.data.isErrorModalShow = true;
            wx.showModal({
              title: '提示',
              content: e.detail.detail,
              showCancel: false,
              complete: function () {
                self.data.isErrorModalShow = false
                pages = getCurrentPages();
                if (pages.length > 1 && (pages[pages.length - 1].__route__ == 'pages/webrtcroom/room/room')) {
                  wx.showToast({
                    title: `code:${e.detail.code} content:${e.detail.detail}`
                  });
                  wx.navigateBack({
                    delta: 1
                  });
                }
              }
            });
          }
        }
        break;
    }
  },

  /**
   * 更新聊天内容
   * @param {Object} msg 消息内容
   */
  updateComment(msg) {
    // 普通消息
    this.data.comment.push({
      content: msg.message,
      name: msg.userName,
      uid: msg.userID,
      time: msg.time
    });
    this.setData({
      comment: this.data.comment,
      toview: null // 滚动条置底
    });

    this.setData({
      toview: 'scroll-bottom' // 滚动条置底
    });
  },

  /**
   * 切换摄像头
   */
  changeCamera: function () {
    this.data.webrtcroomComponent.switchCamera();
    this.setData({
      frontCamera: !this.data.frontCamera
    })
  },

  /**
   * 设置美颜
   */
  setBeauty: function () {
    this.data.beauty = (this.data.beauty == 0 ? 5 : 0);
    this.setData({
      beauty: this.data.beauty
    });
  },

  /**
   * 设置美颜
   */
  setFadeAction: function (fadeAction) {
    this.data.fadeAction = fadeAction;
    this.setData({
      fadeAction: this.data.fadeAction
    });
  },

  /**
   * 切换是否静音
   */
  changeMute: function () {
    this.data.muted = !this.data.muted;
    this.setData({
      muted: this.data.muted
    });
  },

  /**
   * 是否显示日志
   */
  showLog: function () {
    this.data.debug = !this.data.debug;
    this.setData({
      debug: this.data.debug
    });
  },

  /**
   * 切换码率
   */
  changeBitrate: function () {
    this.data.hd = !this.data.hd;
    if(this.data.hd == true){
      this.data.minBitrate = 1200
      this.data.maxBitrate = 1600
    }else{
      this.data.minBitrate = 600
      this.data.maxBitrate = 800
    }
    this.setData({
      hd: this.data.hd,
      minBitrate: this.data.minBitrate,
      maxBitrate: this.data.maxBitrate
    });
  },

  /**
   * 创建房间
   * 房间创建成功后，发送心跳包，并启动webrtc-room标签
   */
  createRoom: function () {
    var self = this;
    webrtcroom.createRoom(self.data.userID, this.data.roomname,
      function (res) {
        console.log('创建房间成功:', res);
        self.data.roomID = res.data.roomID;

        // 成功进房后发送心跳包
        self.sendHeartBeat(self.data.userID, self.data.roomID);

        // 设置webrtc-room标签中所需参数，并启动webrtc-room标签
        self.setData({
          userID: self.data.userID,
          userSig: self.data.userSig,
          sdkAppID: self.data.sdkAppID,
          roomID: self.data.roomID,
          accountType: self.data.accountType,
          privateMapKey: res.data.privateMapKey
        }, function () {
          self.data.webrtcroomComponent.start();
        })
      },
      function (res) {
        console.error('创建房间失败[' + res.errCode + ';' + res.errMsg + ']');
        self.onRoomEvent({
          detail: {
            tag: 'error',
            code: -999,
            detail: '创建房间失败[' + res.errCode + ';' + res.errMsg + ']'
          }
        })
      });
  },

  /**
   * 进入房间， 包括进入IM和进入推流房间
   */
  enterRoom: function () {
    var self = this;
    console.log(self.data);
    webrtcroom.enterRoom(self.data.userID, self.data.roomID, self.data.token, self.data.timestamp,
      function (res) {
        console.log(res)
        self.data.accountType = res.data.accountType;
        self.data.userID = res.data.userId;
        self.data.sdkAppID = res.data.sdkappid;
        self.data.userSig = res.data.userSig;
        self.data.roomID = res.data.roomid;
        self.data.privateMapKey = res.data.privMapEncrypt;
        self.data.original = res.data.original;
        self.data.anchorIsOnline = res.data.anchorIsOnline;
        wx.setStorageSync('tcl_sessionid', self.data.original);
        wx.setStorageSync('webrtc_room_userid', self.data.userID);

        // 成功进房后发送心跳包
        //self.sendHeartBeat(self.data.userID, self.data.roomID);

        // 设置webrtc-room标签中所需参数，并启动webrtc-room标签
        self.setData({
          userID: self.data.userID,
          userSig: self.data.userSig,
          sdkAppID: self.data.sdkAppID,
          accountType: self.data.accountType,
          roomID: self.data.roomID,
          privateMapKey: self.data.privateMapKey,
          role: ROLE_TYPE.PRESENTER
        }, function () {
          self.data.webrtcroomComponent.start();
        });

        //初始坐席未进入的提醒
        setTimeout(() => {
          if (self.data.anchorIsOnline == 0 && self.data.anchorIsOnline != "notAllow" && !self.data.test) {
            wx.redirectTo({
              //url: '/pages/error/error?content=坐席还未进入房间，请稍后再试'
              url: '/pages/error/error?content=outOfTime'
            })
          }
        }, 5000);

        //后续坐席是否在线左上角图片效果
        self.Countdown(self.data.token, self.data.timestamp);
        //激活全媒体用户在线通知
        self.qmtIn(self.data.token, self.data.timestamp)
      },
      function (res) {
        console.error(self.data.ERROR_CREATE_ROOM, '进入房间失败[' + res.errCode + ';' + res.errMsg + ']')
        self.onRoomEvent({
          detail: {
            tag: 'error',
            code: -999,
            detail: '进入房间失败[' + res.errCode + ';' + res.errMsg + ']'
          }
        })
      });
  },

  /**
   * 发送心跳包
   */
  sendHeartBeat(userID, roomID) {
    var self = this;
    // 发送心跳
    webrtcroom.startHeartBeat(userID, roomID, function () {
      self.data.heartBeatFailCount = 0;
    }, function () {
      self.data.heartBeatFailCount++;
      // wx.navigateTo({
      //   url: '../roomlist/roomlist'
      // });
      // 2次心跳都超时，则认为真正超时了
      if (self.data.heartBeatFailCount > 2) {
        wx.hideToast();
        wx.showToast({
          icon: 'none',
          title: '心跳超时，请重新进入房间',
          complete: function () {
            setTimeout(() => {
              self.goBack();
            }, 1000);
          }
        });
      } else {
        wx.hideToast();
        wx.showToast({
          icon: 'none',
          title: '心跳超时，正在重试...'
        });
      }
    });
  },

  /**
   * 返回上一页
   */
  goBack() {
    var pages = getCurrentPages();
    if (pages.length > 1 && (pages[pages.length - 1].__route__ == 'pages/webrtcroom/room/room')) {
      wx.navigateBack({
        delta: 1
      });
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    this.setData({
      userID: wx.getStorageSync('webrtc_room_userid'),
      frontCamera: false
    });

    if ((options.token && options.token != '') && options.timestamp > 1500000000){
      this.data.roomID = options.roomID || '';
      this.data.username = options.userName;
      this.data.token = options.token;
      this.data.timestamp = options.timestamp;
      this.data.test = options.test ? options.test : 0;
      this.setData({
        roomCreator: options.roomCreator || this.data.userID
      });
      this.joinRoom();
    }else{
      wx.showModal({
        title: '提示',
        content: '房间已失效或过期，请联系坐席重新开通音视频房间，谢谢',
        showCancel: false,
        complete: function () {
          return false;
        }
      });
    }
  },

  /**
   * 进入房间
   */
  joinRoom() {
    console.log('room.js onLoad');
    var time = new Date();
    time = time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds();
    console.log('*************开始多人音视频：' + time + '**************');

    // webrtcComponent
    this.data.webrtcroomComponent = this.selectComponent('#webrtcroom');
    var self = this;
    wx.showToast({
      icon: 'none',
      title: '获取登录信息中'
    });
    
    webrtcroom.getLoginInfo(
      self.data.userID,
      self.data.token,
      self.data.timestamp,
      function (res) {
        self.data.nickName = res.nickName
        wx.setNavigationBarTitle({
          title: self.data.nickName + "的房间"
        });
        self.data.avatarUrl = res.avatarUrl
        self.data.gender = res.gender
        self.data.country = res.country
        self.data.province = res.province
        self.data.city = res.city
        
        self.enterRoom();

        self.setData({
          role: ROLE_TYPE.AUDIENCE
        });

        // if (self.data.roomID) {
        //   self.enterRoom();
        // } else {
        //   self.createRoom();
        // }
        // if (self.data.userID === self.data.roomCreator || !self.data.roomCreator) { // 如果创建房间是自己，则是主播
        //   self.setData({
        //     role: ROLE_TYPE.PRESENTER
        //   });
        // } else {
        //   self.setData({
        //     role: ROLE_TYPE.AUDIENCE
        //   });
        // }
      },
      function (res) {
        wx.showToast({
          icon: 'none',
          title: '获取登录信息失败，请重试',
          complete: function () {
            setTimeout(() => {
              wx.redirectTo({
                url: '/pages/main/main?token=' + self.data.token + '&timestamp=' + self.data.timestamp
              });
            }, 1500);
          }
        });
      });
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 计算一次白板的宽高
    this.resizeSketchpad();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var self = this;
    console.log('room.js onShow');
    // 保持屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('room.js onHide');
    clearTimeout(fadeActionTimer)
    this.qmtOut(this.data.token, this.data.timestamp)
    if (this.data.webrtcroomComponent != null) this.data.webrtcroomComponent.stop();
    webrtcroom.quitRoom(this.data.userID, this.data.roomID, this.data.original, this.data.token, this.data.timestamp);
    wx.redirectTo({
      url: '/pages/main/main'
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('room.js onUnload')
    clearTimeout(fadeActionTimer)
    this.qmtOut(this.data.token, this.data.timestamp)
    if (this.data.webrtcroomComponent != null) this.data.webrtcroomComponent.stop();
    webrtcroom.quitRoom(this.data.userID, this.data.roomID, this.data.original, this.data.token, this.data.timestamp);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    // return {
    //   title: 'TCL在线音视频',
    //   path: '/pages/main/main',
    //   imageUrl: 'https://mc.qcloudimg.com/static/img/dacf9205fe088ec2fef6f0b781c92510/share.png'
    // }
    return null;
  },

  /**
   * 展示白板
   */
  showBoard() {
    this.setData({
      showInteractType: this.data.SHOWINTERACT_TYPE.BOARD
    }, () => {
      if (this.data.webrtcroomComponent) {
        var body = {
          cmd: 'sketchpad',
          data: {
            userID: this.data.userID,
            userName: this.data.userName,
            userAvatar: '',
            msg: '{"type":"request", "action":"currentBoard"}'
          }
        }
        var msg = {
          data: JSON.stringify(body)
        }
        // 同步当前白板
        this.data.webrtcroomComponent.sendC2CCustomMsg(this.data.roomCreator, msg, (res) => {
          console.log('C2C消息发送成功');
        }, (err) => {
          wx.showToast({
            icon: 'none',
            title: `消息发送失败，code: ${err.ErrorCode}`
          });
        });
      }
    });
  },

  /**
   * 展示聊天面板
   */
  showComment() {
    this.setData({
      showInteractType: this.data.SHOWINTERACT_TYPE.COMMENT
    });
  },

  // IM输入框的信息
  bindInputMsg: function (e) {
    this.data.inputMsg = e.detail.value;
  },

  // 发送IM消息
  sendComment: function () {
    var msg = this.data.inputMsg || '';

    if (this.data.webrtcroomComponent) {
      if (!msg || !msg.trim()) {
        wx.showToast({
          icon: 'none',
          title: '不能发送空消息'
        });
        console.error('不能发送空消息');
        return;
      }
      var msgLen = webim.Tool.getStrBytes(msg);
      var maxLen, errInfo;
      maxLen = webim.MSG_MAX_LENGTH.GROUP; // 群组最大支持的消息长度
      if (msgLen > maxLen) {
        errInfo = "消息长度超出限制(最多" + Math.round(maxLen / 3) + "汉字)";
        wx.showToast({
          icon: 'none',
          title: errInfo
        });
        console.error(errInfo);
        return;
      }

      this.data.webrtcroomComponent.sendGroupMsg({
        data: msg, // 要发送的消息内容
        ext: 'TEXT', // 自定义消息的类型
        desc: JSON.stringify({ // 扩展数据
          nickName: '自定义昵称' + new Date().getTime()
        })
      }, (res) => {
        // 发送成功
        this.setData({
          inputMsg: ''
        });
      }, (err) => {
        wx.showToast({
          icon: 'none',
          title: `消息发送失败，code: ${err.ErrorCode}`
        });
        console.error(`消息发送失败，code: ${err.ErrorCode} info:${err.SrcErrorInfo}`);
      });
    }
  },


  /**
   * 计算宽高
   */
  pixel: function ({
    value,
    unit
  }, cb) {
    wx.getSystemInfo({
      success: function (res) {
        var vw = res.windowWidth;
        var vh = res.windowHeight;
        var resultPixelValue = 0;
        if (unit == 'px') {
          resultPixelValue = value;
        } else if (unit == 'vw') {
          resultPixelValue = value / 100 * vw;
        } else if (unit == 'vh') {
          resultPixelValue = value / 100 * vh;
        } else {
          console.log('支持单位：vw, vh');
        }
        console.log("{value: %d, unit: %s} ==> %d px", value, unit, resultPixelValue);
        cb(resultPixelValue);
      },
      fail: function () {
        console.log('获取系统信息失败');
        cb(0);
      }
    })
  },

  /**
   * 重置画面的宽高
   */
  resizeSketchpad() {
    var self = this;
    self.pixel({
      value: 100,
      unit: 'vh'
    }, function (res1) {
      self.pixel({
        value: 100,
        unit: 'vw'
      }, function (res2) {
        var fullHeight = res1;
        var fullWidth = res2;

        // 100vh - 100vw*9/16 - 100vw/3 - 1vh - 10vh - 5vh + 2vw/3
        var rHeight = fullHeight - fullWidth * 9 / 16 - fullWidth / 3 - fullHeight * 0.01 - fullHeight * 0.1 - fullHeight * 0.05 + fullWidth * 0.02 / 3;
        self.setData({
          sketchpad: {
            height: rHeight,
            width: fullWidth,
          }
        }, () => {
          console.log("normal screen: h1 = %d, w1 = %d", rHeight, fullWidth);
        });
      });
    });
  },

  //定时执行显示左上角坐席是否在线图标
  Countdown: function(token, timestamp) {
    console.log("fade action!");
    var self = this;
    self.setFadeAction('');
    fadeActionTimer = setTimeout(function () {
      webrtcroom.anchorIsOnline(token, timestamp,
        function (res) {
          if (res.data.anchorIsOnline == true) {
            self.setFadeAction('fadeAction');
          }
        }, function () {
          console.log("坐席out of line");
        })
      self.Countdown(token, timestamp);
    }, 30000);
  },

  //全媒体-用户进入监控定时器
  qmtIn: function (token, timestamp){
    webrtcroom.qmtInAndOutRequest(token, timestamp, 1)
    this.data.qmtapi = setInterval(function(){
      webrtcroom.qmtInAndOutRequest(token, timestamp, 1)
    },30000);
    webrtcroom.qmtInterval = this.data.qmtapi
    this.setData({
      qmtapi: this.data.qmtapi
    });
  },
  //全媒体-用户离开监控定时器
  qmtOut: function(token, timestamp){
    clearInterval(this.data.qmtapi)
    webrtcroom.qmtInAndOutRequest(token, timestamp, 2)
    this.setData({
      qmtapi: 0
    });
  },
})