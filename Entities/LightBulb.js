import LightBulbShader from "../Shaders/LightBulbShader.js";
import { tiny, defs } from "../project-resources.js";

const { Vec, Mat4, Material, Color } = tiny;
const { Surface_Of_Revolution, Phong_Shader, Cube } = defs;

class LightBulb {
  constructor(position) {
    this.position = position;
    const points = Vec.cast(
      [0.02, 0, 0.96],
      [0.02, 0, 0.87],
      [0.1, 0, 0.84],
      [0.17, 0, 0.79],
      [0.18, 0, 0.64],
      [0.29, 0, 0.16],
      [0.24, 0, 0.1],
      [0.22, 0, 0.05],
      [0.15, 0, 0]
    );

    this.size = 12;

    this.shapes = {
      rope: new Cube(),
      light_bulb: new Surface_Of_Revolution(9, 9, points)
    };

    this.materials = {
      light_bulb: new Material(new LightBulbShader(3), {
        ambient: 2,
        diffusivity: 1,
        specularity: 0.5,
        color: Color.of(0, 0, 1, 1)
      }),
      rope: new Material(new Phong_Shader(3), {
        ambient: 0.8,
        diffusivity: 0,
        specularity: 0,
        color: Color.of(0.749, 0.847, 0.847, 0.5)
      })
    };
  }

  draw(context, program_state, ambient, color) {
    this.materials.light_bulb.ambient = ambient;
    this.materials.light_bulb.color = color;

    let model_transform = Mat4.identity();
    model_transform = model_transform.times(
      Mat4.translation([this.position[0], this.position[1], this.position[2]])
    );
    this.shapes["light_bulb"].draw(
      context,
      program_state,
      model_transform
        .times(Mat4.scale([this.size, this.size, this.size]))
        .times(Mat4.rotation(4.7124, Vec.of(1, 0, 0))),
      this.materials.light_bulb
    );
    this.shapes["rope"].draw(
      context,
      program_state,
      model_transform
        .times(Mat4.translation([0, 35, 0]))
        .times(Mat4.scale([0.1, 30, 0.1])),
      this.materials.rope
    );
  }
}

export default LightBulb;
