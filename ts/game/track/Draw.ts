namespace Trains.Game.Track {

    const trackWidth = 8;
    const sleeperSeparation = 20;
    const sleeperExtension = 10;

    export function drawRailway(graphics: Phaser.Graphics, railway: Trains.Track.IRailway) {
        if (!railway.allTrackPieces.length) {
            return;
        }

        graphics.lineStyle(4, 0);
        graphics.lineColor = 1118481;
        railway.allTrackPieces.map(p => drawTrackPiece(p, graphics));

        graphics.lineStyle(6, 0);
        graphics.lineColor = 2558988;
        drawSleepers(railway, graphics);
    }

    export function drawTrackPiece(trackPiece: Trains.Track.ITrackPiece, g: Phaser.Graphics) {

        switch(trackPiece.type) {
            case Trains.Game.trackTypes.straight:
                drawStraightTrack(<Trains.Track.StraightTrackPiece>trackPiece, g);
                break;
            case Trains.Game.trackTypes.circular:
                drawCircularTrack(<Trains.Track.CircularTrackPiece>trackPiece, g);
                break;
            default:
                console.error("Can't draw tracks of type: " + trackPiece.type);
        }
    }

    function drawSleepers(railway: Trains.Track.IRailway, g: Phaser.Graphics) {
        var trackAndPosition = {
            position: 0,
            trackPiece: railway.allTrackPieces[0]
        };

        // Move along the rail, drawing sleepers
        while(true) {
            trackAndPosition = Trains.Engines.getNextPosition(sleeperSeparation, trackAndPosition, railway);
            if (!trackAndPosition) {
                return;
            }
            let position = trackAndPosition.trackPiece.getPosition(trackAndPosition.position);

            let offsets = getTrackEdgeOffset(0.5*(sleeperExtension + trackWidth), position.angle);

            g.moveTo(position.point.x - offsets.x, position.point.y - offsets.y);
            g.lineTo(position.point.x + offsets.x, position.point.y + offsets.y);
        }
    }

    function drawStraightTrack(trackPiece: Trains.Track.StraightTrackPiece, g: Phaser.Graphics) {
        let offsets = getTrackEdgeOffset(0.5*trackWidth, trackPiece.angle);

        g.moveTo(trackPiece.startCoordinate.x + offsets.x, trackPiece.startCoordinate.y + offsets.y);
        g.lineTo(trackPiece.endCoordinate.x + offsets.x, trackPiece.endCoordinate.y + offsets.y);

        g.moveTo(trackPiece.startCoordinate.x - offsets.x, trackPiece.startCoordinate.y - offsets.y);
        g.lineTo(trackPiece.endCoordinate.x - offsets.x, trackPiece.endCoordinate.y - offsets.y);
    }

    function drawCircularTrack(trackPiece: Trains.Track.CircularTrackPiece, g: Phaser.Graphics) {
        let offsets = getTrackEdgeOffset(0.5*trackWidth, trackPiece.startAngle);

        g.arc(trackPiece.center.x,
              trackPiece.center.y,
              trackPiece.radius + trackWidth/2,
              trackPiece.startAngle,
              trackPiece.endAngle,
              !trackPiece.clockwise);

        g.arc(trackPiece.center.x,
              trackPiece.center.y,
              trackPiece.radius - trackWidth/2,
              trackPiece.startAngle,
              trackPiece.endAngle,
              !trackPiece.clockwise);
    }

    // The offset of the start of the right edge with respect to the center of the track
    function getTrackEdgeOffset(width: number, startAngle: number): Trains.Maths.IPoint {
        // An angle of 0 is vertical so this looks atypical:
        return {
            x: width*Math.sin(startAngle),
            y: -width*Math.cos(startAngle)
        };
    }

}
