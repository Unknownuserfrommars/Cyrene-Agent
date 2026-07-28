import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { TitleBar } from "./TitleBar";

describe("TitleBar", () => {
  it("exposes the light and dark theme control as an accessible switch", () => {
    const markup = renderToStaticMarkup(
      React.createElement(TitleBar, {
        title: "Cyrene Chat",
        theme: "classic",
        onToggleTheme: vi.fn(),
        onMinimize: vi.fn(),
        onToggleMaximize: vi.fn(),
        onClose: vi.fn(),
      }),
    );

    expect(markup).toContain('role="switch"');
  });
});
