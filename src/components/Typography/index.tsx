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
  h1: "text-4xl sm:text-5xl",
  h2: "text-3xl sm:text-4xl",
  h3: "text-2xl sm:text-3xl",
  h4: "text-1xl sm:text-2xl",
  h5: "text-lg sm:text-xl",
  h6: "text-md sm:text-lg",
  body: "text-sm sm:text-base",
  //   "body-small": "text-sm sm:text-md",
  small: "text-xs sm:text-sm",
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
