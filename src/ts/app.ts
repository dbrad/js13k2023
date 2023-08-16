import { assert } from "@debug/assert";
import { debug_log } from "@debug/log";
import { initialize_performance_meter, performance_mark, render_performance_meter, tick_performance_meter, toggle_performance_display } from "@debug/performance-meter";
import { INPUT_CONTEXT, init_input } from "@game-input";
import { initialize_input } from "@system-input";
import { gl } from "gl";
import { load_textures } from "texture";
import { load_game, load_options, save_game, save_options } from "./app-state";
import { init_sfx_system, play_sfx } from "./audio/sfx";
import { set_game_state, set_option_state } from "./game-state";
import { register_scene, render_scene, update_scene } from "./scene";
import { combat } from "./scene/combat";
import { initialization_scene } from "./scene/initialize";
import { main_menu } from "./scene/main-menu";
import { run_map } from "./scene/run-map";
import { run_over } from "./scene/run-over";
import { run_start } from "./scene/run-start";
import { initialize_canvas, request_fullscreen } from "./screen";

if (typeof WorkerGlobalScope === "undefined" && typeof self.app === "undefined")
{
    // MAIN THREAD
    let canvas = initialize_canvas();
    let post_message: (...params: any[]) => void;

    function apply_options(options: OptionsState): void
    {

    }

    function message_handler(event: MessageEvent): void
    {
        let cmd = event.data[0];
        switch (cmd)
        {
            case ETM_MSG_ENGINE_READY:
                initialize_input(canvas, post_message);
                let data = load_game();
                post_message([MTE_MSG_SAVE_LOADED, data]);
                break;
            case ETM_MSG_FIRST_INPUT:
                init_sfx_system();
                let options_state = load_options();
                apply_options(options_state);
                post_message([MTE_MSG_SEND_OPTIONS, options_state]);
                break;
            case ETM_MSG_PLAY_SOUND:
                play_sfx(event.data[1]);
                break;
            case ETM_MSG_PLAY_SONG:
                // play music
                break;
            case ETM_MSG_STOP_MUSIC:
                // stop music
                break;
            case ETM_MSG_REQUEST_FULLSCREEN:
                request_fullscreen(canvas);
                break;
            case ETM_MSG_SAVE_GAME:
                let game_state = event.data[1];
                save_game(game_state);
                post_message([MTE_MSG_SAVE_LOADED, game_state]);
                break;
            case ETM_MSG_SAVE_OPTIONS:
                let options = event.data[1];
                save_options(options);
                apply_options(options);
                break;
        }
    }

    let url: string;
    if (DEBUG)
    {
        url = "app.js";
    }
    else
    {
        let script_element = document.querySelector("script");
        assert(script_element !== null, "");
        let blob = new Blob([script_element.textContent ?? ""], { type: "text/javascript" });
        url = window.URL.createObjectURL(blob);
    }

    self.app = 1;

    if (!DISABLE_WEB_WORKER && typeof OffscreenCanvas !== "undefined" && typeof canvas.transferControlToOffscreen === "function")
    {
        // OffscreenCanvas support
        debug_log("OffscreenCanvas supported, running game on worker thread.");
        let offscreen_canvas = canvas.transferControlToOffscreen();
        let game_thread = new Worker(url);

        post_message = game_thread.postMessage.bind(game_thread);
        post_message([MTE_MSG_INIT_ENGINE, offscreen_canvas], [offscreen_canvas]);
        game_thread.addEventListener("message", message_handler);
    }
    else
    {
        // No OffscreenCanvas support
        debug_log("No OffscreenCanvas support, running game on main thread.");
        var script = document.createElement("script");
        script.onload = function ()
        {
            post_message = window.postMessage.bind(window);
            post_message([MTE_MSG_INIT_ENGINE]);
            window.addEventListener("message", message_handler);
        };
        script.src = url;
        document.head.appendChild(script);
    }

    if (DEBUG)
    {
        document.addEventListener("keyup", (e: KeyboardEvent) =>
        {
            if (e.code === "KeyD") post_message([DEBUG_MSG_SHOW_PERFORMANCE]);
        });
    }
}
else
{
    // GAME THREAD
    if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope)
    {
        debug_log("Game running in web worker.");
    }
    else
    {
        debug_log("Game running in main thread.");
    }

    self.addEventListener("message", async event =>
    {
        let cmd = event.data[0];
        switch (cmd)
        {
            case MTE_MSG_INIT_ENGINE:
                let canvas: OffscreenCanvas | HTMLCanvasElement;
                if (event.data[1])
                {
                    canvas = event.data[1];
                }
                else
                {
                    canvas = document.querySelector("canvas")!!;
                }
                await initialize_game_engine(canvas);
                postMessage([ETM_MSG_ENGINE_READY]);
                break;
            case MTE_MSG_INPUT:
                INPUT_CONTEXT._cursor[X] = event.data[1];
                INPUT_CONTEXT._cursor[Y] = event.data[2];

                let is_down = event.data[3];
                if (INPUT_CONTEXT._is_down && !is_down)
                {
                    INPUT_CONTEXT._was_down = true;
                }
                INPUT_CONTEXT._is_down = is_down;
                break;
            case MTE_MSG_SAVE_LOADED:
                set_game_state(event.data[1]);
                break;
            case MTE_MSG_SEND_OPTIONS:
                set_option_state(event.data[1]);
                break;
        }

        if (DEBUG)
        {
            // debug only messages
            switch (cmd)
            {
                case DEBUG_MSG_SHOW_PERFORMANCE:
                    toggle_performance_display();
                    break;
            }
        }
    });

    async function initialize_game_engine(canvas: OffscreenCanvas | HTMLCanvasElement)
    {
        gl._initialize(canvas);
        await load_textures();
        gl._set_clear_colour(0, 0, 0);

        // init_simple_particles();
        // init_text_particles();

        init_input();

        initialize_performance_meter();

        register_scene(initialization_scene);
        register_scene(main_menu);
        register_scene(run_start);
        register_scene(run_map);
        register_scene(combat);
        register_scene(run_over);

        requestAnimationFrame(tick);
    }

    let target_update_ms = 16.66;
    let then = performance.now();
    let delta = 0;
    function tick(now: number)
    {
        performance_mark("start_of_frame");
        requestAnimationFrame(tick);

        performance_mark("update_start");
        let debug_delta = now - then;
        delta += now - then;
        then = now;

        if (delta >= target_update_ms)
        {
            update_scene(delta);
            INPUT_CONTEXT._was_down = false;
            delta = 0;
        }
        performance_mark("update_end");

        performance_mark("render_start");
        gl._begin_render();
        gl._clear();
        render_scene();
        render_performance_meter();
        gl._end_render();
        performance_mark("render_end");

        tick_performance_meter(debug_delta);
    }
}