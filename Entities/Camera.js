import { tiny } from "../project-resources.js";

const { Vec } = tiny;

class Camera {
  constructor(player) {
    this.player = player;
    this.pitch = 20;
    this.distance_from_player = 25;
    this.ZOOM_SPEED = 1;
    this.current_zoom_speed = 0;
    this.PITCH_SPEED = 1;
    this.current_pitch_speed = 0;
    this.angle_around_player = 0;
    this.position = Vec.of(0, 0, 0);
  }

  calculate_horizontal_distance() {
    return (
      this.distance_from_player * Math.cos(((2 * Math.PI) / 360) * this.pitch)
    );
  }

  calculate_vertical_distance() {
    return (
      this.distance_from_player * Math.sin(((2 * Math.PI) / 360) * this.pitch)
    );
  }

  calculate_camera_position(horizontal_distance, vertical_distance) {
    const theta = this.player.rotation[1] + this.angle_around_player;
    const offset_x =
      horizontal_distance * Math.sin(((2 * Math.PI) / 360) * theta);
    const offset_z =
      horizontal_distance * Math.cos(((2 * Math.PI) / 360) * theta);
    this.position[0] = this.player.position[0] - offset_x;
    this.position[2] = this.player.position[2] - offset_z;
    this.position[1] = this.player.position[1] + vertical_distance;
  }

  update_position() {
    this.calculate_camera_position(
      this.calculate_horizontal_distance(),
      this.calculate_vertical_distance()
    );
  }

  update(program_state) {
    this.update_position();
    this.distance_from_player = Math.max(
      5,
      Math.min(300, this.distance_from_player - this.current_zoom_speed)
    );

    this.pitch = Math.max(
      -89,
      Math.min(89, this.pitch + this.current_pitch_speed)
    );
  }

  invert_pitch() {
    this.pitch = -this.pitch;
  }
}

export default Camera;
