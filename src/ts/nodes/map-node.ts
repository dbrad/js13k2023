import { WHITE } from "@graphics/colour";
import { push_quad } from "@graphics/quad";
import { GAME_STATE } from "@root/game-state";
import { node_enabled, node_hover, node_interactive, node_position } from "@root/node";
import { add_node } from "@root/scene";
import { pointOnQuadraticBezier, rand_int } from "math";

export let node_encounter_id: number[] = [];
let encounter_node_id: number[] = [];
export function add_map_node(scene_id: number): number
{
    let _position: V2 = [-48, -48];
    let _size: V2 = [32, 32];
    let _interactive: V4 = [..._position, ..._size];

    let node_id = add_node(scene_id, { _position, _size, _interactive, _tag: TAG_BUTTON, _render });
    node_enabled[node_id] = false;
    node_encounter_id[node_id] = -1;
    return node_id;
}

export function clear_encounter(node_id: number): void
{
    let encounter_id = node_encounter_id[node_id];
    encounter_node_id[encounter_id] = -1;
    node_enabled[node_id] = false;
    node_encounter_id[node_id] = -1;
}

export function set_encounter_id(node_id: number, encounter_id: number): void
{
    encounter_node_id[encounter_id] = node_id;

    node_enabled[node_id] = true;
    node_encounter_id[node_id] = encounter_id;

    let encounter = GAME_STATE[1]._encounters[encounter_id];
    let pos = [32 + encounter._row * 96 + rand_int(-10, 10), 32 + encounter._column * 96 + rand_int(-10, 10)];
    if (encounter._row === 12)
        node_position[node_id][X] = node_interactive[node_id][X] = (pos[X] + 32);
    else
        node_position[node_id][X] = node_interactive[node_id][X] = pos[X];
    node_position[node_id][Y] = node_interactive[node_id][Y] = pos[Y];
}

function _render(node_id: number): void
{
    let colour = 0xff444444;
    if (node_hover[node_id])
        colour = WHITE;

    let encounter_id = node_encounter_id[node_id];
    let encounter = GAME_STATE[1]._encounters[encounter_id];
    if (encounter)
    {
        let [encounter_x, encounter_y] = node_position[node_id];
        for (let other_encounter_id of encounter._to_edges)
        {
            let other_node_id = encounter_node_id[other_encounter_id];
            let [other_encounter_x, other_encounter_y] = node_position[other_node_id];
            let half_x = ((other_encounter_x + 16) - (encounter_x + 16)) / 2 + encounter_x + 16;
            let half_y = ((other_encounter_y + 16) - (encounter_y + 16)) / 2 + encounter_y + 16;
            for (let t = 0; t <= 1; t += 0.1)
            {
                let pt = pointOnQuadraticBezier([encounter_x + 16, encounter_y + 16], [half_x, half_y], [other_encounter_x + 16, other_encounter_y + 16], t);
                push_quad(pt[X] - 2, pt[Y] - 2, 4, 4, colour);
            }
        }
        push_quad(encounter_x, encounter_y, 32, 32, colour);
    }
}