import { tiny, defs } from "../project-resources.js";

const { Phong_Shader } = defs;

class WaterShader extends Phong_Shader {
  constructor(num_lights = 2) {
    super(num_lights);
  }

  vertex_glsl_code() {
    // ********* VERTEX SHADER *********
    return (
      this.shared_glsl_code() +
      `
          varying vec4 clip_space;
          varying vec2 f_tex_coord;
          varying vec3 to_camera_vector;
          varying vec3 world_position;
          attribute vec3 position, normal;                            // Position is expressed in object coordinates.
          attribute vec2 texture_coord;
          
          uniform mat4 model_transform;
          uniform mat4 projection_camera_model_transform;
          uniform vec3 camera_position;
   
          const float tiling = 6.0;
  
          void main()
            {               
              world_position = (model_transform * vec4( position, 1.0 )).xyz;
              clip_space = projection_camera_model_transform * vec4( position, 1.0 );
              // The vertex's final resting place (in NDCS):
              gl_Position = clip_space;
              f_tex_coord = texture_coord * tiling;
              to_camera_vector = camera_position - world_position;
                                                                                // The final normal vector in screen space.
  
            } `
    );
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
  
              //vec2 distortion1 = (texture2D(dudv_map, vec2(f_tex_coord.x + move_factor, f_tex_coord.y)).rg * 2.0 - 1.0) * wave_strength;
              //vec2 distortion2 = (texture2D(dudv_map, vec2(-f_tex_coord.x, f_tex_coord.y + move_factor)).rg * 2.0 - 1.0) * wave_strength;
              //vec2 total_distortion = distortion1 + distortion2;

              vec2 distortion_texture_coords = texture2D(dudv_map, vec2(f_tex_coord.x + move_factor, f_tex_coord.y)).rg * 0.1;
              distortion_texture_coords = f_tex_coord + vec2(f_tex_coord.x, f_tex_coord.y + move_factor);
              vec2 total_distortion = (texture2D(dudv_map, distortion_texture_coords).rg * 2.0 - 1.0) * wave_strength;
  
              refraction_tex_coords += total_distortion;
              refraction_tex_coords = clamp(refraction_tex_coords, 0.001, 0.999);
  
              reflection_tex_coords += total_distortion;
              reflection_tex_coords.x = clamp(reflection_tex_coords.x, 0.001, 0.999);
              reflection_tex_coords.y = clamp(reflection_tex_coords.y, -0.999, 0.001);
              
              vec4 reflection_color = texture2D(reflection_texture, reflection_tex_coords);
              vec4 refraction_color = texture2D(refraction_texture, refraction_tex_coords);

              vec3 view_vector = normalize(to_camera_vector);
              float refractive_factor = dot(view_vector, vec3(0.0, 1.0, 0.0));
              refractive_factor = pow(refractive_factor, 0.5);

              vec4 normal_map_color = texture2D(normal_map, distortion_texture_coords);
              vec3 normal = vec3(normal_map_color.r * 2.0 - 1.0, normal_map_color.b, normal_map_color.g * 2.0 - 1.0);
              normal = normalize(normal);

              gl_FragColor = mix(reflection_color, refraction_color, refractive_factor);
              gl_FragColor = mix(gl_FragColor, vec4(0.0, 0.3, 0.5, 1.0), 0.2);
              gl_FragColor.xyz += phong_model_lights( normal, world_position, vec4(0, 0, 0, 0) );
            } `
    );
  }

  update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
    // update_GPU(): Add a little more to the base class's version of this method.
    super.update_GPU(
      context,
      gpu_addresses,
      gpu_state,
      model_transform,
      material
    );

    if (material.reflection_texture && material.reflection_texture.ready) {
      // Select texture unit 0 for the fragment shader Sampler2D uniform called "texture":
      context.uniform1i(gpu_addresses.reflection_texture, 0);
      // For this draw, use the texture image from correct the GPU buffer:
      material.reflection_texture.activate(context, 0);
    }

    if (material.refraction_texture && material.refraction_texture.ready) {
      // Select texture unit 0 for the fragment shader Sampler2D uniform called "texture":
      context.uniform1i(gpu_addresses.refraction_texture, 1);
      // For this draw, use the texture image from correct the GPU buffer:
      material.refraction_texture.activate(context, 1);
    }

    if (material.dudv_map && material.dudv_map.ready) {
      // Select texture unit 0 for the fragment shader Sampler2D uniform called "texture":
      context.uniform1i(gpu_addresses.dudv_map, 2);
      // For this draw, use the texture image from correct the GPU buffer:
      material.dudv_map.activate(context, 2);
    }

    if (material.normal_map && material.normal_map.ready) {
      // Select texture unit 0 for the fragment shader Sampler2D uniform called "texture":
      context.uniform1i(gpu_addresses.normal_map, 3);
      // For this draw, use the texture image from correct the GPU buffer:
      material.normal_map.activate(context, 3);
    }

    context.uniform1f(gpu_addresses.move_factor, material.move_factor);
    context.uniform3fv(
      gpu_addresses.camera_position,
      gpu_state.camera.position
    );
  }
}

export default WaterShader;
