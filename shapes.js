var Shape = function () {
    this.sections  = [];
    this.settings  = { x: 0, y: 0, z: -2, rx: 0, ry: 0, rz: 0, sx: 1, sy: 1, sz: 1 };
    this.transform = translate(0, 0, -2);
    this.ambient   = vec4(0.2, 0.2, 0.2, 1.0);
    this.diffuse   = vec4(0.4, 0.4, 0.4, 1.0);
    this.specular  = vec4(0.6, 0.6, 0.6, 1.0);
    this.shine     = 80.0;
};

Shape.accuracy       = Math.PI / 180,  // resolution of shapes

Shape.TRIANGLES      = 4;
Shape.TRIANGLE_STRIP = 5;
Shape.TRIANGLE_FAN   = 6;

Shape.prototype.getParameters = function() {
    return this.settings;
};

Shape.prototype.setParameters = function(x, y, z, rx, ry, rz, sx, sy, sz) {
    this.settings = { x: x, y: y, z: z, rx: rx, ry: ry, rz: rz, sx: sx, sy: sy, sz: sz };

    var  m = mult(translate(x, y, z), rotate(rx, 1, 0, 0));
    m = mult(m, rotate(ry, 0, 1, 0));
    m = mult(m, rotate(rz, 0, 0, 1));
    m = mult(m, mscale(sx, sy, sz));

    this.transform = m;
};

Shape.prototype.getColors = function() {
    return {
        ambient: {
            r: this.ambient[0],
            g: this.ambient[1],
            b: this.ambient[2]
        },
        diffuse: {
            r: this.diffuse[0],
            g: this.diffuse[1],
            b: this.diffuse[2]
        },
        specular: {
            r: this.specular[0],
            g: this.specular[1],
            b: this.specular[2]
        },
        shine: this.shine
    };
};

Shape.prototype.setColors = function(a, d, s, z) {
    this.ambient = vec4(a[0], a[1], a[2], 1.0);
    this.diffuse = vec4(d[0], d[1], d[2], 1.0);
    this.specular = vec4(s[0], s[1], s[2], 1.0);
    this.shine = z;
};

Shape.prototype.addSection = function(method, vertices, normals) {
    this.sections.push( {
        method: method,
        vertices: vertices,
        normals: normals
    } );
};

Shape.prototype.addDisc = function(r, h) {
    var dn = h/Math.abs(h);
    var fan = [[0, h, 0]]; // center
    var norm = [[0, dn, 0]];

    for (var i = 0; i <= 2 * Math.PI; i += Shape.accuracy) {
        fan.push([r * Math.cos(i), h, r * Math.sin(i)]);
        norm.push([0, dn, 0]);
    }

    this.addSection(Shape.TRIANGLE_FAN, fan, norm);
};

var unstrip = function(strip) {
    var vertices = [];
    var normals  = [];
    for (var i = 2, dn=0; i < strip.length; i++, dn=1-dn) {
        vertices.push(strip[i-2]);
        vertices.push(strip[i-1]);
        vertices.push(strip[i-0]);
        var t1 = subtract(strip[i-(2-dn)], strip[i-0]),
            t2 = subtract(strip[i-0], strip[i-dn-1]),
            nm = normalize(vec3(cross(t1, t2)));
        normals.push(nm);
        normals.push(nm);
        normals.push(nm);
    }

    return { vertices: vertices, normals: normals };
};

/* returns a list of renders for a cylinder */
var makeCylinder = function(r, h) {
    var shape = new Shape();
    shape.addDisc(r, h);
    shape.addDisc(r, -h);

    var strip = [[r, h, 0]], y = -h;
    for (var i = 0; i <= 2 * Math.PI || y > 0; i += Shape.accuracy) {
        strip.push([r * Math.cos(i), y, r * Math.sin(i)]);
        y = -y;
    }

    // convert triangle strip into triangles with normals
    var tris = unstrip(strip);
    shape.addSection(Shape.TRIANGLES, tris.vertices, tris.normals);

    return shape;
};

var makeCone = function(r, h) {
    var shape = new Shape();

    shape.addDisc(r, -h);

    var strip = [[0, h, 0]], y = -h, w = r;
    for (var i = 0; i <= 2 * Math.PI; i += Shape.accuracy) {
        strip.push([w * Math.cos(i), y, w * Math.sin(i)]);
        y = -y;
        w = r - w;
    }

    // convert triangle strip into triangles with normals
    var tris = unstrip(strip);
    shape.addSection(Shape.TRIANGLES, tris.vertices, tris.normals);

    return shape;
};

var makeSphere = function(r) {
    var phi = (1 + Math.sqrt(5)) / 2;

    var normalise = function(v) {
        var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) / r;
        return [ v[0] / l, v[1] / l, v[2] / l ];
    };

    var isoverts = [        // 12 vertices of an icosahedron
        [  -1,  phi,    0],
        [   1,  phi,    0],
        [  -1, -phi,    0],
        [   1, -phi,    0],
        [   0,   -1,  phi],
        [   0,    1,  phi],
        [   0,   -1, -phi],
        [   0,    1, -phi],
        [ phi,    0,   -1],
        [ phi,    0,    1],
        [-phi,    0,   -1],
        [-phi,    0,    1]
    ].map(normalise);

    var midpoint = function(v1, v2) {
        return normalise([
            (v1[0] + v2[0]) / 2,
            (v1[1] + v2[1]) / 2,
            (v1[2] + v2[2]) / 2
        ]);
    };

    var tesselate = function(faces, count) {
        if (count <= 0) { return faces; }

        faces = faces.map(function(f) {
            var a = midpoint(f[0], f[1]),
                b = midpoint(f[1], f[2]),
                c = midpoint(f[2], f[0]);

            return [
                [f[0], a, c],
                [f[1], b, a],
                [f[2], c, b],
                [a, b, c]
            ];
        });
        faces = faces.reduce(function(l, v) { return l.concat(v); }, []);

        return tesselate(faces, count - 1);
    };

    var faces = tesselate([
        [0, 11, 5],  [0, 5, 1],   [0, 1, 7],    [0, 7, 10],  [0, 10, 11],
        [1, 5, 9],   [5, 11, 4],  [11, 10, 2],  [10, 7, 6],  [7, 1, 8],
        [3, 9, 4],   [3, 4, 2],   [3, 2, 6],    [3, 6, 8],   [3, 8, 9],
        [4, 9, 5],   [2, 4, 11],  [6, 2, 10],   [8, 6, 7],   [9, 8, 1]
    ].map(function(f) {
        return f.map(function(e) { return isoverts[e]; });
    }), 2);

    var shape = new Shape();
    shape.addSection(Shape.TRIANGLES,
                     faces.reduce(function(l, v) {
                         return l.concat(v);
                     }, []),
                     faces.reduce(function(l, v) {
                         var v1 = vec3(v[0]),
                             v2 = vec3(v[1]),
                             v3 = vec3(v[2]),
                             t1 = subtract(v1, v2),
                             t2 = subtract(v1, v3),
                             nm = normalize(vec3(cross(t1, t2)));
                         return l.concat([nm, nm, nm]);
                     }, []));

    return shape;
};
