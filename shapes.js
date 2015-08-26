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

var sphere;
var notify;
var worker = new Worker('gensphere.js');
worker.onmessage = function(evt) {
    sphere = evt.data;
    if (notify !== undefined) notify();
};

var makeSphere = function(r) {

    var shape = new Shape();
    shape.addSection(Shape.TRIANGLES, sphere.vertices, sphere.normals);

    return shape;
};
