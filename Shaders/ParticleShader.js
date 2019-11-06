import { defs } from "../project-resources.js";

const { Textured_Phong } = defs;

class ParticleShader extends Textured_Phong {
  vertex_glsl_code() {
    // ********* VERTEX SHADER *********
    return (
      this.shared_glsl_code() +
      `
            varying vec2 f_tex_coord;
            attribute vec3 position, normal;                            // Position is expressed in object coordinates.
            attribute vec2 texture_coord;
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;

            uniform vec2 tex_offset_1;
            uniform vec2 tex_offset_2;
            uniform vec2 tex_coord_info; // x = number of rows, y = blend factor

            varying vec2 texture_coords_1;
            varying vec2 texture_coords_2;
            float blend;

    
            void main()
              {                                                                   // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                                                                                  // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
                                                  // Turn the per-vertex texture coordinate into an interpolated variable.
                f_tex_coord = texture_coord;

                vec2 texture_coord_copy = texture_coord;

                // texture_coord_copy.y = 1.0 - texture_coord_copy.y;
                texture_coord_copy /= tex_coord_info.x;
                texture_coords_1 = texture_coord_copy + tex_offset_1;
                texture_coords_2 = texture_coord_copy + tex_offset_2;
                blend = tex_coord_info.y;

                eyespace_pos = model_transform * vec4(position, 1.0);

                
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
            varying vec2 f_tex_coord;
            uniform sampler2D texture;

            varying vec2 texture_coords_1;
            varying vec2 texture_coords_2;
            float blend;
    
            void main()
              {                 
                
                if (dot(eyespace_pos, clip_plane) < 0.0) discard;
                
                vec4 color1 = texture2D(texture, texture_coords_1);
                vec4 color2 = texture2D(texture, texture_coords_2);

                color1 = vec4( ( color1.xyz * (1.5 * shape_color.xyz) ) * ambient, shape_color.w * color1.w );
                color2 = vec4( ( color2.xyz * (1.5 * shape_color.xyz) ) * ambient, shape_color.w * color2.w ); 

                gl_FragColor = mix(color1, color2, blend);
                

              } `
    );
  }

  activate(context, buffer_pointers, program_state, model_transform, material) {
    super.activate(
      context,
      buffer_pointers,
      program_state,
      model_transform,
      material
    );

    context.disable(context.DEPTH_TEST); // Enable Z-Buffering test.
    context.blendFunc(context.SRC_ALPHA, context.ONE);
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

    if (material.is_ready) {
      context.uniform2fv(gpu_addresses.tex_offset_1, material.tex_offset_1);
      context.uniform2fv(gpu_addresses.tex_offset_2, material.tex_offset_2);
      context.uniform2fv(gpu_addresses.tex_coord_info, material.tex_coord_info);
    }
  }
}

export default ParticleShader;
