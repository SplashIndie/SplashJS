this.setTileSheet(4, 4, [0, 0]);
this.animationDelay = 100;

this.OnUpdate = () => {
    app.focusCamera(this, 20);

    if (app.isPressed('w')) {
        this.playAnimate([0, 4], 'x', 3);
        this.moveY(-4);
    }
    if (app.isPressed('s')) {
        this.playAnimate([0, 4], 'x', 0);
        this.moveY(4);
    }
    if (app.isPressed('a')) {
        this.playAnimate([0, 4], 'x', 1);
        this.moveX(-4);
    }
    if (app.isPressed('d')) {
        this.playAnimate([0, 4], 'x', 2);
        this.moveX(4);
    }
}