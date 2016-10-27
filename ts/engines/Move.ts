namespace Trains.Engines {

    export function move(currentTrainState: ITrainState, railway: Trains.Track.IRailway, dt: number) : ITrainState {
        var distanceToTravel: number = currentTrainState.speed * dt,
            newSpeed = currentTrainState.speed;

        var newTrackAndPosition = getNextPosition(distanceToTravel, currentTrainState.trackAndPosition, railway);
        if (newTrackAndPosition == null) {
            // we've ran out of track - finish at the end of the current piece of track
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

    export function getNextPosition(distance: number, trackAndPosition: ITrackAndPosition, railway: Trains.Track.IRailway) : ITrackAndPosition {
        var trackPieces = getTrackPiecesCovered(
            railway,
            trackAndPosition.position,
            trackAndPosition.trackPiece,
            distance);

        return trackPieces[trackPieces.length-1];
    }

    function getTrackPiecesCovered(
        railway: Trains.Track.IRailway,
        currentPositionOnTrack: number,
        currentTrackPiece: Trains.Track.ITrackPiece,
        distance: number): ITrackAndPosition[] {

        let trackPositions: ITrackAndPosition[] = [];
        // Move to the next track if the distance to travel if greater than the length of the track
        while(true) {
            let distanceLeftOnThisTrackPiece = (1-currentPositionOnTrack) * currentTrackPiece.length;
            currentPositionOnTrack = currentPositionOnTrack + distance / currentTrackPiece.length;

            trackPositions.push({
                trackPiece: currentTrackPiece,
                position: Math.min(currentPositionOnTrack, 1)
            });

            if (currentPositionOnTrack <= 1) {
                return trackPositions;
            }

            var nextTrackPiece: Trains.Track.ITrackPiece;
            let nextTrackPieceId = railway.connections[currentTrackPiece.id];
            if (nextTrackPieceId || nextTrackPieceId === 0) {
                nextTrackPiece = railway.trackPieces[nextTrackPieceId];
            }

            if (!nextTrackPiece) {
                trackPositions.push(null);
                return trackPositions;
            }

            // We've gone off this piece of track, set currentTrackPiece to the next one
            // and adjust the distance left to travel
            distance -= distanceLeftOnThisTrackPiece;
            currentPositionOnTrack = 0;
            currentTrackPiece = nextTrackPiece;
        }
    }
}
