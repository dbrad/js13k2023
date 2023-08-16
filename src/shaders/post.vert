#version 300 es
precision lowp float;

in vec2 v;

out vec2 vu;

void main() {
    vu = v * 0.5 + 0.5;
    gl_Position = vec4(v, 1.0, 1.0);
}