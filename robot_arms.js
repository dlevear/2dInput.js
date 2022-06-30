//main structure to hold the arm drawing and updating functionality
//configurable position parameters and style 
//these can be treated as the default values, you can override them and it will take effect on next draw 
class arms {
  arm1left = 50;                              // x position of arm1 left endpoint, in pixels from canvas left
  arm1top = 50;                               // y position of arm1 left endpoint, in pixels from canvas top
  arm1width = 100;                            // length of arm1
  arm1weight = 5;                             // width (lineWidth) of arm1
  arm1color = 'orange';                       // color of arm1
  arm1angle = Math.PI/4;                      // angle that arm1 makes with x-axis counter-clockwise
  arm1angleLabelRadius = 25;                  // how long the line for the arm1 angle should be
  arm2width = 100;                            // length of arm2
  arm2weight = 5;                             // width (lineWidth) of arm2
  arm2color = 'blue';                         // color of arm2
  arm2angle = Math.PI/4;                      // angle that arm2 makes with arm1
  arm2angleLabelRadius = 25;                  // how long the line for the arm2 angle should be
  angleLabelWeight = 2;                       // width (lineWidth) of the reference lines for angle1 and angle2 labels
  angleLabelColor = 'black';                  // color of the reference lines and text for angle1 and angle2 labels
  angleLabelFont = 'bold 20px Didact Gothic'; // font for angle1 and angle2 labels
  angleLabelPadding = 5;                      // extra space (+left, -top) for angle1 and angle2 text labels
  pixelsPerX = 100;                           // how many pixels horizontally between gridlines. Thinking of unit gridlines.
  pixelsPerY = 100;                           // how many pixels vertically between gridlines. Thinking of unit gridlines.
  axesColor = 'black';                        // color for x,y axes
  axesWeight = 3;                             // width (lineWidth) of axes
  gridlineColor = 'gray';                     // color for gridlines
  gridlineWeight = 1;                         // width (lineWidth) of gridlines
  angle1LabelText = '\u03B81 = #';            // string for the angle1 label (# replaced with value)
  angle2LabelText = '\u03B82 = #';            // string for the angle2 label (# replaced with value)
  shouldDrawAngleLabels = true;               // whether to draw angle labels (true) or not (false)
  constructor(_canvas) {
    this.canvas = _canvas;                    // canvas where to draw grid and sliders
    this.ctx = this.canvas.getContext('2d');  // context of above canvas

    //fix for devices with pixel density (e.g. retina)
    //see https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
    var scale = window.devicePixelRatio;
    var W = this.canvas.width;
    var H = this.canvas.height;
    this.canvas.style.width = W;
    this.canvas.style.height = H;
    this.canvas.width = Math.floor(W * scale);
    this.canvas.height = Math.floor(H * scale);
    this.ctx.scale(scale,scale);
  };
  draw_arms = function() {
    /*
      draw arm1 and arm2 at desired angles
    */
    var arm1endpoint = {
      x: this.arm1left + this.arm1width*Math.cos(this.arm1angle),
      y: this.arm1top - this.arm1width*Math.sin(this.arm1angle),
    };
    var arm2endpoint = {
      x: arm1endpoint.x + this.arm2width*Math.cos(this.arm1angle + this.arm2angle),
      y: arm1endpoint.y - this.arm2width*Math.sin(this.arm1angle + this.arm2angle),
    };

    //draw arm1
    this.ctx.lineWidth = this.arm1weight;
    this.ctx.strokeStyle = this.arm1color;
    this.ctx.lineCap = "round";

    this.ctx.beginPath();
    this.ctx.moveTo(this.arm1left, this.arm1top);
    this.ctx.lineTo(arm1endpoint.x, arm1endpoint.y);
    this.ctx.stroke();

    //draw arm2
    this.ctx.lineWidth = this.arm2weight;
    this.ctx.strokeStyle = this.arm2color;
    this.ctx.lineCap = "round";

    this.ctx.beginPath();
    this.ctx.moveTo(arm1endpoint.x, arm1endpoint.y);
    this.ctx.lineTo(arm2endpoint.x, arm2endpoint.y);
    this.ctx.stroke();
  };
  draw_angles = function() {
    /* 
      draw text labels for arm1angle and arm2angle 
    */

    //where does the reference line for angle 1 end
    var angle1lineEndpoint = {
      x: this.arm1left + this.arm1angleLabelRadius,
      y: this.arm1top,
    };
    //where does arm1 end
    var arm1endpoint = {
      x: this.arm1left + this.arm1width*Math.cos(this.arm1angle),
      y: this.arm1top - this.arm1width*Math.sin(this.arm1angle),
    };
    // where does the reference line for angle 2 end
    var angle2lineEndpoint = {
      x: arm1endpoint.x + this.arm2angleLabelRadius*Math.cos(this.arm1angle),
      y: arm1endpoint.y - this.arm2angleLabelRadius*Math.sin(this.arm1angle),
    }
    // set style
    this.ctx.lineWidth = this.angleLabelWeight;
    this.ctx.strokeStyle = this.angleLabelColor;
    this.ctx.fillStyle = this.angleLabelColor;
    this.ctx.lineCap = "butt";

    // draw arm1 angle reference line
    this.ctx.beginPath();
    this.ctx.moveTo(this.arm1left,this.arm1top);
    this.ctx.lineTo(angle1lineEndpoint.x, angle1lineEndpoint.y);
    this.ctx.stroke();

    // draw arm1 angle arc
    this.ctx.beginPath();
    this.ctx.arc(this.arm1left,this.arm1top,this.arm1angleLabelRadius, -this.arm1angle, 0);
    this.ctx.stroke();

    // draw arm2 angle reference line
    this.ctx.beginPath();
    this.ctx.moveTo(arm1endpoint.x, arm1endpoint.y);
    this.ctx.lineTo(angle2lineEndpoint.x, angle2lineEndpoint.y);
    this.ctx.stroke();

    // draw arm2 angle arc
    this.ctx.beginPath();
    this.ctx.arc(arm1endpoint.x, arm1endpoint.y, this.arm2angleLabelRadius, -this.arm2angle-this.arm1angle, -this.arm1angle);
    this.ctx.stroke();

    //draw labels 
    this.ctx.font = this.angleLabelFont;
    this.ctx.fillText(this.angle1LabelText.replace('#',(this.arm1angle / Math.PI).toFixed(2) + "\u03C0"), angle1lineEndpoint.x + this.angleLabelPadding, angle1lineEndpoint.y - this.angleLabelPadding);
    this.ctx.fillText(this.angle2LabelText.replace('#',(this.arm2angle / Math.PI).toFixed(2) + "\u03C0"), angle2lineEndpoint.x + this.angleLabelPadding, angle2lineEndpoint.y - this.angleLabelPadding);
  };
  draw_axes = function() {
    /*
      draw axes with arm1 centered at origin
    */
    this.ctx.strokeStyle = this.axesColor;
    this.ctx.lineWidth = this.axesWeight;
    this.ctx.beginPath();
    this.ctx.moveTo(this.arm1left,0);
    this.ctx.lineTo(this.arm1left,this.canvas.height);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(0,this.arm1top);
    this.ctx.lineTo(this.canvas.width,this.arm1top);
    this.ctx.stroke();
  };
  draw_gridlines = function() {
    /*
      draw gridlines according to pixelsPerX and pixelsPerY
    */
    this.ctx.strokeStyle = this.gridlineColor;
    this.ctx.lineWidth = this.gridlineWeight;

    for (var x=this.arm1left; x < this.canvas.width; x += this.pixelsPerX) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    for (var x=this.arm1left; x > 0; x -= this.pixelsPerX) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    for (var y=this.arm1top; y < this.canvas.height; y += this.pixelsPerY) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
    for (var y=this.arm1top; y > 0; y -= this.pixelsPerY) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
    
  };
  draw = function() {
    /*
      call all needed drawing functions
    */
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.draw_gridlines();
    this.draw_axes();
    if (this.shouldDrawAngleLabels) {
      this.draw_angles();
    }
    this.draw_arms();
  };
};
