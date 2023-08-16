import { request_fullscreen } from "@root/screen";
import { floor } from "math";

let canvas_ref: HTMLCanvasElement;
let post_message: (...params: any[]) => void;

let sys_cursor_x: number = 0;
let sys_cursor_y: number = 0;
let sys_mouse_down: boolean = false;

let is_touch_event = (e: Event | PointerEvent | TouchEvent): e is TouchEvent =>
{
    return (e.type[0] === `t`);
};

function pointer_move(e: PointerEvent | TouchEvent): void
{
    let canvas_bounds = canvas_ref.getBoundingClientRect();
    let client_x: number = 0;
    let client_y: number = 0;

    if (is_touch_event(e))
    {
        let touch: Touch = e.touches[0];
        client_x = touch.clientX;
        client_y = touch.clientY;
    }
    else 
    {
        client_x = e.clientX;
        client_y = e.clientY;
    }

    sys_cursor_x = floor((client_x - canvas_bounds.left) / (canvas_bounds.width / SCREEN_WIDTH));
    sys_cursor_y = floor((client_y - canvas_bounds.top) / (canvas_bounds.height / SCREEN_HEIGHT));

    send_input();
};

function pointer_down(e: PointerEvent | TouchEvent): void
{
    if (is_touch_event(e))
    {
        if (!document.fullscreenElement) request_fullscreen(canvas_ref);
        let canvas_bounds = canvas_ref.getBoundingClientRect();
        let touch: Touch = e.touches[0];
        sys_cursor_x = floor((touch.clientX - canvas_bounds.left) / (canvas_bounds.width / SCREEN_WIDTH));
        sys_cursor_y = floor((touch.clientY - canvas_bounds.top) / (canvas_bounds.height / SCREEN_HEIGHT));
    }

    sys_mouse_down = true;
    send_input();
};

function pointer_up(e: PointerEvent | TouchEvent): void
{
    sys_mouse_down = false;
    send_input();
};

function send_input(): void
{
    post_message([MTE_MSG_INPUT, sys_cursor_x, sys_cursor_y, sys_mouse_down]);
}

export function initialize_input(canvas: HTMLCanvasElement, message_fn: (...params: any[]) => void)
{
    canvas_ref = canvas;
    post_message = message_fn;

    document.addEventListener("pointermove", pointer_move);
    document.addEventListener("touchmove", pointer_move);

    canvas.addEventListener("pointerdown", pointer_down);
    canvas.addEventListener("touchstart", pointer_down);

    canvas.addEventListener("pointerup", pointer_up);
    canvas.addEventListener("touchend", pointer_up);
};