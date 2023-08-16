import { assert } from "@debug/assert";
import { gl } from "gl";
import { floor } from "math";
import { TEXTURE_CACHE } from "texture";

export let character_code_map: { [key: string]: number; } = {};
let font_sizes: { [key: number]: number; } = { [FONT_NORMAL]: 8, [FONT_SMALL]: 5 };
let font_texture_offsets: { [key: number]: number; } = { [FONT_NORMAL]: 100, [FONT_SMALL]: 200 };
let font_letter_gap: { [key: number]: number; } = { [FONT_NORMAL]: 0, [FONT_SMALL]: 1 };

export function push_text(text: string | number, x: number, y: number, parameters: TextParameters = {}): void
{
  text = (text + "").toUpperCase();
  let horizontal_align: number = parameters._horizontal_align ?? TEXT_ALIGN_LEFT;
  let vertical_align: number = parameters._vertical_align ?? TEXT_ALIGN_TOP;
  let scale: number = parameters._scale ?? 1;
  let font_id: number = parameters._font ?? FONT_NORMAL;

  let font_texture_offset: number = font_texture_offsets[font_id];
  let letter_gap: number = font_letter_gap[font_id] * scale;
  let letter_size: number = font_sizes[font_id] * scale;

  let letter_jump = letter_size + letter_gap;
  let line_jump = letter_size + (scale * 2);

  let lines = text.split("|");
  let line_count = lines.length;
  let total_height = (letter_size * line_count) + ((scale * 2) * (line_count - 1));

  let x_offset: number = 0;
  let y_offset: number = vertical_align === TEXT_ALIGN_MIDDLE ? floor(total_height / 2) : vertical_align === TEXT_ALIGN_BOTTOM ? total_height : 0;

  let alignment_offset: number = 0;
  let character_count: number = 0;
  let line_length: number = 0;

  for (let line of lines)
  {
    character_count = line.length;
    line_length = (character_count * letter_size) + ((character_count - 1) * letter_gap);

    if (horizontal_align === TEXT_ALIGN_CENTER)
      alignment_offset = floor(line_length / 2);
    else if (horizontal_align === TEXT_ALIGN_RIGHT)
      alignment_offset = floor(line_length);

    for (let letter of line)
    {
      if (letter !== " ")
      {
        assert(character_code_map[letter] !== undefined, `Undefined character ${letter} used.`);
        let t = TEXTURE_CACHE[font_texture_offset + character_code_map[letter]];

        gl._save();
        gl._translate(x + x_offset - alignment_offset, y - y_offset);
        gl._scale(scale, scale);
        gl._push_quad(t._w, t._h, t._u0, t._v0, t._u1, t._v1);
        gl._restore();
      }
      x_offset += letter_jump;
    }
    y += line_jump;
    x_offset = 0;
  }
};