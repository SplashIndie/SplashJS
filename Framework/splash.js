class Game {
    constructor() {
        this.zoom = 3;
        this.vignete = 0;
        this.camera = [0, 0];
        this.renderer = [];
        this.colliders = {
            static: [],
            dynamic_rigid: []
        };
        this.world = {
            gravity: 0.7
        }
        this.events = '';


        this.performance = {
            fps: 0,
            frames: 0,
            lastTime: performance.now()
        };


        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');


        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight;


        this.canvas.style.background = '#000';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';


        this.ctx.mozImageSmoothingEnabled = 0;
        this.ctx.webkitImageSmoothingEnabled = 0;
        this.ctx.msImageSmoothingEnabled = 0;
        this.ctx.imageSmoothingEnabled = 0;



        onresize = () => {
            this.canvas.width = innerWidth;
            this.canvas.height = innerHeight;
            this.ctx.mozImageSmoothingEnabled = 0;
            this.ctx.webkitImageSmoothingEnabled = 0;
            this.ctx.msImageSmoothingEnabled = 0;
            this.ctx.imageSmoothingEnabled = 0;
        };






        addEventListener('keydown', (e) => {
            if (!this.events.includes(e.key + ',')) {
                this.events += e.key + ","
            }
        });
        addEventListener('keyup', (e) => {
            if (this.events.includes(e.key + ',')) {
                this.events = this.events.replace(e.key + ',', "");
            }
        });


    }
    isPressed(eventID) {
        return this.events.includes(eventID.replaceAll(',', '') + ',');
    }
    sendEvent(eventID) {
        this.events += eventID.replaceAll(',') + ",";
    }
    stopEvent(eventID) {
        this.events = this.events.replace(eventID + ',', "");
    }
    addEventTouched(eventID, element) {
        element.ontouchstart = (e) => {
            this.sendEvent(eventID);
        }
        element.ontouchstart = (e) => {
            this.stopEvent(eventID);
        }
    }
    add(object) {
        this.renderer.push(object);
        if (object.physics.type !== 'null') {
            if (object.physics.type == 'rigid' || object.physics.type == 'dynamic') {
                this.colliders['dynamic_rigid'].push(object);
            } else {
                this.colliders[object.physics.type].push(object);
            }
        }
        return object;
    }

    detectCollision(object1, object2) {
        return (object1.position[0] + object1.size[0] > object2.position[0] && object1.position[0] < object2.position[0] + object2.size[0] && object1.position[1] + object1.size[1] > object2.position[1] && object1.position[1] < object2.position[1] + object2.size[1]);
    }

    framePerTick(func) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i of this.renderer) {
            if (i.OnUpdate) i.OnUpdate();
        }

        for (let i of this.colliders.dynamic_rigid) {
            if (i.physics.type == 'rigid') {
                i.physics.velocity += this.world.gravity;
                i.position[1] += i.physics.velocity;
            }
        }

        for (let dynamicObject of this.colliders.dynamic_rigid) {
            for (let staticObject of this.colliders.static) {
                if (this.detectCollision(dynamicObject, staticObject)) {
                    let distX = (dynamicObject.position[0] + dynamicObject.size[0] / 2) - (staticObject.position[0] + staticObject.size[0] / 2);
                    let distY = (dynamicObject.position[1] + dynamicObject.size[1] / 2) - (staticObject.position[1] + staticObject.size[1] / 2);

                    let sumWidth = (dynamicObject.size[0] + staticObject.size[0]) / 2;
                    let sumHeight = (dynamicObject.size[1] + staticObject.size[1]) / 2;

                    if (Math.abs(distX) < sumWidth && Math.abs(distY) < sumHeight) {
                        let overlapX = sumWidth - Math.abs(distX);
                        let overlapY = sumHeight - Math.abs(distY);

                        if (overlapX > overlapY) {
                            dynamicObject.position[1] = distY > 0 ? dynamicObject.position[1] + overlapY : dynamicObject.position[1] - overlapY;
                            if (dynamicObject.position[0] + dynamicObject.size[0] > staticObject.position[0] && dynamicObject.position[0] < staticObject.position[0] + staticObject.size[0]) {
                                dynamicObject.physics.velocity = 0;
                            }
                        } else {
                            dynamicObject.position[0] = distX > 0 ? dynamicObject.position[0] + overlapX : dynamicObject.position[0] - overlapX;
                        }
                    }
                }
            }
        }

        for (let i of this.renderer) {
            i.enable = (((i.position[0] * this.zoom) - this.camera[0]) + ((i.size[0] * this.zoom) * 2) > 0 && ((i.position[0] * this.zoom) - this.camera[0]) + (i.size[0] * this.zoom) < innerWidth + ((i.size[0] * this.zoom) * 2) && ((i.position[1] * this.zoom) - this.camera[1]) + ((i.size[1] * this.zoom) * 2) > 0 && ((i.position[1] * this.zoom) - this.camera[1]) + (i.size[1] * this.zoom) < innerHeight + ((i.size[1] * this.zoom) * 2));
        }

        for (let i of this.renderer) {
            if (!i.enable) continue;
            if (i.constructor.name == 'Sprite') {
                this.ctx.save();
                // this.ctx.drawImage(
                //     i.image, i.imageConfig.cropPosition[0], i.imageConfig.cropPosition[1], i.imageConfig.cropSize[0], i.imageConfig.cropSize[1],
                //     (i.position[0] * this.zoom) - this.camera[0], (i.position[1] * this.zoom) - this.camera[1], i.size[0] * this.zoom, i.size[1] * this.zoom
                // );

                this.ctx.translate(((i.position[0] * this.zoom) - this.camera[0]) + ((i.size[0] * this.zoom) / 2), ((i.position[1] * this.zoom) - this.camera[1]) + ((i.size[1] * this.zoom) / 2));
                this.ctx.rotate(i.angle * Math.PI / 180);
                this.ctx.translate(-(((i.position[0] * this.zoom) - this.camera[0]) + ((i.size[0] * this.zoom) / 2)), -(((i.position[1] * this.zoom) - this.camera[1]) + ((i.size[1] * this.zoom) / 2)));

                this.ctx.drawImage(
                    i.image, i.imageConfig.cropPosition[0], i.imageConfig.cropPosition[1], i.imageConfig.cropSize[0], i.imageConfig.cropSize[1],
                    (i.position[0] * this.zoom) - this.camera[0], (i.position[1] * this.zoom) - this.camera[1], i.size[0] * this.zoom, i.size[1] * this.zoom
                );
                this.ctx.restore();
            }
        }
        this.ctx.save();
        // Create a radial gradient from black to transparent
        const gradient = this.ctx.createRadialGradient(innerWidth / 2, innerHeight / 2, 0, innerWidth / 2, innerHeight / 2, this.vignete);
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(1, "rgba(0,0,0,1)");

        // Set the blending mode to multiply
        this.ctx.globalCompositeOperation = "multiply";

        // Draw the vignette using the radial gradient
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, innerWidth, innerHeight);

        // Restore the context state
        this.ctx.restore();


        this.performance.frames++;
        const currentTime = performance.now();
        if (currentTime - this.performance.lastTime >= 1000) {
            this.performance.fps = this.performance.frames;
            this.performance.frames = 0;
            this.performance.lastTime = currentTime;
        }


        requestAnimationFrame(func);
    }

    focusCamera(object, delay) {
        this.camera[0] += Math.floor(((object.position[0] * this.zoom) - this.camera[0] - (this.canvas.width / 2) + Math.floor((object.size[0] * this.zoom)) / 2) / delay);
        this.camera[1] += Math.floor(((object.position[1] * this.zoom) - this.camera[1] - (this.canvas.height / 2) + Math.floor((object.size[1] * this.zoom)) / 2) / delay);
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    getDistance(objectA, objectB) {
        const dx = objectA.x - objectB.x;
        const dy = objectA.y - objectB.y;
        return Math.sqrt(dx * dx - dy * dy);
    }
}

function getImageSize(url) {
    let img = new Image();
    img.src = url;

    return { width: img.width, height: img.height };
}




// Objects

class Sprite {
    constructor(sprite, x, y, width, height, collider = 'dynamic') {
        this.position = [x, y];
        this.size = [width, height];
        this.angle = 0;
        this.physics = {
            type: collider,
            velocity: 0
        }
        this.x = x;
        this.y = y;


        this.sprite = sprite;
        this.image = new Image();
        this.image.src = this.sprite;

        this.imageConfig = {
            cropPosition: [0, 0],
            cropSize: [this.image.width, this.image.height],
            size: [this.image.width, this.image.height],
            columns: 0,
            rows: 0,
            position: [0, 0],
            animation: {
                time: 0,
                inFrame: [0, 0],
                lastTime: Date.now()
            }
        }
        this.animationDelay = 0;


        this.enable = true;
    }

    lookAt(object) {
        let dx = (object.position[0] + (object.size[0] / 2)) - (this.position[0] + (this.size[0] / 2));
        let dy = (object.position[1] + (object.size[1] / 2)) - (this.position[1] + (this.size[1] / 2));

        this.angle = Math.atan2(dy, dx) * (180 / Math.PI);
    }
    move(speed) {
        let angleRad = this.angle * Math.PI / 180;

        this.moveX(Math.cos(angleRad) * speed);
        this.moveY(Math.sin(angleRad) * speed);
    }


    moveX(value) {
        this.position[0] += value;
        this.x = this.position[0];
    }
    moveY(value) {
        this.position[1] += value;
        this.y = this.position[1];
    }



    setX(value) {
        this.position[0] = value;
        this.x = this.position[0];
    }
    setY(value) {
        this.position[1] = value;
        this.y = this.position[1];
    }


    setTileSheet(rows = 0, columns = 0, position = [0, 0]) {

        position[0] = Math.min(position[0], columns - 1);
        position[1] = Math.min(position[1], rows - 1);

        let posX = Math.round(position[0] * (this.imageConfig.size[0] / columns));
        let posY = Math.round(position[1] * (this.imageConfig.size[1] / rows));




        this.imageConfig.cropPosition = [posX, posY];
        this.imageConfig.cropSize = [Math.round(this.imageConfig.size[0] / columns), Math.round(this.imageConfig.size[1] / rows)];

        this.imageConfig.rows = rows;
        this.imageConfig.columns = columns;

        this.imageConfig.position = position;
    }

    playAnimate(fromTo = [0, 4], axis = 'x', index = 0) {
        if (!this.imageConfig.animation.lastTime) {
            this.imageConfig.animation.lastTime = Date.now();
        }
        if (Date.now() - this.imageConfig.animation.lastTime >= this.animationDelay) {
            if (axis == 'x') {
                this.imageConfig.animation.inFrame[0] += 1;
                if (this.imageConfig.animation.inFrame[0] >= fromTo[1]) this.imageConfig.animation.inFrame[0] = fromTo[0];
                this.setTileSheet(this.imageConfig.rows, this.imageConfig.columns, [this.imageConfig.animation.inFrame[0], Math.min(index, this.imageConfig.rows)]);
            }
            if (axis == 'y') {
                this.imageConfig.animation.inFrame[1] += 1;
                if (this.imageConfig.animation.inFrame[1] >= fromTo[1]) this.imageConfig.animation.inFrame[1] = fromTo[0];
                this.setTileSheet(this.imageConfig.rows, this.imageConfig.columns, [Math.min(index, this.imageConfig.columns), this.imageConfig.animation.inFrame[1]]);
            }
            this.imageConfig.animation.lastTime = Date.now();
        }
    }

    followObject(object, speed, minDistance = 0) {
        const dx = this.x - object.x;
        const dy = this.y - object.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > minDistance) {
            this.moveX(-(dx / distance * speed));
            this.moveY(-(dy / distance * speed));
        }
    }





    importScript(url = '') {
        fetch(url)
            .then(response => response.text())
            .then(data => eval(data))
            .catch(error => console.error(error));
    }
}

class Box {
    constructor(x, y, width, height, collider = 'dynamic') {
        this.position = [x, y];
        this.size = [width, height];
        this.physics = {
            type: collider,
            velocity: 0
        }
        this.x = x;
        this.y = y;


        this.enable = true;
    }


    moveX(value) {
        this.position[0] += value;
        this.x = this.position[0];
    }
    moveY(value) {
        this.position[1] += value;
        this.y = this.position[1];
    }



    setX(value) {
        this.position[0] = value;
        this.x = this.position[0];
    }
    setY(value) {
        this.position[1] = value;
        this.y = this.position[1];
    }

    followObject(object, speed, minDistance) {
        const dx = this.x - object.x;
        const dy = this.y - object.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > minDistance) {
            this.moveX(-(dx / distance * speed));
            this.moveY(-(dy / distance * speed));
        }
    }





    importScript(url = '') {
        fetch(url)
            .then(response => response.text())
            .then(data => eval(data))
            .catch(error => console.error(error));
    }
}


// GUI Objects

class uiImage {
    constructor(image, x, y, size = [0, 0], name = 'uiImage') {
        this.image = (image == null) ? '#fff' : image;


        this.x = x;
        this.y = y;
        this.width = size[0];
        this.height = size[1];


        this.element = document.createElement('div');
        document.body.appendChild(this.element);
        this.element.id = name;


        this.element.style.background = (image == null) ? this.image : 'url(' + this.image + ')';
        this.element.style.backgroundPosition = 'center';
        this.element.style.backgroundSize = 'cover';
        this.element.style.backgroundRepeat = 'no-repeat';
        this.element.style.imageRendering = 'pixelated';

        this.element.style.position = 'absolute';

        this.element.style.top = this.y + 'px';
        this.element.style.left = this.x + 'px';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
    }
}