namespace Trains.Track {
    // Higher values will result in more curved track pieces getting approximated as striaght lines
    const ApproximateLinePixelThreshold = 0.1;
    const ApproximateLineAngleThreshold = 0.01;

    export function buildTrackPiece(id: number, start: Trains.Maths.IPoint, end: Trains.Maths.IPoint, startAngle: number): Trains.Track.ITrackPiece {
        // If there is no constraint on the start angle, draw a straight line
        if (!startAngle && startAngle !== 0) {
            return buildStraightTrackPiece(id, start, end);
        }

        // centre of circle is (Cx, Cy)
        // arc goes from (x1,y1) -> (x2,y2)
        // tangent parallel to start angle is y = tan(a)x + c
        // line from start to centre of circle is y = mx + d (where x = -1/tan(a) & d = y1 - mx1)
        var cx: number,
            cy: number;

        startAngle = Trains.Maths.normaliseAngle(startAngle);

        let dx = end.x - start.x,
            dy = end.y - start.y;

        if (Math.abs(startAngle) < ApproximateLineAngleThreshold) {
            if (Math.abs(dy) < ApproximateLinePixelThreshold) {
                // Line is essentially straight
                return new Trains.Track.StraightTrackPiece(id, startAngle, start, end);
            }
            // Special case if line to center has an infinite getGradient
            cx = start.x;
            cy = (end.y*end.y + dx*dx - start.y*start.y)/(2*dy);
        } else {
            let m = -1/Math.tan(startAngle),
                d = start.y - m*start.x,
                cxDenominator = 2 * (dx + m*dy);

            if (Math.abs(cxDenominator) < ApproximateLinePixelThreshold) {
                // Line is essentially straight
                return new Trains.Track.StraightTrackPiece(id, startAngle, start, end);
            }

            let cxNumerator = end.x * end.x - start.x * start.x + end.y * end.y - start.y * start.y - 2*d*(dy);
            cx = cxNumerator / cxDenominator;
            cy = m * cx + d;
        }

        let radius = Math.sqrt((start.x - cx)*(start.x - cx) + (start.y - cy)*(start.y - cy))

        // Work out if track goes clockwise
        var clockwise: boolean;
        if (startAngle === Math.PI/2) {
            clockwise = end.x > start.x;
        } else if (startAngle === 3*Math.PI/2) {
            var clockwise = end.x < start.x;
        } else {
            // Equation of the 'entering tangent': y = gx + c.
            // For tracks that initially point right, if the end point is under this line the track goes clockwise.
            // For tracks that intiailly point left, the opposite is true
            let g = Math.tan(startAngle),
                c = start.y - g*start.x;

            clockwise = end.y < g*end.x + c;
            if (startAngle > Math.PI/2 && startAngle < 3*Math.PI/2) {
                clockwise = !clockwise;
            }
        }

        return new CircularTrackPiece(id, {x:cx, y:cy}, radius, start, end, !clockwise);
    }

    export function buildRailway(points: ITrackPoint[]): Trains.Track.IRailway {
        let allTrackPieces: ITrackPiece[] = [],
            connections: { [id: number]: number } = { };

        var previousPoint: ITrackPoint,
            previousTrackPiece: ITrackPiece

        points.forEach((point, i) => {
            if (i === 0) {
                previousPoint = point;
                return;
            }

            if (point.point.x == previousPoint.point.x && point.point.y == previousPoint.point.y) {
                // These points are the same, skip this one
                return;
            }

            var startAngle: number;
            if (previousTrackPiece) {
                startAngle = previousTrackPiece.getPosition(1).angle;
            }

            let trackPiece = buildTrackPiece(i, previousPoint.point, point.point, startAngle);
            allTrackPieces.push(trackPiece);

            // Just connect tracks sequentially
            if (previousTrackPiece) {
                connections[previousTrackPiece.id] = trackPiece.id;
            }

            previousPoint = point;
            previousTrackPiece = trackPiece;
        });

        let trackPieces = {};
        allTrackPieces.map(t => trackPieces[t.id] = t);

        return {
            allTrackPieces: allTrackPieces,
            connections: connections,
            trackPieces: trackPieces
        };
    }

    function buildStraightTrackPiece(id: number, start: Trains.Maths.IPoint, end: Trains.Maths.IPoint): Trains.Track.ITrackPiece {
        var angle = Trains.Maths.getAngleBetweenPoints(start, end);
        return new Trains.Track.StraightTrackPiece(id, angle, start, end);
    }
}
