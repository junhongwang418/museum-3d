import { tiny, defs } from "../project-resources.js";
import LampShader from "../Shaders/LampShader.js";

const { Vec, Mat4, Material, Texture, Light, Color } = tiny;
const { Cube, Shape_From_File, Textured_Phong, Phong_Shader } = defs;

class Torch {
  constructor(position, color, particle_system, size = 1) {
    this.position = position;
    this.color = color;
    this.size = size;
    this.particle_system = particle_system;
    this.height_to_ground = size;
    this.particle_system.scale = size;
    this.shape = new Cube();
    this.ID=1;
    this.material = new Material(new Phong_Shader(2), {
      ambient: 1,
      color: Color.of(97 / 255, 51 / 255, 24 / 255, 1)
    });
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
      50
    );
  }

  update(program_state) {
    this.position[1] =
      program_state.current_terrain.get_height(
        this.position[0],
        this.position[2]
      ) + this.height_to_ground;
    this.particle_system.position = this.position;
    let pos = this.position.copy();
    pos[1] += this.height_to_ground - 1;
    this.particle_system.pps = 10;
    this.particle_system.speed=5;
    this.particle_system.lifeLength =2;
    this.particle_system.scale = this.size;
    this.particle_system.color = this.color;
    this.particle_system.gravityComplient = 0;
    this.particle_system.generateParticles(this.ID,program_state.dt,pos);
  }

  draw(context, program_state) {
    let shape_transform = Mat4.identity();
    shape_transform = shape_transform
      .times(
        Mat4.translation([this.position[0], this.position[1], this.position[2]])
      )
      .times(Mat4.scale([this.size / 8, this.size, this.size / 8]));
    this.shape.draw(context, program_state, shape_transform, this.material);
    this.particle_system.draw(context, program_state);
  }
}

export default Torch;
