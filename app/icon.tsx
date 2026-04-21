import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: "#FF8FA3",
          borderRadius: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "serif",
            fontSize: 300,
            color: "#FFFDF5",
            lineHeight: 1,
            marginTop: 20,
          }}
        >
          m
        </span>
      </div>
    ),
    { ...size }
  );
}
