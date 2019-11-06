import { tiny, defs } from "../project-resources.js";

const { Mat, Mat4, Shader } = tiny;

class SkyboxShader extends Shader {
  constructor(rotation_speed = 1) {
    super();
    this.ROTATION_SPEED = rotation_speed;
    this.rotation = 0;
  }

  update_GPU(
    context,
    gpu_addresses,
    graphics_state,
    model_transform,
    material
  ) {
    // update_GPU():  Define how to synchronize our JavaScript's variables to the GPU's:
    let [P, C] = [
      graphics_state.projection_transform,
      graphics_state.camera_transform.copy()
    ];

    // remove translation
    C[0][3] = 0;
    C[1][3] = 0;
    C[2][3] = 0;

    this.rotation +=
      (this.ROTATION_SPEED * graphics_state.animation_delta_time) / 1000;

    C = Mat4.inverse(C);

    // move the sky
    C = C.times(
      Mat4.rotation(((2 * Math.PI) / 360) * this.rotation, [0, 1, 0])
    );

    const PC = P.times(C);

    context.uniformMatrix4fv(
      gpu_addresses.projection_camera_transform,
      false,
      Mat.flatten_2D_to_1D(PC.transposed())
    );

    context.uniform1f(gpu_addresses.blend_factor, material.blend_factor);

    if (material.cube_map && material.cube_map.ready()) {
      context.uniform1i(gpu_addresses.cube_map, 0);
      material.cube_map.activate(context, 0);
    }

    if (material.cube_map2 && material.cube_map2.ready()) {
      context.uniform1i(gpu_addresses.cube_map2, 1);
      material.cube_map2.activate(context, 1);
    }
  }

  shared_glsl_code() {
    // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    return `
        precision mediump float;
        varying vec3 f_tex_coord;
      `;
  }

  // **Textured_Phong** is a Phong Shader extended to addditionally decal a
  // texture image over the drawn shape, lined up according to the texture
  // coordinates that are stored at each shape vertex.
  vertex_glsl_code() {
    // ********* VERTEX SHADER *********
    return (
      this.shared_glsl_code() +
      `
          attribute vec3 position;                            // Position is expressed in object coordinates.
          
          uniform mat4 projection_camera_transform;
  
          void main()
            {                                                                   // The vertex's final resting place (in NDCS):
              gl_Position = projection_camera_transform * vec4( position, 1.0 );
              f_tex_coord = position;
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
          uniform samplerCube cube_map;
          uniform samplerCube cube_map2;
          uniform float blend_factor;
  
          void main()
            {
              vec4 texture1 = textureCube(cube_map, f_tex_coord);
              vec4 texture2 = textureCube(cube_map2, f_tex_coord);
  
              gl_FragColor = mix(texture1, texture2, blend_factor);
            } 
        `
    );
  }
}

export default SkyboxShader;
