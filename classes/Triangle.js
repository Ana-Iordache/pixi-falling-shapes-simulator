import { Shape } from './Shape.js';

export class Triangle extends Shape {
  constructor(x, y, size, gravityValue, color) {
    super(x, y, gravityValue, color);
    this.size = size;

    // Perform the drawing once upon initialization
    this.drawShape();
  }

  drawShape() {
    // Set the fill color
    this.fill(this.color);

    // Draw the triangle path relative to (0,0) of this object
    // We offset the points so (0,0) is the center-top or center of the shape
    this.moveTo(0, 0);                 // Top point
    this.lineTo(this.size / 2, this.size); // Bottom Right
    this.lineTo(-this.size / 2, this.size);// Bottom Left
    this.closePath();

    // Apply the fill
    this.endFill();
  }
}