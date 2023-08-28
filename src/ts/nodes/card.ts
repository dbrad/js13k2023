import { INPUT_CONTEXT } from "@game-input";
import { push_quad } from "@graphics/quad";
import { push_text } from "@graphics/text";
import { COMBAT_STATE, get_card_from_index } from "@root/game-state";
import { node_active, node_data_index, node_enabled, node_hover, node_position, node_size } from "@root/node";
import { add_node } from "@root/scene";
import { gl } from "gl";

export function add_card(scene_id: number): number
{
    let _position: V2 = [0, 0];
    let _size: V2 = [96, 144];
    let _interactive: V4 = [..._position, ..._size];
    let node_id = add_node(scene_id, { _position, _size, _interactive, _tag: TAG_CARD, _render, _update });
    node_enabled[node_id] = false;
    node_data_index[node_id] = -1;
    return node_id;
}

function _update(id: number): void
{
    if (node_active[id] && COMBAT_STATE[COMBAT_ACTIVE_CARD_INDEX] === -1)
    {
        COMBAT_STATE[COMBAT_ACTIVE_CARD_INDEX] = node_data_index[id];
    }

    if (!INPUT_CONTEXT._is_down && COMBAT_STATE[COMBAT_ACTIVE_CARD_INDEX] === node_data_index[id])
    {
        COMBAT_STATE[COMBAT_ACTIVE_CARD_INDEX] = -1;
    }
}

function _render(id: number): void
{
    let card = get_card_from_index(node_data_index[id]);
    let pos = node_position[id];
    let y_off = 0;
    let size = node_size[id];
    if (node_hover[id])
    {
        y_off = 8;
    }
    if (COMBAT_STATE[COMBAT_ACTIVE_CARD_INDEX] === node_data_index[id] || (node_active[id] && COMBAT_STATE[COMBAT_ACTIVE_CARD_INDEX] === -1))
    {
        y_off = 16;
    }
    push_quad(pos[X], pos[Y] - y_off, size[X], size[Y], 0xffdcf5f5);
    push_quad(pos[X] + 2, pos[Y] + 2 - y_off, size[X] - 4, size[Y] - 4, 0xFF000000);
    gl._reset_colour();
    push_text(card._name, pos[X] + 48, pos[Y] + 5 - y_off, { _vertical_align: TEXT_ALIGN_TOP, _horizontal_align: TEXT_ALIGN_CENTER });

}