function Slerp(u, v, t)
{
    const angleBetween = u.angleTo(v);

    return (Math.sin(angleBetween * (1 - t)) * u + Math.sin(angleBetween * t) * v) / Math.sin(angleBetween);
}