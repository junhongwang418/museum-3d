import { tiny, defs } from "../project-resources.js";
import TerrainShader from "../Shaders/TerrainShader.js";
import TerrainShape from "../Shapes/Terrain.js";

const { Vec, Mat4, Material, Texture } = tiny;

class Terrain {
  constructor(position, size) {
    this.position = Vec.of(
      position[0] * size,
      position[1] * size,
      position[2] * size
    );

    this.size = size;
    this.height_map = new Image();
    this.height_map.src = "assets/images/heightmap.png";
    this.height_map.onload = () => {
      this.shape = new TerrainShape(size, this.height_map);
    };
    this.material = new Material(new TerrainShader(10), {
      texture: new Texture("assets/images/concrete.png"),
      ambient: 0.8,
      diffusivity: 1.0,
      specularity: 0
    });
  }

  update(program_state) {
    if (program_state.is_day) {
      this.material.ambient = Math.min(
        0.8,
        this.material.ambient + program_state.dt
      );
    } else {
      this.material.ambient = Math.max(
        0.1,
        this.material.ambient - program_state.dt
      );
    }
  }

  get_height(world_x, world_z) {
    if (!this.shape) return 0;
    let terrain_x = this.position[0] - world_x;
    let terrain_z = this.position[2] - world_z;

    let grid_square_size = this.size / (this.shape.heights.length - 1);
    let grid_x = Math.floor(terrain_x / grid_square_size);
    let grid_z = Math.floor(terrain_z / grid_square_size);

    if (
      grid_x >= this.shape.heights.length - 1 ||
      grid_z >= this.shape.heights.length - 1 ||
      grid_x < 0 ||
      grid_z < 0
    )
      return 0;

    let x_coord = (terrain_x % grid_square_size) / grid_square_size;
    let z_coord = (terrain_z % grid_square_size) / grid_square_size;

    var ans;
    if (x_coord <= 1 - z_coord) {
      ans = this.barry_centric(
        Vec.of(0, this.shape.heights[grid_x][grid_z], 0),
        Vec.of(1, this.shape.heights[grid_x + 1][grid_z], 0),
        Vec.of(0, this.shape.heights[grid_x][grid_z + 1], 1),
        Vec.of(x_coord, z_coord)
      );
    } else {
      ans = this.barry_centric(
        Vec.of(1, this.shape.heights[grid_x + 1][grid_z], 0),
        Vec.of(1, this.shape.heights[grid_x + 1][grid_z + 1], 1),
        Vec.of(0, this.shape.heights[grid_x][grid_z + 1], 1),
        Vec.of(x_coord, z_coord)
      );
    }

    return ans;
  }

  barry_centric(p1, p2, p3, pos) {
    let det =
      (p2[2] - p3[2]) * (p1[0] - p3[0]) + (p3[0] - p2[0]) * (p1[2] - p3[2]);
    let l1 =
      ((p2[2] - p3[2]) * (pos[0] - p3[0]) +
        (p3[0] - p2[0]) * (pos[1] - p3[2])) /
      det;
    let l2 =
      ((p3[2] - p1[2]) * (pos[0] - p3[0]) +
        (p1[0] - p3[0]) * (pos[1] - p3[2])) /
      det;
    let l3 = 1 - l1 - l2;
    return l1 * p1[1] + l2 * p2[1] + l3 * p3[1];
  }

  draw(context, program_state) {
    if (!this.shape) return;
    let terrain_transform = Mat4.identity();
    terrain_transform = terrain_transform.times(
      Mat4.translation([this.position[0], this.position[1], this.position[2]])
    );
    this.shape.draw(context, program_state, terrain_transform, this.material);
  }
}

export default Terrain;
