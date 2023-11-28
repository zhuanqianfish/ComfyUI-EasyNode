/*
 * Title: Easy Capture
 * Author: zhuanqianfish
 * Version: 2023.10.19
 * Github: https://github.com/easypet/ComfyUI_Custom_Nodes_easypet
 */

import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";


// ================= CLASS PAINTER ================
class EasyCapture {
  // panelPaintBox = null;
  constructor(node, devObj) {
    this.node = node;
    this.image = node.widgets.find((w) => w.name === "image");
    this.devObj = devObj;
    this.makeElements();
  }

  makeElements() {
    const panelPaintBox = document.createElement("div");
    panelPaintBox.innerHTML = `
      <div class="func_box">
        <!---
        <button btnFunc="startCapture" title="Start Capture" style="width:80px;height:20px">Start Capture</button>
        <button btnFunc="stopCapture" title="Start Capture"  style="width:80px;height:20px">Stop Capture</button>
        <button btnFunc="randerToCanvas" title="randerToCanvas"  style="width:80px;height:20px">Rander</button>
        --->
      </div>
    `;
    // Main panelpaint box
    panelPaintBox.className = "panelPaintBox";
    var videoObj = document.createElement("video");
    var canvasObj = document.createElement("canvas");
    videoObj.style.width = "500px";
    videoObj.style.height = "400px";
    videoObj.style.background = "#cccccc";
    videoObj.id="easyvideo";
    videoObj.autoplay="autoplay";
    this.video = videoObj;
    canvasObj.style.width = "500px";
    canvasObj.style.height = "400px";
    canvasObj.style.background = "#555555";
    canvasObj.style.display = "none";

    canvasObj.id = "easycanvas";
    this.canvas = canvasObj;

    // this.video.innerHTML =`<video name="easyvideo" id="easyvideo" style="width:500px;height:400px;background:#cccccc;" autoplay></video>`;
    // this.canvas.innerHTML =`<canvas name="easycanvas" id="easycanvas" style="width:500px;height:400px;background:#555555;"></canvas>`;

    panelPaintBox.appendChild(videoObj);
    panelPaintBox.appendChild(canvasObj);
    this.panelPaintBox = panelPaintBox;
    this.devObj.appendChild(panelPaintBox);
    this.func_box = panelPaintBox.querySelector(
      ".func_box"
    );
    this.panelPaintBox = panelPaintBox;
    this.bindEvents();
  }

  bindEvents() {
    this.func_box.onclick = (e) => {
      let target = e.target;
      if (target.hasAttribute("btnFunc")) {
        let typeEvent = target.getAttribute("btnFunc");
        switch (typeEvent) {
          case "startCapture":
            this.startCapture();
            break;
          case "stopCapture":
            this.stopCapture();
            break;
          case "GoGoGo":
            this.GoGoGo();
            break;
            
        }
      }
    };
  }

  
  //=================  Capture event================= 
  async startCapture() {
    let videoObj = this.panelPaintBox.querySelector(
      "#easyvideo"
    );
    try {
      let that = this
      videoObj.srcObject =
        await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: "window",
          },
          audio: false,
        });
      videoObj.addEventListener("loadeddata", function() {
        that.switchToCanvas();
      }, false);
      videoObj.addEventListener("play", function() {
        that.switchToCanvas();
      }, false);
      videoObj.addEventListener('canplay', e => {
        console.log(e) //get video true width
        this.videoWidth =  e.target.clientWidth
        this.videoHeight =  e.target.clientHeight
      })
    } catch (err) {
      console.error(err);
    }
  }

  
  switchToCanvas() {
    let videoObj = this.video;
    let canvasObj = this.canvas;
    if (videoObj.ended) {
        console.log("videoObj.ended")
        return;
    }
    let context = canvasObj.getContext("2d");
    // canvasObj.style.background = "green";
    canvasObj.width = videoObj.videoWidth;
    canvasObj.height = videoObj.videoHeight;
    context.drawImage( videoObj, 0, 0, canvasObj.width, canvasObj.height);
    let base64Str = canvasObj.toDataURL("image/png");
    this.image.value = base64Str.replace("data:image/png;base64,","");
    console.log("Length of :",this.image.value.length )
    // window.requestAnimationFrame(this.switchToCanvas());
  }

  stopCapture(){
    let tracks = this.video.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    this.video.srcObject = null;
  }


  randerToCanvas(){
    this.switchToCanvas()
  }
  //=================  End Capture event ================= 
  
}
// ================= END CLASS PAINTER ================



// ================= CREATE PAINTER WIDGET ============
function PainterWidget(node, inputName, inputData, app) {
  node.name = inputName;
  const widget = {
    type: "painter_widget",
    name: `w${inputName}`,
    callback: () => {},
    draw: function (ctx, _, widgetWidth, y, widgetHeight) {
      const margin = 10,
        left_offset = 0,
        top_offset = 0,
        visible = app.canvas.ds.scale > 0.6 && this.type === "painter_widget",
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

      Object.assign(this.painter_wrap.style, {
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

      // Object.assign(this.painter_wrap.children[1].style, {
      //   transformOrigin: "0 0",
      //   transform: scale,
      //   width: w + "px",
      //   height: w + "px",
      // });

      // Object.assign(this.painter_wrap.children[2].style, {
      //   transformOrigin: "0 0",
      //   transform: scale,
      //   width: w + "px",
      //   height: w + "px",
      // });

      this.painter_wrap.hidden = !visible;
    },
  };
  let devElmt = document.createElement("div");
  node.capture = new EasyCapture(node, devElmt);
  widget.painter_wrap = node.capture.devObj;

  widget.parent = node;
  widget.afterQueued = ()=>{  //auto randerToCanvas
    node.capture.randerToCanvas();
  }
  // node.capture.makeElements();
  document.body.appendChild(widget.painter_wrap);

  node.addWidget("button", "Start Capture", "start_capture", () => {
    node.capture.startCapture();
  });

  node.addWidget("button", "Rander Picture", "Rander", () => {
    node.capture.randerToCanvas();
  });

  // Add customWidget to node
  node.addCustomWidget(widget);
  node.onRemoved = () => {
    // When removing this node we need to remove the input from the DOM
    for (let y in node.widgets) {
      if (node.widgets[y].painter_wrap) {
        node.widgets[y].painter_wrap.remove();
      }
    }
  };
  node.onResize = function () {
    let [w, h] = this.size;
    if (w <= 531) w = 530;
    if (h <= 201) h = 200;

    if (w > 531) {
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
    let EasyCaptureNode = app.graph._nodes.filter((wi) => wi.type == "EasyCaptureNode");

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
          nodeName = `Paint_${EasyCaptureNode.length}`,
          nodeNamePNG = `${nodeName}.png`;
        console.log(`Create EasyCaptureNode: ${nodeName}`);
        PainterWidget.apply(this, [this, nodeNamePNG, {}, app]);
        this.setSize([530, 200]);
        return r;
      };
    }
  },
});
// ================= END CREATE EXTENSION ================
