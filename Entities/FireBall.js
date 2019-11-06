import LightBulbShader from "../Shaders/LightBulbShader.js";
import { tiny, defs } from "../project-resources.js";
import ParticleSystem from "../Entities/ParticleSystem.js";
const { Vec, Mat4, Material, Color } = tiny;
const { Surface_Of_Revolution, Phong_Shader, Cube, Subdivision_Sphere } = defs;

class FireBall {
  constructor(launchpos, size, particalSystem) {
    this.pos = launchpos;
    this.initpos = launchpos.copy();
    this.scale = size;
    this.GRAVITY = -10;
    this.acc = 5;
    this.life = 3;
    this.System = particalSystem;
    this.ID = 2;
    this.hasExplode = 0;
    this.MAX_DISPALY_COUNT = 5;

    this.velocity = Vec.of(0, 100 + Math.random() * 100, 0);
    this.initVel = Vec.of(0, 100 + Math.random() * 100, 0);
    this.shape = { ball: new Subdivision_Sphere(6) };
    this.sounds = {
      firework: new Audio("assets/audios/Firework.wav")
    };

    this.colors = [
      Color.of(96 / 255, 26 / 255, 21 / 255, 1),
      Color.of(91 / 255, 12 / 255, 39 / 255, 1),
      Color.of(61 / 255, 15 / 255, 69 / 255, 1),
      Color.of(40 / 255, 23 / 255, 72 / 255, 1),
      Color.of(25 / 255, 32 / 255, 71 / 255, 1),
      Color.of(13 / 255, 59 / 255, 95 / 255, 1),
      Color.of(1 / 255, 66 / 255, 96 / 255, 1),
      Color.of(0 / 255, 74 / 255, 83 / 255, 1),
      Color.of(0 / 255, 59 / 255, 53 / 255, 1),
      Color.of(30 / 255, 69 / 255, 31 / 255, 1),
      Color.of(55 / 255, 76 / 255, 29 / 255, 1),
      Color.of(80 / 255, 86 / 255, 22 / 255, 1),
      Color.of(100 / 255, 92 / 255, 23 / 255, 1),
      Color.of(100 / 255, 76 / 255, 29 / 255, 1),
      Color.of(100 / 255, 60 / 255, 0 / 255, 1),
      Color.of(100 / 255, 34 / 255, 13 / 255, 1)
    ];
    this.color = this.colors[Math.floor(Math.random() * this.colors.length)];

    this.material = {
      light_bulb: new Material(new LightBulbShader(3), {
        ambient: 2,
        diffusivity: 1,
        specularity: 0.5,
        color: this.color
      })
    };
  }

  play_sound(name, volume = 0.5) {
    if (!this.sounds[name].paused) return;
    this.sounds[name].currentTime = 0;
    this.sounds[name].volume = volume;
    this.sounds[name].play();
  }

  pause_sound(name) {
    this.sounds[name].pause();
    this.sounds[name].currentTime = 0;
  }

  update(program_state) {
    const dt = program_state.dt;

    if (this.hasExplode == this.MAX_DISPALY_COUNT) {
      this.hasExplode = 0;
      this.velocity = this.initVel.copy();
      this.pos = this.initpos.copy();
      return;
    }

    if (this.velocity[1] < 0) {
      // explode
      this.play_sound("firework");
      this.hasExplode++;
      this.System.scale = 1;
      this.System.pps = 100;
      this.System.lifeLength = 13;
      this.System.speed = 3;
      // this.System.gravityComplient=-1;
      this.ID = Math.floor(Math.random() * 3 + 1);
      this.System.generateParticles(this.ID, dt, this.pos, () => {
        const dx = Math.random() * 2 - 1;
        const dz = Math.random() * 2 - 1;
        const dy = Math.random() * 2 - 1;
        var myVelocity = Vec.of(dx, dy, dz);
        myVelocity.normalize();
        return myVelocity;
      });
    } else {
      this.velocity[1] += this.GRAVITY * dt;
      let change = Vec.of(
        this.velocity[0],
        this.velocity[1] + this.GRAVITY * dt * dt,
        this.velocity[2]
      ).times(dt / 10);
      this.pos = this.pos.plus(change);
    }
  }
  draw(context, program_state) {
    // get time
    if (this.velocity[1] >= 0) {
      const dt = program_state.dt;
      var scaleF, dx, dy, dz;
      scaleF = this.scale;
      dx = this.pos[0];
      dy = this.pos[1];
      dz = this.pos[2];
      //draw
      let model_transform = Mat4.identity()
        .times(Mat4.translation([dx, dy, dz]))
        .times(Mat4.scale([scaleF, scaleF, scaleF]));
      //console.log(this.material.light_bulb);
      this.shape.ball.draw(
        context,
        program_state,
        model_transform,
        this.material.light_bulb
      );
    }
  }
}
export default FireBall;
