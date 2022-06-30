function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  var x;
  var y;
  if (evt.type.startsWith('touch')) {
    x = evt.touches[0].clientX - rect.left;
    y = evt.touches[0].clientY - rect.top;
  }
  else {
    x = evt.clientX - rect.left;
    y = evt.clientY - rect.top;
  }
  return {
    x: x,
    y: y,
  };
};
function pos_is_in_rect(x,y,topLeftX,topLeftY,bottomRightX,bottomRightY)
{
  return (topLeftX <= x && x <= bottomRightX && topLeftY <= y && y <= bottomRightY);
}
//main class to hold the grid drawing and updating functionality
//configurable position parameters and style 
//relies on functions getMousePos and pos_is_in_rect
//these can be treated as the default values, you can override them and it will take effect on next draw 
class grid {
  sliderLineColor = '#33202A';                  // color of sliders
  sliderWeight = 5;                             // lineWidth when drawing sliders
  gridLineWeight = 1;                           // lineWidth when drawing gridlines
  gridLineColor = '#33202A';                    // color of grid lines
  ticksFont = "bold 12px Didact Gothic";        // font for tick labels
  gridLeft = 30;                                // leftmost position of grid, in pixels from left
  gridRight = 230;                              // rightmost position of grid
  gridTop = 30;                                 // topmost position of grid, in pixels from top
  gridBottom = 230;                             // bottommost position of grid
  bottomSliderPadding = 20;                     // padding between grid and bottom slider
  leftSliderPadding = 20;                       // padding between grid nad left slider
  xLabels = ['', 1, 2, 3, 4, 5];                // tick labels for x gridlines
  yLabels = ['', 1, 2, 3, 4, 5];                // tick labels for y gridlines
  xChoice = 0.5;                                // current user choice x coordinate between 0 and 1
  yChoice = 0.5;                                // current user choice y coordinate between 0 and 1
  xSliderLabel = 'X';                           // label for x axis slider
  ySliderLabel = 'Y';                           // label for y axis slider
  xSliderLabelFont = "bold 12px Didact Gothic"; // font for x slider ball labels
  xSliderLabelFontColor = "white" ;             // color font for x slider ball labels
  xSliderBallColor = 'orange';                  // color for slider x balls
  xSliderCircleColor = 'orange';                // color for outline of x slider balls
  xSliderCircleWeight = 1;                      // lineWidth for outline of sliders
  ySliderBallColor = 'blue';                    // color for slider y balls
  ySliderLabelFontColor = "white" ;             // color font for x slider ball labels
  ySliderCircleColor = 'blue';                  // color for outline of y slider balls
  ySliderCircleWeight = 1;                      // lineWidth for outline of sliders
  sliderBallColor = '#E15151';                  // color for inside the grid ball
  sliderCircleColor = '#E15151';                // color for outline of inside the grid ball
  sliderCircleWeight = 1;                       // lineWidth for outline of sliders
  sliderBallRadius = 7;                         // radius of slider balls
  constructor(_canvas) {
    this.canvas = _canvas;                      // canvas where to draw grid and sliders
    this.ctx = this.canvas.getContext('2d');    // context of above canvas

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
  draw_sliders = function() {
    /* 
      draw the slider lines
      does not include the slider balls
    */
    this.ctx.strokeStyle = this.sliderLineColor; 
    this.ctx.lineWidth = this.sliderWeight;
    this.ctx.lineCap = "round";
    this.ctx.beginPath();
    var bottomSliderLeft = this.gridLeft;
    var bottomSliderRight = this.gridRight;
    var bottomSliderTop = this.gridBottom + this.bottomSliderPadding;
    this.ctx.moveTo(bottomSliderLeft, bottomSliderTop);
    this.ctx.lineTo(bottomSliderRight, bottomSliderTop);
    this.ctx.stroke();
    this.ctx.beginPath();
    var leftSliderLeft = this.gridLeft - this.leftSliderPadding;
    var leftSliderTop = this.gridTop;
    var leftSliderBottom = this.gridBottom;
    this.ctx.moveTo(leftSliderLeft, leftSliderTop);
    this.ctx.lineTo(leftSliderLeft, leftSliderBottom);
    this.ctx.stroke();
  };
  draw_axes = function() {
    /*
      draw the x and y axes (possibly different style from gridlines)
    */
    this.ctx.strokeStyle = this.sliderLineColor; 
    this.ctx.lineWidth = this.sliderWeight;
    this.ctx.lineCap = "butt";
    this.ctx.beginPath();
    //a little extra here so the axes overlap nicely
    this.ctx.moveTo(this.gridLeft, this.gridTop);
    this.ctx.lineTo(this.gridLeft, this.gridBottom + this.sliderWeight/2);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(this.gridLeft - this.sliderWeight/2, this.gridBottom);
    this.ctx.lineTo(this.gridRight, this.gridBottom);
    this.ctx.stroke();
  };
  draw_gridlines = function() {
    /*
      draw the gridlines and tick labels
    */
    this.ctx.lineWidth = this.gridLineWeight;
    this.ctx.strokeStyle = this.gridLineColor;
    this.ctx.fillStyle = this.gridLineColor; //for text

    /*make vertical grid lines */
    var nXticks = this.xLabels.length;
    var cellWidth = (this.gridRight - this.gridLeft)/(nXticks-1);
    for (var i = 0; i < nXticks; i++) {
      /*vertical lines*/
      this.ctx.beginPath();
      this.ctx.moveTo(this.gridLeft + i * cellWidth, this.gridTop);
      this.ctx.lineTo(this.gridLeft + i * cellWidth, this.gridBottom);
      this.ctx.stroke();
    }

    /*make horizontal grid lines */
    var nYticks = this.yLabels.length;
    var cellHeight = (this.gridBottom - this.gridTop)/(nYticks-1);
    for (var i = 0; i < nYticks; i++) {
      /*horizontal lines*/
      this.ctx.beginPath();
      this.ctx.moveTo(this.gridLeft, this.gridBottom - i * cellHeight);
      this.ctx.lineTo(this.gridRight, this.gridBottom - i * cellHeight);
      this.ctx.stroke();
    }

    this.ctx.font = this.ticksFont; 
    var fontSize = parseInt(this.ticksFont.match(/\d+/)[0]);
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    /*make x ticks*/
    for (var i=0; i < nXticks; i++) {
      this.ctx.fillText(this.xLabels[i], this.gridLeft + i * cellWidth - fontSize/2, this.gridTop - fontSize);
    }
    /*make y ticks*/
    for (var i=0; i < nYticks; i++) {
      this.ctx.fillText(this.yLabels[i], this.gridRight + fontSize, this.gridBottom - i * cellHeight + fontSize/2);
    }
  };
  draw_choices = function() {
    /*
      draw slider balls and chosen input ball
    */
    /* X */
    this.ctx.fillStyle = this.xSliderBallColor;
    this.ctx.strokeStyle = this.xSliderCircleColor; 
    this.ctx.lineWidth = this.xSliderCircleWeight;
    this.ctx.beginPath();
    var bottomBallCenterX = this.xChoice*(this.gridRight-this.gridLeft)+this.gridLeft;
    var bottomBallCenterY = this.gridBottom + this.bottomSliderPadding;
    this.ctx.arc(bottomBallCenterX, bottomBallCenterY, this.sliderBallRadius, 0, 2 * Math.PI);
    this.ctx.stroke();
    this.ctx.fill();
    /* Y */
    this.ctx.fillStyle = this.ySliderBallColor;
    this.ctx.strokeStyle = this.ySliderCircleColor; 
    this.ctx.lineWidth = this.ySliderCircleWeight;
    this.ctx.beginPath();
    var leftBallCenterX = this.gridLeft - this.leftSliderPadding;
    var leftBallCenterY = this.gridBottom - this.yChoice*(this.gridBottom-this.gridTop);
    this.ctx.arc(leftBallCenterX, leftBallCenterY, this.sliderBallRadius, 0, 2 * Math.PI);
    this.ctx.stroke();
    this.ctx.fill();
    /* (X,Y) */
    // clip within grid
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(this.gridLeft, this.gridTop);
    this.ctx.lineTo(this.gridLeft, this.gridBottom);
    this.ctx.lineTo(this.gridRight, this.gridBottom);
    this.ctx.lineTo(this.gridRight, this.gridTop);
    this.ctx.lineTo(this.gridLeft, this.gridTop);
    this.ctx.clip();
    // now draw
    this.ctx.fillStyle = this.sliderBallColor;
    this.ctx.strokeStyle = this.sliderCircleColor; 
    this.ctx.lineWidth = this.sliderCircleWeight;
    this.ctx.beginPath();
    var ballCenterX = bottomBallCenterX; 
    var ballCenterY = leftBallCenterY;
    this.ctx.arc(ballCenterX, ballCenterY, this.sliderBallRadius, 0, 2 * Math.PI);
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.restore();

    //drawing labels
    this.ctx.font = this.xSliderLabelFont;
    this.ctx.fillStyle = this.xSliderLabelFontColor; 
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(this.xSliderLabel, bottomBallCenterX, bottomBallCenterY);
    this.ctx.font = this.ySliderLabelFont;
    this.ctx.fillStyle = this.ySliderLabelFontColor; 
    this.ctx.fillText(this.ySliderLabel, leftBallCenterX, leftBallCenterY);
  };
  draw = function() {
    /*
      call all needed drawing functions
    */
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.draw_sliders();
    this.draw_axes();
    this.draw_gridlines();
    this.draw_choices();
  };
  canvasCoords_to_proportionalityCoords = function(point) {
    /*
      Return result of applying transformation sending the displayed grid to the unit square

      canvasCoords are the pixels within the canvas. 
      proportionalityCoords are numbers between 0 and 1 within the grid
    */
    return {
      x: (point.x - this.gridLeft)/(this.gridRight - this.gridLeft),
      y: (this.gridBottom - point.y)/(this.gridBottom - this.gridTop)
    }
  }
  proportionalityCoords_to_canvasCoords = function(point) {
    return {
      x: point.x*(this.gridRight - this.gridLeft) + this.gridLeft, 
      y: this.gridBottom - point.y*(this.gridBottom - this.gridTop) 
    }
  }
  sync_choice_mouse = function(e) {
    /*
      use the mouse position to set the values of choiceX and choiceY 
    */
    var mousePos = getMousePos(this.canvas, e);
    //X
    this.xChoice = Math.max(0, Math.min(1, (mousePos.x - this.gridLeft)/(this.gridRight - this.gridLeft)));
    //Y
    this.yChoice = Math.max(0, Math.min(1, (this.gridBottom - mousePos.y)/(this.gridBottom - this.gridTop)));
  };
  attention_xSlider = function(e) {
    /*
      use mouse data to update the xSlider 

      this is called when user clicks on the xSlider, among elsewhere.
    */
    var mousePos = getMousePos(this.canvas, e);
    var saveY = this.yChoice;
    this.sync_choice_mouse(e);
    this.yChoice = saveY;
    this.draw();

  };
  attention_ySlider = function(e) {
    /*
      use mouse data to update the ySlider 

      this is called when user clicks on the ySlider, among elsewhere.
    */
    var mousePos = getMousePos(this.canvas, e);
    var saveX = this.xChoice;
    this.sync_choice_mouse(e);
    this.xChoice = saveX;
    this.draw();
  };
  attention_grid = function(e) {
    /*
      use mouse data to update the grid

      this is called when user clicks on the grid or during dragging of the mouse over the grid 
    */
    this.attention_xSlider(e);
    this.attention_ySlider(e);
    this.draw();
  };
  on_mousemove = function(e) {
    /*
      what to do when the mouse moves 

      separate function because I want to call it when the mouse is clicked as well
    */
    if (this.clicked.grid) {
      this.attention_grid(e);
    }
    if (this.clicked.xSlider) {
      this.attention_xSlider(e);
    }
    if (this.clicked.ySlider) {
      this.attention_ySlider(e);
    }
  };
  attach_events = function() {
    /*
      attach mouse events to the grid
    */
    var parentThis = this;

    //structure for keeping track of where the mouse was clicked
    this.clicked = {
      grid: false,
      xSlider: false,
      ySlider: false,
    }

    function drag(e) {
      parentThis.on_mousemove(e);
    }
    function dragStart(e) {
      e.preventDefault();
      var mousePos = getMousePos(parentThis.canvas, e);
      // keep track of where they clicked, to inform mousemove 
      parentThis.clicked = {
        grid: false,
        xSlider: false,
        ySlider: false,
      }
      // check if click in grid
      if (pos_is_in_rect(mousePos.x, mousePos.y, parentThis.gridLeft, parentThis.gridTop, parentThis.gridRight, parentThis.gridBottom)) {
        parentThis.clicked.grid = true;
      }
      // check if click in x slider
      var xSliderTop = parentThis.gridBottom + parentThis.bottomSliderPadding - parentThis.sliderBallRadius;
      var xSliderBottom = xSliderTop + 2*parentThis.sliderBallRadius;
      if (pos_is_in_rect(mousePos.x, mousePos.y, parentThis.gridLeft, xSliderTop, parentThis.gridRight, xSliderBottom)) {
        parentThis.clicked.xSlider = true;
      }
      // check if click in y slider
      var ySliderLeft = parentThis.gridLeft - parentThis.leftSliderPadding - parentThis.sliderBallRadius; 
      var ySliderRight = ySliderLeft + 2*parentThis.sliderBallRadius;
      if (pos_is_in_rect(mousePos.x, mousePos.y, ySliderLeft, parentThis.gridTop, ySliderRight, parentThis.gridBottom)) {
        parentThis.clicked.ySlider = true;
        return;
      }
      parentThis.on_mousemove(e);
    }
    function dragEnd(e) {
      parentThis.clicked = {
        grid: false,
        xSlider: false,
        ySlider: false,
      }
    }
    // mouse events
    window.addEventListener('mousemove', drag);
    window.addEventListener('mousedown', dragStart);
    window.addEventListener('mouseup', dragEnd);

    // touch events
    window.addEventListener('touchmove', drag);
    window.addEventListener('touchstart', dragStart);
    window.addEventListener('touchend', dragEnd);

    window.addEventListener('mouseout', function(e) {
      if (e.srcElement == document.querySelector('html')) {
        parentThis.clicked = {
          grid: false,
          xSlider: false,
          ySlider: false,
        }
      }
    });
  };
};
