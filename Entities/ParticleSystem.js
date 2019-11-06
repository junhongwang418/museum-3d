// import
import { tiny, defs } from "../project-resources.js";
import Particle from "./Particle.js";
import ParticleShader from "../Shaders/ParticleShader.js";

const { Square, Surface_Of_Revolution } = defs;

// Pull these names into this module's scope for convenience:
const {
  Vec,
  Mat,
  Mat4,
  Material,
  Color,
  Texture,
  ParticleTexture,
  Shape,
  Shader,
  Scene,
  Canvas_Widget,
  Code_Widget,
  Text_Widget
} = tiny;
const {
  Cube,
  Subdivision_Sphere,
  Transforms_Sandbox_Base,
  Water_Shader
} = defs;

// the class is to contorl the system of particels ..
class ParticleSystem {
  // define constuctor
  constructor(pps, speed, gf, lifeLength, scale = 1) {
    const points = Vec.cast(
      [0.02, 0, 0.96],
      [0.02, 0, 0.87],
      [0.1, 0, 0.84],
      [0.17, 0, 0.79],
      [0.18, 0, 0.64],
      [0.29, 0, 0.16],
      [0.24, 0, 0.1],
      [0.22, 0, 0.05],
      [0.15, 0, 0]
    );

    this.pps = pps;
    this.speed = speed;
    this.gravityComplient = gf;
    this.lifeLength = lifeLength;
    this.scale = scale;
    this.myparticles = [];
    this.color = undefined;
    this.shapes = {
      ball: new Subdivision_Sphere(6),
      box: new Cube(),
      particle: new Square(),
      light_bulb: new Surface_Of_Revolution(9, 9, points)
    };
    this.materials = {

        star: new Material(new ParticleShader(2), {
        texture: new ParticleTexture("assets/images/particleStar.png", 1),
        ambient: 1,
        diffusivity: 0,
        specularity: 1,
        color: Color.of(0, 0, 1, 0.4)
      }),
      particle: new Material(new ParticleShader(2), {
        texture: new ParticleTexture("assets/images/fireParticle.png", 8),
        ambient: 1
      })
    };
  }

  toProduce() {
    if (this.myparticles.length < 1000) return true;
    else return false;
  }

  // add particles
  addParticle(particle) {
    this.myparticles.push(particle);
  }
  // // generator
  generateParticles(
    ID,
    times,
    pos,
    vecocity_generator = () => {
      const dx = Math.random() * 2 - 1;
      const dz = Math.random() * 2 - 1;
      var myVelocity = Vec.of(dx / 2, 1, dz / 2);
      myVelocity.normalize();
      return myVelocity;
    })
     {
    if (this.toProduce()) {
      const t = times;
      const m_num_prt = this.pps * t;

      for (let i = 0; i < m_num_prt; i++) {
        this.emitParticle(ID,pos,vecocity_generator);
      }
    }
  }
  // emiter
  emitParticle(ID,pos,vecocity_generator) 
  {
    let myVelocity = vecocity_generator();
    myVelocity.scale(this.speed);
    if(ID == 1)
    {
      this.addParticle(
        new Particle(
          pos,
          myVelocity,
          this.gravityComplient,
          this.lifeLength,
          this.scale,
          this.shapes.particle,
          this.materials.particle,
          this.color
        )
      );
    }else if( ID == 2)
    {
      this.addParticle(
        new Particle(
          pos,
          myVelocity,
          this.gravityComplient,
          this.lifeLength,
          this.scale,
          this.shapes.ball,
          this.materials.star,
          this.color
        )
      );
    }else
    {this.addParticle(
        new Particle(
          pos,
          myVelocity,
          this.gravityComplient,
          this.lifeLength,
          this.scale,
          this.shapes.particle,
          this.materials.star,
          this.color
        )
      );
      
    }
      

  }


  // draw
  draw(context, program_state) {
    for (let i = 0; i < this.myparticles.length; i++) {
      if (!this.myparticles[i].update(program_state)) {
        this.myparticles.splice(i--, 1);
      } else {
        this.myparticles[i].draw(context, program_state);
      }
    }
  }
}
export default ParticleSystem;
