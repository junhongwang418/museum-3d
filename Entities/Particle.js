import { tiny, defs } from "../project-resources.js";
import WaterShader from "../Shaders/WaterShader.js";
import Player from "./Player.js";
// Pull these names into this module's scope for convenience:
const {
  Vec,
  Mat,
  Mat4,
  Material,
  Color,
  Texture,
  Shape,
  Shader,
  Scene,
  Canvas_Widget,
  Code_Widget,
  Text_Widget
} = tiny;
const {
  Cube,
  Subdivision_Sphere,
  Transforms_Sandbox_Base,
  Water_Shader
} = defs;

class Particle {
  // define the constructor
  constructor(
    position,
    velocity,
    gravatiyEff,
    lifelength,
    scale,
    shape,
    material,
    color
  ) {
    this.position = position;
    this.orgpos = this.position;
    this.orgVelocity = velocity;
    this.rotation = 0; // along z-axis
    this.velocity = velocity;
    this.GravatiyEff = gravatiyEff;
    this.LifeLength = lifelength;
    this.elapsedtime = 0;
    this.G = -50;
    this.scale = scale;
    this.shape = shape;
    this.material = material;
    this.tex_offset_1 = Vec.of(0, 0);
    this.tex_offset_2 = Vec.of(0, 0);
    this.blend = undefined;
    this.color = color;
  }

  // update funtion to detmine if
  // particles is still valid
  update(program_state) {
    this.material.color = this.color;

    // get time
    const dt = program_state.dt;
    // make it move vertically
    // find the offset of verical velocity
    // v= v0+(sign)*a*t
    // since velocty is vec.of(x,y,z)
    this.velocity[1] += this.GravatiyEff * this.G * dt;
    // d = vt
    const displace_y = this.velocity[1] * dt;

    let change = Vec.of(
      this.velocity[0],
      this.velocity[1],
      this.velocity[2]
    ).times(dt);

    this.position = this.position.plus(change);

    let terrain_height = program_state.current_terrain.get_height(
      this.position[0],
      this.position[2]
    );

    this.update_texture_coord_info();

    // calclate if particle is still valid
    this.elapsedtime += dt;

    return (
      this.elapsedtime < this.LifeLength && this.position[1] > terrain_height
    );
  }

  draw(context, program_state) {
    // get time
    const dt = program_state.dt;
    var scaleF, dx, dy, dz;
    scaleF = this.scale;
    dx = this.position[0];
    dy = this.position[1];
    dz = this.position[2];
    //draw
    // for testing

    const view_matrix = program_state.camera_inverse;
    let model_transform = Mat4.identity().times(
      Mat4.translation([this.position[0], this.position[1], this.position[2]])
    );

    // cancel out camera rotation
    model_transform[0][0] = view_matrix[0][0];
    model_transform[0][1] = view_matrix[1][0];
    model_transform[0][2] = view_matrix[2][0];
    model_transform[1][0] = view_matrix[0][1];
    model_transform[1][1] = view_matrix[1][1];
    model_transform[1][2] = view_matrix[2][1];
    model_transform[2][0] = view_matrix[0][2];
    model_transform[2][1] = view_matrix[1][2];
    model_transform[2][2] = view_matrix[2][2];

    model_transform = model_transform
      .times(Mat4.rotation(((2 * Math.PI) / 360) * this.rotation, [0, 0, 1]))
      .times(Mat4.scale([scaleF, scaleF, scaleF]));

    //     // Act
    //     let model_transform = Mat4.identity().times(Mat4.translation([dx,dy,dz]))
    //                                          .times(Mat4.scale([scaleF,scaleF,scaleF]));
    //if(!this.elapsedtime < this.LifeLength)
    //     console.log(this.shapes);
    this.shape.draw(context, program_state, model_transform, this.material);

    //     for( var i =0 ; i < 100 ; i++)
    //     {
    //        this.velocity = Vec.of(0,0,0);
    //        const rx =  Math.random() * 20 - 10;
    //        const rz =  Math.random() * 20 - 10;
    //        const ry =  Math.random() * 10 ;
    //       var init = model_transform;
    //       let transform = Mat4.identity().times(Mat4.translation([dx+rx,dy-37+ry,dz+rz]))
    //                                          .times(Mat4.scale([scaleF,scaleF,scaleF]))
    //       this.shapes.ball.draw( context, program_state,transform, this.materials.fire );
    //       // reset
    // //       model_transform = init;
    //     }
  }

  update_texture_coord_info() {
    if (!this.material.texture.number_of_rows) return;
    let life_factor = this.elapsedtime / this.LifeLength;

    let stage_count =
      this.material.texture.number_of_rows *
      this.material.texture.number_of_rows;

    let atlas_progression = life_factor * stage_count;
    let index1 = Math.floor(atlas_progression);
    let index2 = index1 < stage_count - 1 ? index1 + 1 : index1;
    this.blend = atlas_progression % 1;
    this.set_texture_offset(this.tex_offset_1, index1);
    this.set_texture_offset(this.tex_offset_2, index2);

    this.material.is_ready = true;
    this.material.tex_offset_1 = this.tex_offset_1;
    this.material.tex_offset_2 = this.tex_offset_2;
    this.material.tex_coord_info = Vec.of(
      this.material.texture.number_of_rows,
      this.blend
    );
  }

  set_texture_offset(offset, index) {
    let column = Math.floor(index % this.material.texture.number_of_rows);
    let row = Math.floor(index / this.material.texture.number_of_rows);
    offset[0] = column / this.material.texture.number_of_rows;
    offset[1] = row / this.material.texture.number_of_rows;
  }
}
export default Particle;
