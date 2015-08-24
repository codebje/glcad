function UI(shapes) {
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

    // Start life out with a sphere
    addShape(makeSphere(0.1), 'sphere #' + (sphereCount++));
}
