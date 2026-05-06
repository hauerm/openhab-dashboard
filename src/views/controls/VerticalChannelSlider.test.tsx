import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VerticalChannelSlider } from "./VerticalChannelSlider";

const renderSlider = (onChange = vi.fn()) => {
  render(
    <VerticalChannelSlider
      label="Brightness"
      testId="brightness-slider"
      value={40}
      min={0}
      max={100}
      trackClassName="bg-scale-lightness"
      disabled={false}
      onChange={onChange}
    />
  );

  const slider = screen.getByTestId("brightness-slider");
  vi.spyOn(slider, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    top: 0,
    right: 100,
    bottom: 100,
    left: 0,
    toJSON: () => ({}),
  });

  const track = screen.getByTestId("brightness-slider-track");
  const handle = screen.getByTestId("brightness-slider-handle");

  return { slider, track, handle, onChange };
};

describe("VerticalChannelSlider", () => {
  it("tracks one active pointer and finalizes on pointer up", () => {
    const onChange = vi.fn();
    const { slider, track, handle } = renderSlider(onChange);

    expect(slider).toHaveAttribute("role", "slider");
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "100");
    expect(slider).toHaveAttribute("aria-valuenow", "40");
    expect(slider).toHaveClass("slider-track-frame");
    expect(slider).not.toHaveClass("bg-scale-lightness");
    expect(track).toHaveClass("slider-track-fill", "bg-scale-lightness");
    expect(handle).toHaveClass("slider-thumb-roundbar");

    fireEvent.pointerDown(slider, {
      pointerId: 1,
      pointerType: "touch",
      isPrimary: true,
      button: 0,
      buttons: 1,
      clientY: 70,
    });
    expect(onChange).toHaveBeenLastCalledWith(30, false);

    fireEvent.pointerMove(slider, {
      pointerId: 2,
      pointerType: "touch",
      isPrimary: true,
      button: 0,
      buttons: 1,
      clientY: 10,
    });
    expect(onChange).toHaveBeenCalledTimes(1);

    fireEvent.pointerMove(slider, {
      pointerId: 1,
      pointerType: "touch",
      isPrimary: true,
      button: 0,
      buttons: 1,
      clientY: 20,
    });
    expect(onChange).toHaveBeenLastCalledWith(80, false);

    fireEvent.pointerUp(slider, {
      pointerId: 1,
      pointerType: "touch",
      isPrimary: true,
      button: 0,
      buttons: 0,
      clientY: 20,
    });
    expect(onChange).toHaveBeenLastCalledWith(80, true);
  });

  it("releases pointer cancel without a forced final change", () => {
    const onChange = vi.fn();
    const { slider } = renderSlider(onChange);

    fireEvent.pointerDown(slider, {
      pointerId: 1,
      pointerType: "touch",
      isPrimary: true,
      button: 0,
      buttons: 1,
      clientY: 80,
    });
    fireEvent.pointerMove(slider, {
      pointerId: 1,
      pointerType: "touch",
      isPrimary: true,
      button: 0,
      buttons: 1,
      clientY: 10,
    });
    fireEvent.pointerCancel(slider, {
      pointerId: 1,
      pointerType: "touch",
      isPrimary: true,
      button: 0,
      buttons: 0,
      clientY: 10,
    });

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).not.toHaveBeenCalledWith(expect.any(Number), true);
  });

  it("keeps mouse behavior on the primary button only", () => {
    const onChange = vi.fn();
    const { slider } = renderSlider(onChange);

    fireEvent.pointerDown(slider, {
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      button: 2,
      buttons: 2,
      clientY: 40,
    });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.pointerDown(slider, {
      pointerId: 2,
      pointerType: "mouse",
      isPrimary: true,
      button: 0,
      buttons: 1,
      clientY: 40,
    });
    expect(onChange).toHaveBeenLastCalledWith(60, false);
  });
});
