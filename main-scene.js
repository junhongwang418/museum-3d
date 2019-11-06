import { tiny, defs } from "./project-resources.js";
import Player from "./Entities/Player.js";
import Camera from "./Entities/Camera.js";
import SkyBox from "./Entities/SkyBox.js";
import Art from "./Entities/Art.js";
import Terrain from "./Entities/Terrain.js";
import Water from "./Entities/Water.js";
import Mirror from "./Entities/Mirror.js";
import MovementControls from "./Controls/MovementControls.js";
import CameraControls from "./Controls/CameraControls.js";
import Particle from "./Entities/Particle.js";
import ParticleSystem from "./Entities/ParticleSystem.js";
import Lamp from "./Entities/Lamp.js";
import ImageControls from "./Controls/ImageControls.js";
import WaterControls from "./Controls/WaterControls.js";
import LightBulbSystem from "./Entities/LightBulbSystem.js";
import MouseControls from "./Controls/MouseControls.js";
import Torch from "./Entities/Torch.js";
import FireBall from "./Entities/FireBall.js";
// Pull these names into this module's scope for convenience:
const {
  Vec,
  Mat,
  Mat4,
  Color,
  Light,
  Shape,
  Shader,
  Material,
  Texture,
  Scene,
  Canvas_Widget,
  Code_Widget,
  Text_Widget
} = tiny;
const {
  Cube,
  Art_Box,
  Subdivision_Sphere,
  Transforms_Sandbox_Base,
  Square,
  Terrain_Shader
} = defs;
const Main_Scene = class Museum_Scene extends Scene {
  constructor() {
    super();
    this.shapes = {
      ball: new Subdivision_Sphere(6),
      box: new Cube()
    };
    this.materials = {
      sun: new Material(new defs.Phong_Shader(2), {
        ambient: 1,
        diffusivity: 0,
        specularity: 1,
        color: Color.of(1, 1, 0, 1)
      }),
      fire: new Material(new defs.Phong_Shader(2), {
        dudv_map: new Texture("assets/images/fir2.gif"),
        ambient: 1,
        diffusivity: 0,
        specularity: 1,
        color: Color.of(0.5, 0.5, 0, 1)
      })
    };
    // state
    this.is_day = true;

    // reflection / refraction
    this.scratchpad = document.createElement("canvas");
    this.scratchpad_context = this.scratchpad.getContext("2d");

    //entitity initializations
    this.sky_box = new SkyBox();
    this.terrain = new Terrain(Vec.of(0.5, 0, 0.5), 800);
    this.player = new Player();
    this.camera = new Camera(this.player);
    this.water = new Water(Vec.of(-220, -45, -180));
    this.mySystem = new ParticleSystem(10, 5, 3, 2);
    this.mirror = new Mirror(Vec.of(170, -49, -170), 80);

    this.fireWorks = [
      new FireBall(Vec.of(20, 70, 0), 3, this.mySystem),
      new FireBall(Vec.of(-180, 0, 30), 1, this.mySystem),
      new FireBall(Vec.of(-50, 0, 180), 1, this.mySystem),
      new FireBall(this.player.position.copy(), 1, this.mySystem)
    ];
    this.light_bulb_system = new LightBulbSystem(this.mirror.position);
    this.lamps = [
      new Lamp(Vec.of(-40, 0, -40), Color.of(1, 0, 0, 1)),
      new Lamp(Vec.of(-220, 0, -200), Color.of(1, 1, 1, 1)),
      new Torch(Vec.of(0, 0, 0), Color.of(1, 0, 0, 1), this.mySystem, 3),
      new Torch(Vec.of(30, 0, 0), Color.of(0.5, 0.5, 1, 1), this.mySystem, 3),
      new Torch(Vec.of(-30, 0, 0), Color.of(1, 1, 0, 1), this.mySystem, 3),
      new Torch(Vec.of(10, 0, 20), Color.of(1, 0, 0.5, 1), this.mySystem, 3),
      new Torch(Vec.of(40, 0, 40), Color.of(1, 0, 1, 1), this.mySystem, 3),
      new Torch(Vec.of(-40, 0, 50), Color.of(0, 1, 0, 1), this.mySystem, 3),
      new Torch(
        Vec.of(50, 0, 20),
        Color.of(0.2, 0.5, 0.5, 1),
        this.mySystem,
        3
      ),
      new Torch(
        Vec.of(-50, 0, 30),
        Color.of(0.4, 0.8, 0.2, 1),
        this.mySystem,
        3
      )
    ];
  }

  make_control_panel() {
    this.key_triggered_button("Day", ["0"], () => (this.is_day = true));
    this.key_triggered_button("Night", ["9"], () => (this.is_day = false));
    this.key_triggered_button(
      "Fireword Enabled",
      ["f"],
      () => (this.is_fireword_enabled = true)
    );
    this.key_triggered_button(
      "Fireword Disabled",
      ["g"],
      () => (this.is_fireword_enabled = false)
    );
  }

  display(context, program_state) {
    //this.particle = new Particles(Vec.of(this.player.position[0],this.player.position[1],this.player.position[2]-40), Vec.of(0,20,0),0.2,4,3);
    // display():  Called once per frame of animation.  For each shape that you want to
    // appear onscreen, place a .draw() call for it inside.  Each time, pass in a
    // different matrix value to control where the shape appears.

    // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
    if (!context.scratchpad.controls) {
      // Add a movement controls panel to the page:
      this.children.push(
        (context.scratchpad.controls = new MovementControls(this.player))
      );

      // this.initial_camera_location = program_state.camera_inverse;
      program_state.projection_transform = Mat4.perspective(
        ((2 * Math.PI) / 360) * 70,
        context.width / context.height,
        1,
        1000
      );

      // Add a helper scene / child scene that allows viewing each moving body up close.
      this.children.push(
        (this.camera_controls = new CameraControls(this.camera)),
        (this.water_controls = new WaterControls()),
        (this.mirror_reflection_image_control = new ImageControls(
          "mirror_reflection",
          context,
          this.scratchpad,
          this.scratchpad_context,
          512
        )),
        (this.water_reflection_image_control = new ImageControls(
          "water_reflection",
          context,
          this.scratchpad,
          this.scratchpad_context,
          256
        )),
        (this.water_refraction_image_control = new ImageControls(
          "water_refraction",
          context,
          this.scratchpad,
          this.scratchpad_context,
          256
        )),
        (this.mouse_controls = new MouseControls(this.camera, program_state))
      );

      // Define the global camera and projection matrices, which are stored in program_state.  The camera
      // matrix follows the usual format for transforms, but with opposite values (cameras exist as
      // inverted matrices).  The projection matrix follows an unusual format and determines how depth is
      // treated when projecting 3D points onto a plane.  The Mat4 functions perspective() and
      // orthographic() automatically generate valid matrices for one.  The input arguments of
      // perspective() are field of view, aspect ratio, and distances to the near plane and far plane.
    }

    // Find how much time has passed in seconds; we can use
    // time as an input when calculating new transforms:
    const t = program_state.animation_time / 1000;
    const dt = program_state.animation_delta_time / 1000;

    program_state.t = t;
    program_state.dt = dt;
    program_state.is_day = this.is_day;
    program_state.current_terrain = this.terrain;
    program_state.camera = this.camera;
    program_state.player = this.player;
    program_state.water = this.water;
    program_state.current_ray = this.mouse_controls.current_ray;
    program_state.ray_start_position =
      this.camera_controls.state == 0
        ? this.player.eye_position()
        : this.camera.position;

    /**********************************
      Start coding down here!!!!
      **********************************/
    //     console.log(this.mySystem);

    // Variable model_transform will be a local matrix value that helps us position shapes.
    // It starts over as the identity every single frame - coordinate axes at the origin.
    let model_transform = Mat4.identity();
    // *** Lights: *** Values of vector or point lights.  They'll be consulted by
    // the shader when coloring shapes.  See Light's class definition for inputs.

    program_state.lights = this.lamps.map(lamp => lamp.get_light());

    // ***** END TEST SCENE *****

    // Warning: Get rid of the test scene, or else the camera position and movement will not work.

    // this.prepare_water(context, program_state);
    this.prepare_mirror(context, program_state);
    this.prepare_water(context, program_state);

    // standard render process
    this.camera_controls.first_person_view_camera = Mat4.look_at(
      this.player.eye_position(),
      this.player.look_at_position(),
      Vec.of(0, 1, 0)
    );
    this.camera_controls.third_person_view_camera = Mat4.look_at(
      this.camera.position,
      this.player.position,
      Vec.of(0, 1, 0)
    );

    this.update(program_state);
    program_state.clip_plane = Vec.of(0, -1, 0, 100000);
    this.render(context, program_state);
  }

  update(program_state) {
    this.sky_box.update(program_state);
    this.terrain.update(program_state);
    this.player.update(program_state);
    this.camera.update(program_state);
    this.water.update(program_state);
    this.mirror.update(program_state);
    this.lamps.forEach(lamp => {
      if (this.player.is_near_object(lamp.position)) {
        lamp.update(program_state);
      }
    });

    if (this.is_fireword_enabled) {
      this.fireWorks.forEach(firework => {
        {
          firework.update(program_state);
        }
      });
    }

    this.mouse_controls.update(program_state);
    if (this.player.is_near_object(this.mirror.position, 30000))
      this.light_bulb_system.update(program_state);
  }

  render(context, program_state, is_everything = true) {
    this.terrain.draw(context, program_state);
    this.sky_box.draw(context, program_state);
    this.player.draw(context, program_state);
    this.light_bulb_system.draw(context, program_state);
    this.lamps.forEach(lamp => lamp.draw(context, program_state));
    if (this.is_fireword_enabled) {
      this.fireWorks.forEach(firework => {
        {
          firework.draw(context, program_state);
        }
      });
    }

    if (is_everything) this.water.draw(context, program_state);
    if (is_everything) this.mirror.draw(context, program_state);
  }

  prepare_water(context, program_state) {
    // water reflection / refraction
    if (this.player.is_near_object(this.water.position, 20000)) {
      // reflection
      program_state.clip_plane = Vec.of(0, 1, 0, -this.water.get_height());
      let distance = this.invert_view(program_state, this.water.get_height());

      this.render(context, program_state, false);

      this.water_reflection_image_control.take_a_screen_shot();
      program_state.water_reflection_texture = this.water_reflection_image_control.texture;

      context.context.clear(
        context.context.COLOR_BUFFER_BIT | context.context.DEPTH_BUFFER_BIT
      );

      this.invert_view_back(program_state, distance);

      // refraction
      program_state.clip_plane = Vec.of(0, -1, 0, this.water.get_height());
      this.render(context, program_state, false);
      this.water_refraction_image_control.take_a_screen_shot();
      program_state.water_refraction_texture = this.water_refraction_image_control.texture;

      context.context.clear(
        context.context.COLOR_BUFFER_BIT | context.context.DEPTH_BUFFER_BIT
      );
    }
  }

  prepare_mirror(context, program_state) {
    // mirror reflection
    if (this.player.is_near_object(this.mirror.position, 30000)) {
      program_state.clip_plane = Vec.of(0, 1, 0, -this.mirror.get_height());
      let distance = this.invert_view(program_state, this.mirror.get_height());

      this.render(context, program_state, false);
      this.mirror_reflection_image_control.take_a_screen_shot();
      program_state.mirror_reflection_texture = this.mirror_reflection_image_control.texture;

      context.context.clear(
        context.context.COLOR_BUFFER_BIT | context.context.DEPTH_BUFFER_BIT
      );

      this.invert_view_back(program_state, distance);
    }
  }

  invert_view(program_state, height) {
    var distance;
    if (this.camera_controls.state == 0) {
      // first person view camera
      distance = 2 * (this.player.position[1] - height);
      this.player.position[1] -= distance;
      this.player.invert_look_up_angle();
      program_state.set_camera(
        Mat4.look_at(
          this.player.eye_position(),
          this.player.look_at_position(),
          Vec.of(0, 1, 0)
        )
      );
    } else {
      distance = 2 * (this.camera.position[1] - height);
      this.camera.position[1] -= distance;
      this.camera.invert_pitch();
      this.camera.update_position();
      program_state.set_camera(
        Mat4.look_at(
          this.camera.position,
          this.player.position,
          Vec.of(0, 1, 0)
        )
      );
    }

    return distance;
  }

  invert_view_back(program_state, distance) {
    if (this.camera_controls.state == 0) {
      // first person view camera
      this.player.position[1] += distance;
      this.player.invert_look_up_angle();
      program_state.set_camera(
        Mat4.look_at(
          this.player.eye_position(),
          this.player.look_at_position(),
          Vec.of(0, 1, 0)
        )
      );
    } else {
      this.camera.position[1] += distance;
      this.camera.invert_pitch();
      this.camera.update_position();
      program_state.set_camera(
        Mat4.look_at(
          this.camera.position,
          this.player.position,
          Vec.of(0, 1, 0)
        )
      );
    }
  }
};

const Additional_Scenes = [];

export {
  Main_Scene,
  Additional_Scenes,
  Canvas_Widget,
  Code_Widget,
  Text_Widget,
  defs
};
