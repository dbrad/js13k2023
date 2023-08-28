import { INPUT_CONTEXT } from "@game-input";
import { WHITE } from "@graphics/colour";
import { push_quad } from "@graphics/quad";
import { COMBAT_STATE, ENEMY_UNITS, PLAYER_CARDS, PLAYER_UNITS } from "@root/game-state";
import { move_node, node_position, set_node_data_index } from "@root/node";
import { add_card } from "@root/nodes/card";
import { add_unit } from "@root/nodes/unit";
import { add_node, create_scene } from "@root/scene";
import { pointOnQuadraticBezier as point_on_quadratic_bezier } from "math";

let player_unit_pool: number[] = [];
let enemy_unit_pool: number[] = [];
let card_pool: number[] = [];
function setup(scene_id: number): void
{
    for (let i = 0; i < 10; i++)
    {
        player_unit_pool.push(add_unit(scene_id));
        enemy_unit_pool.push(add_unit(scene_id, TAG_ENEMY_UNIT));
    }

    for (let i = 0; i < 50; i++)
    {
        card_pool.push(add_card(scene_id));
    }

    add_node(scene_id, {
        _position: [0, 0],
        _tag: 0,
        _render: (node_id: number) =>
        {
            let index = COMBAT_STATE[COMBAT_ACTIVE_CARD_INDEX];
            let cursor = INPUT_CONTEXT._cursor;
            if (index !== -1 && cursor[Y] < SCREEN_HEIGHT - 184)
            {
                let card_pos = node_position[card_pool[index]];
                const p0: V2 = [card_pos[X] + 46, card_pos[Y] - 24];
                const p1: V2 = [card_pos[X] + 46, cursor[Y] + (card_pos[Y] - cursor[Y]) / 2];
                const p2: V2 = [cursor[X] + 1, cursor[Y] + 3];
                for (let t: number = 0; t <= 0.9; t += 0.1)
                {
                    push_quad(...point_on_quadratic_bezier(p0, p1, p2, t), 4, 4, WHITE);
                }
            }
        }
    });
}

function reset(): void
{
    for (let i = 0; i < 10; i++)
    {
        set_node_data_index(player_unit_pool[i], PLAYER_UNITS[i] ? i : -1);
        set_node_data_index(enemy_unit_pool[i], ENEMY_UNITS[i] ? i : -1);
    }

    for (let i = 0; i < 50; i++)
    {
        set_node_data_index(card_pool[i], PLAYER_CARDS[i] ? i : -1);
    }
}
function update(delta: number): void
{
    // Arrange Units
    for (let i = 0; i < 6; i += 3)
    {
        let row = i / 3;
        move_node(player_unit_pool[i + 1], SCREEN_CENTER_X - (row * 150) - 256 - 32, 100);
        move_node(enemy_unit_pool[i + 1], SCREEN_CENTER_X + (row * 150) + 256, 100);

        move_node(player_unit_pool[i], SCREEN_CENTER_X - (row * 150) - 288 - 32, 250);
        move_node(enemy_unit_pool[i], SCREEN_CENTER_X + (row * 150) + 288, 250);

        move_node(player_unit_pool[i + 2], SCREEN_CENTER_X - (row * 150) - 320 - 32, 400);
        move_node(enemy_unit_pool[i + 2], SCREEN_CENTER_X + (row * 150) + 320, 400);
    }
    // Figure out unit formations

    // Arrange Cards
    // Do I want card draws to be animated
    let num_cards = PLAYER_CARDS.length;
    let card_start_x = SCREEN_CENTER_X - (48 * num_cards + 4 * (num_cards - 1));
    for (let i = 0; i < num_cards; i++)
    {
        move_node(card_pool[i], card_start_x + (104 * i), SCREEN_HEIGHT - 160);
    }

    if (COMBAT_STATE[COMBAT_ACTIVE_CARD_INDEX] !== -1)
    {
        // TODO: Show tooltip
    }
}

export let combat = create_scene(setup, reset, update);