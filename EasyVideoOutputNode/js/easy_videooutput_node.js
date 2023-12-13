/*
 * Title: Easy Capture
 * Author: zhuanqianfish
 * Version: 2023.12.03
 * Github: https://github.com/zhuanqianfish/ComfyUI-EasyNode
 */

import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

// ================= CLASS PAINTER ================
class EasyVideoOutput {
  constructor(node, devObj) {
    this.node = node;
    // this.image = node.widgets.find((w) => w.name === "image");
    this.devObj = devObj;
    this.makeElements();
  }

  makeElements() {
    const panelEasyVideooutputBox = document.createElement("div");
    panelEasyVideooutputBox.innerHTML = `
      <div class="easyVideoOperatePanel">
        <div style="color:#ffffff;font-size:12px;background-color: steelblue;">
          Click three dots in the bottom right corner and select "Picture in Picture" after paly;
        </div>
        <button btnFunc="pictureInPicture" id="pictureInPictureBtn" style="display:none"     title="randerToCanvas">PictureInPicture</button>
      </div>
      <div class="func_box">
        <div id="videoContainer" style="position: inherit;">
          <canvas id="easycanvas" width="0" height="0" style="display: none; background: rgb(85, 85, 85); position: absolute; top: 427px;max-width:500px;"></canvas>
          <video id="easyvideo2"  muted controls  style="width: 300px; height: 300px; background: rgb(204, 204, 204);display: block;"></video>
        </div>
      </div>
      <style>
      .easyVideoOperatePanel{
        display:block;
        position: relative;
        height:60px;
        text-align:center;
      }
      .panelEasyVideooutputBox div{
        box-sizing:border-box;
      }
      .easyVideoOperatePanel button{
        width:150px;height:20px
      }
      .panelEasyVideooutputBox  .paramy{
        color:#ffffff;
        background:#68CCF0;
      }
      .panelEasyVideooutputBox  .alert{
        color:#ffffff;
        background:#F0A35D;
      }
    </style>
    `;
    // Main panelpaint box
    panelEasyVideooutputBox.className = "panelEasyVideooutputBox";
    this.panelEasyVideooutputBox = panelEasyVideooutputBox;
    this.devObj.appendChild(panelEasyVideooutputBox);
    this.func_box = panelEasyVideooutputBox.querySelector(
      ".func_box"
    );
    this.bindEvents();
  }

  bindEvents() {
    var that = this;
    let videoOutput = this.panelEasyVideooutputBox.querySelectorAll(
      ".easyvideo2"
    );
   
    let pictureInPictureBtn = this.panelEasyVideooutputBox.querySelector(
      "#pictureInPictureBtn"
    );
    pictureInPictureBtn.onclick = async (e) =>{
      // 打开一个画中画窗口。 // it's need https or files  protocol
      const pipWindow = await documentPictureInPicture.requestWindow();
      // 将播放器移动到画中画窗口中。
      pipWindow.document.body.append(videoOutput);
    };
  }

  //================= functions ================= 

  randerVideo(){
    let videoOutput = this.panelEasyVideooutputBox.querySelector(
      "#easyvideo2"
    );
    let canvasObj = this.easycanvas;
    if (videoOutput.paused) {
      const stream = canvasObj.captureStream()
      const videoTrack = stream.getVideoTracks()[0]
      videoOutput.srcObject = new MediaStream([videoTrack])
      videoOutput.play()
    }
  }

  blobToBase64(data){

  }
  //================= END functions===================
}
// ================= END CLASS PAINTER ================

function  base64ToBlob(data) {
  var  arr = data.split( ',' ),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr =  new  Uint8Array(n);
  while  (n--) {
      u8arr[n] = bstr.charCodeAt(n);
  }
  return  new  Blob([u8arr], { type: mime });
}

// ================= CREATE PAINTER WIDGET ============
function EasyVideoOutputWidget(node, inputName, inputData, app) {
  node.name = inputName;
  const widget = {
    type: "ez_videoOutput_widget",
    name: `w${inputName}`,
    callback: () => {},
    draw: function (ctx, _, widgetWidth, y, widgetHeight) {
      const margin = 10,
        left_offset = 0,
        top_offset = 0,
        visible = app.canvas.ds.scale > 0.6 && this.type === "ez_videoOutput_widget",
        w = widgetWidth - margin * 2 - 10,
        clientRectBound = ctx.canvas.getBoundingClientRect(),
        transform = new DOMMatrix()
          .scaleSelf(
            clientRectBound.width / ctx.canvas.width,
            clientRectBound.height / ctx.canvas.height
          )
          .multiplySelf(ctx.getTransform())
          .translateSelf(margin, margin + y),
        scale = new DOMMatrix().scaleSelf(transform.a, transform.d);

      Object.assign(this.painter_wrap.style, {  //auto scale
        left: `${transform.a * margin * left_offset + transform.e}px`,
        top: `${transform.d + transform.f + top_offset}px`,
        width: `${w * transform.a}px`,
        height: `${w * transform.d}px`,
        position: "absolute",
        zIndex: app.graph._nodes.indexOf(node),
      });

      Object.assign(this.painter_wrap.children[0].style, { 
        transformOrigin: "0 0",
        transform: scale,
        width: w + "px",
        height: w + "px",
      });
      // this.painter_wrap.hidden = !visible;   // no hidden
    },
  };
  let devElmt = document.createElement("div");
  node.capture = new EasyVideoOutput(node, devElmt);
  widget.painter_wrap = node.capture.devObj;

  widget.parent = node;
  widget.afterQueued = ()=>{ 

  }
  document.body.appendChild(widget.painter_wrap);

  // Add customWidget to node
  node.addCustomWidget(widget);
  node.onRemoved = () => {
    // When removing this node we need to remove the input from the DOM
    for (let y in node.widgets) {
      if (node.widgets[y].painter_wrap) {
        node.widgets[y].painter_wrap.remove();
        clearInterval(node.widgets[y].painter_wrap.timer); 
      }
    }
  };
  node.onResize = function () {
    let [w, h] = this.size;
    if (w <= 321) w = 320;
    if (h <= 321) h = 320;

    if (w > 321) {
      h = w + 40;
    }
    this.size = [w, h];
  };

  return { widget: widget };
}
// ================= END CREATE PAINTER WIDGET ============

// ================= CREATE EXTENSION ================
app.registerExtension({
  name: "Comfy.EasyVideoOutputNode",
  async init(app) {
    const style = document.createElement("style");
    style.innerText = `.panelEasyVideooutputBox {
      position: absolute;
      width: 100%;
    }
    `;
    document.head.appendChild(style);
  },
  async setup(app) {
    let EasyVideoOutputNode = app.graph._nodes.filter((wi) => wi.type == "EasyVideoOutputNode");

    if (EasyVideoOutputNode.length) {
      EasyVideoOutputNode.map((n) => {
        console.log(`Setup EasyVideoOutput: ${n.name}`);
      });
    }
  },
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeData.name === "EasyVideoOutputNode") {
      // Create node
      const onNodeCreated = nodeType.prototype.onNodeCreated;
      nodeType.prototype.onNodeCreated = async function () {
        const r = onNodeCreated
          ? onNodeCreated.apply(this, arguments)
          : undefined;

        let EasyVideoOutputNode = app.graph._nodes.filter(
            (wi) => wi.type == "EasyVideoOutputNode"
          ),
          nodeName = `EasyVideoOutput_${EasyVideoOutputNode.length}`,
          nodeNamePNG = `${nodeName}.png`;
        console.log(`Create EasyVideoOutputNode: ${nodeName}`);
        EasyVideoOutputWidget.apply(this, [this, nodeNamePNG, {}, app]);
        this.setSize([320, 430]);
        return r;
      };
    }

    const onExecuted = nodeType.prototype.onExecuted
    nodeType.prototype.onExecuted = function (message) {
      const r = onExecuted ? onExecuted.apply(this, message) : undefined
      if (this.widgets) {
        console.log('fliter', this.widgets.filter(w => w.type === `ez_videoOutput_widget`) );
        if(this.widgets.filter(w => w.type === `ez_videoOutput_widget`)!==undefined && this.widgets.filter(w => w.type === `ez_videoOutput_widget`).length > 0 ){
          const painter_wrap = this.widgets.filter(w => w.type === `ez_videoOutput_widget`)[0].painter_wrap;
          const video = painter_wrap.querySelector(
            "#easyvideo2"
          );
          const canvas = painter_wrap.querySelector(
            "#easycanvas"
          );
          const context = canvas.getContext('2d')
          if (message?.images_) {
            const base64 = message.images_[0]
            // console.log('base64Data', base64)
            const image = new Image()
            image.onload = function () {
              canvas.width = image.width
              canvas.height = image.height
              context.drawImage(image, 0, 0)
            }
            // console.log(`data:image/jpeg;base64,${base64}`)
            image.src = `data:image/jpeg;base64,${base64}`
            if (video.paused) {
              const stream = canvas.captureStream()
              const videoTrack = stream.getVideoTracks()[0]
              video.srcObject = new MediaStream([videoTrack])
              video.play()
              video.poster = base64;
              // video.style.border = "20px solid red";
            }
          }
          const onRemoved = this.onRemoved
          this.onRemoved = () => {
            // cleanupNode(this)
            return onRemoved?.()
          }
          this.setSize([
            this.size[0],
            this.computeSize([this.size[0], this.size[1]])[1]
          ])
        }
      }
      return r
    }
  },

  
});
// ================= END CREATE EXTENSION ================
