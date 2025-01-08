import * as path from "https://deno.land/std@0.215.0/path/mod.ts";
import { Denops } from "https://deno.land/x/denops_std@v6.0.1/mod.ts";

const log = async (denops: Denops, content: string[]) => {
  try {
    await denops.call("setline", 1, content);
  } catch (e) {
    console.error(e);
  }
};

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async badApple(): Promise<void> {
      const parentDir = path.dirname(path.fromFileUrl(import.meta.url));
      const filePath = path.join(parentDir, "frames.txt");

      try {
        const rawContent = await Deno.readTextFile(filePath);
        const frames = rawContent.split(/^\n$/gm);
        const startTime = Date.now();
        let frameIndex = 0;

        const playFrame = async (frame: string) => {
          const elapsedTime = Date.now() - startTime;
          const targetTime = ++frameIndex * (1000 / 30); // 30 FPS
          const delay = targetTime - elapsedTime;

          const frameLines = frame.split("\n");
          await log(denops, frameLines);

          if (frames.length > 0) {
            setTimeout(async () => {
              await playFrame(frames.shift() || "");
            }, Math.max(0, delay));
          } else {
            console.log("Playback ended.");
          }
        };

        await denops.cmd("enew");
        await denops.cmd("setlocal nowrap");

        await playFrame(frames.shift() || "");
      } catch (e) {
        console.error("Failed to play frames:", e);
      }
    },
  };

  await denops.cmd(
    `command! BadApple call denops#request('${denops.name}', 'badApple', [])`,
  );
}
