import { tiny, defs } from "../project-resources.js";
import MirrorShader from "../Shaders/MirrorShader.js";

const { Mat4, Material } = tiny;
const { Square } = defs;

class Mirror {
  constructor(position, size = 40) {
    this.position = position;
    this.size = size;
    this.shape = new Square();
    this.material = new Material(new MirrorShader(3), {
      ambient: 1,
      diffusivity: 2,
      specularity: 0,
      color: tiny.Color.of(1, 1, 1, 1)
    });
  }

  get_height = () => {
    return this.position[1];
  };

  update(program_state) {
    this.material.reflection_texture = program_state.mirror_reflection_texture;
  }

  draw(context, program_state) {
    let transform = Mat4.identity()
      .times(
        Mat4.translation([this.position[0], this.position[1], this.position[2]])
      )
      .times(Mat4.rotation(Math.PI / 2, [1, 0, 0]))
      .times(Mat4.scale([this.size, this.size, this.size]));
    this.shape.draw(context, program_state, transform, this.material);
  }
}

export default Mirror;
