var Trains;
(function (Trains) {
    var Engines;
    (function (Engines) {
        function move(currentTrainState, railway, dt) {
            var distanceToTravel = currentTrainState.speed * dt, newSpeed = currentTrainState.speed;
            var newTrackAndPosition = getNextPosition(distanceToTravel, currentTrainState.trackAndPosition, railway);
            if (newTrackAndPosition == null) {
                newTrackAndPosition = {
                    position: 1,
                    trackPiece: currentTrainState.trackAndPosition.trackPiece
                };
                newSpeed = 0;
            }
            return {
                trackAndPosition: newTrackAndPosition,
                speed: newSpeed
            };
        }
        Engines.move = move;
        function getNextPosition(distance, trackAndPosition, railway) {
            var trackPieces = getTrackPiecesCovered(railway, trackAndPosition.position, trackAndPosition.trackPiece, distance);
            return trackPieces[trackPieces.length - 1];
        }
        Engines.getNextPosition = getNextPosition;
        function getTrackPiecesCovered(railway, currentPositionOnTrack, currentTrackPiece, distance) {
            var trackPositions = [];
            while (true) {
                var distanceLeftOnThisTrackPiece = (1 - currentPositionOnTrack) * currentTrackPiece.length;
                currentPositionOnTrack = currentPositionOnTrack + distance / currentTrackPiece.length;
                trackPositions.push({
                    trackPiece: currentTrackPiece,
                    position: Math.min(currentPositionOnTrack, 1)
                });
                if (currentPositionOnTrack <= 1) {
                    return trackPositions;
                }
                var nextTrackPiece;
                var nextTrackPieceId = railway.connections[currentTrackPiece.id];
                if (nextTrackPieceId || nextTrackPieceId === 0) {
                    nextTrackPiece = railway.trackPieces[nextTrackPieceId];
                }
                if (!nextTrackPiece) {
                    trackPositions.push(null);
                    return trackPositions;
                }
                distance -= distanceLeftOnThisTrackPiece;
                currentPositionOnTrack = 0;
                currentTrackPiece = nextTrackPiece;
            }
        }
    })(Engines = Trains.Engines || (Trains.Engines = {}));
})(Trains || (Trains = {}));
var Trains;
(function (Trains) {
    var Game;
    (function (Game_1) {
        Game_1.stateIds = {
            boot: "boot",
            build: "build",
            drive: "drive"
        };
        Game_1.images = {
            background: 'assets/textures/grass.png',
            trackMarker: 'assets/building/marker.png',
            steamTrain: 'assets/trains/steam.png',
            smoke1: 'assets/smoke/smoke1.png',
            smoke2: 'assets/smoke/smoke2.png'
        };
        Game_1.width = 1024;
        Game_1.height = 768;
        Game_1.maxSpeed = 200;
        Game_1.trackTypes = {
            straight: 'straight',
            circular: 'circular'
        };
        var Game = (function () {
            function Game(container) {
                var gameState = {
                    railway: null
                };
                this.game = new Phaser.Game(Game_1.width, Game_1.height, Phaser.AUTO, container);
                this.game.state.add(Game_1.stateIds.boot, new Game_1.States.BootState());
                this.game.state.add(Game_1.stateIds.build, new Game_1.States.BuildState(gameState));
                this.game.state.add(Game_1.stateIds.drive, new Game_1.States.DriveState(gameState));
            }
            Game.prototype.getPhaserGame = function () {
                return this.game;
            };
            Game.prototype.start = function () {
                this.game.state.start(Game_1.stateIds.boot);
            };
            return Game;
        }());
        Game_1.Game = Game;
    })(Game = Trains.Game || (Trains.Game = {}));
})(Trains || (Trains = {}));
var Trains;
(function (Trains) {
    var Game;
    (function (Game) {
        var States;
        (function (States) {
            var BootState = (function () {
                function BootState() {
                    this.preload = function (game) {
                        var images = Trains.Game.images;
                        for (var key in images) {
                            if (!images.hasOwnProperty(key)) {
                                continue;
                            }
                            var path = images[key];
                            game.load.image(path, path);
                        }
                    };
                    this.create = function (game) {
                        game.stage.smoothed = false;
                        game.state.start(Trains.Game.stateIds.build);
                    };
                }
                return BootState;
            }());
            States.BootState = BootState;
        })(States = Game.States || (Game.States = {}));
    })(Game = Trains.Game || (Trains.Game = {}));
})(Trains || (Trains = {}));
var Trains;
(function (Trains) {
    var Game;
    (function (Game) {
        var States;
        (function (States) {
            var BuildState = (function () {
                function BuildState(gameState) {
                    this.currentId = 0;
                    this.isBuildState = true;
                    this.gameState = gameState;
                }
                BuildState.prototype.create = function (game) {
                    this.background = game.add.tileSprite(0, 0, Trains.Game.width, Trains.Game.height, Trains.Game.images.background);
                    this.background.inputEnabled = true;
                    this.railwayGraphics = game.add.graphics(0, 0);
                    this.previewPiece = game.add.graphics(0, 0);
                    this.previewPiece.alpha = 0.5;
                    this.trackPoints = [];
                };
                BuildState.prototype.update = function (game) {
                    var pointer = game.input.activePointer;
                    if (!pointer) {
                        return;
                    }
                    if (!this.previewPoint && pointer.isUp) {
                        return;
                    }
                    else if (this.previewPoint && pointer.isDown) {
                        this.previewPoint.point.x = pointer.position.x;
                        this.previewPoint.point.y = pointer.position.y;
                    }
                    else if (!this.previewPoint && pointer.isDown) {
                        if (!this.trackPoints.length) {
                            this.trackPoints.push(this.createNextPoint(pointer));
                            this.drawMarkerAtPoint(game, this.trackPoints[0]);
                        }
                        this.previewPoint = this.createNextPoint(pointer);
                    }
                    else if (this.previewPoint && pointer.isUp) {
                        this.trackPoints.push(this.previewPoint);
                        this.drawMarkerAtPoint(game, this.previewPoint);
                        this.previewPoint = null;
                    }
                    this.redrawRailway(game);
                };
                BuildState.prototype.redrawRailway = function (game) {
                    var pointsAndPreview;
                    if (this.previewPoint) {
                        pointsAndPreview = this.trackPoints.slice();
                        pointsAndPreview.push(this.previewPoint);
                    }
                    else {
                        pointsAndPreview = this.trackPoints;
                    }
                    this.gameState.railway = Trains.Track.buildRailway(pointsAndPreview);
                    this.railwayGraphics.clear();
                    Trains.Game.Track.drawRailway(this.railwayGraphics, this.gameState.railway);
                };
                BuildState.prototype.drawMarkerAtPoint = function (game, point) {
                    var sprite = game.add.image(point.point.x, point.point.y, Trains.Game.images.trackMarker);
                    sprite.anchor.set(0.5);
                };
                BuildState.prototype.createNextPoint = function (pointer) {
                    return {
                        id: ++this.currentId,
                        point: {
                            x: pointer.position.x,
                            y: pointer.position.y
                        }
                    };
                };
                return BuildState;
            }());
            States.BuildState = BuildState;
        })(States = Game.States || (Game.States = {}));
    })(Game = Trains.Game || (Trains.Game = {}));
})(Trains || (Trains = {}));
var Trains;
(function (Trains) {
    var Game;
    (function (Game) {
        var States;
        (function (States) {
            var DriveState = (function () {
                function DriveState(gameState) {
                    this.gameState = gameState;
                }
                DriveState.prototype.create = function (game) {
                    this.background = game.add.tileSprite(0, 0, Trains.Game.width, Trains.Game.height, Trains.Game.images.background);
                    this.railwayGraphics = game.add.graphics(0, 0);
                    Trains.Game.Track.drawRailway(this.railwayGraphics, this.gameState.railway);
                    this.train = game.add.image(0, 0, Trains.Game.images.steamTrain);
                    this.train.anchor.setTo(0.5, 0.5);
                    this.smokeEmitter = game.add.emitter(0, 0, 50);
                    this.smokeEmitter.emitX = 0;
                    this.smokeEmitter.emitY = 0;
                    this.smokeEmitter.setSize(3, 3);
                    this.smokeEmitter.gravity = 0;
                    this.smokeEmitter.maxRotation = 20;
                    this.smokeEmitter.minRotation = -20;
                    this.smokeEmitter.maxParticleSpeed = new Phaser.Point(30, 30);
                    this.smokeEmitter.minParticleSpeed = new Phaser.Point(-30, -30);
                    this.smokeEmitter.makeParticles(Trains.Game.images.smoke1);
                    this.smokeEmitter.setAlpha(1, 0, 5000, Phaser.Easing.Quadratic.In);
                    this.smokeEmitter.setScale(0, 3, 0, 3, 5000);
                    this.trainState = {
                        trackAndPosition: {
                            trackPiece: this.gameState.railway.allTrackPieces[0],
                            position: 0
                        },
                        speed: 150
                    };
                    this.updatePosition(0);
                    this.smokeEmitter.start(false, 5000, 10);
                };
                DriveState.prototype.update = function (game) {
                    var dt = game.time.elapsedMS / 1000;
                    this.updatePosition(dt);
                };
                DriveState.prototype.updatePosition = function (dt) {
                    this.trainState = Trains.Engines.move(this.trainState, this.gameState.railway, dt);
                    var position = this.trainState.trackAndPosition.trackPiece.getPosition(this.trainState.trackAndPosition.position);
                    this.train.x = position.point.x;
                    this.train.y = position.point.y;
                    this.train.rotation = position.angle;
                    this.smokeEmitter.x = position.point.x;
                    this.smokeEmitter.y = position.point.y;
                };
                return DriveState;
            }());
            States.DriveState = DriveState;
        })(States = Game.States || (Game.States = {}));
    })(Game = Trains.Game || (Trains.Game = {}));
})(Trains || (Trains = {}));
var Trains;
(function (Trains) {
    var Game;
    (function (Game) {
        var Track;
        (function (Track) {
            var trackWidth = 8;
            var sleeperSeparation = 20;
            var sleeperExtension = 10;
            function drawRailway(graphics, railway) {
                if (!railway.allTrackPieces.length) {
                    return;
                }
                graphics.lineStyle(4, 0);
                graphics.lineColor = 1118481;
                railway.allTrackPieces.map(function (p) { return drawTrackPiece(p, graphics); });
                graphics.lineStyle(6, 0);
                graphics.lineColor = 2558988;
                drawSleepers(railway, graphics);
            }
            Track.drawRailway = drawRailway;
            function drawTrackPiece(trackPiece, g) {
                switch (trackPiece.type) {
                    case Trains.Game.trackTypes.straight:
                        drawStraightTrack(trackPiece, g);
                        break;
                    case Trains.Game.trackTypes.circular:
                        drawCircularTrack(trackPiece, g);
                        break;
                    default:
                        console.error("Can't draw tracks of type: " + trackPiece.type);
                }
            }
            Track.drawTrackPiece = drawTrackPiece;
            function drawSleepers(railway, g) {
                var trackAndPosition = {
                    position: 0,
                    trackPiece: railway.allTrackPieces[0]
                };
                while (true) {
                    trackAndPosition = Trains.Engines.getNextPosition(sleeperSeparation, trackAndPosition, railway);
                    if (!trackAndPosition) {
                        return;
                    }
                    var position = trackAndPosition.trackPiece.getPosition(trackAndPosition.position);
                    var offsets = getTrackEdgeOffset(0.5 * (sleeperExtension + trackWidth), position.angle);
                    g.moveTo(position.point.x - offsets.x, position.point.y - offsets.y);
                    g.lineTo(position.point.x + offsets.x, position.point.y + offsets.y);
                }
            }
            function drawStraightTrack(trackPiece, g) {
                var offsets = getTrackEdgeOffset(0.5 * trackWidth, trackPiece.angle);
                g.moveTo(trackPiece.startCoordinate.x + offsets.x, trackPiece.startCoordinate.y + offsets.y);
                g.lineTo(trackPiece.endCoordinate.x + offsets.x, trackPiece.endCoordinate.y + offsets.y);
                g.moveTo(trackPiece.startCoordinate.x - offsets.x, trackPiece.startCoordinate.y - offsets.y);
                g.lineTo(trackPiece.endCoordinate.x - offsets.x, trackPiece.endCoordinate.y - offsets.y);
            }
            function drawCircularTrack(trackPiece, g) {
                var offsets = getTrackEdgeOffset(0.5 * trackWidth, trackPiece.startAngle);
                g.arc(trackPiece.center.x, trackPiece.center.y, trackPiece.radius + trackWidth / 2, trackPiece.startAngle, trackPiece.endAngle, !trackPiece.clockwise);
                g.arc(trackPiece.center.x, trackPiece.center.y, trackPiece.radius - trackWidth / 2, trackPiece.startAngle, trackPiece.endAngle, !trackPiece.clockwise);
            }
            function getTrackEdgeOffset(width, startAngle) {
                return {
                    x: width * Math.sin(startAngle),
                    y: -width * Math.cos(startAngle)
                };
            }
        })(Track = Game.Track || (Game.Track = {}));
    })(Game = Trains.Game || (Trains.Game = {}));
})(Trains || (Trains = {}));
var Trains;
(function (Trains) {
    var Maths;
    (function (Maths) {
        function getGradient(from, to) {
            return (to.y - from.y) / (to.x - from.x);
        }
        Maths.getGradient = getGradient;
        function getVectorAngle(vector) {
            return Math.atan2(vector.y, vector.x);
        }
        Maths.getVectorAngle = getVectorAngle;
        function getAngleBetweenPoints(from, to) {
            return Trains.Maths.getVectorAngle({
                y: to.y - from.y,
                x: to.x - from.x
            });
        }
        Maths.getAngleBetweenPoints = getAngleBetweenPoints;
        function normaliseAngle(angle) {
            return angle + Math.ceil(-angle / (2 * Math.PI)) * 2 * Math.PI;
        }
        Maths.normaliseAngle = normaliseAngle;
    })(Maths = Trains.Maths || (Trains.Maths = {}));
})(Trains || (Trains = {}));
var Trains;
(function (Trains) {
    var Track;
    (function (Track) {
        var CircularTrackPiece = (function () {
            function CircularTrackPiece(id, center, radius, startCoordinate, endCoordinate, clockwise) {
                this.type = Trains.Game.trackTypes.circular;
                this.id = id;
                this.center = center;
                this.radius = radius;
                this.startCoordinate = startCoordinate;
                this.endCoordinate = endCoordinate;
                this.clockwise = clockwise;
                this.startAngle = Trains.Maths.normaliseAngle(Trains.Maths.getAngleBetweenPoints(center, startCoordinate));
                this.endAngle = Trains.Maths.normaliseAngle(Trains.Maths.getAngleBetweenPoints(center, endCoordinate));
                if (clockwise && this.endAngle < this.startAngle) {
                    this.endAngle += 2 * Math.PI;
                }
                else if (!clockwise && this.endAngle > this.startAngle) {
                    this.endAngle -= 2 * Math.PI;
                }
                this.length = Math.abs(radius * (this.endAngle - this.startAngle));
                var handling = 1;
                this.maxSpeed = Math.min(1, Trains.Game.maxSpeed - 1 / (handling * this.radius * this.radius));
            }
            CircularTrackPiece.prototype.getPosition = function (percent) {
                var angleOnCircle = this.startAngle + percent * (this.endAngle - this.startAngle);
                return {
                    angle: angleOnCircle + (this.clockwise ? (Math.PI) : -Math.PI) / 2,
                    point: {
                        x: this.center.x + this.radius * Math.cos(angleOnCircle),
                        y: this.center.y + this.radius * Math.sin(angleOnCircle)
                    }
                };
            };
            return CircularTrackPiece;
        }());
        Track.CircularTrackPiece = CircularTrackPiece;
    })(Track = Trains.Track || (Trains.Track = {}));
})(Trains || (Trains = {}));
var Trains;
(function (Trains) {
    var Track;
    (function (Track) {
        var StraightTrackPiece = (function () {
            function StraightTrackPiece(id, angle, startCoordinate, endCoordinate) {
                this.type = Trains.Game.trackTypes.straight;
                this.maxSpeed = Trains.Game.maxSpeed;
                this.id = id;
                this.angle = angle;
                this.startCoordinate = startCoordinate;
                this.endCoordinate = endCoordinate;
                this.dx = endCoordinate.x - startCoordinate.x;
                this.dy = endCoordinate.y - startCoordinate.y;
                this.length = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
            }
            StraightTrackPiece.prototype.getPosition = function (percent) {
                return {
                    angle: this.angle,
                    point: {
                        x: this.startCoordinate.x + percent * this.dx,
                        y: this.startCoordinate.y + percent * this.dy
                    }
                };
            };
            return StraightTrackPiece;
        }());
        Track.StraightTrackPiece = StraightTrackPiece;
    })(Track = Trains.Track || (Trains.Track = {}));
})(Trains || (Trains = {}));
var Trains;
(function (Trains) {
    var Track;
    (function (Track) {
        var ApproximateLinePixelThreshold = 0.1;
        var ApproximateLineAngleThreshold = 0.01;
        function buildTrackPiece(id, start, end, startAngle) {
            if (!startAngle && startAngle !== 0) {
                return buildStraightTrackPiece(id, start, end);
            }
            var cx, cy;
            startAngle = Trains.Maths.normaliseAngle(startAngle);
            var dx = end.x - start.x, dy = end.y - start.y;
            if (Math.abs(startAngle) < ApproximateLineAngleThreshold) {
                if (Math.abs(dy) < ApproximateLinePixelThreshold) {
                    return new Trains.Track.StraightTrackPiece(id, startAngle, start, end);
                }
                cx = start.x;
                cy = (end.y * end.y + dx * dx - start.y * start.y) / (2 * dy);
            }
            else {
                var m = -1 / Math.tan(startAngle), d = start.y - m * start.x, cxDenominator = 2 * (dx + m * dy);
                if (Math.abs(cxDenominator) < ApproximateLinePixelThreshold) {
                    return new Trains.Track.StraightTrackPiece(id, startAngle, start, end);
                }
                var cxNumerator = end.x * end.x - start.x * start.x + end.y * end.y - start.y * start.y - 2 * d * (dy);
                cx = cxNumerator / cxDenominator;
                cy = m * cx + d;
            }
            var radius = Math.sqrt((start.x - cx) * (start.x - cx) + (start.y - cy) * (start.y - cy));
            var clockwise;
            if (startAngle === Math.PI / 2) {
                clockwise = end.x > start.x;
            }
            else if (startAngle === 3 * Math.PI / 2) {
                var clockwise = end.x < start.x;
            }
            else {
                var g = Math.tan(startAngle), c = start.y - g * start.x;
                clockwise = end.y < g * end.x + c;
                if (startAngle > Math.PI / 2 && startAngle < 3 * Math.PI / 2) {
                    clockwise = !clockwise;
                }
            }
            return new Track.CircularTrackPiece(id, { x: cx, y: cy }, radius, start, end, !clockwise);
        }
        Track.buildTrackPiece = buildTrackPiece;
        function buildRailway(points) {
            var allTrackPieces = [], connections = {};
            var previousPoint, previousTrackPiece;
            points.forEach(function (point, i) {
                if (i === 0) {
                    previousPoint = point;
                    return;
                }
                if (point.point.x == previousPoint.point.x && point.point.y == previousPoint.point.y) {
                    return;
                }
                var startAngle;
                if (previousTrackPiece) {
                    startAngle = previousTrackPiece.getPosition(1).angle;
                }
                var trackPiece = buildTrackPiece(i, previousPoint.point, point.point, startAngle);
                allTrackPieces.push(trackPiece);
                if (previousTrackPiece) {
                    connections[previousTrackPiece.id] = trackPiece.id;
                }
                previousPoint = point;
                previousTrackPiece = trackPiece;
            });
            var trackPieces = {};
            allTrackPieces.map(function (t) { return trackPieces[t.id] = t; });
            return {
                allTrackPieces: allTrackPieces,
                connections: connections,
                trackPieces: trackPieces
            };
        }
        Track.buildRailway = buildRailway;
        function buildStraightTrackPiece(id, start, end) {
            var angle = Trains.Maths.getAngleBetweenPoints(start, end);
            return new Trains.Track.StraightTrackPiece(id, angle, start, end);
        }
    })(Track = Trains.Track || (Trains.Track = {}));
})(Trains || (Trains = {}));
window.onload = function () {
    var stage = document.getElementById("game"), goButton = document.getElementById("go-button"), game = new Trains.Game.Game(stage);
    game.start();
    goButton.addEventListener('click', function () {
        game.getPhaserGame().state.start(Trains.Game.stateIds.drive);
    });
};
//# sourceMappingURL=trains.js.map