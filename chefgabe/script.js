// Dolphins to the Max
// A single image, recursively tiled into an N x N grid of itself,
// forever — zoom into any point and the whole picture appears again.

(function () {
  "use strict";

  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var hint = document.getElementById("hint");
  var hintClose = document.getElementById("hint-close");
  var resetBtn = document.getElementById("reset");

  var GRID = 3;            // each level is divided into GRID x GRID copies of itself
  var MIN_TILE_PX = 18;     // stop recursing once a tile would render smaller than this
  var MAX_DEPTH = 28;       // hard safety cap

  var img = new Image();
  var imgReady = false;
  img.onload = function () {
    imgReady = true;
    requestRender();
  };
  img.src = "images/dolphin-photo.jpeg";

  // World space: the base image occupies [0,1] x [0,1].
  // scale = screen pixels per world unit. offsetX/offsetY = screen position of world (0,0).
  var scale = 1;
  var offsetX = 0, offsetY = 0;

  function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    fitToScreen();
    requestRender();
  }

  function fitToScreen() {
    var size = Math.min(canvas.width, canvas.height);
    scale = size;
    offsetX = (canvas.width - size) / 2;
    offsetY = (canvas.height - size) / 2;
  }

  var pending = false;
  function requestRender() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      render();
    });
  }

  function render() {
    if (!imgReady) return;
    ctx.fillStyle = "#073f63";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawFractal(0, 0, 1, 1, 0);
  }

  // Draw the image into world rect (wx,wy,ww,wh), then recurse into a
  // GRID x GRID set of sub-cells (each of which again shows the full image).
  function drawFractal(wx, wy, ww, wh, depth) {
    var sx = wx * scale + offsetX;
    var sy = wy * scale + offsetY;
    var sw = ww * scale;
    var sh = wh * scale;

    if (sx > canvas.width || sy > canvas.height || sx + sw < 0 || sy + sh < 0) {
      return; // fully off-screen
    }

    ctx.drawImage(img, sx, sy, sw, sh);

    if (depth >= MAX_DEPTH || sw < MIN_TILE_PX) return;

    var cw = ww / GRID, ch = wh / GRID;
    for (var i = 0; i < GRID; i++) {
      for (var j = 0; j < GRID; j++) {
        drawFractal(wx + i * cw, wy + j * ch, cw, ch, depth + 1);
      }
    }
  }

  // ---- interaction: pan + zoom-to-pointer ----

  function zoomAt(px, py, factor) {
    var wx = (px - offsetX) / scale;
    var wy = (py - offsetY) / scale;
    var newScale = scale * factor;
    // keep zoom sane: never smaller than fitting the screen, never absurdly large
    var minScale = Math.min(canvas.width, canvas.height);
    if (newScale < minScale) newScale = minScale;
    scale = newScale;
    offsetX = px - wx * scale;
    offsetY = py - wy * scale;
    requestRender();
  }

  canvas.addEventListener("wheel", function (e) {
    e.preventDefault();
    var rect = canvas.getBoundingClientRect();
    var px = (e.clientX - rect.left) * window.devicePixelRatio;
    var py = (e.clientY - rect.top) * window.devicePixelRatio;
    var factor = Math.pow(1.0025, -e.deltaY);
    zoomAt(px, py, factor);
  }, { passive: false });

  // mouse drag
  var dragging = false, lastX = 0, lastY = 0;
  canvas.addEventListener("mousedown", function (e) {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  window.addEventListener("mousemove", function (e) {
    if (!dragging) return;
    var dx = (e.clientX - lastX) * window.devicePixelRatio;
    var dy = (e.clientY - lastY) * window.devicePixelRatio;
    offsetX += dx;
    offsetY += dy;
    lastX = e.clientX;
    lastY = e.clientY;
    requestRender();
  });
  window.addEventListener("mouseup", function () { dragging = false; });

  // touch: drag + pinch
  var touches = {};
  function touchPoint(t) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (t.clientX - rect.left) * window.devicePixelRatio,
      y: (t.clientY - rect.top) * window.devicePixelRatio
    };
  }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }

  var pinchStartDist = null, pinchStartScale = null, panStart = null;

  canvas.addEventListener("touchstart", function (e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      panStart = touchPoint(e.touches[0]);
    } else if (e.touches.length === 2) {
      var a = touchPoint(e.touches[0]), b = touchPoint(e.touches[1]);
      pinchStartDist = dist(a, b);
      pinchStartScale = scale;
    }
  }, { passive: false });

  canvas.addEventListener("touchmove", function (e) {
    e.preventDefault();
    if (e.touches.length === 1 && panStart) {
      var p = touchPoint(e.touches[0]);
      offsetX += p.x - panStart.x;
      offsetY += p.y - panStart.y;
      panStart = p;
      requestRender();
    } else if (e.touches.length === 2 && pinchStartDist) {
      var a = touchPoint(e.touches[0]), b = touchPoint(e.touches[1]);
      var d = dist(a, b);
      var m = mid(a, b);
      var factor = (d / pinchStartDist) * (pinchStartScale / scale);
      zoomAt(m.x, m.y, factor);
    }
  }, { passive: false });

  canvas.addEventListener("touchend", function (e) {
    if (e.touches.length === 0) {
      panStart = null;
      pinchStartDist = null;
    }
  });

  // reset + hint
  resetBtn.addEventListener("click", function () {
    fitToScreen();
    requestRender();
  });
  hintClose.addEventListener("click", function () {
    hint.classList.add("hidden");
  });
  setTimeout(function () { hint.classList.add("hidden"); }, 6000);

  window.addEventListener("resize", resize);
  resize();
})();
