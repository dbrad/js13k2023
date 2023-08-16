import { assert } from "@debug/assert";
import { character_code_map } from "@graphics/text";
import texture_atlas_data_url from "@res/sheet.webp";
import { gl } from "gl";
import { texture_definitions } from "./texture-definitions";

export let TEXTURE_CACHE: TextureCache = [];

function make_texture(_w: number, _h: number, _u0: number, _v0: number, _u1: number, _v1: number): Texture
{
  return { _w, _h, _u0, _v0, _u1, _v1 };
};

export async function load_textures(): Promise<void>
{
  return new Promise(async (resolve) =>
  {
    let response = await fetch(texture_atlas_data_url);
    let blob = await response.blob();
    let image_bitmap = await createImageBitmap(blob);

    assert(ATLAS_WIDTH === image_bitmap.width, `ATLAS WIDTH CHANGED (expected: ${ATLAS_WIDTH} actual: ${image_bitmap.width})`);
    assert(ATLAS_HEIGHT === image_bitmap.height, `ATLAS HEIGHT CHANGED (expected: ${ATLAS_HEIGHT} actual: ${image_bitmap.height})`);

    let canvas = new OffscreenCanvas(ATLAS_WIDTH, ATLAS_HEIGHT);
    canvas.getContext("2d")?.drawImage(image_bitmap, 0, 0);
    gl._upload_atlas(canvas);

    for (let texture of texture_definitions)
    {
      let [def_type, id, x, y, w, h] = texture;
      if (def_type === TEXTURE_TYPE_FONT)
      {
        for (let i: number = 33; i <= 96; i++)
        {
          let font_offset = (id[0] + 1) * 100;
          character_code_map[String.fromCharCode(i)] = i;
          let offset_x = x + (i - 33) * w;
          TEXTURE_CACHE[font_offset + i] = make_texture(w, h, offset_x / ATLAS_WIDTH, y / ATLAS_HEIGHT, (offset_x + w) / ATLAS_WIDTH, (y + h) / ATLAS_HEIGHT);
        }
      }
      else if (def_type === TEXTURE_TYPE_SPRITE)
      {
        TEXTURE_CACHE[id[0]] = make_texture(w, h, x / ATLAS_WIDTH, y / ATLAS_HEIGHT, (x + w) / ATLAS_WIDTH, (y + h) / ATLAS_HEIGHT);
      }
      else // TEXTURE_TYPE_SPRITE_STRIP
      {
        for (let offset_x: number = x, i: number = 0; offset_x < ATLAS_WIDTH; offset_x += w)
          TEXTURE_CACHE[id[i++]] = make_texture(w, h, offset_x / ATLAS_WIDTH, y / ATLAS_HEIGHT, (offset_x + w) / ATLAS_WIDTH, (y + h) / ATLAS_HEIGHT);
      }
    }
    resolve();
  });
};