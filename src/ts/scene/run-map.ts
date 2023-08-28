import { INPUT_CONTEXT } from "@game-input";
import { make_cultist } from "@gameplay/enemy-units";
import { generate_new_map } from "@gameplay/generate-map";
import { make_knight } from "@gameplay/player-units";
import { ENEMY_UNITS, GAME_STATE, PLAYER_CARDS, PLAYER_UNITS, reset_combat_state } from "@root/game-state";
import { add_map_node, clear_encounter, set_encounter_id } from "@root/nodes/map-node";
import { create_scene, switch_to_scene } from "@root/scene";
import { floor } from "math";
import { combat } from "./combat";

let map_nodes: number[] = [];

function setup(scene_id: number): void
{
    for (let i = 0; i < 91; i++)
        map_nodes.push(add_map_node(scene_id));
}

function reset_nodes(): void
{
    for (let i = 0; i < 91; i++)
        clear_encounter(map_nodes[i]);
    for (let i = 0; i < 91; i++)
    {
        let col = i % 7;
        let row = floor(i / 7);
        let encounter = GAME_STATE[1]._encounters[GAME_STATE[1]._rows[row][col]];
        if (encounter)
            set_encounter_id(map_nodes[i], encounter._id);
    }
}

function reset(): void
{
    GAME_STATE[1] = generate_new_map();
    reset_nodes();
}

function update(delta: number): void
{
    if (INPUT_CONTEXT._was_down)
    {
        PLAYER_UNITS[0] = make_knight();
        PLAYER_UNITS[1] = make_knight();
        PLAYER_UNITS[2] = make_knight();
        PLAYER_UNITS[3] = make_knight();
        PLAYER_UNITS[4] = make_knight();
        PLAYER_UNITS[5] = make_knight();

        ENEMY_UNITS[0] = make_cultist();
        ENEMY_UNITS[1] = make_cultist();
        ENEMY_UNITS[2] = make_cultist();
        ENEMY_UNITS[3] = make_cultist();
        ENEMY_UNITS[4] = make_cultist();
        ENEMY_UNITS[5] = make_cultist();

        PLAYER_CARDS[0] = { _card_id: CARD_STRIKE, _owner_id: 0 };
        PLAYER_CARDS[1] = { _card_id: CARD_BLOCK, _owner_id: 0 };
        PLAYER_CARDS[2] = { _card_id: CARD_BLOCK, _owner_id: 0 };
        PLAYER_CARDS[3] = { _card_id: CARD_STRIKE, _owner_id: 0 };
        PLAYER_CARDS[4] = { _card_id: CARD_STRIKE, _owner_id: 0 };
        PLAYER_CARDS[5] = { _card_id: CARD_HEAL, _owner_id: 0 };
        PLAYER_CARDS[6] = { _card_id: CARD_STRIKE, _owner_id: 0 };

        reset_combat_state();
        switch_to_scene(combat._id);
    }
}

export let run_map = create_scene(setup, reset, update);