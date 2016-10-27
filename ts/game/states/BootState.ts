namespace Trains.Game.States {
    export class BootState {

        preload = function(game: Phaser.Game) {
            var images = Trains.Game.images;
            for(var key in images) {
                if (!images.hasOwnProperty(key)) {
                    continue;
                }

                var path = images[key];
                game.load.image(path, path);
            }
        }

        create = function(game: Phaser.Game) {
            game.stage.smoothed = false;

            game.state.start(Trains.Game.stateIds.build);
        }
    }
}
