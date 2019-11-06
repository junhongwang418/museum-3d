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
  
              vec2 ndc = (clip_space.xy / clip_space.w) / 2.0 + 0.5;
              vec2 refraction_tex_coords = vec2(ndc.x, ndc.y);
              vec2 reflection_tex_coords = vec2(ndc.x, -ndc.y); 

              vec4 reflection_color = texture2D(reflection_texture, reflection_tex_coords);
              vec4 refraction_color = texture2D(refraction_texture, refraction_tex_coords);


              gl_FragColor = mix(reflection_color, refraction_color, 0.5);
              gl_FragColor = mix(gl_FragColor, vec4(0.0, 0.3, 0.5, 1.0), 0.2);
            } `
    );
  }
}

export default SimpleWaterShader;
