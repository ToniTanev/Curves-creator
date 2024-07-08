function slerp( u, v, t )
{
    const angleBetween = u.angleTo( v );

    return ( Math.sin( angleBetween * ( 1 - t ) ) * u + Math.sin( angleBetween * t ) * v ) / Math.sin( angleBetween );
}

export class BezierCurve
{
    constructor( controlPoints )
    {
        this.controlPoints = controlPoints;
    }

    generateCurve()
    {
        const curvePoints = [];
        for( let t = 0.0; t <= 1.0; t += 0.01 )
        {
            curvePoints.push( this.generatePoint( t ) );
        }

        return curvePoints;
    }
    generatePoint( t )
    {
        const steps = this.controlPoints.size - 1;
        let prevPoints = this.controlPoints;

        for( let i = 0; i < steps; i++ )
        {
            const currPoints = [];
            for( let j = 0; j < prevPoints.size - 1; j++ )
            {
                currPoints.push( slerp( prevPoints[j], prevPoints[j + 1], t ) );
            }

            prevPoints = currPoints;
        }

        return prevPoints[0];
    }
}