function UI(shapes, lights) {
    var shapeChooser = document.getElementById('objects');

    var addShape = function(shape, label) {
        shapes.push(shape);

        var opt = document.createElement('option');
        opt.value = shapes.length - 1;
        opt.appendChild(document.createTextNode(label));
        opt.selected = true;
        shapeChooser.appendChild(opt);
        setsettings();
    };

    var coneCount = 1;
    document.getElementById('addcone').onclick = function() {
        addShape(makeCone(0.1, 0.2), 'cone #' + (coneCount++));
    };

    var sphereCount = 1;
    document.getElementById('addsphere').onclick = function() {
        addShape(makeSphere(0.1), 'sphere #' + (sphereCount++));
    };

    var cylinderCount = 1;
    document.getElementById('addcylinder').onclick = function() {
        addShape(makeCylinder(0.1, 0.2), 'cylinder #' + (cylinderCount++));
    };

    document.getElementById('kill').onclick = function() {
        var i = shapeChooser.selectedIndex;

        if (i > 0) {
            shapes.splice(i - 1, 1);
            shapeChooser.removeChild(shapeChooser.options[i]);
            setsettings();
        }
    };

    var parseColor = function(cstr) {
        var bits = cstr.match(/^#(\w{2})(\w{2})(\w{2})$/).slice(1,4);
        return bits.map(function(v) { return parseInt(v, 16) / 255; });
    };

    var makeHex = function(v) {
        return ('00' + (Math.round(v * 255).toString(16))).slice(-2);
    };

    var makeColor = function(color) {
        var bits = "rgb"
            .split("")
            .map(function(c) { return makeHex(color[c]); })
            .join('');
        return '#' + bits;
    };

    var xpos = document.getElementById('xpos'),
        ypos = document.getElementById('ypos'),
        zpos = document.getElementById('zpos'),
        phi  = document.getElementById('phi'),
        rho  = document.getElementById('rho'),
        thet = document.getElementById('theta'),
        sclx = document.getElementById('sx'),
        scly = document.getElementById('sy'),
        sclz = document.getElementById('sz'),
        ambi = document.getElementById('ambi'),
        diff = document.getElementById('diff'),
        spec = document.getElementById('spec'),
        shin = document.getElementById('shin');

    var shuffle = function() {
        var x = xpos.value,
            y = ypos.value,
            z = zpos.value,
            p = phi.value,
            r = rho.value,
            t = thet.value,
            sx = sclx.value,
            sy = scly.value,
            sz = sclz.value,
            i = shapeChooser.selectedIndex;

        if (i <= 0) { return; }        // nothing selected

        shapes[i-1].setParameters(x, y, z, p, r, t, sx, sy, sz);
        shapes[i-1].setColors(
                parseColor(ambi.value),
                parseColor(diff.value),
                parseColor(spec.value),
                shin.value);
    };

    var setsettings = function() {
        var i = shapeChooser.selectedIndex;
        if (i <= 0) { return; }        // nothing selected
        var settings = shapes[i-1].getParameters();
        xpos.value = settings.x;
        ypos.value = settings.y;
        zpos.value = settings.z;
        phi.value  = settings.rx;
        rho.value  = settings.ry;
        thet.value = settings.rz;
        sclx.value = settings.sx;
        scly.value = settings.sy;
        sclz.value = settings.sz;
        var colors = shapes[i-1].getColors();
        ambi.value = makeColor(colors.ambient);
        diff.value = makeColor(colors.diffuse);
        spec.value = makeColor(colors.specular);
        shin.value = colors.shine;
    };

    [xpos, ypos, zpos, phi, rho, theta, shin, sclx, scly, sclz].forEach(function(c) {
        c.oninput = shuffle;
    });
    [ambi, diff, spec].forEach(function(c) { c.onchange = shuffle; });

    shapeChooser.onchange = function() {
        setsettings();
    }

    /* Lighting controls */
    var light0  = document.getElementById('light-0'),
        light1  = document.getElementById('light-1');
        lighton = document.getElementById('lighton'),
        lamb    = document.getElementById('lamb'),
        ldif    = document.getElementById('ldif'),
        lspe    = document.getElementById('lspe'),
        mva     =  document.getElementById('mva'),
        mvb     =  document.getElementById('mvb'),
        mvc     =  document.getElementById('mvc'),
        mvu     =  document.getElementById('mvu'),
        mvv     =  document.getElementById('mvv');

    var lightIndex = -1;
    var pickLight = function(i) {
        if (lightIndex === i) return;
        lightIndex = i;

        if (i === 0) {
            light0.className = 'active';
            light1.className = '';
        } else {
            light0.className = '';
            light1.className = 'active';
        }

        lighton.checked = lights[i].on;

        lamb.value = '#' + (lights[i].ambient.slice(0,3).map(makeHex).join(''));
        ldif.value = '#' + (lights[i].ambient.slice(0,3).map(makeHex).join(''));
        lspe.value = '#' + (lights[i].specular.slice(0,3).map(makeHex).join(''));

        mva.value  = lights[i].parameters[0];
        mvb.value  = lights[i].parameters[1];
        mvc.value  = lights[i].parameters[2];
        mvu.value  = lights[i].deltaU;
        mvv.value  = lights[i].deltaV;
    };

    var setLight = function(key) {
        return function() {
            var rgb = parseColor(event.target.value);
            lights[lightIndex][key][0] = rgb[0];
            lights[lightIndex][key][1] = rgb[1];
            lights[lightIndex][key][2] = rgb[2];
        }
    };

    light0.onclick = function() { pickLight(0); };
    light1.onclick = function() { pickLight(1); };
    lighton.onchange = function() {
        lights[lightIndex].on = !lights[lightIndex].on;
    };
    lamb.onchange  = setLight('ambient');
    ldif.onchange  = setLight('diffuse');
    lspe.onchange  = setLight('specular');
    mva.oninput    = function() { lights[lightIndex].parameters[0] = mva.value; };
    mvb.oninput    = function() { lights[lightIndex].parameters[1] = mvb.value; };
    mvc.oninput    = function() { lights[lightIndex].parameters[2] = mvc.value; };
    mvu.oninput    = function() { lights[lightIndex].deltaU = mvu.value; };
    mvv.oninput    = function() { lights[lightIndex].deltaV = mvv.value; };

    pickLight(0);

    var clearShapes = function() {
        for (var i = shapes.length; i > 0; i--) {
            shapeChooser.remove(i);
        }
        shapes.splice(0, shapes.length);
    };

    var preset = function(data) {
        clearShapes();
        var makers = {
            'sphere': makeSphere,
            'cylinder': makeCylinder,
            'cone': makeCone
        };
        data.shapes.forEach(function(src) {
            var shape = makers[src.shape].apply(null, src.parameters);
            shape.setParameters.apply(shape,
                    src.location.concat(src.rotation).concat(src.scale));
            shape.setColors(src.ambient,
                            src.diffuse,
                            src.specular,
                            src.shine);
            addShape(shape, src.name);
        });
        data.lights.forEach(function(light, i) {
            lights[i].ambient = light.ambient;
            lights[i].diffuse = light.diffuse;
            lights[i].specular = light.specular;
            lights[i].on = light.enabled;
            lights[i].parameters.splice(0, 3);
            lights[i].parameters.unshift.apply(lights[i].parameters,
                                               light.movement.slice(0, 3));
            lights[i].deltaU = light.movement[3];
            lights[i].deltaV = light.movement[4];
        });
        pickLight(1);
        pickLight(0);
    };

    /* Presets */
    document.getElementById('bird').onclick = function() {
        preset(thebird);
    };

    // Start life out with a sphere
    //addShape(makeSphere(0.1), 'sphere #' + (sphereCount++));

    document.getElementById('addsphere').disabled = true;
    notify = function() {
        document.getElementById('addsphere').disabled = false;
        console.log('spheres ready now');
    }
}
