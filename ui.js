function UI(shapes, lights) {
    var shapeChooser = document.getElementById('objects');

    var addShape = function(shape, label) {
        shapes.push(shape);

        var opt = document.createElement('option');
        opt.value = shapes.length;
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

    var shuffle = function() {
        var x = document.getElementById('xpos').value;
        var y = document.getElementById('ypos').value;
        var z = document.getElementById('zpos').value;
        var p = document.getElementById('phi').value;
        var r = document.getElementById('rho').value;
        var t = document.getElementById('theta').value;
        var i = shapeChooser.selectedIndex;

        if (i === 0) { return; }        // nothing selected

        shapes[i-1].setParameters(x, y, z, p, r, t);
    };

    var setsettings = function() {
        var i = shapeChooser.selectedIndex;
        if (i === 0) { return; }        // nothing selected
        var settings = shapes[i-1].getParameters();
        document.getElementById('xpos').value = settings.x;
        document.getElementById('ypos').value = settings.y;
        document.getElementById('zpos').value = settings.z;
        document.getElementById('phi').value = settings.rx;
        document.getElementById('rho').value = settings.ry;
        document.getElementById('theta').value = settings.rz;
    };

    document.getElementById('xpos').oninput = shuffle;
    document.getElementById('ypos').oninput = shuffle;
    document.getElementById('zpos').oninput = shuffle;
    document.getElementById('phi').oninput = shuffle;
    document.getElementById('rho').oninput = shuffle;
    document.getElementById('theta').oninput = shuffle;

    shapeChooser.onchange = function() {
        setsettings();
    }

    /* Lighting controls */
    var light0  = document.getElementById('light-0'),
        light1  = document.getElementById('light-1');
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
