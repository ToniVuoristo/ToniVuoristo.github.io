var base = {
	gl:    null,
	timer: null,

	vertex_shader:   null,
	fragment_shader: null,
	program_shader:  null,
	
	vao: null,
	vbo: null,
}

var uniforms = {
	time: null,
}


var vertexShaderSource = `#version 300 es

layout (location = 0) in vec4 aPosition;
 
void main() {
  	gl_Position = aPosition;
}
`;
 
var fragmentShaderSource = `#version 300 es
 
precision highp float;
 
#define fragCoord gl_FragCoord.xy

uniform float iTime;

out vec4 fragColor;

float sdSphere(vec3 p, float r)
{
 	return length(p) - r;
}

float map_the_world(in vec3 pos)
{
    float displacement = sin(abs(4.0 * cos(iTime)) * pos.x) *
                         sin(abs(4.0 * sin(iTime)) * pos.y) *
                         sin(4.0                   * pos.z) *
                        (0.1 + abs(0.1 * sin(iTime * 2.0)));
    float sphere_0 = sdSphere(pos, 2.5) + displacement;
    
    return sphere_0;
}

vec3 calculate_normal(in vec3 pos)
{
    const vec3 small_step = vec3(0.001, 0.0, 0.0);
    float gradient_x = map_the_world(pos + small_step.xyy) - map_the_world(pos - small_step.xyy);
    float gradient_y = map_the_world(pos + small_step.yxy) - map_the_world(pos - small_step.yxy);
    float gradient_z = map_the_world(pos + small_step.yyx) - map_the_world(pos - small_step.yyx);
    vec3 normal = vec3(gradient_x, gradient_y, gradient_z);
    
    return normalize(normal);
}

vec3 ray_march(in vec3 ro, in vec3 rd)
{
    float total_distance_traveled = 0.0;
    const int NUMBER_OF_STEPS = 128;
    const float MINIMUM_HIT_DISTANCE = 0.001;
    const float MAXIMUM_TRACE_DISTANCE = 512.0;
    const float AMBIENT = 0.2;
    
    for (int i = 0; i < NUMBER_OF_STEPS; ++i)
    {
        vec3 current_position = ro + total_distance_traveled * rd;
        float distance_to_closest = map_the_world(current_position);
        
        if (distance_to_closest < MINIMUM_HIT_DISTANCE) 
        {
            vec3 normal = calculate_normal(current_position);
            vec3 light_position = vec3(0, 0, 4.0);
            vec3 direction_to_light = normalize(current_position - light_position);
            float diffuse_intensity = max(AMBIENT, pow(dot(normal, direction_to_light), 16.0));
            
            return vec3(1.0, 0.0, 0.0) * diffuse_intensity;
        }
        
        if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE){
            break;
        }
        
        total_distance_traveled += distance_to_closest;
    }
    
    return vec3(0.0);
}

void main()
{
	vec2 iResolution = vec2(800.0f, 600.0f);

    vec2 uv = fragCoord / iResolution.xy * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;
    vec3 camera_position = vec3(0.0, 0.0, -5.0);
    vec3 ray_origin = camera_position;
    vec3 ray_direction = vec3(uv, 1.0);
    vec3 result = ray_march(ray_origin, ray_direction);
    fragColor = vec4(result, 1.0);
}
`;


function pad(n) 
{
    return (n < 10 ? "0" + n : n);
}


class Timer {
	constructor(){
		this.m_old_time = performance.now();
		this.m_new_time = 0.0;
		
		this.m_delta = 0.0;
		this.m_time  = 0.0;

		this.m_fps_counter = document.getElementById("fps");
	}

	tick(){
		this.m_new_time = performance.now();
		this.m_delta    = this.m_new_time - this.m_old_time;
		this.m_old_time = this.m_new_time;

		this.m_time += this.m_delta;

		// Update fps display
		const _fps   = this.getFramerate().toFixed(2); 
		const _delta = this.getDelta().toFixed(3);
		this.m_fps_counter.innerHTML = "Framerate: " + _fps;
	}

	getDelta(){
		return this.m_delta;
	}

	getSeconds(){
		return this.m_time / 1000.0;
	}

	getFramerate(){
		return 1000.0 / this.m_delta;
	}
}


function checkOpenGLError()
{
	const err = base.gl.getError();
	if (!err){
		return;
	}
}


function checkShaderStatus(shader)
{
	var message = base.gl.getShaderInfoLog(shader);

	if (message.length > 0){
		console.log(message);
	}
}


function setup()
{
	const canvas = document.querySelector("#frame");
	base.gl      = canvas.getContext("webgl2");

	const GL = base.gl;

	if (GL === null){
		alert("Webgl2 Not Supported!");
		return;
	}

	// Vertex Shader
	base.vertex_shader = GL.createShader(GL.VERTEX_SHADER);
	GL.shaderSource(base.vertex_shader, vertexShaderSource);
	GL.compileShader(base.vertex_shader);
	checkShaderStatus(base.vertex_shader);


	// Fragment shader
	base.fragment_shader = GL.createShader(GL.FRAGMENT_SHADER);
	GL.shaderSource(base.fragment_shader, fragmentShaderSource);
	GL.compileShader(base.fragment_shader);
	checkShaderStatus(base.fragment_shader);


	// Create program
	base.program_shader = GL.createProgram();
	GL.attachShader(base.program_shader, base.vertex_shader);
	GL.attachShader(base.program_shader, base.fragment_shader);
	GL.linkProgram(base.program_shader);
	GL.useProgram(base.program_shader);
	checkOpenGLError();


	// VAO and VBO setup
	base.vao = GL.createVertexArray();
	GL.bindVertexArray(base.vao);

	base.vbo = GL.createBuffer();
	GL.bindBuffer(GL.ARRAY_BUFFER, base.vbo);

	var positions = [
	  	-1.0, -1.0,    // First triangle
	  	-1.0,  1.0,
	  	 1.0,  1.0,

	  	-1.0, -1.0,    // Second triangle
	  	 1.0, -1.0,
	  	 1.0,  1.0,
	];
	
	GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(positions), GL.STATIC_DRAW);

	// Setup locations
	var positionAttributeLocation = GL.getAttribLocation(base.program_shader, "aPosition");
	GL.enableVertexAttribArray(positionAttributeLocation);      
	GL.vertexAttribPointer(positionAttributeLocation, 2, GL.FLOAT, false, 2 * 4, 0)

	// Query uniforms
	uniforms.time = GL.getUniformLocation(base.program_shader, "iTime");

	// Begin
	base.timer = new Timer();
	run();
}

window.onload = setup; 

function run()
{
	const GL = base.gl;

	base.timer.tick();

	GL.clearColor(0.0, 0.0, 0.0, 1.0);
	GL.clear(base.gl.COLOR_BUFFER_BIT);

	GL.useProgram(base.program_shader);

	// Uniform updates
	const seconds = performance.now() / 1000.0;
	GL.uniform1f(uniforms.time, seconds);

	GL.bindVertexArray(base.vao);
	GL.drawArrays(GL.TRIANGLES, 0, 6);

	requestAnimationFrame(run);
}

