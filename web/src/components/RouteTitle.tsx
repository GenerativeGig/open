import { ReactNode } from "react";

export interface RoutTitleProps {
  children: ReactNode;
}
export function RouteTitle({ children }: RoutTitleProps) {
  return <h1 className="text-6xl break-words my-8">{children}</h1>;
}