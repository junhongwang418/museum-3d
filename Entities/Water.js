import { tiny, defs } from "../project-resources.js";

const { Vec, Mat4, Material, Texture } = tiny;
const { Cube, Square } = defs;

class Water {
  constructor(position, size = 60) {
    this.position = position;
    this.size = size;
    this.WAVE_SPEED = 0.1;
    this.shape = new Square();
    this.material = undefined;
  }

  get_height = () => {
    return this.position[1];
  };

  update(program_state) {
    if (!this.material) return;
    this.material.reflection_texture = program_state.water_reflection_texture;
    this.material.refraction_texture = program_state.water_refraction_texture;
    this.material.move_factor += this.WAVE_SPEED * program_state.dt;
    this.material.move_factor %= 1;
  }

  draw(context, program_state) {
    if (!this.material) return;
    let transform = Mat4.identity()
      .times(
        Mat4.translation([this.position[0], this.position[1], this.position[2]])
      )
      .times(Mat4.rotation(Math.PI / 2, [1, 0, 0]))
      .times(Mat4.scale([this.size, this.size, this.size]));
    this.shape.draw(context, program_state, transform, this.material);
  }
}

export default Water;
