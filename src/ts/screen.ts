import { assert } from "@debug/assert";

export function initialize_canvas(): HTMLCanvasElement 
{
  document.title = "Game";
  document.body.style.cssText = "margin:0;padding:0;background-color:#000;width:100vw;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;";

  let stage = document.createElement("div");
  stage.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;height:calc(100vw*(9/16));max-height:100vh;width:100vw;";
  document.body.appendChild(stage);

  let canvas = document.createElement("canvas");
  canvas.style.cssText = "height:100%;image-rendering:pixelated;";
  stage.appendChild(canvas);

  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;

  return canvas;
};

export function request_fullscreen(canvas: HTMLCanvasElement): void 
{
  if (document.fullscreenEnabled)
  {
    if (!document.fullscreenElement)
    {
      let body = document.querySelector("body");
      let fullscreen = canvas.requestFullscreen || canvas.mozRequestFullScreen || canvas.webkitRequestFullscreen || canvas.msRequestFullscreen;
      assert(fullscreen !== undefined, "Unable to find a requestFullscreen implementation.");
      fullscreen.call(body);
    }
    else
    {
      document.exitFullscreen();
    }
  }
};