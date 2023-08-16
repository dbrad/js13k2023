type TextureDefinition = [number, number[], number, number, number, number];

type Texture =
    {
        _w: number;
        _h: number;
        _u0: number;
        _v0: number;
        _u1: number;
        _v1: number;
    };

type TextureCache = Texture[];

type Effects =
    {
        _transition: number;
    };

type TextureQuadParameters =
    {
        _horizontal_flip?: boolean;
        _vertical_flip?: boolean;
        _scale?: number;
        _colour?: number;
    };

type TextParameters =
    {
        _horizontal_align?: number,
        _vertical_align?: number,
        _scale?: number,
        _font?: number,
    };

type SimpleParticleParameters =
    {
        _position: V2;
        _velocity: V2;
        _velocity_variation: V2,

        _size_begin: number,
        _size_end: number,
        _size_variation: number,

        _colour_begin: V4f,
        _colour_end: V4f,

        _lifetime: number;
    };

type TextParticleParameters =
    {
        _text: string,
        _position: V2;
        _colour: V4f,
    };