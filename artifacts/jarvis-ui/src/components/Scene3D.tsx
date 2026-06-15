"use client";

export default function Scene3D() {
  return (
    <div className="fixed inset-0 z-0 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(120,40,200,0.15),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(60,100,220,0.1),transparent_70%)]" />
    </div>
  );
}
