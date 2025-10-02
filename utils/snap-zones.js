export function getSnapZones(container) {
  const edgeMargin = 32;
  const cornerMargin = 48;
  const edgeCenterRatio = 0.4;

  const w = container.clientWidth;
  const h = container.clientHeight;

  const halfW = w / 2;
  const halfH = h / 2;

  const centerLeft = w * (0.5 - edgeCenterRatio / 2);
  const centerRight = w * (0.5 + edgeCenterRatio / 2);
  const centerTop = h * (0.5 - edgeCenterRatio / 2);
  const centerBottom = h * (0.5 + edgeCenterRatio / 2);

  return [
    {
      position: "topleft",
      detect: { x: 0, y: 0, w: cornerMargin, h: cornerMargin },
      snap: { x: 0, y: 0, w: halfW, h: halfH },
    },
    {
      position: "topright",
      detect: { x: w - cornerMargin, y: 0, w: cornerMargin, h: cornerMargin },
      snap: { x: halfW, y: 0, w: halfW, h: halfH },
    },
    {
      position: "bottomleft",
      detect: { x: 0, y: h - cornerMargin, w: cornerMargin, h: cornerMargin },
      snap: { x: 0, y: halfH, w: halfW, h: halfH },
    },
    {
      position: "bottomright",
      detect: {
        x: w - cornerMargin,
        y: h - cornerMargin,
        w: cornerMargin,
        h: cornerMargin,
      },
      snap: { x: halfW, y: halfH, w: halfW, h: halfH },
    },
    {
      position: "top",
      detect: {
        x: centerLeft,
        y: 0,
        w: centerRight - centerLeft,
        h: edgeMargin,
      },
      snap: { x: 0, y: 0, w: w, h: halfH },
    },
    {
      position: "bottom",
      detect: {
        x: centerLeft,
        y: h - edgeMargin,
        w: centerRight - centerLeft,
        h: edgeMargin,
      },
      snap: { x: 0, y: halfH, w: w, h: halfH },
    },
    {
      position: "left",
      detect: {
        x: 0,
        y: centerTop,
        w: edgeMargin,
        h: centerBottom - centerTop,
      },
      snap: { x: 0, y: 0, w: halfW, h: h },
    },
    {
      position: "right",
      detect: {
        x: w - edgeMargin,
        y: centerTop,
        w: edgeMargin,
        h: centerBottom - centerTop,
      },
      snap: { x: halfW, y: 0, w: halfW, h: h },
    },
  ];
}
