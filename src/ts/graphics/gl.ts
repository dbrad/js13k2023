import { assert } from "@debug/assert";

import main_fragment from "@shaders/main.frag";
import main_vertex from "@shaders/main.vert";

import post_fragment from "@shaders/post.frag";
import post_vertex from "@shaders/post.vert";

import { TRANSITION_TIME_HALF, TRANSITION_TIME_HALFWAY } from "@root/scene";
import { lerp } from "math";

export namespace gl
{
  let context: WebGLRenderingContext;
  let width: number;
  let height: number;

  // xy + uv + colour
  let VERTEX_SIZE: number = (4 * 2) + (4 * 2) + (4);
  let MAX_BATCH: number = 10922;
  let VERTICES_PER_QUAD: number = 6;
  let VERTEX_DATA_SIZE: number = VERTEX_SIZE * MAX_BATCH * 4;
  let INDEX_DATA_SIZE: number = MAX_BATCH * (2 * VERTICES_PER_QUAD);

  let main_program: WebGLShader;

  let loc_m_vertex_attr: number;
  let loc_m_uv_attr: number;
  let loc_m_colour_attr: number;
  let loc_m_texture_uniform: WebGLUniformLocation | null;

  let vertex_data: ArrayBuffer = new ArrayBuffer(VERTEX_DATA_SIZE);
  let position_data: Float32Array = new Float32Array(vertex_data);
  let colour_data: Uint32Array = new Uint32Array(vertex_data);
  let index_data: Uint16Array = new Uint16Array(INDEX_DATA_SIZE);

  let matrix: Float32Array = new Float32Array([1, 0, 0, 1, 0, 0]);
  let stack: Float32Array = new Float32Array(100);

  let index_buffer: WebGLBuffer;
  let vertex_buffer: WebGLBuffer;
  let batch_count: number = 0;
  let stack_level: number = 0;

  let post_processing_program: WebGLShader;

  let position_buffer: WebGLBuffer | null;
  let fbo_texture: WebGLTexture;
  let framebuffer: WebGLFramebuffer | null;

  let loc_p_pos_attr: number;
  let loc_p_transition_uniform: WebGLUniformLocation | null;
  let loc_p_texture_uniform: WebGLUniformLocation | null;

  export let _effects: Effects = {
    _transition: 0
  };

  export function _initialize(canvas: OffscreenCanvas | HTMLCanvasElement): void
  {
    width = canvas.width;
    height = canvas.height;

    {
      context = canvas.getContext("webgl2", { powerPreference: "high-performance", antialias: false, depth: false }) as WebGL2RenderingContext;
      assert(context !== undefined && context !== null, "No GL context created.");
    }

    function _compile_shader(source: string, type: number): WebGLShader
    {
      let shader = context.createShader(type);
      assert(shader !== null, "Unable to created shader");
      context.shaderSource(shader, source);
      context.compileShader(shader);
      return shader;
    };

    function _create_shader_program(vsSource: string, fsSource: string): WebGLProgram
    {
      let program = context.createProgram();
      assert(program !== null, "Unable to created program");
      let vShader: WebGLShader = _compile_shader(vsSource, GL_VERTEX_SHADER);
      let fShader: WebGLShader = _compile_shader(fsSource, GL_FRAGMENT_SHADER);
      context.attachShader(program, vShader);
      context.attachShader(program, fShader);
      context.linkProgram(program);
      return program;
    };

    function _create_buffer(bufferType: number, size: number, usage: number): WebGLBuffer
    {
      let buffer = context.createBuffer();
      assert(buffer !== null, "Unable to created buffer");
      context.bindBuffer(bufferType, buffer);
      context.bufferData(bufferType, size, usage);
      return buffer;
    };

    // ==============================================================
    // POST PROCESSING SETUP
    // ==============================================================
    {
      post_processing_program = _create_shader_program(post_vertex, post_fragment);
      context.useProgram(post_processing_program);

      let t_fbo_texture = context.createTexture();
      assert(t_fbo_texture !== null, "Failed to create texture for fbo.");
      fbo_texture = t_fbo_texture;
      context.activeTexture(GL_TEXTURE1);
      context.bindTexture(GL_TEXTURE_2D, fbo_texture);
      {
        context.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        context.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
        context.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
        context.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        context.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, SCREEN_WIDTH, SCREEN_HEIGHT, 0, GL_RGBA, GL_UNSIGNED_BYTE, null);
      }

      framebuffer = context.createFramebuffer();
      context.bindFramebuffer(GL_FRAMEBUFFER, framebuffer);
      context.framebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, fbo_texture, 0);

      let position_buffer_data = new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, 1, 1, 1, 1, -1, 1, 0, 1]);
      position_buffer = _create_buffer(GL_ARRAY_BUFFER, position_buffer_data.byteLength, GL_STATIC_DRAW);
      context.bufferSubData(GL_ARRAY_BUFFER, 0, position_buffer_data);

      loc_p_pos_attr = context.getAttribLocation(post_processing_program, "v");

      loc_p_transition_uniform = context.getUniformLocation(post_processing_program, "tp");
      loc_p_texture_uniform = context.getUniformLocation(post_processing_program, "ft");
    }

    // ==============================================================
    // MAIN PROGRAM SETUP
    // ==============================================================
    {
      main_program = _create_shader_program(main_vertex, main_fragment);
      context.useProgram(main_program);

      for (let indexA: number = 0, indexB: number = 0; indexA < MAX_BATCH * VERTICES_PER_QUAD; indexA += VERTICES_PER_QUAD, indexB += 4)
      {
        index_data[indexA + 0] = indexB;
        index_data[indexA + 1] = indexB + 1;
        index_data[indexA + 2] = indexB + 2;
        index_data[indexA + 3] = indexB + 0;
        index_data[indexA + 4] = indexB + 3;
        index_data[indexA + 5] = indexB + 1;
      }

      index_buffer = _create_buffer(GL_ELEMENT_ARRAY_BUFFER, index_data.byteLength, GL_STATIC_DRAW);
      context.bufferSubData(GL_ELEMENT_ARRAY_BUFFER, 0, index_data);

      vertex_buffer = _create_buffer(GL_ARRAY_BUFFER, vertex_data.byteLength, GL_DYNAMIC_DRAW);

      context.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
      context.enable(GL_BLEND);

      loc_m_vertex_attr = context.getAttribLocation(main_program, "v");
      loc_m_uv_attr = context.getAttribLocation(main_program, "u");
      loc_m_colour_attr = context.getAttribLocation(main_program, "c");

      loc_m_texture_uniform = context.getUniformLocation(main_program, "t");
    }

    context.activeTexture(GL_TEXTURE0);
    context.viewport(0, 0, width, height);
  };

  export function _upload_atlas(image: TexImageSource): void
  {
    context.activeTexture(GL_TEXTURE0);
    let texture = context.createTexture();
    assert(texture !== null, "Unable to create texture.");
    context.bindTexture(GL_TEXTURE_2D, texture);
    context.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    context.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    context.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    context.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    context.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, GL_RGBA, GL_UNSIGNED_BYTE, image);
  };

  export function _set_clear_colour(r: number, g: number, b: number): void
  {
    context.clearColor(r, g, b, 1);
  };

  let render_colour: number = 0xffffffff;
  export function _set_colour(colour: number)
  {
    render_colour = colour;
  };

  export function _reset_colour()
  {
    render_colour = 0xffffffff;
  };

  export function _translate(x: number, y: number): void
  {
    matrix[4] += matrix[0] * x + matrix[2] * y;
    matrix[5] += matrix[1] * x + matrix[3] * y;
  };

  export function _scale(x: number, y: number): void
  {
    matrix[0] *= x;
    matrix[1] *= x;
    matrix[2] *= y;
    matrix[3] *= y;
  };

  export function _rotate(r: number): void
  {
    let sr: number = Math.sin(r);
    let cr: number = Math.cos(r);

    matrix[0] = matrix[0] * cr + matrix[2] * sr;
    matrix[1] = matrix[1] * cr + matrix[3] * sr;
    matrix[2] = matrix[0] * -sr + matrix[2] * cr;
    matrix[3] = matrix[1] * -sr + matrix[3] * cr;
  };

  export function _save(): void
  {
    stack[stack_level + 0] = matrix[0];
    stack[stack_level + 1] = matrix[1];
    stack[stack_level + 2] = matrix[2];
    stack[stack_level + 3] = matrix[3];
    stack[stack_level + 4] = matrix[4];
    stack[stack_level + 5] = matrix[5];
    stack_level += 6;
  };

  export function _restore(): void
  {
    stack_level -= 6;
    matrix[0] = stack[stack_level + 0];
    matrix[1] = stack[stack_level + 1];
    matrix[2] = stack[stack_level + 2];
    matrix[3] = stack[stack_level + 3];
    matrix[4] = stack[stack_level + 4];
    matrix[5] = stack[stack_level + 5];
  };

  export function _begin_render(): void
  {
    context.useProgram(main_program);

    context.bindFramebuffer(GL_FRAMEBUFFER, framebuffer);
    context.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, index_buffer);
    context.bindBuffer(GL_ARRAY_BUFFER, vertex_buffer);

    context.vertexAttribPointer(loc_m_vertex_attr, 2, GL_FLOAT, false, VERTEX_SIZE, 0);
    context.enableVertexAttribArray(loc_m_vertex_attr);

    context.vertexAttribPointer(loc_m_uv_attr, 2, GL_FLOAT, false, VERTEX_SIZE, 8);
    context.enableVertexAttribArray(loc_m_uv_attr);

    context.vertexAttribPointer(loc_m_colour_attr, 4, GL_UNSIGNED_BYTE, true, VERTEX_SIZE, 16);
    context.enableVertexAttribArray(loc_m_colour_attr);

    context.uniform1i(loc_m_texture_uniform, 0);
  }

  export function _end_render(): void
  {
    if (batch_count > 0)
    {
      context.bufferSubData(GL_ARRAY_BUFFER, 0, position_data.subarray(0, batch_count * VERTEX_SIZE));
      context.drawElements(GL_TRIANGLES, batch_count * VERTICES_PER_QUAD, GL_UNSIGNED_SHORT, 0);
      batch_count = 0;
    }

    _reset_colour();

    context.useProgram(post_processing_program);

    context.bindFramebuffer(GL_FRAMEBUFFER, null);
    context.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, null);
    context.bindBuffer(GL_ARRAY_BUFFER, position_buffer);

    context.vertexAttribPointer(loc_p_pos_attr, 4, GL_FLOAT, false, 0, 0);
    context.enableVertexAttribArray(loc_p_pos_attr);

    context.uniform1i(loc_p_texture_uniform, 1);

    // Set effect uniforms
    if (_effects._transition >= TRANSITION_TIME_HALFWAY)
    {
      let progress = lerp(1, 0, (_effects._transition - TRANSITION_TIME_HALFWAY) / TRANSITION_TIME_HALF);
      context.uniform1f(loc_p_transition_uniform, progress);
    }
    else if (_effects._transition > 0)
    {
      let progress = lerp(0, 1, _effects._transition / TRANSITION_TIME_HALF);
      context.uniform1f(loc_p_transition_uniform, progress);
    }
    else
    {
      context.uniform1f(loc_p_transition_uniform, 0);
    }

    context.drawArrays(GL_TRIANGLES_FAN, 0, 4);
  }

  export function _clear(): void
  {
    context.clear(GL_COLOR_BUFFER_BIT);
  }

  export function _push_quad(w: number, h: number, u0: number, v0: number, u1: number, v1: number): void
  {
    let m0: number = matrix[0];
    let m1: number = matrix[1];
    let m2: number = matrix[2];
    let m3: number = matrix[3];
    let m4: number = matrix[4];
    let m5: number = matrix[5];

    if (batch_count + 1 >= MAX_BATCH)
    {
      context.bufferSubData(GL_ARRAY_BUFFER, 0, vertex_data);
      context.drawElements(GL_TRIANGLES, batch_count * VERTICES_PER_QUAD, GL_UNSIGNED_SHORT, 0);
      batch_count = 0;
    }

    let offset: number = batch_count * VERTEX_SIZE;

    // Vertex Order
    // Vertex Position | UV | ABGR
    // Vertex 1
    position_data[offset++] = m4;
    position_data[offset++] = m5;
    position_data[offset++] = u0;
    position_data[offset++] = v0;
    colour_data[offset++] = render_colour;

    // Vertex 2
    position_data[offset++] = w * m0 + h * m2 + m4;
    position_data[offset++] = w * m1 + h * m3 + m5;
    position_data[offset++] = u1;
    position_data[offset++] = v1;
    colour_data[offset++] = render_colour;

    // Vertex 3
    position_data[offset++] = h * m2 + m4;
    position_data[offset++] = h * m3 + m5;
    position_data[offset++] = u0;
    position_data[offset++] = v1;
    colour_data[offset++] = render_colour;

    // Vertex 4
    position_data[offset++] = w * m0 + m4;
    position_data[offset++] = w * m1 + m5;
    position_data[offset++] = u1;
    position_data[offset++] = v0;
    colour_data[offset++] = render_colour;

    if (++batch_count >= MAX_BATCH)
    {
      context.bufferSubData(GL_ARRAY_BUFFER, 0, vertex_data);
      context.drawElements(GL_TRIANGLES, batch_count * VERTICES_PER_QUAD, GL_UNSIGNED_SHORT, 0);
      batch_count = 0;
    }
  };
}