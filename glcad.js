(function() { window.onload = function() {
    'use strict';

    var canvas = document.getElementById('canvas'),
        gl     = WebGLUtils.setupWebGL(canvas),
        shapes = [];

    /* Set up canvas */
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    var program = initShaders(gl, "vertex-shader", "fragment-shader" );
    gl.useProgram(program);

    /* Attributes & Uniforms */
    var aPosition       = gl.getAttribLocation(program, "aPosition"),
        aNormal         = gl.getAttribLocation(program, "aNormal"),
        uPerspective    = gl.getUniformLocation(program, "uPerspective"),
        uTransform      = gl.getUniformLocation(program, "uTransform"),
        uAmbient        = gl.getUniformLocation(program, "uAmbient"),
        uDiffuse        = gl.getUniformLocation(program, "uDiffuse"),
        uSpecular       = gl.getUniformLocation(program, "uSpecular"),
        uLight          = gl.getUniformLocation(program, "uLight");

    /* Lighting */
    var lights = [
        {
            ambient:  vec4(0.0, 0.1, 0.0, 1.0),
            diffuse:  vec4(0.5, 0.8, 0.5, 1.0),
            specular: vec4(1.0, 0.0, 1.0, 1.0),
            position: vec4(1.0, 1.0, 5.0, 0.0),
            deltaU:   0.002,
            deltaV:   0.003
        },
        {
            ambient:  vec4(0.2, 0.2, 0.2, 1.0),
            diffuse:  vec4(1.0, 1.0, 1.0, 1.0),
            specular: vec4(1.0, 1.0, 1.0, 1.0),
            position: vec4(1.0, 1.0, 3.0, 0.0),
            deltaU:   0.002,
            deltaV:   0.003
        }
    ];

    var render = function(ts) {
        var width  = canvas.clientWidth,
            height = canvas.clientHeight;
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, canvas.width, canvas.height);

        /* Perspective */
        var persp = perspective(20, (width / height), 0.1, 100.0);
        gl.uniformMatrix4fv(uPerspective, false, flatten(persp));

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var du = lights[0].deltaU,
            dv = lights[0].deltaV,
            lpos = lights[0].position,
            _light = vec4(
                lpos[0] * Math.cos(ts * du) * Math.cos(ts * dv),
                lpos[1] * Math.cos(ts * du) * Math.sin(ts * dv),
                lpos[2] * Math.sin(ts * du),
                0.0
            );

        gl.uniform4fv(uLight, _light);
        shapes.forEach(function(shape) {

            gl.uniformMatrix4fv(uTransform, false, flatten(shape.transform));
            gl.uniform4fv(uAmbient, flatten(mult(lights[0].ambient, shape.ambient)));
            gl.uniform4fv(uDiffuse, flatten(mult(lights[0].diffuse, shape.diffuse)));
            gl.uniform4fv(uSpecular, flatten(mult(lights[0].specular, shape.specular)));
            // TODO: set materials, colours, etc

            shape.sections.forEach(function(section) {
                if (section.vbuffer === undefined) {
                    section.vbuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, section.vbuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, flatten(section.vertices),
                                 gl.STATIC_DRAW);
                    section.nbuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, section.nbuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, flatten(section.normals),
                                 gl.STATIC_DRAW);
                }
                gl.bindBuffer(gl.ARRAY_BUFFER, section.vbuffer);
                gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(aPosition);
                gl.bindBuffer(gl.ARRAY_BUFFER, section.nbuffer);
                gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(aNormal);
                gl.drawArrays(section.method, 0, section.vertices.length);
            });

        });
        requestAnimationFrame(render);
    }

    render();

    UI(shapes, lights);
}} ());
