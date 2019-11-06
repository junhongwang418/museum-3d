import { tiny, defs } from "../project-resources.js";

const { Phong_Shader } = defs;

class MirrorShader extends Phong_Shader {
  constructor(num_lights = 2) {
    super(num_lights);
  }

  vertex_glsl_code() {
    // ********* VERTEX SHADER *********
    return (
      this.shared_glsl_code() +
      `
          varying vec4 clip_space;
          attribute vec3 position, normal;                            // Position is expressed in object coordinates.
          
          uniform mat4 model_transform;
          uniform mat4 projection_camera_model_transform;
  
          const float tiling = 6.0;
  
          void main()
            {               
              
              clip_space = projection_camera_model_transform * vec4( position, 1.0 );
              // The vertex's final resting place (in NDCS):
              gl_Position = clip_space;
              N = normalize( mat3( model_transform ) * normal / squared_scale);
              vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
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
        
          uniform sampler2D reflection_texture;
      
          void main()
            {           
  
              vec2 ndc = (clip_space.xy / clip_space.w) / 2.0 + 0.5;
              vec2 reflection_tex_coords = vec2(ndc.x, -ndc.y); 
              
              vec4 reflection_color = texture2D(reflection_texture, reflection_tex_coords);
              gl_FragColor = reflection_color;
              gl_FragColor.xyz += phong_model_lights( vec3(0, 1, 0), vertex_worldspace, vec4(0, 0, 0, 0) );
              
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
  }
}

export default MirrorShader;
