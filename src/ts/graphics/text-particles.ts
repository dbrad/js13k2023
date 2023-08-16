import { add_V2, set_V2_from_V2, set_V4f_from_V4f, v4c } from "@math/vector";
import { gl } from "gl";
import { easeOutQuad, floor, lerp } from "math";
import { v4f_to_abgr_value } from "./colour";
import { push_text } from "./text";

// let damage_particle: TextParticleParameters = {
//     _text: "",
//     _position: [0, 0],
//     _colour: v4c(1, 0, 0, 1),
// };

let particle_text: string[] = [];
let particle_position: V2[] = [];
let particle_colour: V4f[] = [];

let particle_lifetime_remaining: number[] = [];

let particle_pool_size: number = 100;
let particle_pool_index = particle_pool_size - 1;

export let active_text_particles: Set<number> = new Set();

export function init_text_particles(): void
{
    for (let i = particle_pool_size - 1; i >= 0; --i)
    {
        particle_text[i] = "";
        particle_position[i] = [0, 0];
        particle_colour[i] = v4c(1.0, 1.0, 1.0, 1.0);
        particle_lifetime_remaining[i] = 0;
    }
};

export function update_text_particles(delta: number): void
{
    let delta_in_seconds = (delta / 1000);
    let indexes = active_text_particles.values();
    for (let i of indexes)
    {
        if (particle_lifetime_remaining[i] <= 0)
        {
            active_text_particles.delete(i);
            continue;
        }

        particle_lifetime_remaining[i] -= delta;

        let life_progress = particle_lifetime_remaining[i] / 1000;
        let vel = lerp(0, 20, easeOutQuad(life_progress));
        add_V2(particle_position[i], 0, -vel * delta_in_seconds);
        particle_colour[i][A] = lerp(0, 1, life_progress);
    }
};

export function clear_text_particles(): void 
{
    active_text_particles.clear();
};

let text_options: TextParameters = { _horizontal_align: TEXT_ALIGN_CENTER, _vertical_align: TEXT_ALIGN_MIDDLE };
export function render_text_particles(t: Texture[]): void
{
    let indexes = active_text_particles.values();
    for (let i of indexes)
    {
        gl._set_colour(v4f_to_abgr_value(particle_colour[i]));
        push_text(t, particle_text[i], floor(particle_position[i][X]), floor(particle_position[i][Y]), text_options);
    }
};

export function emit_text_particle(particle_params: TextParticleParameters): void
{
    active_text_particles.add(particle_pool_index);

    particle_text[particle_pool_index] = particle_params._text;

    set_V2_from_V2(particle_position[particle_pool_index], particle_params._position);

    set_V4f_from_V4f(particle_colour[particle_pool_index], particle_params._colour);

    particle_lifetime_remaining[particle_pool_index] = 1000;

    --particle_pool_index;
    if (particle_pool_index < 0)
        particle_pool_index = particle_pool_size - 1;
};

export function emit_text_particles(particle_params: TextParticleParameters, count: number): void
{
    while (--count)
        emit_text_particle(particle_params);
};