const acc = 9.81;
const bounce = 0.3;
const surfaceResistance = 0.999;
const pieceSize = 20;
const colors = [
  [248, 173, 42],
  [80, 180, 174],
  [26, 143, 252],
  [150, 187, 222],
  [58, 72, 151],
  [61, 107, 235],
  [105, 215, 252],
  [38, 38, 38],
  [241, 121, 73]
];

class Piece {
  constructor(x, y, velocity, acceleration) {
    this.active = false;
    this.frame = 0;
    this.color = colors[Math.ceil((Math.random() * 100)) % colors.length];
    this.prevPosition = [x, y];
    this.position = [x, y];
    this.sourceX = x;
    this.sourceY = y;
    this.size = pieceSize;
    this.velocity = velocity;
    this.acceleration = acceleration;
  }

  calcAcceleration() {
    this.acceleration[1] = acc / 20;
  }

  calcVelocity() {
    this.velocity[0] += this.acceleration[0];
    this.velocity[1] += this.acceleration[1];
  }

  calcPosition() {
    this.position[0] += this.velocity[0];
    this.position[1] += this.velocity[1];
    this.prevPosition = this.position;
  }

  checkWallColisions(spaceWidth, spaceHeight) {
    if (this.position[1] >= spaceHeight - this.size) {
      this.position[1] = spaceHeight - this.size;
      this.velocity[1] *= -bounce;
      if (this.velocity[1] > -0.1 && this.velocity[1] < 0.1) {
        this.velocity[1] = 0;
        this.velocity[0] *= surfaceResistance;
        if (Math.abs(this.velocity[0]) <= 0.1) {
            this.velocity[0] = 0;
        }
      }
    } else if (this.position[1] <= this.size) {
      this.position[1] = this.size;
      this.velocity[1] *= -bounce;
    }
    if (this.position[0] <= 0 + this.size) {
      this.position[0] = 0 + this.size;
      this.velocity[0] *= -bounce;
    } else if (this.position[0] >= spaceWidth - this.size) {
      this.position[0] = spaceWidth - this.size;
      this.velocity[0] *= -bounce;
    }
  }

  updatePosition(spaceWidth, spaceHeight) {
    this.calcAcceleration();
    this.checkWallColisions(spaceWidth, spaceHeight);
    this.calcVelocity();
    this.calcPosition();
  }
}

function shuffle(array) {
  let len = array.length;

  while (len) {
    let i = Math.floor(Math.random() * len--);
    let t = array[len];
    array[len] = array[i];
    array[i] = t;
  }
  return array;
}

class App {
  constructor(imgSrc, canvas) {
    this.image = new Image();
    this.image.src = imgSrc;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx.fillStyle = '#FFF';
    this.frame = 0;
    this.createPieces();
  }

  createPieces() {
    const pieces = [];
    const random = () => ((((Math.random() * 100) % 50) - 25) / 10)

    // 生成碎片
    for (let x = 0; x < this.canvas.width / pieceSize; ++x) {
      for (let y = 0; y < this.canvas.height / pieceSize; ++y) {
        pieces.push(new Piece(
          x * pieceSize,
          y * pieceSize,
          [random(), random()],
          [0, acc]
        ));
      }
    }
    // 打乱碎片的顺序
    this.pieces = shuffle(pieces);
  }

  render() {
    const duration = 300;
    const { ctx, canvas } = this;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.pieces.forEach((el, i) => {
      // 在一段时间后不再渲染该碎片
      if (el.frame > 240) {
        return;
      }
      // 随着动画播放的时间增长，分批激活碎片
      if (this.frame < duration) {
        if (i < this.pieces.length * this.frame / duration) {
          el.active = true;
        }
      } else {
        el.active = true;
      }
      // 在一段时间后，让碎片开始往下掉落
      if (el.frame > 30) {
        el.updatePosition(canvas.width, canvas.height);
      }
      // 贴上碎片背景图
      ctx.drawImage(this.image, el.sourceX, el.sourceY, pieceSize, pieceSize,
        el.position[0], el.position[1], pieceSize, pieceSize);
      // 如果碎片已经激活
      if (el.active) {
        let alpha = 0;

        if (el.frame > 60) {
          alpha = 1.0;
        } else if (el.frame > 30) {
          alpha = (el.frame - 30) / 30;
        }
        el.frame++;
        ctx.strokeStyle = '#eee';
        ctx.strokeRect(el.position[0], el.position[1], pieceSize, pieceSize);
        // 让碎片的背景图渐变为纯色
        ctx.fillStyle = `rgba(${el.color[0]}, ${el.color[1]}, ${el.color[2]}, ${alpha})`;
        ctx.fillRect(el.position[0], el.position[1], pieceSize, pieceSize);
      }
    })
    this.frame++;
    requestAnimationFrame(() => this.render());
  }
}

window.onload = () => {
  const bg = document.createElement('div');
  const canvas = document.createElement('canvas');

  bg.innerText = '愚人节快乐！';
  bg.style.textAlign = 'center';
  bg.style.fontSize = '64px';
  bg.style.display = 'flex';
  bg.style.justifyContent = 'center';
  bg.style.alignItems = 'center';
  bg.style.backgroundColor = '#fff';
  bg.style.position = 'fixed';
  bg.style.left = 0;
  bg.style.top = 0;
  bg.style.width = '100%';
  bg.style.height = '100%';
  bg.style.zIndex = 10000;
  canvas.style.position = 'fixed';
  canvas.style.left = 0;
  canvas.style.top = 0;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = 10001;
  document.body.appendChild(bg);
  document.body.appendChild(canvas);
  canvas.addEventListener('click', () => {
    bg.parentNode.removeChild(bg);
    canvas.parentNode.removeChild(canvas);
  })
  new App('image.png', canvas).render();
}
