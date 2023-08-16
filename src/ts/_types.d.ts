type Scene = {
    _id: number,
    _nodes: number[],
    _setup: SetupFunction,
    _reset: ResetFunction,
    _update: UpdateFunction,
    _render: RenderFunction,
};

type NodeParameters = {
    _position: V2,
    _size?: V2,
    _tag: number,
    _interactive?: V4,
    _render: NodeRenderFunction,
    _update?: NodeUpdateFunction;
};

type OptionsState = [];

type GameState = [
    MetaGameState,
    CurrentGameState,
];

type MetaGameState = [
    number, // STORY_PROGRESS
];

type CurrentGameState = [
    number, // SEED
];

type SetupFunction = (scene_id: number) => void;
type ResetFunction = () => void;

type UpdateFunction = (delta: number) => void;
type RenderFunction = () => void;

type NodeUpdateFunction = (id: number, delta: number) => void;
type NodeRenderFunction = (id: number) => void;