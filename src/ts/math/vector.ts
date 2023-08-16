// V2
export function copy_V2(source: V2): V2
{
  return [source[X], source[Y]];
};

export let set_V2 = (target: V2, x: number, y: number): void =>
{
  target[X] = x;
  target[Y] = y;
};

export let set_V2_from_V2 = (target: V2, source: V2): void =>
{
  target[X] = source[X];
  target[Y] = source[Y];
};

export let add_V2 = (target: V2, x: number, y: number): void =>
{
  target[X] += x;
  target[Y] += y;
};

export let subtract_V2 = (target: V2, x: number, y: number): void =>
{
  target[X] -= x;
  target[Y] -= y;
};

// V3
export let set_V3 = (target: V3, source: V3): void =>
{
  target[X] = source[X];
  target[Y] = source[Y];
  target[Z] = source[Z];
};

// V4
export function v4c(r: number, g: number, b: number, a: number): V4f
{
  return new Float32Array([r, g, b, a]);
}

export let set_V4 = (target: V4, x: number, y: number, z: number, w: number): void =>
{
  target[X] = x;
  target[Y] = y;
  target[Z] = z;
  target[W] = w;
};

export let set_V4_from_V4 = (target: V4, source: V4): void =>
{
  target[X] = source[X];
  target[Y] = source[Y];
  target[Z] = source[Z];
  target[W] = source[W];
};

export let set_V4f_from_V4f = (target: V4f, source: V4f): void =>
{
  target[X] = source[X];
  target[Y] = source[Y];
  target[Z] = source[Z];
  target[W] = source[W];
};