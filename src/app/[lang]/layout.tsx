import Footer from "../components/Common/modules/Footer";
import Header from "../components/Common/modules/Header";

export type tParams = Promise<{ lang: string }>;

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }, { lang: "ar" }, { lang: "pt" }];
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: tParams;
}>) {
  return (
    <>
      <Header params={params} />
      {children}
      <Footer params={params} />
    </>
  );
}
