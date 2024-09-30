import * as THREE from 'three';
import {camera, renderer} from "./CurveCreator.js";

export const vectorEpsilon = 0.0000001;
function slerp( u, v, t )
{
    // copy vectors, so that we don't modify the originals
    const u1 = u.clone();
    const v1 = v.clone();

    const angleBetween = u1.angleTo( v1 );
    const nom = u1.multiplyScalar( Math.sin( angleBetween * ( 1 - t ) ) ).add( v1.multiplyScalar( Math.sin( angleBetween * t ) ) );
    return nom.divideScalar( Math.sin( angleBetween ) );
}

function strans(u, v)
{
    // copy vectors, so that we don't modify the originals
    const u1 = u.clone();
    const v1 = v.clone();

    const uLen = u1.length();
    const vLen = v1.length();

    const vScaled = v1.normalize().multiplyScalar( uLen );

    return u1.multiplyScalar( Math.cos( vLen ) ).add( vScaled.multiplyScalar( Math.sin( vLen ) ) );
}

const epsilonOffset = 0.07;
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
        const steps = this.controlPoints.length - 1;
        let prevPoints = this.controlPoints;

        for( let i = 0; i < steps; i++ )
        {
            const currPoints = [];
            for( let j = 0; j < prevPoints.length - 1; j++ )
            {
                currPoints.push( slerp( prevPoints[j], prevPoints[j + 1], t ) );
            }

            prevPoints = currPoints;
        }

        return prevPoints[ 0 ];
    }
}

class CubicHermiteCurve
{
    constructor( p0, v0, p1, v1 )
    {
        this.p0 = p0;
        this.v0 = v0;
        this.p1 = p1;
        this.v1 = v1;
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
        let pt = slerp( this.p0, this.p1, this.H1( t ) );
        pt = strans( pt, this.v0.multiplyScalar( this.h0( t ) ) );
        pt = strans( pt, this.v1.multiplyScalar( this.h1( t ) ) );

        return pt;
    }

    H1( t )
    {
        return Math.pow( t, 2 ) * ( 3 - 2*t );
    }

    h0( t )
    {
        return t * Math.pow( ( 1 - t ), 2 );
    }

    h1( t )
    {
        return Math.pow( t, 2 ) * ( t - 1 );
    }
}

export class CubicHermiteCurves
{
    constructor( controlPoints, controlVectors )
    {
        this.controlPoints = controlPoints;
        this.controlVectors = controlVectors;
    }

    generateCurves()
    {
        const allPoints = [];

        for( let i = 0; i < this.controlPoints.length - 1; i += 2 )
        {
            const p0 = this.controlPoints[ i ];
            const v0 = this.controlVectors[ i ];
            const p1 = this.controlPoints[ i + 1 ];
            const v1 = this.controlVectors[ i + 1 ];

            const twoPointCurve = new CubicHermiteCurve(p0, v0, p1, v1);
            const currPoints = twoPointCurve.generateCurve();

            allPoints.push( ...currPoints );
        }

        return allPoints;
    }
}

// assumes the sphere is centered at (0, 0, 0)
export function offsetPoints( curvePoints )
{
    // slightly offset the curve points to avoid Z fight with the sphere
    // the offset is in the direction of the sphere normal at that point
    // the normal coincides with the curve point itself when the curve point is on the sphere which is centered at (0, 0, 0)

    for( const point of curvePoints )
    {
        const normalized = new THREE.Vector3(point.x, point.y, point.z).normalize();
        const epsilonOffsetVec = normalized.multiplyScalar(epsilonOffset);
        point.add( epsilonOffsetVec );
    }
}

// assumes the sphere is centered at (0, 0, 0)
export function getPlaneAtSpherePoint( spherePoint )
{
    const normal = spherePoint.clone().normalize();
    const p = -spherePoint.length();

    return new THREE.Plane( normal, p );
}

export function intersectPlaneWithMouse( event, plane )
{
    // calculate ray
    const mouse = new THREE.Vector2;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / (rect.right - rect.left)) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;

    const raycaster = new THREE.Raycaster();

    camera.updateMatrixWorld();

    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera(mouse, camera);

    // intersect with the plane
    const dummy = new THREE.Vector3;
    return raycaster.ray.intersectPlane( plane, dummy );
}

export function vectorsEqual( vec1, vec2, epsilon )
{
    return vec1.distanceTo( vec2 ) < epsilon;
}