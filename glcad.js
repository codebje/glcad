(function() { window.onload = function() {
    'use strict';

    var canvas = document.getElementById('canvas'),
        width  = canvas.clientWidth,
        height = canvas.clientHeight,
        gl     = WebGLUtils.setupWebGL(canvas),
        shapes = [];

    /* Set up canvas */
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, canvas.width, canvas.height);
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

    /* Perspective */
    var persp = perspective(20, (width / height), 0.1, 100.0);
    gl.uniformMatrix4fv(uPerspective, false, flatten(persp));

    /* Lighting */
    var ambient    = vec4(0.2, 0.2, 0.2, 1.0);
    var diffuse    = vec4(1.0, 1.0, 1.0, 1.0);
    var specular   = vec4(1.0, 1.0, 1.0, 1.0);
    var light      = vec4(1.0, 1.0, 3.0, 0.0);

    gl.uniform4fv(uLight, flatten(light));

    var render = function() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        shapes.forEach(function(shape) {

            gl.uniformMatrix4fv(uTransform, false, flatten(shape.transform));
            gl.uniform4fv(uAmbient, flatten(mult(ambient, shape.ambient)));
            gl.uniform4fv(uDiffuse, flatten(mult(diffuse, shape.diffuse)));
            gl.uniform4fv(uSpecular, flatten(mult(specular, shape.specular)));
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

    UI(shapes);
}} ());
