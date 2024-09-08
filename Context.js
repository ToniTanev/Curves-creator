export class BezierCurveToolContext
{
    constructor()
    {
        this.isStarted = false;
        this.curveDegree = 0;
        this.collectedPoints = [];
    }

    clear()
    {
        this.isStarted = false;
        this.curveDegree = 0;
        this.collectedPoints = [];
    }
}