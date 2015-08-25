var thebird = {
    shapes: [
        {
            "shape": "sphere",
            "name": "head top",
            "parameters": [0.1],
            "ambient": [0, 0, 0.2],
            "diffuse": [0.4, 0.4, 0.45],
            "specular": [0.6, 0.6, 0.6],
            "shine": 18,
            "location": [-0.2, 0.2, -2],
            "rotation": [0, 0, 0],
            "scale": [1, 1, 1]
        },
        {
            "shape": "cylinder",
            "name": "head main",
            "parameters": [0.1, 0.2],
            "ambient": [0, 0, 0.2],
            "diffuse": [0.4, 0.4, 0.4],
            "specular": [0.6, 0.6, 0.6],
            "shine": 18,
            "location": [-0.2, 0, -2],
            "rotation": [1, 0, 0],
            "scale": [1, 1, 1]
        },
        {
            "shape": "cone",
            "name": "beak",
            "parameters": [0.1, 0.1],
            "ambient": [0.2, 0.2, 0],
            "diffuse": [0.55, 0.4, 0.4],
            "specular": [0.6, 0.6, 0.6],
            "shine": 10,
            "location": [-0.1, 0.05, -1.9],
            "rotation": [14, 133, 85],
            "scale": [1, 1.2, 1]
        }
    ],
    lights: [
        {
            "ambient": [1, 1, 1, 1],
            "diffuse": [0.4, 0.2, 0.2, 1],
            "specular": [0.6, 0.2, 0.2, 1],
            "movement": [2, 1, 3, 0.2, 0.4],
            "enabled": true
        },
        {
            "ambient": [1, 1, 1, 1],
            "diffuse": [0.2, 0.4, 0.2, 1],
            "specular": [0.6, 0.2, 0.2, 1],
            "movement": [1, 1, 3, 0, 0.2],
            "enabled": true
        }
    ]
};
