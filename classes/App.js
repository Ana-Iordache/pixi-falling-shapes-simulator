import { Application, Container, Graphics, TextStyle, Text } from 'pixi.js';
import { Shape } from './Shape.js';

export class App {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.shapes = [];
    this.gravity = 2;
    this.shapesPerSecond = 1;
    this.timeSinceLastSpawn = 0;

    this.setElements();
    this.init();
    this.bindControls();
  }

  setElements() {
    this.wrapper = document.getElementById('wrapper');
    this.shapesVal = document.getElementById('shapes-val');
    this.gravityVal = document.getElementById('gravity-val');
    this.shapesDecr = document.getElementById('shapes-decr');
    this.shapesIncr = document.getElementById('shapes-incr');
    this.gravityDecr = document.getElementById('gravity-decr');
    this.gravityIncr = document.getElementById('gravity-incr');
    this.currentShapesVal = document.getElementById('current-shapes-val');
    this.surfaceAreaVal = document.getElementById('surface-area-val');
  }

  async init() {
    this.app = new Application();

    await this.app.init({
      width: this.width,
      height: this.height,
      backgroundColor: 0xcccccc
    });
    this.wrapper.appendChild(this.app.canvas);

    this.shapeContainer = new Container();
    this.app.stage.addChild(this.shapeContainer);

    this.addVisibleArea();
    this.bindTextFields();
    this.addBackgoundInteraction();

    // start the loop
    this.app.ticker.add((delta) => this.update(delta));
  }

  addVisibleArea() {
    // graphics object to define the visible area
    const mask = new Graphics()
      .rect(0, 0, this.width, this.height)
      .fill(0xffffff);

    // apply the mask to the container
    this.shapeContainer.mask = mask;
    // add mask to stage so it is part of the rendering context
    this.app.stage.addChild(mask);
  }

  spawnShape(x, y) {
    const sizeShape = 80;
    const shape = new Shape(this.width, this.height, sizeShape, x, y);
    this.shapes.push(shape);
    this.shapeContainer.addChild(shape.graphics);

    this.updateStatistics(sizeShape);
  }

  update(delta) {
    // convert pixi's frame delta to seconds (approx 1/60th of a second per frame)
    const elapsedMS = this.app.ticker.elapsedMS / 1000;

    // generation frequency
    this.timeSinceLastSpawn += elapsedMS;
    if (this.timeSinceLastSpawn >= (1 / this.shapesPerSecond)) {
      this.spawnShape();
      this.timeSinceLastSpawn = 0;
    }

    // update all shapes
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const shape = this.shapes[i];

      // move the shape
      shape.fallDown(this.gravity);

      // hide if it fell out of bounds
      if (shape.shouldRemove) {
        this.shapeContainer.removeChild(shape.graphics);
        this.shapes.splice(i, 1);

        this.updateStatistics(shape.size);
      }
    }
  }

  bindControls() {
    // shapes per second
    this.shapesDecr.onclick = () => {
      // ensure at least 1 shape is generated
      if (this.shapesPerSecond > 1) {
        this.shapesPerSecond--;
        this.shapesVal.innerText = this.shapesPerSecond;
      }
    };

    this.shapesIncr.onclick = () => {
      this.shapesPerSecond++;
      this.shapesVal.innerText = this.shapesPerSecond;
    };

    // gravity value
    this.gravityDecr.onclick = () => {
      // ensure a gravity at least of 0.5
      if (this.gravity > 0.5) {
        this.gravity -= 0.5;
        this.gravityVal.innerText = this.gravity.toFixed(1);
      }
    };

    this.gravityIncr.onclick = () => {
      this.gravity += 0.5;
      this.gravityVal.innerText = this.gravity.toFixed(1);
    };
  }

  bindTextFields() {
    // define the container 
    this.uiContainer = new Container();
    this.app.stage.addChild(this.uiContainer);

    // define the styles for the text
    const labelStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 10,
      fontWeight: 'bold',
      fill: '#000000',
    });

    const valueStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 14,
      fontWeight: 'bold',
      fill: '#000000',
    });

    // create the "text fields" boxes
    const boxHeight = 40;
    const boxWidth = 180;
    const box = new Graphics();

    // box 1: number of current shapes
    box.rect(0, 0, boxWidth, boxHeight);
    box.fill({ color: 0xDDDDDD, alpha: 0.5 });
    box.stroke({ width: 2, color: 0x000000 });

    // box 2: surface area occupied
    box.rect(boxWidth, 0, boxWidth, boxHeight);
    box.fill({ color: 0xDDDDDD, alpha: 0.5 });
    box.stroke({ width: 2, color: 0x000000 });

    this.uiContainer.addChild(box);

    // text labels
    const currentShapesLabel = new Text({ text: 'NUMBER OF CURRENT SHAPES', style: labelStyle });
    currentShapesLabel.x = 10;
    currentShapesLabel.y = 5;
    this.uiContainer.addChild(currentShapesLabel);

    const areaOccupiedLabel = new Text({ text: 'SURFACE AREA OCCUPIED', style: labelStyle });
    areaOccupiedLabel.x = boxWidth + 10;
    areaOccupiedLabel.y = 5;
    this.uiContainer.addChild(areaOccupiedLabel);

    // text values
    this.currentShapesText = new Text({ text: '0', style: valueStyle });
    this.currentShapesText.x = 10;
    this.currentShapesText.y = 20;
    this.uiContainer.addChild(this.currentShapesText);

    this.areaOccupiedText = new Text({ text: '0', style: valueStyle });
    this.areaOccupiedText.x = boxWidth + 10;
    this.areaOccupiedText.y = 20;
    this.uiContainer.addChild(this.areaOccupiedText);
  }

  updateStatistics(sizeShape) {
    const totalShapes = this.shapes.length;

    // triangle area = (base * height) / 2
    const shapeArea = (sizeShape * sizeShape) / 2; // 3200 px² per shape
    const totalArea = totalShapes * shapeArea;

    // update pixi fields
    this.currentShapesText.text = totalShapes;
    this.areaOccupiedText.text = `${totalArea} px²`;

    // update html fields
    this.currentShapesVal.innerText = totalShapes;
    this.surfaceAreaVal.innerText = `${totalArea} px²`;
  }

  addBackgoundInteraction() {
    // enable interaction
    this.app.stage.eventMode = 'static';
    // set the entire canvas as "clicking" area
    this.app.stage.hitArea = this.app.screen;

    this.app.stage.on('pointerdown', (event) => {
      this.spawnShape(event.globalX, event.globalY);
    });
  }
}