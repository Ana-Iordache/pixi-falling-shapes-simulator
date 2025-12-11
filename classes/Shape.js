import { Graphics } from 'pixi.js';

export class Shape {
  constructor(appWidth, appHeight, sizeShape, x, y) {
    this.appHeight = appHeight;
    this.appWidth = appWidth;
    this.size = sizeShape;
    this.x = x;
    this.y = y;

    this.graphics = new Graphics();
    this.color = 0xFF0000;
    this.shouldRemove = false;

    this.draw();
    this.addPosition();
    this.addInteraction();
  }

  draw() {
    this.graphics.poly([
      0, 0,               // top-left
      this.size, 0,       // top-right
      this.size / 2, this.size // bottom-center
    ]);
    this.graphics.fill({ color: this.color });
    this.graphics.stroke({ width: 2, color: 0x000000 });

    // center the pivot
    this.graphics.pivot.set(this.size / 2, this.size / 2);
  }

  addPosition() {
    if (!this.x && !this.y) {
      // initial X position random across the top of the rectangle
      this.graphics.x = Math.random() * (this.appWidth - this.size);
      // initial Y position outside the top of the rectangle
      this.graphics.y = -this.size * 2;
    } else {
      this.graphics.x = this.x;
      this.graphics.y = this.y;
    }
  }

  fallDown(gravity) {
    this.graphics.y += gravity;

    // if bottom position is outside the rectangle
    if (this.graphics.getBounds().y > this.appHeight) {
      this.shouldRemove = true;
    }
  }

  addInteraction() {
    this.graphics.eventMode = 'static';
    this.graphics.cursor = 'pointer';

    this.graphics.on('pointerdown', (event) => {
      // stop the click to propagate to the backgound
      event.stopPropagation();
      this.shouldRemove = true;
    });
  }
}