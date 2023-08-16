import { INPUT_CONTEXT } from "@game-input";
import { is_point_in_rect } from "math";

export let node_position: V2[] = [];
export let node_size: V2[] = [];
export let node_tag: number[] = [];
export let node_interactive: V4[] = [];
export let node_render: NodeRenderFunction[] = [];
export let node_update: NodeUpdateFunction[] = [];
export let node_hover: boolean[] = [];
export let node_active: boolean[] = [];
export let node_fired: boolean[] = [];
export let node_text: string[] = [];
export let node_text_parameters: TextParameters[] = [];

let next_node_id = 0;
export function create_node(parameters: NodeParameters): number
{
    let id = next_node_id++;

    node_position[id] = parameters._position;

    if (parameters._size)
        node_size[id] = parameters._size;

    node_tag[id] = parameters._tag;
    if (parameters._interactive)
        node_interactive[id] = parameters._interactive;

    node_render[id] = parameters._render;

    if (parameters._update)
        node_update[id] = parameters._update;

    node_hover[id] = false;
    node_active[id] = false;
    node_fired[id] = false;

    return id;
}

export function update_nodes(node_ids: number[], delta: number): void
{
    for (let i = 0, len = node_ids.length; i < len; i++)
    {
        let node_id = node_ids[i];
        if (node_update[node_id])
            node_update[node_id](node_id, delta);
    }
}

export function render_nodes(node_ids: number[]): void
{
    for (let i = 0, len = node_ids.length; i < len; i++)
    {
        let node_id = node_ids[i];
        if (node_render[node_id])
            node_render[node_id](node_id);
    }
}

export function node_movement(node_ids: number[]): void
{

}

export function node_input(node_ids: number[]): void
{
    let [cursor_x, cursor_y] = INPUT_CONTEXT._cursor;
    let mouse_down = INPUT_CONTEXT._is_down;

    for (let i = 0, len = node_ids.length; i < len; i++)
    {
        let node_id = node_ids[i];
        let interactive = node_interactive[node_id];
        if (interactive)
        {
            node_fired[node_id] = false;

            let [x, y, w, h] = interactive;
            if (is_point_in_rect(cursor_x, cursor_y, x, y, w, h))
            {
                node_hover[node_id] = true;
                if (node_active[node_id] && !mouse_down)
                {
                    if (node_hover[node_id])
                    {
                        node_fired[node_id] = true;
                    }
                    node_active[node_id] = false;
                }
                else if (node_hover[node_id] && mouse_down)
                {
                    node_active[node_id] = true;
                }
            }
            else
            {
                node_active[node_id] = false;
                node_hover[node_id] = false;
            }
        }
    }
}