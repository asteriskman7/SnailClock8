const canvas = document.getElementById('cmain');
const ctx = canvas.getContext('2d', {alpha: false});
const snail = document.getElementById('img_snail');
const grass = document.getElementById('img_grass');

// *** fnoise code begin
function rnd(seed) {
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function pnoise(x, offset) {
    offset = offset|0;
    var x0 = Math.floor(x);
    var x1 = x0 + 1;
    var r0 = rnd(x0+offset);
    var r1 = rnd(x1+offset);
    var dx = x - x0;
    var rx = (r1 - r0) * dx + r0;
    return rx;
}

function fnoise(x,config) {
    var r=0;
    for (var i = 0; i < config.length; i++) {
        var c = config[i];
        var ri = c.a * pnoise(x * c.s, c.s);
        r += ri;
    }
    return r;
}

function getNoiseRange(config) {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < 1000; i += 1.1543) {
    let n = fnoise(i, config);
    min = Math.min(min, n);
    max = Math.max(max, n);
  }
  return [min, max, max - min];
}

function getNormalizedNoise(x, config, range) {
  return (fnoise(x, config) - range[0]) / range[2];
}

// ** fnoise code end

function getTimeString(t) {
  let [h,m] = t.toLocaleTimeString().split` `[0].split`:`;
  if (h < 10) {h = '0' + h;}
  let baseString = `${h}${m}`;
  return baseString;
}

function drawImageAtAngle(context, x, y, angle, img) {
  context.save();
  context.translate(x, y);
  context.rotate(angle);
  context.drawImage(img, -img.width/2, -img.height/2, img.width, img.height);
  context.restore();
}

function textAtPointAndAngle(context, x, y, angle, text) {
  context.save();
  context.translate(x, y);
  context.rotate(-angle);
  context.fillText(text, 0, 0);
  context.restore();
}

let PI = Math.PI;

function lineToPoints(l, config, x1, y1, x2, y2) {
  let dx = (x2 - x1) / (config.ppl - 1);
  let dy = (y1 - y2) / (config.ppl - 1);
  for (let i = 0; i < config.ppl; i++) {
    l.push([(x1 + dx * i) * config.scale + config.offX, (10 - y1 + dy * i) * config.scale + config.offY]);
  }
}

//quad
//21
//34
//dir in ['cw', 'ccw']
function arcToPoints(l, config, cx, cy, r, quad, dir) {
  let minAngle;
  let maxAngle;
  if (dir === 'cw') {
    minAngle = quad * PI / 2;
    maxAngle = (quad - 1) * PI / 2;
  } else {
    maxAngle = quad * PI / 2;
    minAngle = (quad - 1) * PI / 2;
  }
  let da = (maxAngle - minAngle) / (config.ppl - 1);
  for (let i = 0; i < config.ppl; i++) {
    let a = minAngle + i * da;
    let x = r * Math.cos(a) + cx;
    let y = r * Math.sin(a) + cy;
    l.push([x * config.scale + config.offX, (10 - y) * config.scale + config.offY]);
  }
}

function getCharPoints(maxPoints, scale, offX, offY, char) {
  let pl = [];
  let numUnits;
  let ppl;
  let config;
  switch(char) {
    case '0':
      numUnits = 8;
      ppl = Math.floor(maxPoints / numUnits);
      config = {ppl, scale, offX, offY};
      lineToPoints(pl, config, 2, 10, 4, 10);
      arcToPoints( pl, config, 4, 8, 2, 1, 'cw');
      lineToPoints(pl, config, 6, 8, 6, 2);
      arcToPoints( pl, config, 4, 2, 2, 4, 'cw');
      lineToPoints(pl, config, 4, 0, 2, 0);
      arcToPoints( pl, config, 2, 2, 2, 3, 'cw');
      lineToPoints(pl, config, 0, 2, 0, 8);
      arcToPoints( pl, config, 2, 8, 2, 2, 'cw');
      break;
    case '1':
      numUnits = 4;
      ppl = Math.floor(maxPoints / numUnits);
      config = {ppl, scale, offX, offY};
      lineToPoints(pl, config, 2, 10, 4, 10);
      lineToPoints(pl, config, 4, 10, 4, 0);
      lineToPoints(pl, config, 4, 0, 2, 0);
      lineToPoints(pl, config, 2, 0, 2, 10);
      break;
    case '2':
      numUnits = 12;
      ppl = Math.floor(maxPoints / numUnits);
      config = {ppl, scale, offX, offY};
      lineToPoints(pl, config, 2, 10, 4, 10);
      arcToPoints( pl, config, 4, 8, 2, 1, 'cw');
      lineToPoints(pl, config, 6, 8, 3, 2);
      lineToPoints(pl, config, 3, 2, 6, 2);
      lineToPoints(pl, config, 6, 2, 6, 0);
      lineToPoints(pl, config, 6, 0, 0, 0);
      lineToPoints(pl, config, 0, 0, 0, 2);
      lineToPoints(pl, config, 0, 2, 4, 7);
      arcToPoints( pl, config, 3, 7, 1, 1, 'ccw');
      arcToPoints( pl, config, 3, 7, 1, 2, 'ccw');
      lineToPoints(pl, config, 2, 7, 0, 7);
      arcToPoints( pl, config, 2, 8, 2, 2, 'cw');
      break;
    case '3':
      numUnits = 20;
      ppl = Math.floor(maxPoints / numUnits);
      config = {ppl, scale, offX, offY};
      lineToPoints(pl, config, 2.5, 10, 4, 10);
      arcToPoints( pl, config, 4, 8, 2, 1, 'cw');
      arcToPoints( pl, config, 4, 8, 2, 4, 'cw');
      arcToPoints( pl, config, 4, 4, 2, 1, 'cw');
      lineToPoints(pl, config, 6, 4, 6, 2);
      arcToPoints( pl, config, 4, 2, 2, 4, 'cw');
      lineToPoints(pl, config, 4, 0, 2, 0);
      arcToPoints( pl, config, 2, 2, 2, 3, 'cw');
      lineToPoints(pl, config, 0, 2, 2, 2);
      arcToPoints( pl, config, 3, 1.5, 0.5, 3, 'ccw');
      arcToPoints( pl, config, 3, 1.5, 0.5, 4, 'ccw');
      lineToPoints(pl, config, 3.5, 2, 3.5, 4);
      arcToPoints( pl, config, 3, 4.5, 0.5, 1, 'ccw');
      lineToPoints(pl, config, 3, 5, 3, 7);
      arcToPoints( pl, config, 3, 7.5, 0.5, 4, 'ccw');
      arcToPoints( pl, config, 3, 7.5, 0.5, 1, 'ccw');
      arcToPoints( pl, config, 3, 7.5, 0.5, 2, 'ccw');
      lineToPoints(pl, config, 2.5, 7.5, 0, 7.5);
      arcToPoints( pl, config, 2.5, 7.5, 2.5, 2, 'cw');
      break;
    case '4':
      numUnits = 11;
      ppl = Math.floor(maxPoints / numUnits);
      config = {ppl, scale, offX, offY};
      lineToPoints(pl, config, 2, 10, 5, 10);
      lineToPoints(pl, config, 5, 10, 5, 3);
      lineToPoints(pl, config, 5, 3, 6, 3);
      lineToPoints(pl, config, 6, 3, 6, 2);
      lineToPoints(pl, config, 6, 2, 5, 2);
      lineToPoints(pl, config, 5, 2, 5, 0);
      lineToPoints(pl, config, 5, 0, 3, 0);
      lineToPoints(pl, config, 3, 0, 3, 2);
      lineToPoints(pl, config, 3, 2, 0, 2);
      lineToPoints(pl, config, 0, 2, 0, 4);
      lineToPoints(pl, config, 0, 4, 2, 10);
      break;
    case '5':
      numUnits = 19;
      ppl = Math.floor(maxPoints / numUnits);
      config = {ppl, scale, offX, offY};
      lineToPoints(pl, config, 0, 10, 6, 10);
      lineToPoints(pl, config, 6, 10, 6, 8);
      lineToPoints(pl, config, 6, 8, 2, 8);
      lineToPoints(pl, config, 2, 8, 2, 5.5);
      arcToPoints( pl, config, 3.5, 5.5, 1.5, 2, 'cw');
      lineToPoints(pl, config, 3.5, 7, 4.5, 7);
      arcToPoints( pl, config, 4.5, 5.5, 1.5, 1, 'cw');
      lineToPoints(pl, config, 6, 5.5, 6, 2);
      arcToPoints( pl, config, 4, 2, 2, 4, 'cw');
      lineToPoints(pl, config, 4, 0, 2, 0);
      arcToPoints( pl, config, 2, 2, 2, 3, 'cw');
      lineToPoints(pl, config, 0, 2, 2, 2);
      arcToPoints( pl, config, 3, 2, 1, 3, 'ccw');
      arcToPoints( pl, config, 3, 2, 1, 4, 'ccw');
      lineToPoints(pl, config, 4, 2, 4, 4);
      arcToPoints( pl, config, 3, 4, 1, 1, 'ccw');
      arcToPoints( pl, config, 3, 4, 1, 2, 'ccw');
      lineToPoints(pl, config, 2, 4, 0, 4);
      lineToPoints(pl, config, 0, 4, 0, 10);
      break;
    case '6':
      numUnits = 14;
      ppl = Math.floor(maxPoints / numUnits);
      config = {ppl, scale, offX, offY};
      lineToPoints(pl, config, 2, 10, 4, 10);
      arcToPoints( pl, config, 4, 8, 2, 1, 'cw');
      lineToPoints(pl, config, 6, 8, 4, 8);
      arcToPoints( pl, config, 3, 8, 1, 1, 'ccw');
      arcToPoints( pl, config, 3, 8, 1, 2, 'ccw');
      lineToPoints(pl, config, 2, 8, 2, 5);
      arcToPoints( pl, config, 4, 5, 2, 2, 'cw');
      arcToPoints( pl, config, 4, 5, 2, 1, 'cw');
      lineToPoints(pl, config, 6, 5, 6, 2);
      arcToPoints( pl, config, 4, 2, 2, 4, 'cw');
      lineToPoints(pl, config, 4, 0, 2, 0);
      arcToPoints( pl, config, 2, 2, 2, 3, 'cw');
      lineToPoints(pl, config, 0, 2, 0, 8);
      arcToPoints( pl, config, 2, 8, 2, 2, 'cw');
      break;
    case '7':
      numUnits = 7;
      ppl = Math.floor(maxPoints / numUnits);
      config = {ppl, scale, offX, offY};
      lineToPoints(pl, config, 0, 10, 6, 10);
      lineToPoints(pl, config, 6, 10, 6, 8);
      lineToPoints(pl, config, 6, 8, 4, 0);
      lineToPoints(pl, config, 4, 0, 2, 0);
      lineToPoints(pl, config, 2, 0, 3, 8);
      lineToPoints(pl, config, 3, 8, 0, 8);
      lineToPoints(pl, config, 0, 8, 0, 10);
      break;
    case '8':
      numUnits = 12;
      ppl = Math.floor(maxPoints / numUnits);
      config = {ppl, scale, offX, offY};
      lineToPoints(pl, config, 2, 10, 4, 10);
      arcToPoints( pl, config, 4, 8, 2, 1, 'cw');
      arcToPoints( pl, config, 4, 8, 2, 4, 'cw');
      arcToPoints( pl, config, 4, 4, 2, 1, 'cw');
      lineToPoints(pl, config, 6, 4, 6, 2);
      arcToPoints( pl, config, 4, 2, 2, 4, 'cw');
      lineToPoints(pl, config, 4, 0, 2, 0);
      arcToPoints( pl, config, 2, 2, 2, 3, 'cw');
      lineToPoints(pl, config, 0, 2, 0, 4);
      arcToPoints( pl, config, 2, 4, 2, 2, 'cw');
      arcToPoints( pl, config, 2, 8, 2, 3, 'cw');
      arcToPoints( pl, config, 2, 8, 2, 2, 'cw');
      break;
    case '9':
      numUnits = 14;
      ppl = Math.floor(maxPoints / numUnits);
      config = {ppl, scale, offX, offY};
      lineToPoints(pl, config, 2, 10, 4, 10);
      arcToPoints( pl, config, 4, 8, 2, 1, 'cw');
      lineToPoints(pl, config, 6, 8, 6, 2);
      arcToPoints( pl, config, 4, 2, 2, 4, 'cw');
      lineToPoints(pl, config, 4, 0, 2, 0);
      arcToPoints( pl, config, 2, 2, 2, 3, 'cw');
      lineToPoints(pl, config, 0, 2, 2, 2);
      arcToPoints( pl, config, 3, 2, 1, 3, 'ccw');
      arcToPoints( pl, config, 3, 2, 1, 4, 'ccw');
      lineToPoints(pl, config, 4, 2, 4, 6);
      arcToPoints( pl, config, 2, 6, 2, 4, 'cw');
      arcToPoints( pl, config, 2, 6, 2, 3, 'cw');
      lineToPoints(pl, config, 0, 6, 0, 8);
      arcToPoints( pl, config, 2, 8, 2, 2, 'cw');

      break;
    default:
      throw "UNKNOWN CHAR"
  }
  while(pl.length < maxPoints) {
    pl.push(pl[pl.length-1]);
  }
  return pl;
}

function morphPoints(a, b, p) {
  let result = [];
  for (let i = 0; i < a.length; i++) {
    let newx = (b[i][0] - a[i][0]) * p + a[i][0];
    let newy = (b[i][1] - a[i][1]) * p + a[i][1];
    result.push([newx, newy]);
  }
  return result;
}

let noiseConfig = [
  {a: 128, s: 1/8},
  {a: 64,  s: 1/4},
  {a: 16,  s: 1/2},
  {a: 8,   s: 1},
  {a: 4,   s: 2},
  {a: 2,   s: 4},
];
let noiseRange = getNoiseRange(noiseConfig);


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  ctx.drawImage(grass, 0, 0, grass.width, grass.height);
  ctx.drawImage(snail, 0, 150, snail.width, snail.height);

  let curTime = new Date();
  //curTime.setTime(curTime.getTime() * 10);
  let nextTime = new Date();
  nextTime.setTime(curTime.getTime() + 60 * 1000);

  let scale = 6;
  let maxPoints = 100;

  let digitPos = [
    80,
    214,
    350,
    484,
  ];

  let noiseConfig = [
    {a: 128, s: 1/8},
    {a: 64,  s: 1/4},
    {a: 0,   s: 1/2},
    {a: 0,   s: 1},
    {a: 0,   s: 2},
    {a: 0,   s: 4},
  ];


  let ypos = 180;
  let curTimeString = getTimeString(curTime);
  let nextTimeString = getTimeString(nextTime);
  let minutePercent = (curTime.getSeconds() + curTime.getMilliseconds() / 1000) / 60;

  ctx.strokeStyle = 'red';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  let pointIndex = 0;
  let noiseYScale = 4;
  let noiseTime = curTime.getTime() * 0.05;

  for (let i = 0; i < 4; i++) {
    let curChar = curTimeString[i];
    let nextChar = nextTimeString[i];
    let curCharPoints = getCharPoints(maxPoints, scale, digitPos[i], ypos, curChar)
    let nextCharPoints = getCharPoints(maxPoints, scale, digitPos[i], ypos, nextChar);
    let mp = morphPoints(curCharPoints, nextCharPoints, minutePercent);
    ctx.beginPath();
    ctx.moveTo(mp[0][0], mp[0][1]);
    mp.forEach(p => {
      let rx = p[0] + noiseYScale * (getNormalizedNoise(pointIndex + noiseTime, noiseConfig, noiseRange) - 0.5);
      let ry = p[1] + noiseYScale * (getNormalizedNoise(pointIndex + 9999 + noiseTime, noiseConfig, noiseRange) - 0.5);
      //ctx.lineTo(p[0], p[1]);
      ctx.lineTo(rx, ry);
      pointIndex++;
    });
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'red';
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'yellow';
    ctx.stroke();
  }

  ctx.restore();


  requestAnimationFrame(draw);
}

draw()
