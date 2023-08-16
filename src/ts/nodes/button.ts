import { WHITE } from "@graphics/colour";
import { push_quad } from "@graphics/quad";
import { push_text } from "@graphics/text";
import { node_active, node_hover, node_position, node_size, node_text } from "@root/node";
import { add_node } from "@root/scene";
import { gl } from "gl";

export function add_button_node(scene_id: number, _position: V2, _size: V2, text: string): number
{
    let _interactive: V4 = [..._position, ..._size];
    let id = add_node(scene_id, { _position, _size, _interactive, _tag: TAG_BUTTON, _render });
    node_text[id] = text;
    return id;
}

function _render(id: number): void
{
    let pos = node_position[id];
    let size = node_size[id];
    let colour = 0xff222222;
    if (node_hover[id])
    {
        colour = 0xff333333;
    }
    if (node_active[id])
    {
        colour = 0xff111111;
    }
    push_quad(pos[X], pos[Y], size[X], size[Y], colour);
    gl._set_colour(WHITE);
    push_text(node_text[id], pos[X] + size[X] - 22, pos[Y] + size[Y] / 2, { _vertical_align: TEXT_ALIGN_MIDDLE, _horizontal_align: TEXT_ALIGN_RIGHT, _scale: 2 });
}