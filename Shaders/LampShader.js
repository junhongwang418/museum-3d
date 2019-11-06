import { tiny, defs } from "../project-resources.js";

const { Textured_Phong } = defs;

class LampShader extends Textured_Phong {
  fragment_glsl_code() {
    // ********* FRAGMENT SHADER *********
    // A fragment is a pixel that's overlapped by the current triangle.
    // Fragments affect the final image or get discarded due to depth.
    return (
      this.shared_glsl_code() +
      `
	            varying vec2 f_tex_coord;
	            uniform sampler2D texture;
	    
	            void main()
	              {                 
	                
	                if (dot(eyespace_pos, clip_plane) < 0.0) discard;
	                // Sample the texture image in the correct place:
	                vec4 tex_color = texture2D( texture, f_tex_coord );
	                if( tex_color.w < .01 ) discard;
	                                                                         // Compute an initial (ambient) color:
	                gl_FragColor = vec4( ( tex_color.xyz * (1.5 * shape_color.xyz) ) * ambient, shape_color.w * tex_color.w ); 
	                                                                         // Compute the final color with contributions from lights:
	                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace, tex_color );
	              } `
    );
  }
}

export default LampShader;
