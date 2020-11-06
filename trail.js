const cvs = document.getElementById('main');
const ctx = cvs.getContext('2d');
let lx = -1, ly = -1;

cvs.onmousemove = e => {
  lx = e.x;
  ly = e.y;
}

const Trail = function () {
  this.ps = [];
  this.ds = [];
  this.lastDelta = 0;
  this.pps = 50;
  this.max = 10;
  this.virt = 0;
  this.last = null;
  this.dot = false;
  this.line = false;
  this.fill = true;

  this.available = function (d) {
    if (d - this.lastDelta > (1000 / this.pps)) {
      this.lastDelta = d;
      return true;
    }
    return false;
  }
  this.push = function (q) {
    this.checkDist(q) && this.ps.push(q) && (this.last = q);
  }
  this.render = function (ctx) {
    while (this.ps.length + this.virt > this.max && this.ps.length > 0) this.ps.shift();
    if (this.ps.length == 0) return;
    let cur = this.ps;
    //trail area
    if (this.fill) {
      let us = [], ds = [];
      ctx.beginPath();
      ctx.fillStyle = '#ff8400';
      for (let i = 1; i < cur.length; i++) {
        let ppdc = this.calcPerpendic(cur[i - 1], cur[i], 14 * ((i + 1) + this.max / 2) / (cur.length + this.max / 2));
        us.push(ppdc[0]);
        ds.push(ppdc[1]);
      }
      [...us, ...ds.reverse()].forEach((e, i) => (i == 0) ? ctx.moveTo(e.x, e.y) : ctx.lineTo(e.x, e.y));
      ctx.fill();
    }
    if (this.line) {
      //skel line
      ctx.beginPath();
      for (let i = 1; i < cur.length; i++) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.moveTo(cur[i - 1][0], cur[i - 1][1]);
        ctx.lineTo(cur[i][0], cur[i][1]);
      }
      ctx.stroke();
    }
    //circle dot
    this.dot && cur.forEach(p => this.renderCircle(ctx, p));

  }

  this.renderCircle = function (ctx, p) {
    ctx.fillStyle = '#737373';
    ctx.strokeStyle = '#504f4f';
    ctx.beginPath();
    ctx.arc(p[0], p[1], 5, 0, Math.PI * 2);
    ctx.fill();
  }

  this.checkDist = function (p) {
    if (this.last != null) {
      if (Math.abs(Math.hypot(this.last[0] - p[0], this.last[1] - p[1])) < 3) {
        this.virt++;
        if (this.virt > this.max) this.virt = this.max;
        this.ps.shift();
        return false;
      }
    }
    this.virt > 0 && this.virt--;
    return true;
  }

  this.calcPerpendic = function (sp, ep, dist = 10) {
    let radu = Math.atan2(ep[1] - sp[1], ep[0] - sp[0]) - Math.PI / 2;
    let radd = Math.atan2(ep[1] - sp[1], ep[0] - sp[0]) + Math.PI / 2;
    vu = { x: ep[0] + Math.cos(radu) * dist, y: ep[1] + Math.sin(radu) * dist };
    vd = { x: ep[0] + Math.cos(radd) * dist, y: ep[1] + Math.sin(radd) * dist };
    return [vu, vd];
  }

  this._loop = (d) => {
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    trail.available(d) && trail.push([lx, ly]);
    trail.render(ctx);
  };

  this.bindLoop = function (loop) {
    loop.on(this._loop);
  }

  this.unbindLoop = function (loop) {
    loop.off(this._loop);
  }
}

