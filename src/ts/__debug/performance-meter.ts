import { INPUT_CONTEXT } from "@game-input";
import { push_quad } from "@graphics/quad";
import { push_text } from "@graphics/text";
import { gl } from "gl";

let frame_count: number = 0;
let fps: number = 60;
let ms: number = 1000 / fps;
let update_time = 0;
let render_time = 0;

let average_frame_time = 0;
let average_update_time = 0;
let average_render_time = 0;

let display_ms = 0;
let display_frame_time = 0;
let display_update_time = 0;
let display_render_time = 0;

let next_fps_time: number = 0;
let FPS_INTERVAL = 1000;

let next_display_time: number = 0;
let DISPLAY_INTERVAL = 100;

let show_performance = false;

export function initialize_performance_meter(): void
{
  if (DEBUG)
  {
    show_performance = false;
  }
}

export function toggle_performance_display(): void
{
  if (DEBUG)
  {
    show_performance = !show_performance;
  }
}

let background_01: number = 0xf0000000;

let graph_01: number = 0xff755a56;
let graph_02: number = 0xffbeb7c6;

export function render_performance_meter(): void
{
  if (DEBUG)
    if (show_performance)
    {
      push_quad(0, 0, SCREEN_WIDTH, 80, background_01);

      gl._reset_colour();
      push_text(`fps ${fps.toFixed(0).padStart(7, " ")} hz`, SCREEN_WIDTH - 5, 5, { _horizontal_align: TEXT_ALIGN_RIGHT, _font: FONT_SMALL, _scale: 2 });
      push_text(`frame ${display_ms.toFixed(3).padStart(7, " ")} ms`, SCREEN_WIDTH - 5, 18, { _horizontal_align: TEXT_ALIGN_RIGHT, _font: FONT_SMALL, _scale: 2 });
      push_text(`actual ${display_frame_time.toFixed(3).padStart(7, " ")} ms`, SCREEN_WIDTH - 5, 31, { _horizontal_align: TEXT_ALIGN_RIGHT, _font: FONT_SMALL, _scale: 2 });

      gl._set_colour(graph_02);
      push_text(`update ${display_update_time.toFixed(3).padStart(7, " ")} ms`, SCREEN_WIDTH - 5, 44, { _horizontal_align: TEXT_ALIGN_RIGHT, _font: FONT_SMALL, _scale: 2 });

      gl._set_colour(graph_01);
      push_text(`render ${display_render_time.toFixed(3).padStart(7, " ")} ms`, SCREEN_WIDTH - 5, 57, { _horizontal_align: TEXT_ALIGN_RIGHT, _font: FONT_SMALL, _scale: 2 });

      gl._reset_colour();
      push_text(`x ${INPUT_CONTEXT._cursor[X].toFixed(0).padStart(4, " ")} px`, SCREEN_WIDTH - 240, 5, { _horizontal_align: TEXT_ALIGN_RIGHT, _font: FONT_SMALL, _scale: 2 });
      push_text(`y ${INPUT_CONTEXT._cursor[Y].toFixed(0).padStart(4, " ")} px`, SCREEN_WIDTH - 240, 18, { _horizontal_align: TEXT_ALIGN_RIGHT, _font: FONT_SMALL, _scale: 2 });
      push_text(`c ${(INPUT_CONTEXT._is_down + "").padStart(7, " ")}`, SCREEN_WIDTH - 240, 31, { _horizontal_align: TEXT_ALIGN_RIGHT, _font: FONT_SMALL, _scale: 2 });

      // let total_particles = active_text_particles.size + active_simple_particles.size;
      // push_text(t, `active particles ${total_particles.toFixed(0).padStart(4, " ")}`, SCREEN_WIDTH - 240, 57, { _horizontal_align: TEXT_ALIGN_RIGHT, _font: FONT_SMALL, _scale: 2 });
    }
}

export function tick_performance_meter(delta: number): void
{
  if (DEBUG)
  {
    let frame_start_time = performance.getEntriesByName("start_of_frame", "mark")[0].startTime;
    performance.measure("frame", "start_of_frame");
    let frame_duration_time = performance.getEntriesByName("frame")[0].duration;

    // MS
    ms = (0.9 * delta) + (0.1 * ms);
    average_frame_time = (0.9 * frame_duration_time) + (0.1 * average_frame_time);
    if (average_frame_time < 0) average_frame_time = 0;

    if (ms > 250)
    {
      fps = 0;
      ms = 0;
      average_frame_time = 0;
      average_update_time = 0;
      average_render_time = 0;
    }

    // FPS
    if (frame_start_time >= next_fps_time)
    {
      let last_update_time = next_fps_time - FPS_INTERVAL;
      let current_fps = frame_count * 1000;
      let actual_duration = frame_start_time - last_update_time;
      fps = (0.9 * (current_fps / actual_duration)) + (0.1 * fps);
      frame_count = 0;
      next_fps_time = frame_start_time + FPS_INTERVAL;
    }
    frame_count++;

    // UPDATE + RENDER
    performance.measure("update", "update_start", "update_end");
    performance.measure("render", "render_start", "render_end");

    update_time = performance.getEntriesByName("update")[0].duration;
    render_time = performance.getEntriesByName("render")[0].duration;

    average_update_time = (0.9 * update_time) + (0.1 * average_update_time);
    average_render_time = (0.9 * render_time) + (0.1 * average_render_time);

    performance.clearMeasures();
    performance.clearMarks();

    // DISPLAY VALUES
    if (frame_start_time > next_display_time)
    {
      display_ms = ms;
      display_frame_time = average_frame_time;
      display_update_time = average_update_time;
      display_render_time = average_render_time;

      next_display_time = frame_start_time + DISPLAY_INTERVAL;
    }
  }
}

export let performance_mark = (markName: string): void =>
{
  if (DEBUG)
    performance.mark(markName);
};