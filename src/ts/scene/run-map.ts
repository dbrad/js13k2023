import { INPUT_CONTEXT } from "@game-input";
import { generate_new_map } from "@gameplay/generate-map";
import { WHITE } from "@graphics/colour";
import { push_quad } from "@graphics/quad";
import { create_scene } from "@root/scene";
import { void_fn } from "@root/shared";
import { pointOnQuadraticBezier } from "math";

let map: RunMap;

function setup(scene_id: number): void
{
    map = generate_new_map();
}

function update(delta: number): void
{
    if (INPUT_CONTEXT._was_down)
    {
        map = generate_new_map();
    }
}

function render(): void
{
    for (let r = 0, r_len = map._rows.length; r < r_len; r++)
    {
        let row = map._rows[r];
        for (let c = 0, c_len = row.length; c < c_len; c++)
        {
            let node = map._encounters[map._rows[r][c]];
            if (node)
            {
                let node_x = 32 + node._row * 96;
                let node_y = 32 + node._column * 96;
                for (let i of node._from_edges)
                {
                    let other_node = map._encounters[i];
                    let other_node_x = 32 + other_node._row * 96;
                    let other_node_y = 32 + other_node._column * 96;
                    for (let t = 0; t <= 1; t += 0.1)
                    {
                        let pt = pointOnQuadraticBezier([node_x + 16, node_y + 16], [node_x + 16, other_node_y + 16], [other_node_x + 34, other_node_y + 16], t);
                        push_quad(pt[X] - 2, pt[Y] - 2, 4, 4, 0xff444444);
                    }
                }
                push_quad(node_x, node_y, 32, 32, WHITE);
            }
        }
    }
}

export let run_map = create_scene(setup, void_fn, update, render);