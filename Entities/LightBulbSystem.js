import LightBulb from "./LightBulb.js";
import { tiny, defs } from "../project-resources.js";

const { Vec, Color } = tiny;

class LightBulbSystem {
  constructor(position) {
    this.position = position;
    this.HEIGHT = 50;
    this.light_bulb = new LightBulb(position);
    this.light_bulb_positions = [];
    this.selected_light_bulb_position = undefined;
    this.ROW = 5;
    for (let i = 0; i < this.ROW; i++) {
      for (let j = 0; j < this.ROW; j++) {
        for (let k = 0; k < this.ROW; k++) {
          this.light_bulb_positions.push(
            Vec.of(
              (Math.random() * 2 + 1) * (i - this.ROW / 2),
              (Math.random() * 2 + 1) * j,
              (Math.random() * 2 + 1) * (k - this.ROW / 2)
            ).times(this.light_bulb.size)
          );
        }
      }
    }
    this.colors = [
      Color.of(96 / 255, 26 / 255, 21 / 255, 1),
      Color.of(91 / 255, 12 / 255, 39 / 255, 1),
      Color.of(61 / 255, 15 / 255, 69 / 255, 1),
      Color.of(40 / 255, 23 / 255, 72 / 255, 1),
      Color.of(25 / 255, 32 / 255, 71 / 255, 1),
      Color.of(13 / 255, 59 / 255, 95 / 255, 1),
      Color.of(1 / 255, 66 / 255, 96 / 255, 1),
      Color.of(0 / 255, 74 / 255, 83 / 255, 1),
      Color.of(0 / 255, 59 / 255, 53 / 255, 1),
      Color.of(30 / 255, 69 / 255, 31 / 255, 1),
      Color.of(55 / 255, 76 / 255, 29 / 255, 1),
      Color.of(80 / 255, 86 / 255, 22 / 255, 1),
      Color.of(100 / 255, 92 / 255, 23 / 255, 1),
      Color.of(100 / 255, 76 / 255, 29 / 255, 1),
      Color.of(100 / 255, 60 / 255, 0 / 255, 1),
      Color.of(100 / 255, 34 / 255, 13 / 255, 1)
    ];
  }

  update(program_state) {
    this.selected_light_bulb_position = undefined;
    const light_bulb_radius = this.light_bulb.size / 2;
    const current_ray = program_state.current_ray;
    const ray_start_position = program_state.ray_start_position;

    if (current_ray) {
      let selected_light_bulb_position_candidates = [];
      this.light_bulb_positions.forEach(light_bulb_position => {
        const light_bulb_true_position = Vec.of(
          this.position[0] + light_bulb_position[0],
          this.position[1] + light_bulb_position[1] + this.HEIGHT,
          this.position[2] + light_bulb_position[2]
        );
        const offset_y = 3;
        light_bulb_true_position[1] += offset_y;
        const oc = ray_start_position.minus(light_bulb_true_position);
        const b = current_ray.dot(oc);
        const c = oc.dot(oc) - light_bulb_radius * light_bulb_radius;
        light_bulb_true_position[1] -= offset_y;
        if (b * b > c) {
          selected_light_bulb_position_candidates.push(
            light_bulb_true_position
          );
        }
      });

      let min_distance = 9999999;
      let min_index = -1;
      selected_light_bulb_position_candidates.forEach((position, index) => {
        let distance = position.minus(ray_start_position).norm();
        if (min_distance > distance) {
          min_distance = distance;
          min_index = index;
        }
      });

      if (min_index != -1) {
        this.selected_light_bulb_position =
          selected_light_bulb_position_candidates[min_index];
      }
    }
  }

  draw(context, program_state) {
    this.light_bulb.position = Vec.of(
      this.position[0],
      this.position[1] + this.HEIGHT,
      this.position[2]
    );

    this.light_bulb_positions.forEach((position, index) => {
      let smoothly_varying_ratio =
        0.4 +
        0.3 * (Math.sin(2 * Math.PI * program_state.t + index * 50) + 1.0);

      let color = this.colors[index % this.colors.length];
      this.light_bulb.position = Vec.of(
        this.position[0] + position[0],
        this.position[1] + position[1] + this.HEIGHT,
        this.position[2] + position[2]
      );

      if (
        this.selected_light_bulb_position &&
        this.selected_light_bulb_position[0] == this.light_bulb.position[0] &&
        this.selected_light_bulb_position[1] == this.light_bulb.position[1] &&
        this.selected_light_bulb_position[2] == this.light_bulb.position[2]
      ) {
        smoothly_varying_ratio = 1.0;
        color = Vec.of(1, 1, 1, 1);
      }

      this.light_bulb.draw(
        context,
        program_state,
        smoothly_varying_ratio,
        color
      );
    });
  }
}

export default LightBulbSystem;
