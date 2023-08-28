import { INPUT_CONTEXT } from "@game-input";
import { WHITE } from "@graphics/colour";
import { push_quad } from "@graphics/quad";
import { push_text } from "@graphics/text";
import { COMBAT_STATE, get_card_from_index } from "@root/game-state";
import { node_data_index, node_enabled, node_hover, node_position, node_size, node_tag } from "@root/node";
import { add_node } from "@root/scene";
import { gl } from "gl";

let node_targetable_state: number[] = [];
export function add_unit(scene_id: number, _tag: number = TAG_PLAYER_UNIT): number
{
    let _position: V2 = [0, 0];
    let _size: V2 = [64, 64];
    let _interactive: V4 = [..._position, ..._size];
    let node_id = add_node(scene_id, { _position, _size, _interactive, _tag, _update, _render });
    node_enabled[node_id] = false;
    node_data_index[node_id] = -1;
    return node_id;
}

function _update(node_id: number): void
{
    node_targetable_state[node_id] = TARGET_IGNORE;
    if (COMBAT_STATE[COMBAT_ACTIVE_CARD_INDEX] !== -1)
    {
        let tag = node_tag[node_id];
        let active_card = get_card_from_index(COMBAT_STATE[COMBAT_ACTIVE_CARD_INDEX]);

        if (active_card._target_type === TARGET_ENEMY)
        {
            node_targetable_state[node_id] = (tag === TAG_ENEMY_UNIT ? TARGET_VALID : TARGET_INVALID);
        }
        else if (active_card._target_type === TARGET_HERO)
        {
            node_targetable_state[node_id] = (tag === TAG_PLAYER_UNIT ? TARGET_VALID : TARGET_INVALID);
        }
    }

    if (node_hover[node_id] && !INPUT_CONTEXT._is_down && COMBAT_STATE[COMBAT_ACTIVE_CARD_INDEX] !== -1)
    {
        // todo: I'VE BEEN TARGETED BY A CARD!!!!
        // Tag based targeting
    }
};

function _render(node_id: number): void
{
    let tag = node_tag[node_id];
    let pos = node_position[node_id];
    let size = node_size[node_id];
    let colour = tag === TAG_PLAYER_UNIT ? 0xff229922 : 0xff222299;

    if (node_targetable_state[node_id] === TARGET_VALID)
    {
        push_quad(pos[X], pos[Y], size[X], size[Y], node_hover[node_id] ? WHITE : 0xff114411);
        push_quad(pos[X] + 2, pos[Y] + 2, size[X] - 4, size[Y] - 4, 0xFF111111);
    }

    if (COMBAT_STATE[COMBAT_ACTIVE_CARD_INDEX] === -1 && node_hover[node_id])
    {
        push_quad(pos[X], pos[Y], size[X], size[Y], WHITE);
        push_quad(pos[X] + 2, pos[Y] + 2, size[X] - 4, size[Y] - 4, 0xFF111111);
    }

    push_quad(pos[X] + 16, pos[Y] + 16, 32, 32, colour);
    gl._reset_colour();
    push_text("10/10", pos[X] + 32, pos[Y] + 68, { _scale: 2, _vertical_align: TEXT_ALIGN_TOP, _horizontal_align: TEXT_ALIGN_CENTER });

    if (node_targetable_state[node_id] === TARGET_INVALID)
    {
        // push_quad(pos[X], pos[Y], size[X], size[Y], 0x442222299);
        push_quad(pos[X] + 2, pos[Y] + 2, size[X] - 4, size[Y] - 4, 0xCC000000);
    }
}