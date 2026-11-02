'use client';
import { Canvas } from '@react-three/fiber';
import { ShowcaseModel, ShowcaseRig } from '@/components/three/ShowcaseModel';
import { thumbJobs } from '@/config/gallery';

export function ThumbSheet() {
  return (
    <div className="flex flex-wrap gap-4 p-4 pt-[calc(var(--header-h)+1rem)]">
      {thumbJobs.map((job) => (
        <div key={job.key} data-thumb={job.key} className="size-[480px]">
          <Canvas gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }} dpr={1}>
            <ShowcaseRig>
              <ShowcaseModel asset={job.asset} yaw={job.yaw} spin={false} />
            </ShowcaseRig>
          </Canvas>
        </div>
      ))}
    </div>
  );
}
