import { gl } from "@graphics/gl";
import { WHITE } from "./colour";

export function push_quad(x: number, y: number, w: number, h: number, colour: number): void
{
  gl._save();
  gl._translate(x, y);
  gl._scale(w, h);
  gl._set_colour(colour);
  gl._push_quad(1, 1, 2, 2, 2, 2);
  gl._restore();
};

export function push_textured_quad(t: Texture, x: number, y: number, parameters: TextureQuadParameters = {}): void 
{
  let horizontal_flip = parameters._horizontal_flip ?? false;
  let vertical_flip = parameters._vertical_flip ?? false;
  let scale = parameters._scale ?? 1;
  let colour = parameters._colour ?? WHITE;

  gl._save();
  gl._translate(x, y);
  gl._save();
  if (horizontal_flip)
  {
    gl._translate(t._w * scale, 0);
    gl._scale(-1, 1);
  }
  if (vertical_flip)
  {
    gl._translate(0, t._h * scale);
    gl._scale(1, -1);
  }

  gl._scale(scale, scale);
  gl._set_colour(colour);
  gl._push_quad(t._w, t._h, t._u0, t._v0, t._u1, t._v1);
  gl._restore();
  gl._restore();
};
