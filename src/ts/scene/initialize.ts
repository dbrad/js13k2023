import { INPUT_CONTEXT } from "@game-input";
import { add_text_node } from "@root/nodes/text";
import { create_scene, switch_to_scene } from "@root/scene";
import { void_fn } from "@root/shared";
import { VERSION } from "@root/version";
import { main_menu } from "./main-menu";

function setup(scene_id: number): void
{
    add_text_node(scene_id, [SCREEN_CENTER_X, SCREEN_CENTER_Y], "touch to start", { _vertical_align: TEXT_ALIGN_MIDDLE, _horizontal_align: TEXT_ALIGN_CENTER, _scale: 3 });
    add_text_node(scene_id, [SCREEN_WIDTH - 5, SCREEN_HEIGHT - 5], VERSION, { _vertical_align: TEXT_ALIGN_BOTTOM, _horizontal_align: TEXT_ALIGN_RIGHT, _font: FONT_SMALL, _scale: 2 });
}

function update(delta: number): void
{
    if (INPUT_CONTEXT._is_down)
    {
        postMessage([ETM_MSG_FIRST_INPUT]);
        switch_to_scene(main_menu._id);
    }
}

export let initialization_scene = create_scene(setup, void_fn, update);