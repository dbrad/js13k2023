import { new_game_state } from "@root/game-state";
import { node_fired } from "@root/node";
import { add_button_node } from "@root/nodes/button";
import { add_text_node } from "@root/nodes/text";
import { create_scene, switch_to_scene } from "@root/scene";
import { void_fn } from "@root/shared";
import { VERSION } from "@root/version";
import { run_map } from "./run-map";

let new_game_button: number;
let continue_button: number;
function setup(scene_id: number): void
{
    add_text_node(scene_id, [SCREEN_WIDTH - 50, 250], "The Lost|Crusades", { _vertical_align: TEXT_ALIGN_MIDDLE, _horizontal_align: TEXT_ALIGN_RIGHT, _font: FONT_SMALL, _scale: 12 });
    add_text_node(scene_id, [SCREEN_WIDTH - 5, SCREEN_HEIGHT - 5], VERSION, { _vertical_align: TEXT_ALIGN_BOTTOM, _horizontal_align: TEXT_ALIGN_RIGHT, _font: FONT_SMALL, _scale: 2 });
    new_game_button = add_button_node(scene_id, [0, SCREEN_HEIGHT - 100], [480, 60], "new run");
    continue_button = add_button_node(scene_id, [0, SCREEN_HEIGHT - 180], [480, 60], "continue");
}

function update(delta: number): void
{
    if (node_fired[continue_button])
    {
        new_game_state();
        switch_to_scene(run_map._id);
    }
    if (node_fired[new_game_button])
    {
        new_game_state();
        switch_to_scene(run_map._id);
    }
}

export let main_menu = create_scene(setup, void_fn, update);