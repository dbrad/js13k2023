export function v4f_to_abgr_value(colour: V4f): number
{
  let out = (0 | (colour[3] * 255 & 0xff)) << 8 >>> 0;
  out = (out | (colour[2] * 255 & 0xff)) << 8 >>> 0;
  out = (out | (colour[1] * 255 & 0xff)) << 8 >>> 0;
  out = (out | (colour[0] * 255 & 0xff)) >>> 0;
  return out;
};

export let WHITE: number = 0xffffffff;