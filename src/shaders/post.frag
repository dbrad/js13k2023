#version 300 es
precision lowp float;

in vec2 vu;

uniform sampler2D ft;
uniform float tp;

out vec4 oc;

void main() {
    // float xFraction = fract(gl_FragCoord.x / 32.0);
    // float yFraction = fract(gl_FragCoord.y / 32.0);
    
    // if (abs(xFraction - 0.5) + abs(yFraction - 0.5) < tp * 2.0) {
    //     oc = vec4(0.0, 0.0, 0.0, 1.0);
    // } else {
    //     oc = texture(ft, vu);
    // }
    
    oc = texture(ft, vu);
    oc.rgb *= 1.0 - tp;
}