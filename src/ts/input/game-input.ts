export let INPUT_CONTEXT: InputContext;
export function init_input(): void
{
    INPUT_CONTEXT = {
        _cursor: [0, 0],
        _is_down: false,
        _was_down: false,
        _enabled: false
    };
}
