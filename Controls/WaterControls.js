import { tiny } from "../tiny-graphics.js";
import WaterShader from "../Shaders/WaterShader.js";
import SimpleWaterShader from "../Shaders/SimpleWaterShader.js";
import TexturedWaterShader from "../Shaders/TexturedWaterShader.js";
import ComplexWaterShader from "../Shaders/ComplexWaterShader.js";
import VeryComplexWaterShader from "../Shaders/VeryComplexWaterShader.js";
import VeryVeryComplexWaterShader from "../Shaders/VeryVeryComplexWaterShader.js";
// Pull these names into this module's scope for convenience:
const { Scene, Material, Texture } = tiny;

class WaterControls extends Scene {
  constructor() {
    super();
    this.state = 0;
    this.materials = [
      new Material(new WaterShader(3), {
        dudv_map: new Texture("assets/images/waterDUDV.png"),
        normal_map: new Texture("assets/images/waterNormalMap.png"),
        move_factor: 0,
        ambient: 0,
        diffusivity: 0.2,
        specularity: 0.8,
        color: tiny.Color.of(1, 1, 1, 1)
      }),
      new Material(new SimpleWaterShader(3), {
        dudv_map: new Texture("assets/images/waterDUDV.png"),
        normal_map: new Texture("assets/images/waterNormalMap.png"),
        move_factor: 0,
        ambient: 0,
        diffusivity: 0.2,
        specularity: 0.8,
        color: tiny.Color.of(1, 1, 1, 1)
      }),
      new Material(new TexturedWaterShader(3), {
        dudv_map: new Texture("assets/images/waterDUDV.png"),
        normal_map: new Texture("assets/images/waterNormalMap.png"),
        move_factor: 0,
        ambient: 0,
        diffusivity: 0.2,
        specularity: 0.8,
        color: tiny.Color.of(1, 1, 1, 1)
      }),
      new Material(new ComplexWaterShader(3), {
        dudv_map: new Texture("assets/images/waterDUDV.png"),
        normal_map: new Texture("assets/images/waterNormalMap.png"),
        move_factor: 0,
        ambient: 0,
        diffusivity: 0.2,
        specularity: 0.8,
        color: tiny.Color.of(1, 1, 1, 1)
      }),
      new Material(new VeryComplexWaterShader(3), {
        dudv_map: new Texture("assets/images/waterDUDV.png"),
        normal_map: new Texture("assets/images/waterNormalMap.png"),
        move_factor: 0,
        ambient: 0,
        diffusivity: 0.2,
        specularity: 0.8,
        color: tiny.Color.of(1, 1, 1, 1)
      }),
      new Material(new VeryVeryComplexWaterShader(3), {
        dudv_map: new Texture("assets/images/waterDUDV.png"),
        normal_map: new Texture("assets/images/waterNormalMap.png"),
        move_factor: 0,
        ambient: 0,
        diffusivity: 0.2,
        specularity: 0.8,
        color: tiny.Color.of(1, 1, 1, 1)
      })
    ];
  }

  make_control_panel() {
    this.control_panel.innerHTML += "These are commands water";
    this.new_line();
    this.key_triggered_button("Water Shader", ["p"], () => {
      this.state = 0;
    });
    this.key_triggered_button("Simple Water Shader", ["o"], () => {
      this.state = 1;
    });
    this.key_triggered_button("Textured Water Shader", ["i"], () => {
      this.state = 2;
    });
    this.key_triggered_button("Complex Water Shader", ["u"], () => {
      this.state = 3;
    });
    this.key_triggered_button("Very Complex Water Shader", ["y"], () => {
      this.state = 4;
    });
    this.key_triggered_button("Very Very Complex Water Shader", ["t"], () => {
      this.state = 5;
    });
  }

  display(context, program_state) {
    program_state.water.material = this.materials[this.state];
  }
}

export default WaterControls;
