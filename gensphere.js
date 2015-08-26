
var MV = {
    _argumentsToArray: function( args ) {
        return [].concat.apply( [], Array.prototype.slice.apply(args) );
    },
    vec3: function () {
        var result = MV._argumentsToArray( arguments );

        switch ( result.length ) {
            case 0: result.push( 0.0 );
            case 1: result.push( 0.0 );
            case 2: result.push( 0.0 );
        }

        return result.splice( 0, 3 );
    },
    subtract: function ( u, v ) {
        var result = [];

        if ( u.matrix && v.matrix ) {
            if ( u.length != v.length ) {
                throw "subtract(): trying to subtract matrices" +
                      " of different dimensions";
            }

            for ( var i = 0; i < u.length; ++i ) {
                if ( u[i].length != v[i].length ) {
                    throw "subtract(): trying to subtact matrices" +
                          " of different dimensions";
                }
                result.push( [] );
                for ( var j = 0; j < u[i].length; ++j ) {
                    result[i].push( u[i][j] - v[i][j] );
                }
            }

            result.matrix = true;

            return result;
        }
        else if ( u.matrix && !v.matrix || !u.matrix && v.matrix ) {
            throw "subtact(): trying to subtact  matrix and non-matrix variables";
        }
        else {
            if ( u.length != v.length ) {
                throw "subtract(): vectors are not the same length";
            }

            for ( var i = 0; i < u.length; ++i ) {
                result.push( u[i] - v[i] );
            }

            return result;
        }
    },
    cross: function ( u, v ) {
        if ( !Array.isArray(u) || u.length < 3 ) {
            throw "cross(): first argument is not a vector of at least 3";
        }

        if ( !Array.isArray(v) || v.length < 3 ) {
            throw "cross(): second argument is not a vector of at least 3";
        }

        var result = [
            u[1]*v[2] - u[2]*v[1],
            u[2]*v[0] - u[0]*v[2],
            u[0]*v[1] - u[1]*v[0]
        ];

        return result;
    },
    normalize: function ( u, excludeLastComponent )
    {
        if ( excludeLastComponent ) {
            var last = u.pop();
        }

        var len = MV.length( u );

        if ( !isFinite(len) ) {
            throw "normalize: vector " + u + " has zero length";
        }

        for ( var i = 0; i < u.length; ++i ) {
            u[i] /= len;
        }

        if ( excludeLastComponent ) {
            u.push( last );
        }

        return u;
    },
    length: function ( u ) {
        return Math.sqrt( MV.dot(u, u) );
    },
    dot: function ( u, v ) {
        if ( u.length != v.length ) {
            throw "dot(): vectors are not the same dimension";
        }

        var sum = 0.0;
        for ( var i = 0; i < u.length; ++i ) {
            sum += u[i] * v[i];
        }

        return sum;
    }
}

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

    var tessellate = function(faces, count) {
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

        return tessellate(faces, count - 1);
    };

    var faces = tessellate([
        [0, 11, 5],  [0, 5, 1],   [0, 1, 7],    [0, 7, 10],  [0, 10, 11],
        [1, 5, 9],   [5, 11, 4],  [11, 10, 2],  [10, 7, 6],  [7, 1, 8],
        [3, 9, 4],   [3, 4, 2],   [3, 2, 6],    [3, 6, 8],   [3, 8, 9],
        [4, 9, 5],   [2, 4, 11],  [6, 2, 10],   [8, 6, 7],   [9, 8, 1]
    ].map(function(f) {
        return f.map(function(e) { return isoverts[e]; });
    }), 5);

    var foo = {
        vertices: faces.reduce(function(l, v) {
            return l.concat(v);
        }, []),
        normals: faces.reduce(function(l, v) {
            var v1 = MV.vec3(v[0]),
                v2 = MV.vec3(v[1]),
                v3 = MV.vec3(v[2]),
                t1 = MV.subtract(v1, v2),
                t2 = MV.subtract(v1, v3),
                nm = MV.normalize(MV.vec3(MV.cross(t1, t2)));
            return l.concat([nm, nm, nm]);
        }, [])
    };

    return foo;
};

postMessage(makeSphere(0.1));
