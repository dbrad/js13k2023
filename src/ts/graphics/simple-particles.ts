import { push_quad } from "@graphics/quad";
import { set_V2, set_V2_from_V2, set_V4f_from_V4f, v4c } from "@math/vector";
import { floor, lerp, math } from "math";
import { v4f_to_abgr_value } from "./colour";

// let star_particles: SimpleParticleParameters = {
//     _position: [SCREEN_CENTER_X, SCREEN_CENTER_Y],
//     _velocity: [0, 0],
//     _velocity_variation: [250, 250],
//     _size_begin: 2,
//     _size_end: 4,
//     _size_variation: 1,
//     _colour_begin: v4c(0.75, 0, 0, 1),
//     _colour_end: v4c(1, 0, 0, 0),
//     _lifetime: 1000
// };

let particle_position: V2[] = [];
let particle_velocity: V2[] = [];

let particle_size_begin: number[] = [];
let particle_size_end: number[] = [];
let particle_size: number[] = [];

let particle_colour_begin: V4f[] = [];
let particle_colour_end: V4f[] = [];
let particle_colour: V4f[] = [];

let particle_lifetime: number[] = [];
let particle_lifetime_remaining: number[] = [];

let particle_pool_size: number = 10000;
let particle_pool_index = particle_pool_size - 1;

export let active_simple_particles: Set<number> = new Set();

export function init_simple_particles(): void
{
    for (let i = particle_pool_size - 1; i >= 0; --i)
    {
        particle_position[i] = [0, 0];
        particle_velocity[i] = [0, 0];
        particle_size_begin[i] = 0;
        particle_size_end[i] = 0;
        particle_size[i] = 0;
        particle_colour_begin[i] = v4c(1.0, 1.0, 1.0, 1.0);
        particle_colour_end[i] = v4c(1.0, 1.0, 1.0, 1.0);
        particle_colour[i] = v4c(1.0, 1.0, 1.0, 1.0);
        particle_lifetime[i] = 0;
        particle_lifetime_remaining[i] = 0;
    }
};

export function update_simple_particles(delta: number): void
{
    let delta_in_seconds = (delta / 1000);
    let indexes = active_simple_particles.values();
    for (let i of indexes)
    {
        if (particle_lifetime_remaining[i] <= 0)
        {
            active_simple_particles.delete(i);
            continue;
        }

        particle_lifetime_remaining[i] -= delta;

        particle_position[i][X] += particle_velocity[i][X] * delta_in_seconds;
        particle_position[i][Y] += particle_velocity[i][Y] * delta_in_seconds;

        let life_progress = particle_lifetime_remaining[i] / particle_lifetime[i];

        particle_size[i] = floor(lerp(particle_size_end[i], particle_size_begin[i], life_progress));

        let colour_begin = particle_colour_begin[i];
        let colour_end = particle_colour_end[i];

        particle_colour[i][R] = lerp(colour_end[R], colour_begin[R], life_progress);
        particle_colour[i][G] = lerp(colour_end[G], colour_begin[G], life_progress);
        particle_colour[i][B] = lerp(colour_end[B], colour_begin[B], life_progress);
        particle_colour[i][A] = lerp(colour_end[A], colour_begin[A], life_progress);
    }
};

export function clear_simple_particles(): void 
{
    active_simple_particles.clear();
};

export function render_simple_particles(): void
{
    let indexes = active_simple_particles.values();
    for (let i of indexes)
    {
        let halfSize = floor(particle_size[i] / 2);
        push_quad(floor(particle_position[i][X]) - halfSize, floor(particle_position[i][Y]) - halfSize, particle_size[i], particle_size[i], v4f_to_abgr_value(particle_colour[i]));
    }
};

export function emit_simple_particle(particle_params: SimpleParticleParameters): void
{
    active_simple_particles.add(particle_pool_index);

    set_V2_from_V2(particle_position[particle_pool_index], particle_params._position);

    set_V2(particle_velocity[particle_pool_index], particle_params._velocity[X] + particle_params._velocity_variation[X] * (math.random() - 0.5), particle_params._velocity[Y] + particle_params._velocity_variation[Y] * (math.random() - 0.5));

    set_V4f_from_V4f(particle_colour_begin[particle_pool_index], particle_params._colour_begin);
    set_V4f_from_V4f(particle_colour_end[particle_pool_index], particle_params._colour_end);
    set_V4f_from_V4f(particle_colour[particle_pool_index], particle_colour_begin[particle_pool_index]);

    particle_lifetime[particle_pool_index] = particle_params._lifetime;
    particle_lifetime_remaining[particle_pool_index] = particle_lifetime[particle_pool_index];

    particle_size_begin[particle_pool_index] = particle_params._size_begin + particle_params._size_variation * (math.random() - 0.5);
    particle_size_end[particle_pool_index] = particle_params._size_end;
    particle_size[particle_pool_index] = particle_size_begin[particle_pool_index];

    --particle_pool_index;
    if (particle_pool_index < 0)
        particle_pool_index = particle_pool_size - 1;
};

export function emit_simple_particles(particle_params: SimpleParticleParameters, count: number): void
{
    while (--count)
        emit_simple_particle(particle_params);
};