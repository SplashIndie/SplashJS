let app = new Game();

let player = app.add(new Sprite('player.png', 0, 0, 50, 50, 'dynamic'));
let txt = app.add(new Sprite('https://i.pinimg.com/564x/07/57/a4/0757a4b8148d04e825fb19a6724a18e7.jpg', 0, -100, 50, 50, 'static'));


for (let i = 0; i < 50; ++i) {
    app.add(new Sprite('https://i.pinimg.com/564x/07/57/a4/0757a4b8148d04e825fb19a6724a18e7.jpg', 50 * i, 100, 50, 50, 'dynamic'));
}


player.importScript('./Objects/player.js');



app.zoom = 1.5;
function update() {
    app.framePerTick(update);
}
update();