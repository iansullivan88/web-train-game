window.onload = () => {
    let stage = document.getElementById("game"),
        goButton = document.getElementById("go-button"),
        game = new Trains.Game.Game(stage);

    game.start();

    goButton.addEventListener('click', () => {
        game.getPhaserGame().state.start(Trains.Game.stateIds.drive);
    });
};
