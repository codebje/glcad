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

        if (i !== 0) {
            shapes.splice(i - 1, 1);
            shapeChooser.removeChild(shapeChooser.options[i]);
            setsettings();
        }
    };

    var xpos = document.getElementById('xpos'),
        ypos = document.getElementById('ypos'),
        zpos = document.getElementById('zpos'),
        phi  = document.getElementById('phi'),
        rho  = document.getElementById('rho'),
        thet = document.getElementById('theta'),
        mred = document.getElementById('mred'),
        mgrn = document.getElementById('mgrn'),
        mblu = document.getElementById('mblu'),
        nred = document.getElementById('nred'),
        ngrn = document.getElementById('ngrn'),
        nblu = document.getElementById('nblu'),
        ored = document.getElementById('ored'),
        ogrn = document.getElementById('ogrn'),
        oblu = document.getElementById('oblu'),
        shin = document.getElementById('shin');

    var shuffle = function() {
        var x = xpos.value,
            y = ypos.value,
            z = zpos.value,
            p = phi.value,
            r = rho.value,
            t = thet.value,
            i = shapeChooser.selectedIndex;

        if (i === 0) { return; }        // nothing selected

        shapes[i-1].setParameters(x, y, z, p, r, t);
        shapes[i-1].setColors(
                [mred.value, mgrn.value, mblu.value],
                [nred.value, ngrn.value, nblu.value],
                [ored.value, ogrn.value, oblu.value],
                shin.value);
    };

    var setsettings = function() {
        var i = shapeChooser.selectedIndex;
        if (i === 0) { return; }        // nothing selected
        var settings = shapes[i-1].getParameters();
        xpos.value = settings.x;
        ypos.value = settings.y;
        zpos.value = settings.z;
        phi.value  = settings.rx;
        rho.value  = settings.ry;
        thet.value = settings.rz;
        var colors = shapes[i-1].getColors();
        mred.value = colors.ambient.r;
        mgrn.value = colors.ambient.g;
        mblu.value = colors.ambient.b;
        nred.value = colors.diffuse.r;
        ngrn.value = colors.diffuse.g;
        nblu.value = colors.diffuse.b;
        ored.value = colors.specular.r;
        ogrn.value = colors.specular.g;
        oblu.value = colors.specular.b;
        shin.value = colors.shine;
    };

    [xpos, ypos, zpos, phi, rho, theta, mred, mgrn, mblu,
        nred, ngrn, nblu, ored, ogrn, oblu, shin].forEach(function(c) {
        c.oninput = shuffle;
    });

    shapeChooser.onchange = function() {
        setsettings();
    }

    /* Lighting controls */
    var light0  = document.getElementById('light-0'),
        light1  = document.getElementById('light-1');
        lighton = document.getElementById('lighton');
    var lightSliders = {
        ared: document.getElementById('ared'),
        agrn: document.getElementById('agrn'),
        ablu: document.getElementById('ablu'),
        dred: document.getElementById('dred'),
        dgrn: document.getElementById('dgrn'),
        dblu: document.getElementById('dblu'),
        sred: document.getElementById('sred'),
        sgrn: document.getElementById('sgrn'),
        sblu: document.getElementById('sblu')
    };

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

        ared.value = lights[i].ambient[0];
        agrn.value = lights[i].ambient[1];
        ablu.value = lights[i].ambient[2];

        dred.value = lights[i].diffuse[0];
        dgrn.value = lights[i].diffuse[1];
        dblu.value = lights[i].diffuse[2];

        sred.value = lights[i].specular[0];
        sgrn.value = lights[i].specular[1];
        sblu.value = lights[i].specular[2];
    };

    var setLight = function(key, idx) {
        return function() {
            lights[lightIndex][key][idx] = event.target.value;
        }
    };

    light0.onclick = function() { pickLight(0); };
    light1.onclick = function() { pickLight(1); };
    lighton.onchange = function() {
        lights[lightIndex].on = !lights[lightIndex].on;
    };
    ared.oninput   = setLight('ambient', 0);
    agrn.oninput   = setLight('ambient', 1);
    ablu.oninput   = setLight('ambient', 2);
    dred.oninput   = setLight('diffuse', 0);
    dgrn.oninput   = setLight('diffuse', 1);
    dblu.oninput   = setLight('diffuse', 2);
    sred.oninput   = setLight('specular', 0);
    sgrn.oninput   = setLight('specular', 1);
    sblu.oninput   = setLight('specular', 2);

    pickLight(0);

    // Start life out with a sphere
    addShape(makeSphere(0.1), 'sphere #' + (sphereCount++));
}
