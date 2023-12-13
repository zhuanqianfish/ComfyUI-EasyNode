/*
 * Title: Easy Capture
 * Author: zhuanqianfish
 * Version: 2023.12.03
 * Github: https://github.com/zhuanqianfish/ComfyUI-EasyNode
 */

import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";


// ================= CLASS PAINTER ================
class EasyCapture {
  timer = null;
  constructor(node, devObj) {
    this.node = node;
    this.image = node.widgets.find((w) => w.name === "image");
    this.devObj = devObj;
    this.makeElements();
  }

  makeElements() {
    const panelPaintBox = document.createElement("div");
    panelPaintBox.innerHTML = `
      <div class="operatePanel">
        <button btnFunc="startCapture" id="startCaptureBtn" class="paramy" title="Start Capture">Start Capture</button>
        <button btnFunc="stopCapture" id="stopCaptureBtn"  class="alert" style="display:none;" title="Start Capture">Stop Capture</button>
        <button btnFunc="randerToCanvas" id="randerToCanvasBtn"  style="display:none;"  title="randerToCanvas">Rander</button>
      </div>
      <div class="func_box">
        <div id="videoContainer" style="position: inherit;">
          <div id="drageBox" style="position: absolute; width:100%; height: 400px; border: 2px solid red; min-width: 50px; min-height: 50px; z-index: 999; display: block; overflow: hidden;">
            <span class="easynode_point easynode_top-left"></span>
            <span class="easynode_point easynode_top"></span>
            <span class="easynode_point easynode_top-right"></span>
            <span class="easynode_point easynode_right"></span>
            <span class="easynode_point easynode_bottom-right"></span>
            <span class="easynode_point easynode_bottom"></span>
            <span class="easynode_point easynode_bottom-left"></span>
            <span class="easynode_point easynode_left"></span>
          </div>
          <video id="easyvideo" autoplay="" style="width: 500px; height: 400px; background: rgb(204, 204, 204);display: block;"></video>
          <canvas id="easycanvas" width="0" height="0" style="display: block;width: 500px; height: 400px; background: rgb(85, 85, 85); position: absolute; top: 427px;max-width:500px;"></canvas>
        </div>
      </div>
      <style>
      .operatePanel{
        display:block;
        position: relative;
        height:25px;
        text-align:center;
      }
      .panelPaintBox div{
        box-sizing:border-box;
      }
      .operatePanel button{
        width:150px;height:20px
      }
      .panelPaintBox  .paramy{
        color:#ffffff;
        background:#68CCF0;
      }
      .panelPaintBox  .alert{
        color:#ffffff;
        background:#F0A35D;
      }

      .easynode_point {
        width: 10px;
        height: 10px;
        background-color: #333;
        position: absolute;
      }
      .easynode_top-left {
        top: -5px;
        left: -5px;
        cursor: nw-resize;
      }

      .easynode_top {
        top: -5px;
        left: 50%;
        margin-left: -5px;
        cursor: n-resize;
      }

      .easynode_top-right {
        top: -5px;
        right: -5px;
        cursor: ne-resize;
      }

      .easynode_right {
        top: 50%;
        right: -5px;
        margin-top: -5px;
        cursor: e-resize;
      }

      .easynode_bottom-right {
        bottom: -5px;
        right: -5px;
        cursor: se-resize;
      }

      .easynode_bottom {
        bottom: -5px;
        left: 50%;
        margin-left: -5px;
        cursor: s-resize;
      }

      .easynode_bottom-left {
        bottom: -5px;
        left: -5px;
        cursor: sw-resize;
      }

      .easynode_left {
        top: 50%;
        left: -5px;
        margin-top: -5px;
        cursor: w-resize;
      }
    </style>
    `;
    // Main panelpaint box
    panelPaintBox.className = "panelPaintBox";
    this.panelPaintBox = panelPaintBox;
    this.devObj.appendChild(panelPaintBox);
    this.func_box = panelPaintBox.querySelector(
      ".func_box"
    );
    this.bindEvents();
  }

  bindEvents() {
    var that = this;
    let operatePanel = this.panelPaintBox.querySelectorAll(
      ".operatePanel"
    );
   
    let startBtn = this.panelPaintBox.querySelector(
      "#startCaptureBtn"
    );
    let stopBtn = this.panelPaintBox.querySelector(
      "#stopCaptureBtn"
    );
    startBtn.onclick = (e) =>{
      this.startCapture();
      startBtn.style.display = 'none';
      stopBtn.style.display = 'inline-block';

    };
   
    stopBtn.onclick = (e) =>{
      this.stopCapture();
      stopBtn.style.display = 'none';
      startBtn.style.display = 'inline-block';
    };

    this.panelPaintBox.querySelector(
      "#randerToCanvasBtn"
    ).onclick = (e) =>{
      this.switchToCanvas();
    };
    

    
    let points = this.panelPaintBox.querySelectorAll(
      ".easynode_point"
    );
    let box = this.panelPaintBox.querySelector(
      "#drageBox"
    );
    this.drageBox = box;
    let videoObj = this.panelPaintBox.querySelector(
      "#easyvideo"
    );
    this.video = videoObj;
    let easycanvas = this.panelPaintBox.querySelector(
      "#easycanvas"
    );
    this.easycanvas = easycanvas;

    points.forEach(function(point) {
      point.addEventListener('mousedown', handleMouseDown);
    });

    function handleMouseDown(e) {
      var point = e.target;
      var startX = e.pageX;
      var startY = e.pageY;
      var startWidth = parseInt(getComputedStyle(box).width);
      var startHeight = parseInt(getComputedStyle(box).height);
      var startTop = parseInt(getComputedStyle(box).top);
      var startLeft = parseInt(getComputedStyle(box).left);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      function handleMouseMove(e) {
        var deltaX = e.pageX - startX;
        var deltaY = e.pageY - startY;
        switch (point.className) {
          case 'easynode_point easynode_top-left':
            box.style.width = startWidth - deltaX + 'px';
            box.style.height = startHeight - deltaY + 'px';
            box.style.top = startTop + deltaY + 'px';
            box.style.left = startLeft + deltaX + 'px';
            break;
          case 'easynode_point easynode_top':
            box.style.height = startHeight - deltaY + 'px';
            box.style.top = startTop + deltaY + 'px';
            break;
          case 'easynode_point easynode_top-right':
            box.style.width = startWidth + deltaX + 'px';
            box.style.height = startHeight - deltaY + 'px';
            box.style.top = startTop + deltaY + 'px';
            break;
          case 'easynode_point easynode_right':
            box.style.width = startWidth + deltaX + 'px';
            break;
          case 'easynode_point easynode_bottom-right':
            box.style.width = startWidth + deltaX + 'px';
            box.style.height = startHeight + deltaY + 'px';
            break;
          case 'easynode_point easynode_bottom':
            box.style.height = startHeight + deltaY + 'px';
            break;
          case 'easynode_point easynode_bottom-left':
            box.style.width = startWidth - deltaX + 'px';
            box.style.height = startHeight + deltaY + 'px';
            box.style.left = startLeft + deltaX + 'px';
            break;
          case 'easynode_point easynode_left':
            box.style.width = startWidth - deltaX + 'px';
            box.style.left = startLeft + deltaX + 'px';
            break;
          default:
            // console.log(point.className)
            break;
        }
       
        e.stopPropagation();
        e.preventDefault();
      }

      function handleMouseUp(e) {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        that.switchToCanvas();
      }
      e.stopPropagation();
      e.preventDefault();
    }
  
  }

  //=================  Capture event================= 
  async startCapture() {
    let videoObj = this.video
    let drageBox = this.drageBox;
    try {
      var that = this
      videoObj.srcObject =
        await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: "window",
          },
          audio: false,
        });
      videoObj.addEventListener("loadeddata", function() {

        // that.switchToCanvas();
      }, false);
      videoObj.addEventListener("play", function() {
        //that.switchToCanvas();
        that.timer = setInterval(function(){that.switchToCanvas()}.bind(that), 300);
      }, false);
      videoObj.addEventListener('canplay', e => {
        // console.log(e) //get video true width
        this.videoWidth =  e.target.clientWidth
        this.videoHeight =  e.target.clientHeight
        let videoRate = videoObj.videoWidth/videoObj.videoHeight;
        drageBox.style.width = "500px";
        drageBox.style.height = 500/videoRate + "px";

      })
      
    } catch (err) {
      console.error(err);
    }
  }

  
  switchToCanvas() {
    let videoObj = this.video
    let drageBox = this.drageBox;
    let canvasObj = this.easycanvas;
    if (videoObj.ended) {
        console.log("videoObj.ended")
        return;
    }
    let context = canvasObj.getContext("2d");
    // canvasObj.style.background = "green";
    let videoRate = videoObj.videoWidth/videoObj.videoHeight;
    let rate_w = 500/videoObj.videoWidth;
    videoObj.style.width =  "500px";
    videoObj.style.height = videoObj.videoHeight*rate_w + "px";
    canvasObj.width = videoObj.videoWidth;
    canvasObj.height = videoObj.videoHeight;
    canvasObj.style.width = drageBox.style.width ;
    canvasObj.style.height =  drageBox.style.height ;
    canvasObj.style.top = parseInt(videoObj.style.height) + 27 + "px";
    //console.log(rate_w, drageBox.offsetLeft, drageBox.offsetTop, drageBox.style.width, drageBox.style.height, canvasObj.width, canvasObj.height);
    context.drawImage( videoObj,  
                  drageBox.offsetLeft/rate_w + 2/rate_w, (drageBox.offsetTop)/rate_w - 23/rate_w , parseInt(drageBox.style.width)/rate_w - 4/rate_w, (parseInt(drageBox.style.height))/rate_w -  4/rate_w, 
                  0,                          0,                          canvasObj.width ,                         canvasObj.height );
    let base64Str = canvasObj.toDataURL("image/png");
    this.image.value = base64Str.replace("data:image/png;base64,","");
    // let testStr = this.image.value.substring( this.image.value.length - 30, this.image.value.length)
    //  console.log('draw canvas111',  testStr);
  }

  stopCapture(){
    let tracks = this.video.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    this.video.srcObject = null;
    let context =  this.easycanvas.getContext("2d");
    context.clearRect(0, 0, this.easycanvas.width,  this.easycanvas.height);
    clearInterval( this.timer);
  }
  
  //=================  End Capture event ================= 
  
}
// ================= END CLASS PAINTER ================



// ================= CREATE PAINTER WIDGET ============
function EasyCaptureerWidget(node, inputName, inputData, app) {
  node.name = inputName;
  const widget = {
    type: "easy_captureer_widget",
    name: `w${inputName}`,
    callback: () => {},
    draw: function (ctx, _, widgetWidth, y, widgetHeight) {
      const margin = 10,
        left_offset = 0,
        top_offset = 0,
        visible = app.canvas.ds.scale > 0.6 && this.type === "easy_captureer_widget",
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
  node.capture = new EasyCapture(node, devElmt);
  widget.painter_wrap = node.capture.devObj;

  widget.parent = node;
  widget.afterQueued = ()=>{  //auto randerToCanvas
    node.capture.switchToCanvas();
  }
  // node.capture.makeElements();
  document.body.appendChild(widget.painter_wrap);

  // node.addWidget("button", "Start Capture", "start_capture", () => {
  //   node.capture.startCapture();
  // });

  // node.addWidget("button", "Rander Picture", "Rander", () => {
  //   node.capture.switchToCanvas();
  // });

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
    if (w <= 501) w = 500;
    if (h <= 201) h = 200;

    if (w > 501) {
      h = w + 40;
    }
    this.size = [w, h];
  };

  return { widget: widget };
}
// ================= END CREATE PAINTER WIDGET ============

// ================= CREATE EXTENSION ================
app.registerExtension({
  name: "Comfy.EasyCaputreNode",
  async init(app) {
    const style = document.createElement("style");
    style.innerText = `.panelPaintBox {
      position: absolute;
      width: 100%;
    }
    `;
    document.head.appendChild(style);
  },
  async setup(app) {
    let EasyCaptureNode = app.graph._nodes.filter((wi) => wi.type == "easy_captureer_widget");

    if (EasyCaptureNode.length) {
      EasyCaptureNode.map((n) => {
        console.log(`Setup EasyCaptureNode: ${n.name}`);
      });
    }
  },
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeData.name === "EasyCaptureNode") {
      // Create node
      const onNodeCreated = nodeType.prototype.onNodeCreated;
      nodeType.prototype.onNodeCreated = async function () {
        const r = onNodeCreated
          ? onNodeCreated.apply(this, arguments)
          : undefined;

        let EasyCaptureNode = app.graph._nodes.filter(
            (wi) => wi.type == "EasyCaptureNode"
          ),
          nodeName = `EasyCaptureNode_${EasyCaptureNode.length}`,
          nodeNamePNG = `${nodeName}.png`;
        console.log(`Create EasyCaptureNode: ${nodeName}`);
        EasyCaptureerWidget.apply(this, [this, nodeNamePNG, {}, app]);
        this.setSize([500, 200]);
        return r;
      };
    }
  },
});
// ================= END CREATE EXTENSION ================