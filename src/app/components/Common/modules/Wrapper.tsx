import { JSX } from "react";
import FooterEntry from "./FooterEntry";
import HeaderEntry from "./HeaderEntry";

export default function Wrapper({
  dict,
  page,
}: {
  dict: any;
  page: JSX.Element;
}) {
  return (
    <>
      <HeaderEntry dict={dict} />
      {page}
      <FooterEntry dict={dict} />
    </>
  );
}
