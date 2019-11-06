import { tiny } from "../tiny-graphics.js";
// Pull these names into this module's scope for convenience:
const { Vec, Mat4, Scene } = tiny;

class MovementControls extends Scene {
  // **Movement_Controls** is a Scene that can be attached to a canvas, like any other
  // Scene, but it is a Secondary Scene Component -- meant to stack alongside other
  // scenes.  Rather than drawing anything it embeds both first-person and third-
  // person style controls into the website.  These can be used to manually move your
  // camera or other objects smoothly through your scene using key, mouse, and HTML
  // button controls to help you explore what's in it.
  constructor(player) {
    super();
    const data_members = {
      roll: 0,
      look_around_locked: true,
      thrust: Vec.of(0, 0, 0),
      pos: Vec.of(0, 0, 0),
      z_axis: Vec.of(0, 0, 0),
      radians_per_frame: 1 / 200,
      meters_per_frame: 20,
      speed_multiplier: 1,
      player: player
    };
    Object.assign(this, data_members);

    this.mouse_enabled_canvases = new Set();
    this.will_take_over_graphics_state = true;
  }
  set_recipient(matrix_closure, inverse_closure) {
    // set_recipient(): The camera matrix is not actually stored here inside Movement_Controls;
    // instead, track an external target matrix to modify.  Targets must be pointer references
    // made using closures.
    this.matrix = matrix_closure;
    this.inverse = inverse_closure;
  }
  reset(graphics_state) {
    // reset(): Initially, the default target is the camera matrix that Shaders use, stored in the
    // encountered program_state object.  Targets must be pointer references made using closures.
    this.set_recipient(
      () => graphics_state.camera_transform,
      () => graphics_state.camera_inverse
    );
  }
  add_mouse_controls(canvas) {
    // add_mouse_controls():  Attach HTML mouse events to the drawing canvas.
    // First, measure mouse steering, for rotating the flyaround camera:
    this.mouse = { from_center: Vec.of(0, 0) };
    const mouse_position = (e, rect = canvas.getBoundingClientRect()) =>
      Vec.of(
        e.clientX - (rect.left + rect.right) / 2,
        e.clientY - (rect.bottom + rect.top) / 2
      );
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
    this.control_panel.innerHTML += "These are commands for first person view";
    this.new_line();
    this.key_triggered_button(
      "Forward",
      ["w"],
      () => (this.player.current_speed = this.player.RUN_SPEED),
      undefined,
      () => (this.player.current_speed = 0)
    );

    this.key_triggered_button(
      "Back",
      ["s"],
      () => (this.player.current_speed = -this.player.RUN_SPEED),
      undefined,
      () => (this.player.current_speed = 0)
    );

    this.key_triggered_button(
      "Turn Left",
      ["a"],
      () => (this.player.current_turn_speed = this.player.TURN_SPEED),
      undefined,
      () => (this.player.current_turn_speed = 0)
    );

    this.key_triggered_button(
      "Turn Right",
      ["d"],
      () => (this.player.current_turn_speed = -this.player.TURN_SPEED),
      undefined,
      () => (this.player.current_turn_speed = 0)
    );

    this.key_triggered_button(
      "Jump",
      [" "],
      () => this.player.jump(),
      undefined,
      undefined
    );

    this.new_line();

    this.key_triggered_button(
      "Look Up",
      ["q"],
      () => (this.player.current_look_up_spped = this.player.TURN_SPEED),
      undefined,
      () => (this.player.current_look_up_spped = 0)
    );

    this.key_triggered_button(
      "Look Down",
      ["e"],
      () => (this.player.current_look_up_spped = -this.player.TURN_SPEED),
      undefined,
      () => (this.player.current_look_up_spped = 0)
    );

    this.key_triggered_button(
      "Zoom In",
      ["z"],
      () => {
        this.player.current_zoom_speed = this.player.ZOOM_SPEED;
      },
      undefined,
      () => {
        this.player.current_zoom_speed = 0;
      }
    );

    this.key_triggered_button(
      "Zoom Out",
      ["x"],
      () => {
        this.player.current_zoom_speed = -this.player.ZOOM_SPEED;
      },
      undefined,
      () => {
        this.player.current_zoom_speed = 0;
      }
    );
  }
  first_person_flyaround(radians_per_frame, meters_per_frame, leeway = 70) {
    // (Internal helper function)
    // Compare mouse's location to all four corners of a dead box:
    const offsets_from_dead_box = {
      plus: [
        this.mouse.from_center[0] + leeway,
        this.mouse.from_center[1] + leeway
      ],
      minus: [
        this.mouse.from_center[0] - leeway,
        this.mouse.from_center[1] - leeway
      ]
    };
    // Apply a camera rotation movement, but only when the mouse is
    // past a minimum distance (leeway) from the canvas's center:
    // if (!this.look_around_locked)
    // If steering, steer according to "mouse_from_center" vector, but don't
    // start increasing until outside a leeway window from the center.
    for (let i = 0; i < 2; i++) {
      // The &&'s in the next line might zero the vectors out:
      let o = offsets_from_dead_box,
        velocity =
          ((o.minus[i] > 0 && o.minus[i]) || (o.plus[i] < 0 && o.plus[i])) *
          radians_per_frame;

      // if (i == 0) {
      //   this.camera.angle_around_player -= velocity;
      // } else {
      //   this.camera.pitch -= velocity;
      // }
      // On X step, rotate around Y axis, and vice versa.
      // this.matrix().post_multiply(
      //   Mat4.rotation(-velocity, Vec.of(i, 1 - i, 0))
      // );
      // this.inverse().pre_multiply(
      //   Mat4.rotation(+velocity, Vec.of(i, 1 - i, 0))
      // );
    }
    this.matrix().post_multiply(
      Mat4.rotation(-0.1 * this.roll, Vec.of(0, 0, 1))
    );
    this.inverse().pre_multiply(
      Mat4.rotation(+0.1 * this.roll, Vec.of(0, 0, 1))
    );
    // Now apply translation movement of the camera, in the newest local coordinate frame.
    this.matrix().post_multiply(
      Mat4.translation(this.thrust.times(-meters_per_frame))
    );
    this.inverse().pre_multiply(
      Mat4.translation(this.thrust.times(+meters_per_frame))
    );
  }
  third_person_arcball(radians_per_frame) {
    // (Internal helper function)
    // Spin the scene around a point on an axis determined by user mouse drag:
    const dragging_vector = this.mouse.from_center.minus(this.mouse.anchor);
    if (dragging_vector.norm() <= 0) return;
    this.matrix().post_multiply(Mat4.translation([0, 0, -25]));
    this.inverse().pre_multiply(Mat4.translation([0, 0, +25]));

    const rotation = Mat4.rotation(
      radians_per_frame * dragging_vector.norm(),
      Vec.of(dragging_vector[1], dragging_vector[0], 0)
    );
    this.matrix().post_multiply(rotation);
    this.inverse().pre_multiply(rotation);

    this.matrix().post_multiply(Mat4.translation([0, 0, +25]));
    this.inverse().pre_multiply(Mat4.translation([0, 0, -25]));
  }
  display(
    context,
    graphics_state,
    dt = graphics_state.animation_delta_time / 1000
  ) {
    // The whole process of acting upon controls begins here.
    const m = this.speed_multiplier * this.meters_per_frame,
      r = this.speed_multiplier * this.radians_per_frame;

    if (this.will_take_over_graphics_state) {
      this.reset(graphics_state);
      this.will_take_over_graphics_state = false;
    }

    if (!this.mouse_enabled_canvases.has(context.canvas)) {
      this.add_mouse_controls(context.canvas);
      this.mouse_enabled_canvases.add(context.canvas);
    }
    // Move in first-person.  Scale the normal camera aiming speed by dt for smoothness:
    // this.first_person_flyaround(dt * r, dt * m);
    // Also apply third-person "arcball" camera mode if a mouse drag is occurring:
    // if (this.mouse.anchor) this.third_person_arcball(dt * r);
    // Log some values:
    this.pos = this.inverse().times(Vec.of(0, 0, 0, 1));
    this.z_axis = this.inverse().times(Vec.of(0, 0, 1, 0));
  }
}

export default MovementControls;
