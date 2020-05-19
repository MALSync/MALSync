const state = {
  canvas: null,
  canvasState: {
    height: 0,
    width: 0,
    starFall: false,
  },
  stars: [],
  fps: 60,
  frame: 0,
  remainingScroll: 0,
  running: 0,
  lastCalledTime: 0,
  fpsRunning: 0,
  mouse: { x: 0, y: 0 },
};

onmessage = function(evt) {
  switch (evt.data.mode) {
    case 'init':
      state.canvas = evt.data.canvas;
    case 'resize':
      state.canvasState.height = evt.data.canvasState.height;
      state.canvasState.width = evt.data.canvasState.width;
      state.canvasState.starFall = evt.data.canvasState.starFall;
      initStars();
      break;
    case 'starFall':
      state.canvasState.starFall = evt.data.canvasState.starFall;
      break;
    case 'scrollDistance':
      state.remainingScroll += evt.data.scrollDistance;
      break;
    default:
      throw `Unknown canvas mode ${evt.data.mode}`;
  }
};

//document.onmousemove = handleMouseMove;
//function handleMouseMove(event) {
//  var dot, eventDoc, doc, body, pageX, pageY;

//  event = event || window.event; // IE-ism

//  // If pageX/Y aren't available and clientX/Y are,
//  // calculate pageX/Y - logic taken from jQuery.
//  // (This is to support old IE)
//  if (event.pageX == null && event.clientX != null) {
//      eventDoc = (event.target && event.target.ownerDocument) || document;
//      doc = eventDoc.documentElement;
//      body = eventDoc.body;

//      event.pageX = event.clientX +
//        (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
//        (doc && doc.clientLeft || body && body.clientLeft || 0);
//      event.pageY = event.clientY +
//        (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
//        (doc && doc.clientTop  || body && body.clientTop  || 0 );
//  }

//  // Use event.pageX / event.pageY here
//  mouse.x = event.pageX;
//  mouse.y = event.pageY -$(window).scrollTop() ;
//}

function initStars() {
  state.canvas.width = state.canvasState.width;
  state.canvas.height = state.canvasState.height;
  const ctx = state.canvas.getContext('2d');

  if (!state.stars.length) {
    for (let i = 0; i < 100; i++) {
      var star = new Star();
      star.init();
      state.stars.push(star);
    }
  } else {
    for (var star of state.stars) {
      star.init();
    }
  }
  drawStars();
  if (!state.running) {
    //setInterval(animate, 1000 / fps);
    state.lastCalledTime = performance.now();
    requestAnimationFrame(animate);
    state.running++;
  }
  let speed = 0;
  function animate() {
    //console.log(speed);
    if (state.remainingScroll < 10 && state.remainingScroll > -10) {
      speed = speed - 0.05;
      if (speed < 0) speed = 0;
    } else {
      speed = speed + 0.1;
      if (speed > 4) speed = 4;
      var scrollDistance = state.remainingScroll / (state.fps * 0.1);
      state.remainingScroll = state.remainingScroll - scrollDistance;
    }

    if (state.remainingScroll < 0) {
      scrollDistance = 0 - speed;
    } else {
      scrollDistance = speed;
    }

    if (state.canvasState.starFall) {
      speed = 4;
      scrollDistance = 4;
    }

    for (const star of state.stars) {
      star.animate();
      star.offset(0, scrollDistance / star.paralaxLevel);
      star.mouseReaction(state.mouse);
    }
    drawStars();

    delta = (performance.now() - state.lastCalledTime) / 1000;
    state.fpsRunning = 1 / delta;
    if (state.fpsRunning > 20) {
      state.lastCalledTime = performance.now();
      requestAnimationFrame(animate);
    } else {
      console.log('Skip Frame');
      setTimeout(function() {
        state.lastCalledTime = performance.now();
        requestAnimationFrame(animate);
      }, 100);
    }
  }
  function drawStars() {
    state.frame++;
    ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
    ctx.moveTo(0, 0);

    for (const star of state.stars) {
      ctx.fillStyle = star.color;
      ctx.fillRect(star.x, star.y, star.size, star.size);
      let i = 10;
      for (const last of star.last) {
        ctx.globalAlpha = 0.8 / (i * 4);
        ctx.fillStyle = star.color;
        ctx.fillRect(last.x, last.y, star.size, star.size);
        i = i - 1;
      }
      ctx.globalAlpha = 1;
    }
    ctx.stroke();
  }
}

function Star() {
  this.x = 0;
  this.y = 0;
  this.xSpeed = 0;
  this.ySpeed = 0;
  this.size = 1;
  this.paralaxLevel = 1;
  this.color = 'white';
  this.last = [];
  this.init = function() {
    this.x = Math.floor(Math.random() * state.canvas.width);
    this.y = Math.floor(Math.random() * state.canvas.height);
    this.size = Math.ceil(Math.random() * 3);
    const maxSpeed = 0.08 / this.size;
    this.xSpeed = Math.random() * (maxSpeed * 2) - maxSpeed;
    this.ySpeed = Math.random() * (maxSpeed * 2) - maxSpeed;
    this.paralaxLevel = Math.ceil(Math.random() * 5) + 3;
  };
  this.animate = function() {
    if (state.frame % 5 == 0) {
      this.last.push({ x: this.x, y: this.y });
      if (this.last.length > 10) {
        this.last.shift();
      }
    }
    const maxSpeed = 0.08 / this.size;
    if (state.frame % 100 == 99) {
      this.xSpeed += Math.random() * 0.0004 - 0.0002;
      this.ySpeed += Math.random() * 0.0004 - 0.0002;
    }
    if (this.xSpeed > maxSpeed) {
      this.xSpeed = maxSpeed;
    } else if (this.xSpeed < maxSpeed * -1) {
      this.xSpeed = maxSpeed * -1;
    }

    if (this.ySpeed > maxSpeed) {
      this.ySpeed = maxSpeed;
    } else if (this.ySpeed < maxSpeed * -1) {
      this.ySpeed = maxSpeed * -1;
    }
    //
    this.y += this.ySpeed;
    this.x += this.xSpeed;
    if (this.x > state.canvas.width) {
      this.x += state.canvas.width * -1;
    } else if (this.x < 0) {
      this.x += state.canvas.width;
    }
    if (this.y > state.canvas.height) {
      this.y += state.canvas.height * -1;
    } else if (this.y < 0) {
      this.y += state.canvas.height;
    }
  };
  this.offset = function(xOff, yOff) {
    this.y += yOff;
    this.x += xOff;
  };
  this.mouseReaction = function(mouse) {
    //this.color = 'white';
    let distx = this.x - mouse.x;
    let disty = this.y - mouse.y;
    const reactionDistance = 200;
    if (distx < reactionDistance && distx > -reactionDistance) {
      if (disty < reactionDistance && disty > -reactionDistance) {
        if (!(distx < 15 && distx > -15 && disty < 15 && disty > -15)) {
          //this.color = 'red';

          const speed = 5;
          const movex = speed / distx;
          const movey = speed / disty;

          if (distx > 0) {
            distx = reactionDistance - distx;
          } else {
            distx = -reactionDistance - distx;
          }

          if (disty > 0) {
            disty = reactionDistance - disty;
          } else {
            disty = -reactionDistance - disty;
          }

          if (1 === 1) {
            this.xSpeed += (distx / 1000000) * -1;
          }
          if (1 === 1) {
            this.ySpeed += (disty / 1000000) * -1;
          }

          //this.move(movex, movey);
          return;
        }
      }
    }
  };
}
