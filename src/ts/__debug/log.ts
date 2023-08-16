export function debug_log(...data: any[]): void
{
    if (DEBUG)
        console.log(...data);
}