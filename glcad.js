(function() { window.onload = function() {
    'use strict';

    var canvas = document.getElementById('canvas'),
        gl     = WebGLUtils.setupWebGL(canvas),
        shapes = [];

    /* Set up canvas */
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    var program = initShaders(gl, 'vertex-shader', 'fragment-shader' );
    gl.useProgram(program);

    /* Attributes & Uniforms */
    var aPosition       = gl.getAttribLocation(program, 'aPosition'),
        aNormal         = gl.getAttribLocation(program, 'aNormal'),
        uPerspective    = gl.getUniformLocation(program, 'uPerspective'),
        uTransform      = gl.getUniformLocation(program, 'uTransform'),
        uAmbient        = gl.getUniformLocation(program, 'uAmbient'),
        uDiffuse        = gl.getUniformLocation(program, 'uDiffuse'),
        uSpecular       = gl.getUniformLocation(program, 'uSpecular'),
        uShine          = gl.getUniformLocation(program, 'uShine'),
        uLightOn        = gl.getUniformLocation(program, 'uLightOn'),
        uGlobalAmbient  = gl.getUniformLocation(program, 'uGlobalAmbient'),
        uLight          = gl.getUniformLocation(program, 'uLight');

    /* Lighting */
    var lights = [
        {
            ambient:    vec4(0.2, 0.1, 0.1, 1.0),
            diffuse:    vec4(0.4, 0.2, 0.2, 1.0),
            specular:   vec4(0.6, 0.2, 0.2, 1.0),
            parameters: vec4(2.0, 0.2, 5.0, 0.0),
            deltaU:     0.002,
            deltaV:     0.003,
            on:         true
        },
        {
            ambient:    vec4(0.1, 0.2, 0.1, 1.0),
            diffuse:    vec4(0.2, 0.4, 0.2, 1.0),
            specular:   vec4(0.2, 0.6, 0.2, 1.0),
            parameters: vec4(-1.0, -1.0, 3.0, 0.0),
            deltaU:     0.001,
            deltaV:     0.0009,
            on:         true
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

        var _light = [];
        lights.forEach(function(light) {
            var du = light.deltaU,
                dv = light.deltaV,
                params = light.parameters;
            _light = _light.concat([
                params[0] * Math.cos(ts * du) * Math.cos(ts * dv),
                params[1] * Math.cos(ts * du) * Math.sin(ts * dv),
                params[2] * Math.sin(ts * du),
                0.0
            ]);
        });

        gl.uniform4fv(uLight, flatten(_light));

        shapes.forEach(function(shape) {
            var _ambient = [],
                _diffuse = [],
                _specular = [],
                _enabled = [];
            lights.forEach(function(light) {
                _enabled.push(light.on);
                _ambient = _ambient.concat(mult(light.ambient, shape.ambient));
                _diffuse = _diffuse.concat(mult(light.diffuse, shape.diffuse));
                _specular = _specular.concat(mult(light.specular, shape.specular));
            });

            gl.uniform4fv(uGlobalAmbient,
                    flatten(mult([0.05, 0.05, 0.05, 1.0], shape.ambient)));

            gl.uniform1iv(uLightOn, new Int32Array(_enabled));
            gl.uniform4fv(uAmbient, flatten(_ambient));
            gl.uniform4fv(uDiffuse, flatten(_diffuse));
            gl.uniform4fv(uSpecular, flatten(_specular));

            gl.uniform1f(uShine, shape.shine);
            gl.uniformMatrix4fv(uTransform, false, flatten(shape.transform));

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

    requestAnimationFrame(render);

    UI(shapes, lights);
}} ());
