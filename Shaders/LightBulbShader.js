import { defs } from "../project-resources.js";

const { Phong_Shader } = defs;

const LightBulbShader = (defs.Light_Bulb_Shader = class LightBulbShader extends Phong_Shader {
  vertex_glsl_code() {
    // ********* VERTEX SHADER *********
    return (
      this.shared_glsl_code() +
      `
          attribute vec3 position, normal;                            // Position is expressed in object coordinates.
          varying vec3 f_position;
  
          uniform mat4 model_transform;
          uniform mat4 projection_camera_model_transform;
  
          void main()
            {            
              // The vertex's final resting place (in NDCS):
              gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                                                                                // The final normal vector in screen space.
              N = normalize( mat3( model_transform ) * normal / squared_scale);
              
              vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
  
              eyespace_pos = model_transform * vec4(position, 1.0);
  
              f_position = position;
  
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
        varying vec3 f_position;
  
  
          void main()
            {                  
              if (dot(eyespace_pos, clip_plane) < 0.0) discard;
  
              // Compute an initial (ambient) color:
              gl_FragColor = vec4( shape_color.xyz * ambient, shape_color.w );
                                                                       // Compute the final color with contributions from lights:
              //gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
              
              gl_FragColor.xyz += vec3(1, 1, 1) * (1.0 - f_position.z);
              if (f_position.z > 0.7) {
                  gl_FragColor = vec4(0, 0, 0, 0.5);
              }
            } `
    );
  }
});

export default LightBulbShader;
