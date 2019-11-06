import WaterShader from "./WaterShader.js";

class SimpleWaterShader extends WaterShader {
  constructor(num_lights = 2) {
    super(num_lights);
  }

  fragment_glsl_code() {
    // ********* FRAGMENT SHADER *********
    // A fragment is a pixel that's overlapped by the current triangle.
    // Fragments affect the final image or get discarded due to depth.
    return (
      this.shared_glsl_code() +
      `
  
          varying vec4 clip_space;
          varying vec2 f_tex_coord;
          varying vec3 to_camera_vector;
          varying vec3 world_position;
  
          uniform sampler2D reflection_texture;
          uniform sampler2D refraction_texture;
          uniform sampler2D dudv_map;
          uniform sampler2D normal_map;
          uniform float move_factor;
  
          const float wave_strength = 0.02;
  
          void main()
            {           
  
              gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
            } `
    );
  }
}

export default SimpleWaterShader;
