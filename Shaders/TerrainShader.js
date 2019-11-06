import { tiny, defs } from "../project-resources.js";

const { Textured_Phong } = defs;

class TerrainShader extends Textured_Phong {
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
          void main()
            {                                                                   // The vertex's final resting place (in NDCS):
              gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                                                                                // The final normal vector in screen space.
              N = normalize( mat3( model_transform ) * normal / squared_scale);
              vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
                                                // Turn the per-vertex texture coordinate into an interpolated variable.
              f_tex_coord = texture_coord * 40.0;
              eyespace_pos = model_transform * vec4(position, 1.0);
            } `
    );
  }
}

export default TerrainShader;
