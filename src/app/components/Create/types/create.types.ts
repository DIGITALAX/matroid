import React, { ReactNode } from "react";

export type FrameProps = {
  title: string;
  children: React.ReactNode;
};

export type CajaProps = {
  children: ReactNode;
  title: string;
};
