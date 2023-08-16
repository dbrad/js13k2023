#version 300 es
precision lowp float;

in vec2 v, u;
in vec4 c;

out vec2 vu;
out vec4 vc;

const vec2 r = vec2(1280, 720);

void main() {
    vu = u;
    vc = c;
    vec2 pos = ((v / r) * 2.0 - 1.0) * vec2(1, -1);
    gl_Position = vec4(pos, 0.0, 1.0); 
}