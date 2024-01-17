import React, { ElementType } from "react";

type Variant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "body"
  //   | "body-small"
  | "small";

interface Props {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
}

const tags: Record<Variant, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  body: "p",
  //   "body-small": "p",
  small: "p",
};

const sizes: Record<Variant, string> = {
  h1: "text-4xl md:text-5xl",
  h2: "text-3xl md:text-4xl",
  h3: "text-2xl md:text-3xl",
  h4: "text-1xl md:text-2xl",
  h5: "text-lg md:text-xl",
  h6: "text-md md:text-lg",
  body: "text-sm md:text-base",
  //   "body-small": "text-sm md:text-md",
  small: "text-xs md:text-sm",
};

export const Typography = ({
  variant = "body",
  children,
  className,
  as,
}: Props) => {
  const sizeClasses = sizes[variant];
  const Tag = as || tags[variant];

  return <Tag className={`${sizeClasses} ${className}`}>{children}</Tag>;
};
