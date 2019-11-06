import { tiny } from "../tiny-graphics.js";
// Pull these names into this module's scope for convenience:
const { Vec, Mat4, Scene } = tiny;

class MouseControls extends Scene {
  // **Movement_Controls** is a Scene that can be attached to a canvas, like any other
  // Scene, but it is a Secondary Scene Component -- meant to stack alongside other
  // scenes.  Rather than drawing anything it embeds both first-person and third-
  // person style controls into the website.  These can be used to manually move your
  // camera or other objects smoothly through your scene using key, mouse, and HTML
  // button controls to help you explore what's in it.
  constructor(camera, program_state) {
    super();
    this.is_mouse_ready = false;

    this.current_ray = undefined;
    this.width = undefined;
    this.height = undefined;
    this.projection_matrix = program_state.projection_transform;
    this.view_matrix = program_state.camera_inverse;
    this.camera = camera;
  }

  update(program_state) {
    if (!this.is_mouse_ready) return;
    this.view_matrix = program_state.camera_inverse;
    this.current_ray = this.calculate_mouse_ray();
  }

  calculate_mouse_ray() {
    const mouse_x = this.mouse.from_center[0];
    const mouse_y = this.mouse.from_center[1];
    const normalized_coords = this.get_normalized_device_coords(
      mouse_x,
      mouse_y
    );
    const clip_coords = Vec.of(
      normalized_coords[0],
      normalized_coords[1],
      -1,
      1
    );

    const eye_coords = this.to_eye_coords(clip_coords);

    const world_ray = this.to_world_coords(eye_coords);

    return world_ray;
  }

  to_world_coords(eye_coords) {
    const inverted_view_matrix = Mat4.inverse(this.view_matrix);
    const ray_world = inverted_view_matrix.times(eye_coords);
    const mouse_ray = Vec.of(ray_world[0], ray_world[1], ray_world[2]);
    mouse_ray.normalize();
    return mouse_ray;
  }

  to_eye_coords(clip_coords) {
    const inverted_projection_matrix = Mat4.inverse(this.projection_matrix);

    const eye_coords = inverted_projection_matrix.times(clip_coords);
    return Vec.of(eye_coords[0], eye_coords[1], -1, 0);
  }

  get_normalized_device_coords(mouse_x, mouse_y) {
    const x = (2 * mouse_x) / this.width;
    const y = (2 * mouse_y) / this.height;
    return Vec.of(x, -y);
  }

  add_mouse_controls(canvas) {
    // add_mouse_controls():  Attach HTML mouse events to the drawing canvas.
    // First, measure mouse steering, for rotating the flyaround camera:
    this.mouse = { from_center: Vec.of(0, 0) };
    const mouse_position = (e, rect = canvas.getBoundingClientRect()) => {
      this.width = rect.width;
      this.height = rect.height;

      return Vec.of(
        e.clientX - (rect.left + rect.right) / 2,
        e.clientY - (rect.bottom + rect.top) / 2
      );
    };

    // Set up mouse response.  The last one stops us from reacting if the mouse leaves the canvas:
    document.addEventListener("mouseup", e => {
      this.mouse.anchor = undefined;
    });
    canvas.addEventListener("mousedown", e => {
      e.preventDefault();
      this.mouse.anchor = mouse_position(e);
    });
    canvas.addEventListener("mousemove", e => {
      e.preventDefault();
      this.mouse.from_center = mouse_position(e);
    });
    canvas.addEventListener("mouseout", e => {
      if (!this.mouse.anchor) this.mouse.from_center.scale(0);
    });
  }
  show_explanation(document_element) {}
  make_control_panel() {
    // make_control_panel(): Sets up a panel of interactive HTML elements, including
    // buttons with key bindings for affecting this scene, and live info readouts.
    this.mouse_coords_x = document.createElement("p");
    this.control_panel.appendChild(this.mouse_coords_x);

    this.mouse_coords_y = document.createElement("p");
    this.control_panel.appendChild(this.mouse_coords_y);

    this.world_coords_x = document.createElement("p");
    this.control_panel.appendChild(this.world_coords_x);

    this.world_coords_y = document.createElement("p");
    this.control_panel.appendChild(this.world_coords_y);

    this.world_coords_z = document.createElement("p");
    this.control_panel.appendChild(this.world_coords_z);
  }

  display(
    context,
    graphics_state,
    dt = graphics_state.animation_delta_time / 1000
  ) {
    // The whole process of acting upon controls begins here.
    if (!this.is_mouse_ready) {
      this.add_mouse_controls(context.canvas);
      this.is_mouse_ready = true;
    }

    this.mouse_coords_x.innerHTML =
      "mouse coords x: (" + this.mouse.from_center[0] + ")";

    this.mouse_coords_y.innerHTML =
      "mouse coords y: (" + this.mouse.from_center[1] + ")";

    if (this.current_ray) {
      this.world_coords_x.innerHTML =
        "world coords x: (" + this.current_ray[0] + ")";
      this.world_coords_y.innerHTML =
        "world coords y: (" + this.current_ray[1] + ")";
      this.world_coords_z.innerHTML =
        "world coords z: (" + this.current_ray[2] + ")";
    }
  }
}

export default MouseControls;
