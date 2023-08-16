import { INPUT_CONTEXT } from "@game-input";
import { gl } from "gl";
import { create_node, node_input, render_nodes, update_nodes } from "./node";

export let TRANSITION_TIME = 1050;
export let TRANSITION_TIME_HALF = 500;
export let TRANSITION_TIME_HALFWAY = 600;

let current_scene_id: number = -1;
let target_scene_id: number = -1;
let scene_stack: number[] = [];
let scenes: Scene[] = [];
let transition_in_progress: boolean = false;
let next_scene_id: number = 0;

export function create_scene(_setup: SetupFunction, _reset: ResetFunction, _update: UpdateFunction, _render: RenderFunction): Scene
{
    return {
        _id: -1,
        _nodes: [],
        _setup,
        _reset,
        _update,
        _render
    };
}

export function register_scene(scene: Scene): void
{
    let id = next_scene_id++;
    scene._id = id;
    scenes[id] = scene;

    scene._setup(id);

    if (current_scene_id == -1)
    {
        current_scene_id = id;
        scene_stack[0] = id;
    }
}

export function add_node(scene_id: number, parameters: NodeParameters): number
{
    let node_id = create_node(parameters);
    scenes[scene_id]._nodes.push(node_id);
    return node_id;
}

export function push_sub_scene(scene_id: number): void
{
    scene_stack.push(scene_id);
    current_scene_id = scene_stack[scene_stack.length - 1];
}

export function pop_sub_scene(): void
{
    scene_stack.pop();
    current_scene_id = scene_stack[scene_stack.length - 1];
}

export function switch_to_scene(scene_id: number): void
{
    target_scene_id = scene_id;
    scenes[scene_id]._reset();

    gl._effects._transition = TRANSITION_TIME;
    transition_in_progress = true;
}

export function update_scene(delta: number): void
{
    if (transition_in_progress || gl._effects._transition > 0)
    {
        gl._effects._transition -= delta;
        if (gl._effects._transition <= 0)
        {
            gl._effects._transition = 0;
            transition_in_progress = false;
        }
        else if (gl._effects._transition < TRANSITION_TIME_HALFWAY)
        {
            current_scene_id = target_scene_id;
            scene_stack.length = 0;
            scene_stack[0] = current_scene_id;
        }
    }

    if (!transition_in_progress)
    {
        INPUT_CONTEXT._enabled = true;
    }
    else
    {
        INPUT_CONTEXT._was_down = false;
        INPUT_CONTEXT._enabled = false;
    }

    node_input(scenes[current_scene_id]._nodes);

    for (let i = 0, len = scene_stack.length; i < len; i++)
    {
        let scene_id = scene_stack[i];
        let scene = scenes[scene_id];
        scene._update(delta);
        update_nodes(scene._nodes, delta);
    }

    // update_simple_particles(delta);
    // update_text_particles(delta);
}

export function render_scene(): void
{
    for (let i = 0, len = scene_stack.length; i < len; i++)
    {
        let scene_id = scene_stack[i];
        let scene = scenes[scene_id];
        scene._render();
        render_nodes(scene._nodes);
    }
    // render_simple_particles();
    // render_text_particles(t);
}