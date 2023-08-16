import { push_text } from "@graphics/text";
import { node_position, node_text, node_text_parameters } from "@root/node";
import { add_node } from "@root/scene";

export function add_text_node(scene_id: number, _position: V2, text: string, text_parameters: TextParameters = {}): number
{
    let id = add_node(scene_id, { _position, _tag: TAG_TEXT, _render });

    node_text[id] = text;
    node_text_parameters[id] = text_parameters;

    return id;
};

function _render(id: number): void
{
    let pos = node_position[id];
    push_text(node_text[id], pos[X], pos[Y], node_text_parameters[id]);
}