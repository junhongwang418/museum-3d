import { tiny, defs } from "../project-resources.js";
import LampShader from "../Shaders/LampShader.js";

const { Vec, Mat4, Material, Texture, Light } = tiny;
const { Cube, Shape_From_File, Textured_Phong } = defs;

class Lamp {
  constructor(position, color, size = 5) {
    this.position = position;
    this.color = color;
    this.size = size;
    this.shape = new Shape_From_File("assets/objects/lamp.obj");
    this.material = new Material(new LampShader(3), {
      ambient: 1,
      texture: new Texture("assets/images/lamp.png"),
      color: color
    });
    this.height_to_ground = this.size;
  }

  get_light() {
    return new Light(
      Vec.of(
        this.position[0],
        this.position[1] + this.height_to_ground,
        this.position[2],
        1
      ),
      this.color,
      1000
    );
  }

  update(program_state) {
    this.position[1] =
      program_state.current_terrain.get_height(
        this.position[0],
        this.position[2]
      ) + this.height_to_ground;
  }

  draw(context, program_state) {
    let transform = Mat4.identity()
      .times(
        Mat4.translation([this.position[0], this.position[1], this.position[2]])
      )
      .times(Mat4.scale([this.size, this.size, this.size]));
    this.shape.draw(context, program_state, transform, this.material);
  }
}

export default Lamp;
