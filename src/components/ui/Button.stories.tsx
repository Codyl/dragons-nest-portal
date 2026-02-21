import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";
import { PanelLeft } from "lucide-react";

import { Button } from "./button";

const childrenOptions = {
  text: "Button",
  icon: <PanelLeft />,
};

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
    },
    children: {
      options: Object.keys(childrenOptions),
      mapping: childrenOptions, // This maps the string key to the JSX
      control: { type: "select" },
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon", "icon-sm", "icon-lg"],
    },
    className: { control: "text" },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#story-args
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    variant: "default",
    children: "Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Button",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Button",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Button",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Button",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
    children: "Button",
  },
};

// Size

export const Large: Story = {
  args: {
    variant: "default",
    children: "Button",
    size: "lg",
  },
};

export const Small: Story = {
  args: {
    variant: "default",
    children: "Button",
    size: "sm",
  },
};

export const Icon: Story = {
  args: {
    variant: "ghost",
    children: <PanelLeft />,
    size: "icon",
  },
};

export const IconSmall: Story = {
  args: {
    variant: "ghost",
    children: <PanelLeft />,
    size: "icon-sm",
  },
};
