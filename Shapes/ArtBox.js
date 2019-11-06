import { tiny } from "../tiny-graphics.js";
import { defs } from "../project-resources.js";
// Pull these names into this module's scope for convenience:
const { Mat4, Shape } = tiny;
const { Square } = defs;

class ArtBox extends Shape {
  constructor(size) {
    super("position", "normal", "texture_coord");

    let right_square_transform = Mat4.identity()
      .times(Mat4.rotation(Math.PI / 2, [0, 1, 0]))
      .times(Mat4.translation([0, 0, -size]))
      .times(Mat4.scale([size, size, size]));
    Square.insert_transformed_copy_into(this, [], right_square_transform);

    let left_square_transform = Mat4.identity()
      .times(Mat4.rotation(-Math.PI / 2, [0, 1, 0]))
      .times(Mat4.translation([0, 0, -size]))
      .times(Mat4.scale([size, size, size]));
    Square.insert_transformed_copy_into(this, [], left_square_transform);

    let top_square_transform = Mat4.identity()
      .times(Mat4.rotation(Math.PI / 2, [1, 0, 0]))
      .times(Mat4.translation([0, 0, -size]))
      .times(Mat4.scale([size, size, size]));
    Square.insert_transformed_copy_into(this, [], top_square_transform);

    let back_square_transform = Mat4.identity()
      .times(Mat4.translation([0, 0, -size]))
      .times(Mat4.scale([size, size, size]));
    Square.insert_transformed_copy_into(this, [], back_square_transform);
  }
}

export default ArtBox;
