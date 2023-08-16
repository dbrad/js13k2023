import { create_scene } from "@root/scene";
import { void_fn } from "@root/shared";

function update(delta: number): void { }

function render(): void { }

export let run_start = create_scene(void_fn, void_fn, update, render);