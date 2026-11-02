import type { CodeSample } from './CodeBlock';

export const quickstartSamples: CodeSample[] = [
  {
    lang: 'python',
    label: 'Python',
    code: `from lux3d import Lux3D

client = Lux3D(api_key="LUX3D_API_KEY")
task = client.image_to_3d.create(
    image=open("dog.jpg", "rb"),
    output=["mesh", "pbr"],
)
model = task.wait()
model.download("dog.glb")`,
  },
  {
    lang: 'typescript',
    label: 'TypeScript',
    code: `import { Lux3D } from "@lux3d/sdk";

const client = new Lux3D({ apiKey: process.env.LUX3D_API_KEY });
const task = await client.imageTo3d.create({
  image: "https://example.com/dog.jpg",
  output: ["mesh", "pbr"],
});
const model = await task.wait();
await model.download("dog.glb");`,
  },
  {
    lang: 'java',
    label: 'Java',
    code: `Lux3D client = Lux3D.builder()
    .apiKey(System.getenv("LUX3D_API_KEY"))
    .build();

Task task = client.imageTo3d().create(
    ImageTo3dRequest.builder()
        .image(Path.of("dog.jpg"))
        .output(List.of("mesh", "pbr"))
        .build());
task.waitForResult().download(Path.of("dog.glb"));`,
  },
];
