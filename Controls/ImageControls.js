import { tiny } from "../tiny-graphics.js";
// Pull these names into this module's scope for convenience:
const { Scene, Texture } = tiny;

class ImageControls extends Scene {
  constructor(
    message,
    context,
    scratchpad,
    scratchpad_context,
    scratchpad_size
  ) {
    super();
    this.message = message;
    this.context = context;
    this.scratchpad = scratchpad;
    this.scratchpad_context = scratchpad_context;
    this.scratchpad_size = scratchpad_size;
    this.texture = new Texture(
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    );
  }

  take_a_screen_shot() {
    this.scratchpad.width = this.scratchpad_size;
    this.scratchpad.height = this.scratchpad_size;

    this.scratchpad_context.drawImage(
      this.context.canvas,
      0,
      0,
      this.scratchpad_size,
      this.scratchpad_size
    );
    this.texture.image.src = this.image.src = this.scratchpad.toDataURL(
      "image/png"
    );
    this.texture.copy_onto_graphics_card(this.context.context, false);
  }

  make_control_panel() {
    this.control_panel.innerHTML += this.message;
    this.image = this.control_panel.appendChild(
      Object.assign(document.createElement("img"), {
        style: "width:200px; height:" + 200 * this.aspect_ratio + "px"
      })
    );
  }

  display(context, program_state) {}
}

export default ImageControls;
