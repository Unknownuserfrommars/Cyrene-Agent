import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ModeSwitcher } from "./ModeSwitcher";

describe("ModeSwitcher", () => {
  it("marks the controlled mode as pressed inside a labelled group", () => {
    const markup = renderToStaticMarkup(
      React.createElement(ModeSwitcher, {
        value: "work",
        onChange: vi.fn(),
      }),
    );

    expect(markup).toContain('role="group"');
    expect(markup).toContain('aria-label="运行模式"');
    expect(markup).toContain('aria-pressed="true"');
  });
});
