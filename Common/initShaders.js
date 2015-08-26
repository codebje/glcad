//
//  LoadShaders.js
//
//

/** Load a shader either by id attribute, or by .language-glsl block with innerText and an '// id: <name>' comment as the first line
 * 
 * Added by codebje
 */
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}
function loadShader(name)
{
    var elem = document.getElementById(name);
    if (elem) return elem.text;

    var blocks = document.getElementsByClassName("language-glsl");
    for (var i = 0; i < blocks.length; i++) {
        var text = blocks[i].textContent;
        if (text.startsWith("// id: " + name + "\n")) return text;
    }

    return undefined;
}


function initShaders( gl, vertexShaderId, fragmentShaderId, attrib0 )
{
    var vertShdr;
    var fragShdr;

    var vertCode = loadShader( vertexShaderId );
    if ( !vertCode ) { 
        throw ( "Unable to load vertex shader " + vertexShaderId );
    }
    else {
        vertShdr = gl.createShader( gl.VERTEX_SHADER );
        gl.shaderSource( vertShdr, vertCode );
        gl.compileShader( vertShdr );
        if ( !gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS) ) {
            var msg = "Vertex shader failed to compile.  The error log is:"
                    + "<pre>" + gl.getShaderInfoLog( vertShdr ) + "</pre>";
            throw msg;
        }
    }

    var fragCode = loadShader( fragmentShaderId );
    if ( !fragCode ) { 
        throw ( "Unable to load vertex shader " + fragmentShaderId );
    }
    else {
        fragShdr = gl.createShader( gl.FRAGMENT_SHADER );
        gl.shaderSource( fragShdr, fragCode );
        gl.compileShader( fragShdr );
        if ( !gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS) ) {
            var msg = "Fragment shader failed to compile.  The error log is:"
                    + "<pre>" + gl.getShaderInfoLog( fragShdr ) + "</pre>";
            throw msg;
        }
    }

    var program = gl.createProgram();
    gl.attachShader( program, vertShdr );
    gl.attachShader( program, fragShdr );
    if (attrib0 !== undefined) {
        gl.bindAttribLocation(program, 0, attrib0);
    }
    gl.linkProgram( program );

    if ( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
        var msg = "Shader program failed to link.  The error log is:"
            + "<pre>" + gl.getProgramInfoLog( program ) + "</pre>";
        throw msg;
    }

    return program;
}
