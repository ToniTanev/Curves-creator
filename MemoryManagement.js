import * as THREE from 'three';
import {scene} from "./CurveCreator.js";

// deletes a Group or an Object3D
export function deleteObject( object )
{
    if( object )
    {
        scene.remove( object );

        object.traverse( child =>
        {
            if ( child instanceof THREE.Mesh )
            {
                child.geometry.dispose();
                child.material.dispose();
            }
        }
        );
    }
}