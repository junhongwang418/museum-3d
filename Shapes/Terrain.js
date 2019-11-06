import { tiny } from "../tiny-graphics.js";
// Pull these names into this module's scope for convenience:
const { Vec, Shape } = tiny;

class Terrain extends Shape {
  constructor(size, height_map, max_height = 50) {
    super("position", "normal", "texture_coord");
    this.SIZE = size;
    this.MAX_HEIGHT = max_height;
    this.MAX_PIXEL_COLOR = 256 * 256 * 256;

    let VERTEX_COUNT = height_map.height;

    this.heights = new Array(VERTEX_COUNT);
    for (let i = 0; i < VERTEX_COUNT; i++) {
      this.heights[i] = new Array(VERTEX_COUNT);
    }

    let data = this.getImageData(height_map);

    for (let i = 0; i < VERTEX_COUNT; i++) {
      for (let j = 0; j < VERTEX_COUNT; j++) {
        let height = this.get_height(height_map, data, j, i);

        this.heights[j][i] = height;
        this.arrays.position.push(
          Vec.of(
            (-j / (VERTEX_COUNT - 1)) * this.SIZE,
            height,
            (-i / (VERTEX_COUNT - 1)) * this.SIZE
          )
        );
        let normal = this.calculate_normal(j, i, height_map, data);

        this.arrays.normal.push(Vec.of(normal[0], normal[1], normal[2]));
        this.arrays.texture_coord.push(
          Vec.of(j / VERTEX_COUNT - 1, i / VERTEX_COUNT - 1)
        );
      }
    }

    for (let gz = 0; gz < VERTEX_COUNT - 1; gz++) {
      for (let gx = 0; gx < VERTEX_COUNT - 1; gx++) {
        let top_left = gz * VERTEX_COUNT + gx;
        let top_right = top_left + 1;
        let bottom_left = (gz + 1) * VERTEX_COUNT + gx;
        let bottom_right = bottom_left + 1;
        this.indices.push(top_left);
        this.indices.push(bottom_left);
        this.indices.push(top_right);
        this.indices.push(top_right);
        this.indices.push(bottom_left);
        this.indices.push(bottom_right);
      }
    }
  }

  get_height(height_map, data, x, z) {
    if (x < 0 || x >= height_map.height || z < 0 || z >= height_map.height)
      return 0;

    let pixel = this.getPixel(data, x, z);

    let height = pixel.r * pixel.g * pixel.b;
    height -= this.MAX_PIXEL_COLOR / 2;
    height /= this.MAX_PIXEL_COLOR / 2;
    height *= this.MAX_HEIGHT;

    return height;
  }

  calculate_normal(x, z, height_map, data) {
    let height_left = this.get_height(height_map, data, x - 1, z);
    let height_right = this.get_height(height_map, data, x + 1, z);
    let height_down = this.get_height(height_map, data, x, z - 1);
    let height_up = this.get_height(height_map, data, x, z + 1);

    let normal = Vec.of(
      height_left - height_right,
      2 * this.SIZE,
      height_down - height_up
    );
    normal.normalize();
    return normal;
  }

  getImageData(image) {
    var canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;

    var context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);

    return context.getImageData(0, 0, image.width, image.height);
  }

  getPixel(imagedata, x, y) {
    var position = (x + imagedata.width * y) * 4,
      data = imagedata.data;
    return {
      r: data[position],
      g: data[position + 1],
      b: data[position + 2],
      a: data[position + 3]
    };
  }
}

export default Terrain;
