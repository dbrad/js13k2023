import { node_enabled } from "@root/node";
import { add_node } from "@root/scene";

export function add_tooltip(scene_id: number, _position: V2): number
{
    let _size: V2 = [64, 64];
    let _interactive: V4 = [..._position, ..._size];
    let node_id = add_node(scene_id, { _position, _size, _interactive, _render });
    node_enabled[node_id] = false;
    return node_id;
}

function _render(node_id: number): void
{
    // TOOLTIP RENDER BASED ON: active card, active tooltip card and active tooltip unit
}