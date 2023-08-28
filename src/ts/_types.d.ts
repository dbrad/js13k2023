type Scene = {
    _id: number,
    _nodes: number[],
    _setup: SetupFunction,
    _reset: ResetFunction,
    _update: UpdateFunction,
};

type NodeParameters = {
    _position: V2,
    _size?: V2,
    _tag?: number,
    _interactive?: V4,
    _render: NodeRenderFunction,
    _update?: NodeUpdateFunction;
};

type OptionsState = [];

type PlayerUnit = {
    _hp: number,
    _max_hp: number,
    _buffs: [number, number][],
    _debuffs: [number, number][],
    _xp: number,
    _max_xp: number,
    _level: number,
    _type: number,
};

type EnemyUnit = {
    _hp: number,
    _max_hp: number,
    _buffs: [number, number][],
    _debuffs: [number, number][],
    _type: number,
    _xp_value: number,
    _ai_pattern: number[], // AI Intents
    _ai_index: number, // Current AI action
    _options: [number, number][], // Effect + Value combinations
    _intent: [number, number][], // option index + target id (-1 for all)
};

type Card = {
    _name: string,
    _target_type: number,
    _card_effects: [number, number][],
};

type PlayerCard = {
    _card_id: number,
    _owner_id: number,
};

type GameState = [
    MetaGameState,
    CurrentGameState,
];

type MetaGameState = [
    number, // STORY_PROGRESS
];

type CurrentGameState = [
    number, // SEED
    RunMap,
    number, // Current encounter id
];

type CombatState = [
    number, // COMBAT_ACTIVE_CARD_INDEX
    number, // COMBAT_ACTIVE_TOOLTIP_CARD
    number, // COMBAT_ACTIVE_TOOLTIP_UNIT
];

type SetupFunction = (scene_id: number) => void;
type ResetFunction = () => void;

type UpdateFunction = (delta: number) => void;
type RenderFunction = () => void;

type NodeUpdateFunction = (id: number, delta: number) => void;
type NodeRenderFunction = (id: number) => void;