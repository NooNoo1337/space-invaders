'use strict';

(() => {
  const SCREEN = {
    WIDTH: 510,
    HEIGHT: 600,
    BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.85)',
    CANVAS_ID: 'gameScreen',
  };

  const TANK = {
    WIDTH: 22,
    HEIGHT: 16,
    GROUND_MARGIN: 30,
    BACKGROUND_COLOR: 'green',
    VELOCITY: 4,
  };

  const ALIEN = {
    WIDTH: 20,
    HEIGHT: 20,
    VELOCITY: 30,
    BACKGROUND_COLOR: 'red',
  };

  const BULLET = {
    WIDTH: 2,
    HEIGHT: 6,
    VELOCITY: 5,
    BACKGROUND_COLOR: '#ffffff',
  };

  const KEYBOARD_KEYS = {
    LEFT: 'KeyA',
    RIGHT: 'KeyD',
    SPACE: 'Space',
  };

  const InputHandler = {
    init() {
      this.downKeys = {};
      this.pressedKeys = {};

      window.addEventListener('keydown', ({ code }) => {
        this.downKeys[code] = true;
      });

      window.addEventListener('keyup', ({ code }) => {
        this.downKeys[code] = false;
        this.pressedKeys[code] = false;
      });
    },

    isDown(code) {
      return this.downKeys[code];
    },

    isPressed(code) {
      if (this.pressedKeys[code]) {
        return false;
      } else if (this.downKeys[code]) {
        return (this.pressedKeys[code] = true);
      }

      return false;
    },
  };

  /** Game */
  const Game = {
    init() {
      Screen.init();
      InputHandler.init();
      Tank.init();
      Aliens.init();
      Bullets.init();
      Bullet.init();

      this.pressedKeys = {
        Space: false,
        KeyA: false,
        KeyD: false,
      };
    },

    render() {
      Screen.render();
      Tank.render();

      Bullets.render();
      Aliens.render();
    },

    update(timestamp) {
      Tank.update();
      Bullets.update();
      Aliens.update(timestamp);
    },
  };

  /** Screen */
  const Screen = {
    init(
      width = SCREEN.WIDTH,
      height = SCREEN.HEIGHT,
      canvasID = SCREEN.CANVAS_ID,
      themeColor = SCREEN.BACKGROUND_COLOR
    ) {
      this.width = width;
      this.height = height;
      this.canvas = document.getElementById(canvasID);
      this.themeColor = themeColor;
    },

    render() {
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.canvas.style.backgroundColor = this.themeColor;
    },
  };

  /** Tank */
  const Tank = {
    init(
      width = TANK.WIDTH,
      height = TANK.HEIGHT,
      velocity = TANK.VELOCITY,
      canvasID = SCREEN.CANVAS_ID,
      themeColor = TANK.BACKGROUND_COLOR
    ) {
      this.x = (SCREEN.WIDTH - width) / 2;
      this.y = SCREEN.HEIGHT - (height + TANK.GROUND_MARGIN);
      this.velocity = velocity;

      this.width = width;
      this.height = height;
      this.themeColor = themeColor;
      this.ctx = document.getElementById(canvasID).getContext('2d');

      this.update = this.update.bind(this);
    },

    update() {
      this.clear();

      if (
        InputHandler.isDown(KEYBOARD_KEYS.LEFT) &&
        this.x - this.velocity > 0
      ) {
        this.x -= this.velocity;
      }

      if (
        InputHandler.isDown(KEYBOARD_KEYS.RIGHT) &&
        this.x + this.width + this.velocity < SCREEN.WIDTH
      ) {
        this.x += this.velocity;
      }

      if (InputHandler.isPressed(KEYBOARD_KEYS.SPACE)) this.shoot();
    },

    render() {
      this.ctx.fillStyle = this.themeColor;
      this.ctx.fillRect(this.x, this.y, this.width, this.height);
    },

    clear() {
      this.ctx.clearRect(this.x, this.y, this.width, this.height);
    },

    shoot() {
      Bullets.create({ x: this.x, y: this.y, width: this.width });
    },
  };

  const Bullets = {
    init() {
      this.bullets = [];
    },

    create({ x, width, y }) {
      const obj = Object.create(Bullet);

      this.bullets.push(obj.init(x + width / 2, y - 10));
    },

    render() {
      /** remove bullets outside canvas */
      this.bullets = this.bullets.filter(
        (bullet) => bullet.y + bullet.height > 0
      );

      this.bullets.map((bullet) => bullet.render());
    },

    update() {
      this.bullets.map((bullet) => bullet.update());
    },
  };

  const Bullet = {
    init(
      x = 50,
      y = 150,
      width = BULLET.WIDTH,
      height = BULLET.HEIGHT,
      velocity = BULLET.VELOCITY,
      backgroundColor = BULLET.BACKGROUND_COLOR,
      canvasID = SCREEN.CANVAS_ID
    ) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.velocity = velocity;
      this.backgroundColor = backgroundColor;
      this.ctx = document.getElementById(canvasID).getContext('2d');

      return this;
    },

    render() {
      this.ctx.fillStyle = this.backgroundColor;
      this.ctx.fillRect(this.x, this.y, this.width, this.height);
    },

    update() {
      this.clear();

      this.y -= this.velocity;
    },

    clear() {
      this.ctx.clearRect(this.x, this.y, this.width, this.height);
    },
  };

  const Alien = {
    init(
      x = 50,
      y = 25,
      canvasID = SCREEN.CANVAS_ID,
      velocity = ALIEN.VELOCITY,
      backgroundColor = ALIEN.BACKGROUND_COLOR
    ) {
      this.x = x;
      this.y = y;

      this.width = ALIEN.WIDTH;
      this.height = ALIEN.HEIGHT;
      this.backgroundColor = backgroundColor;
      this.velocity = velocity;

      this.ctx = document.getElementById(canvasID).getContext('2d');

      return this;
    },

    render() {
      this.ctx.fillStyle = this.backgroundColor;
      this.ctx.fillRect(this.x, this.y, this.width, this.height);
    },

    clear() {
      this.ctx.clearRect(this.x, this.y, this.width, this.height);
    },

    update(direction = 1, isNextLevel = false) {
      this.clear();

      this.x += this.velocity * direction;

      if (isNextLevel) {
        this.y += this.height;
      }
    },
  };

  const Aliens = {
    init() {
      this.aliens = this.createAliens();
      this.direction = 1;
    },

    createAliens() {
      const aliensCollection = [];
      const marginRight = 10;
      const rowsMargin = 16;

      for (let i = 1; i <= 5; i++) {
        const rowCollection = [];

        for (let j = 1; j <= 10; j++) {
          const obj = Object.create(Alien);

          rowCollection.push(
            obj.init(
              (ALIEN.WIDTH + marginRight) * j,
              (ALIEN.HEIGHT + rowsMargin) * i
            )
          );
        }

        aliensCollection.push(rowCollection);
      }

      return aliensCollection;
    },

    render() {
      this.aliens.map((row) => {
        row.map((alien) => {
          alien.render();
        });
      });
    },

    update() {
      let min = 510;
      let max = 0;

      if (frames % 40 === 0) {
        this.aliens.map((row) => {
          row.map((alien) => {
            alien.update(this.direction);

            max = Math.max(max, alien.x + alien.width);
            min = Math.min(min, alien.x);
          });
        });

        if (max > SCREEN.WIDTH - 30 || min < 30) {
          this.direction *= -1;

          this.aliens.map((row) => {
            row.map((alien) => {
              alien.update(this.direction, true);
            });
          });
        }
      }
    },
  };

  const { requestAnimationFrame } = window;
  let lastRender = 0;
  let frames = 0;

  Game.init();

  const gameLoop = (timestamp) => {
    const progress = timestamp - lastRender;

    frames++;

    Game.update(progress);
    Game.render();

    lastRender = timestamp;

    requestAnimationFrame(gameLoop);
  };

  requestAnimationFrame(gameLoop);
})();
