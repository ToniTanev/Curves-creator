import {BezierCurve, CubicHermiteCurves, offsetPoints} from "../Math";
import {drawPolygon} from "../Visualizer";


export class BezierCurveObject
{
    constructor()
    {
        this.controlPoints = [];
        this.meshPoints = [];

        this.poly = null;
        this.controlPoly = null;
    }

    redrawPolys()
    {
        deleteObject( this.poly );
        deleteObject( this.controlPoly );

        if( this.controlPoints.length >= 2 )
        {
            const curve = new BezierCurve( this.controlPoints );

            const curvePoints = curve.generateCurve();

            offsetPoints( curvePoints );

            this.poly = drawPolygon( curvePoints, 'green' );

            const controlPointsCopy = [];
            for( let i = 0; i < this.controlPoints.length; i++ )
            {
                controlPointsCopy.push( this.controlPoints[ i ].clone() );
            }

            offsetPoints( controlPointsCopy );

            this.controlPoly = drawPolygon( controlPointsCopy, 'orange' );
        }
    }
}

export class HermiteCurveObject
{
    constructor()
    {
        this.controlPoints = [];
        this.meshPoints = [];
        this.controlVectors = [];
        this.visualVectors = [];

        this.poly = null;
        this.controlPoly = null;
    }

    redrawPolys()
    {
        deleteObject( this.poly );
        deleteObject( this.controlPoly );

        if( this.controlPoints.length >= 2 && this.controlPoints.length === this.controlVectors.length )
        {
            const curve = new CubicHermiteCurves( this.controlPoints, this.controlVectors );

            const curvePoints = curve.generateCurves();

            offsetPoints( curvePoints );

            this.poly = drawPolygon( curvePoints, 'green' );
        }
    }
}