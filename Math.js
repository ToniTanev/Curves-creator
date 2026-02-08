import * as THREE from 'three';
import {camera, renderer, scene} from "./main.js";
import {isSphereObj, stickToSphere} from "./Objects/Sphere.js";

export const vectorEpsilon = 0.0000001;
function slerp( u, v, t )
{
    // copy vectors, so that we don't modify the originals
    const u1 = u.clone();
    const v1 = v.clone();

    const angleBetween = u1.angleTo( v1 );

    if( Math.abs( angleBetween ) < 0.0001 )
        return u1;

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

    return u1.multiplyScalar( Math.cos( vLen/uLen ) ).add( vScaled.multiplyScalar( Math.sin( vLen/uLen ) ) );
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

    generateControlPolygon()
    {
        const controlPolygonPoints = [];

        for( let i = 0; i < this.controlPoints.length - 1; i++)
        {
            for( let t = 0.0; t <= 1.0; t += 0.01 )
            {
                controlPolygonPoints.push( slerp( this.controlPoints[i], this.controlPoints[i + 1], t ) );
            }
        }

        return controlPolygonPoints;
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
        const su10 = strans( this.p0, this.v0.clone().multiplyScalar( t ) );
        const su11 = slerp( this.p0, this.p1, t );
        const su12 = strans( this.p1, this.v1.clone().multiplyScalar( t - 1 ) );

        const su20 = slerp( su10, su11, t );
        const su21 = slerp( su11, su12, t );

        const su30 = slerp( su20, su21, t );

        return su30;
    }

    getBezierControlPoints()
    {
        const b0 = this.p0.clone();
        const oneThirdOfV0 = this.v0.clone().divideScalar( 3 );
        const b1 = strans( this.p0, oneThirdOfV0 );
        const oneThirdOfV1 = this.v1.clone().divideScalar( -3 );
        const b2 = strans( this.p1, oneThirdOfV1 );
        const b3 = this.p1.clone();

        return [b0, b1, b2, b3];
    }

    generateControlPolygon()
    {
        const controlPolygonPoints = [];

        const bezierControlPoints = this.getBezierControlPoints();

        for( let i = 0; i < bezierControlPoints.length - 1; i++)
        {
            for( let t = 0.0; t <= 1.0; t += 0.01 )
            {
                controlPolygonPoints.push( slerp( bezierControlPoints[i], bezierControlPoints[i + 1], t ) );
            }
        }

        return controlPolygonPoints;
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

        for( let i = 0; i < this.controlPoints.length - 1; i++ )
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

    generateControlPolygons()
    {
        const allPoints = [];

        for( let i = 0; i < this.controlPoints.length - 1; i++ )
        {
            const p0 = this.controlPoints[ i ];
            const v0 = this.controlVectors[ i ];
            const p1 = this.controlPoints[ i + 1 ];
            const v1 = this.controlVectors[ i + 1 ];

            const twoPointCurve = new CubicHermiteCurve(p0, v0, p1, v1);
            const currPoints = twoPointCurve.generateControlPolygon();

            allPoints.push( ...currPoints );
        }

        return allPoints;
    }
}

export function getMouse( event )
{
    const mouse = new THREE.Vector2;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / (rect.right - rect.left)) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;

    return mouse;
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

export function raycastMouse( mouse )
{
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    //const mouse = new THREE.Vector2;
    //mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    //mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    const raycaster = new THREE.Raycaster();

    camera.updateMatrixWorld();

    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    return raycaster.intersectObjects(scene.children);
}

export function raycastMouseOnSphere( mouse )
{
    let resultPt = null;

    const intersects = raycastMouse( mouse );

    const inx = intersects.findIndex( intrs => isSphereObj( intrs.object ) );

    if( inx !== -1 )
    {
        resultPt = intersects[ inx ].point;
        stickToSphere( resultPt );
    }

    return resultPt;
}

export function intersectPlaneWithMouse( mouse, plane )
{
    // calculate ray
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