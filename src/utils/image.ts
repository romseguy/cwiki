import picaFn from "pica";

let picaInstance: any;
export function getPicaInstance() {
  if (picaInstance) {
    return picaInstance;
  }

  picaInstance = picaFn();

  return picaInstance;
}

export type Base64Image = { base64?: string; width: number; height: number };

export const getBase64 = (file: File): Promise<Base64Image> =>
  new Promise(function (resolve, reject) {
    let reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        const img = new Image();
        img.src = reader.result;

        img.onload = () => {
          if (typeof reader.result === "string")
            resolve({
              base64: reader.result,
              height: img.height,
              width: img.width
            });
        };
      } else reject("invalid type");
    };

    reader.onerror = (error) => reject(error);
  });

// Calculate the next 'scale' to use based on how hard the user scrolled
export function calculateScale(scale: number, delta: number): number {
  const zoomFactor = Math.max(Math.abs(delta) / 1000, 0.1);
  const nextScale = delta > 0 ? scale - zoomFactor : scale + zoomFactor;
  const clamped = Math.min(10, Math.max(0.5, nextScale));

  return clamped;
}

export const getMeta = async (
  url: string
): Promise<{ height: number; width: number }> => {
  return new Promise((resolve, reject) => {
    var img = new Image();
    img.src = url;
    img.onload = function () {
      //@ts-expect-error
      resolve({ width: this.width, height: this.height });
    };
  });
};

export function isCached(src: string) {
  const img = new Image();
  img.src = src;
  const complete = img.complete;
  console.log("🚀 ~ file: image.ts:65 ~ isCached ~ src:", complete);
  img.src = "";
  return complete;
}

// export function isCached(src: string) {
//   const imgEl = document.createElement("img");
//   console.log("🚀 ~ file: image.ts:73 ~ isCached ~ imgEl:", imgEl.complete);
//   imgEl.src = src;
//   return imgEl.complete || imgEl.width + imgEl.height > 0;
// }
