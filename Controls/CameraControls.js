import { tiny } from "../tiny-graphics.js";
// Pull these names into this module's scope for convenience:
const { Scene } = tiny;

class CameraControls extends Scene {
  constructor(camera) {
    super();
    this.camera = camera;
    this.state = 0; // 0: use first_person_view_camera, 1: use third_person_view_camera
    this.first_person_view_camera = null;
    this.third_person_view_camera = null;
  }

  make_control_panel() {
    this.control_panel.innerHTML += "These are commands for third person view";
    this.new_line();
    this.key_triggered_button("1st Person View", ["1"], () => (this.state = 0));
    this.key_triggered_button("3rd Person View", ["3"], () => (this.state = 1));
    this.new_line();
    this.key_triggered_button(
      "Zoom In",
      ["c"],
      () => (this.camera.current_zoom_speed = this.camera.ZOOM_SPEED),
      undefined,
      () => (this.camera.current_zoom_speed = 0)
    );
    this.key_triggered_button(
      "Zoom Out",
      ["v"],
      () => (this.camera.current_zoom_speed = -this.camera.ZOOM_SPEED),
      undefined,
      () => (this.camera.current_zoom_speed = 0)
    );
    this.new_line();
    this.key_triggered_button(
      "Pitch Up",
      ["b"],
      () => (this.camera.current_pitch_speed = this.camera.PITCH_SPEED),
      undefined,
      () => (this.camera.current_pitch_speed = 0)
    );

    this.key_triggered_button(
      "Pitch Down",
      ["n"],
      () => (this.camera.current_pitch_speed = -this.camera.PITCH_SPEED),
      undefined,
      () => (this.camera.current_pitch_speed = 0)
    );
  }

  display(context, program_state) {
    if (this.state == 0) {
      program_state.set_camera(this.first_person_view_camera);
      program_state.camera.position = program_state.player.eye_position();
    } else {
      program_state.set_camera(this.third_person_view_camera);
    }
  }
}

export default CameraControls;
