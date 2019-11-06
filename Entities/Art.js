import { tiny, defs } from "../project-resources.js";
import ArtBox from "../Shapes/ArtBox.js";

const { Vec, Mat4, Material, Texture, Color } = tiny;
const { Art_Box } = defs;

class Art {
  constructor(position) {
    this.position = position;
    this.rotation = Vec.of(0, 0, 0);
    this.ART_BOX_SIZE = 50;
    this.art_box = new ArtBox(this.ART_BOX_SIZE);
    this.OFFSET = Vec.of(0, this.ART_BOX_SIZE, 0);
    this.art_box_material = new Material(new defs.Phong_Shader(3), {
      ambient: 0.2,
      diffusivity: 1.0,
      specularity: 0,
      color: Color.of(0.5, 0.5, 0.5, 1)
    });
  }

  draw(context, program_state) {
    let model_transform = Mat4.identity()
      .times(
        Mat4.translation([
          this.position[0] + this.OFFSET[0],
          this.position[1] + this.OFFSET[1],
          this.position[2] + this.OFFSET[2]
        ])
      )
      .times(Mat4.rotation(this.rotation[1], [0, 1, 0]));
    this.art_box.draw(
      context,
      program_state,
      model_transform,
      this.art_box_material
    );
  }
}

export default Art;
