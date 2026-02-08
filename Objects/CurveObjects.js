import * as THREE from 'three';
import {BezierCurve, CubicHermiteCurves, offsetPoints} from "../Math.js";
import {defaultPointSize, defaultVectorSize, drawPoint, drawPolygon, drawVector} from "../Visualizer.js";
import {deleteObject} from "../MemoryManagement.js";
import {scene} from "../CurveCreator.js";
import {filterIntersects, highlightVisualVectorObj} from "../Tools/ToolsBase.js";
import {BezierSettings, HermiteSettings} from "../Data/Settings.js";
import {defaultSphereRadius, stickToSphere} from "./Sphere.js";

export const bezierObjects = [];
export const hermiteObjects = [];

class CurveObject // interface
{
    constructor() {}

    clearPolys() {}

    clearAll() {}

    redrawPointsAndVectors() {}

    redrawPolys() {}

    findIndex( obj ) {}

    highlight( outlinePass ) {}

    filterCurveObjects( intersects ) {}
}

export class BezierCurveObject
{
    constructor()
    {
        this.settings = new BezierSettings();

        this.controlPoints = [];
        this.meshPoints = [];

        this.poly = null;
        this.controlPoly = null;
    }

    clearPolys()
    {
        deleteObject( this.poly );
        deleteObject( this.controlPoly );

        this.poly = null;
        this.controlPoly = null;
    }

    clearAll()
    {
        for( const point of this.meshPoints )
        {
            deleteObject( point );
        }

        this.controlPoints = [];
        this.meshPoints = [];

        this.clearPolys();
    }

    redrawPointsAndVectors()
    {
        for( const point of this.meshPoints )
        {
            deleteObject( point );
        }

        this.meshPoints = [];

        for( const point of this.controlPoints )
        {
            const meshPt = drawPoint( point, this.settings.pointColor, this.settings.pointScale * defaultPointSize );
            meshPt.parentCurve = this;
            this.meshPoints.push( meshPt );
        }
    }

    redrawPolys()
    {
        this.clearPolys();

        if( this.controlPoints.length >= 2 )
        {
            const curve = new BezierCurve( this.controlPoints );

            const curvePoints = curve.generateCurve();

            offsetPoints( curvePoints );

            this.poly = drawPolygon( curvePoints, this.settings.curveColor );

            if( this.settings.showControlPoly )
            {
                const controlPolygonPoints = curve.generateControlPolygon();

                offsetPoints( controlPolygonPoints );

                this.controlPoly = drawPolygon( controlPolygonPoints, this.settings.controlPolyColor );
            }
        }
    }

    findIndex( obj )
    {
        let inx = -1;

        if( obj.parentCurve === this )
        {
            for( let i = 0; i < this.meshPoints.length; i++ )
            {
                if( this.meshPoints[ i ] === obj )
                {
                    inx = i;
                    break;
                }
            }
        }

        return inx;
    }

    highlight( outlinePass )
    {
        for( const point of this.meshPoints )
        {
            outlinePass.selectedObjects.push( point );
        }
    }

    filterCurveObjects( intersects )
    {
        intersects = filterIntersects( intersects );
        return intersects.filter( (inters) => this.findIndex( inters.object ) !== -1 );
    }
}

export class HermiteCurveObject
{
    constructor()
    {
        this.settings = new HermiteSettings();

        this.controlPoints = [];
        this.meshPoints = [];
        this.controlVectors = [];
        this.visualVectors = [];

        this.poly = null;
        this.controlPoly = null;
    }

    clearPolys()
    {
        deleteObject( this.poly );
        deleteObject( this.controlPoly );

        this.poly = null;
        this.controlPoly = null;
    }

    clearAll()
    {
        for( const point of this.meshPoints )
        {
            deleteObject( point );
        }

        for( const vector of this.visualVectors )
        {
            deleteObject( vector );
        }

        this.controlPoints = [];
        this.meshPoints = [];
        this.controlVectors = [];
        this.visualVectors = [];

        this.clearPolys();
    }

    redrawPointsAndVectors()
    {
        for( const point of this.meshPoints )
        {
            deleteObject( point );
        }

        for( const vector of this.visualVectors )
        {
            deleteObject( vector );
        }

        this.meshPoints = [];
        this.visualVectors = [];

        for( const point of this.controlPoints )
        {
            const meshPt = drawPoint( point, this.settings.pointColor, this.settings.pointScale * defaultPointSize );
            meshPt.parentCurve = this;
            this.meshPoints.push( meshPt );
        }

        for( let i = 0; i < this.controlVectors.length; i++ )
        {
            const startPt = this.controlPoints[ i ];
            const endPt = startPt.clone().add( this.controlVectors[ i ] );

            const visualVector = drawVector( startPt, endPt, this.settings.vectorColor, this.settings.vectorScale * defaultVectorSize );
            this.assignAsParentToVector( visualVector );
            this.visualVectors.push( visualVector );
        }
    }

    redrawPolys()
    {
        this.clearPolys();

        if( this.controlPoints.length >= 2 && this.controlPoints.length === this.controlVectors.length )
        {
            const curve = new CubicHermiteCurves( this.controlPoints, this.controlVectors );

            const curvePoints = curve.generateCurves();

            offsetPoints( curvePoints );

            this.poly = drawPolygon( curvePoints, this.settings.curveColor );

            if( this.settings.showControlPoly )
            {
                const controlPolygonPoints = curve.generateControlPolygons();

                offsetPoints( controlPolygonPoints );

                this.controlPoly = drawPolygon( controlPolygonPoints, this.settings.controlPolyColor );
            }
        }
    }

    assignAsParentToVector( visualVector )
    {
        visualVector.parentCurve = this;

        visualVector.traverse( child =>
            {
                if ( child instanceof THREE.Mesh )
                {
                    child.parentCurve = this;
                }
            }
        );
    }

    findIndex( obj )
    {
        let inx = -1;

        if( obj.parentCurve === this )
        {
            if( isCurvePointObj( obj ) )
            {
                for( let i = 0; i < this.meshPoints.length; i++ )
                {
                    if( this.meshPoints[ i ] === obj )
                    {
                        inx = i;
                        break;
                    }
                }
            }
            else // it is a visual vector obj
            {
                for( let i = 0; i < this.visualVectors.length; i++ )
                {
                    if( this.visualVectors[ i ] === obj || this.visualVectors[ i ] === obj.parent )
                    {
                        inx = i;
                        break;
                    }
                }
            }
        }

        return inx;
    }

    highlight( outlinePass )
    {
        for( const point of this.meshPoints )
        {
            outlinePass.selectedObjects.push( point );
        }

        for( const visualVector of this.visualVectors )
        {
            highlightVisualVectorObj( visualVector, outlinePass );
        }
    }

    filterCurveObjects( intersects )
    {
        intersects = filterIntersects( intersects );
        return intersects.filter( (inters) => this.findIndex( inters.object ) !== -1 );
    }
}

export function isCurvePointObj( obj )
{
    return obj.parentCurve !== undefined && obj.parent === scene && obj.children.length === 0;
}

export function isCurveVectorObj( obj )
{
    return obj.parentCurve !== undefined && !isCurvePointObj( obj );
}

export function isBezierCurveObj( obj )
{
    return obj.meshPoints !== undefined && obj.visualVectors === undefined;
}

export function isHermiteCurveObj( obj )
{
    return obj.meshPoints !== undefined && obj.visualVectors !== undefined;
}

export function isCurveObj( obj )
{
    return isBezierCurveObj( obj ) || isHermiteCurveObj( obj );
}

export function onSphereScaleChange( sphereScale )
{
    for( const bezierObj of bezierObjects )
    {
        if( bezierObj.settings.stickToSphere )
        {
            for( const pt of bezierObj.controlPoints )
            {
                stickToSphere( pt );
            }

            bezierObj.redrawPointsAndVectors();
            bezierObj.redrawPolys();
        }
    }

    for( const hermiteObj of hermiteObjects )
    {
        if( hermiteObj.settings.stickToSphere )
        {
            for( const pt of hermiteObj.controlPoints )
            {
                stickToSphere( pt );
            }

            hermiteObj.redrawPointsAndVectors();
            hermiteObj.redrawPolys();
        }
    }
}

export function onDeleteCurveObject( curve )
{
    curve.clearAll();

    if( isBezierCurveObj( curve ) )
    {
        const inx = bezierObjects.indexOf( curve );
        if ( inx !== -1 )
        {
            bezierObjects.splice( inx, 1 );
        }
    }
    else if( isHermiteCurveObj( curve ) )
    {
        const inx = hermiteObjects.indexOf( curve );
        if ( inx !== -1 )
        {
            hermiteObjects.splice( inx, 1 );
        }
    }
}