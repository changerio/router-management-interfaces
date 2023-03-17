import Head from "@/components/Head";
import NavBar from "@/components/NavBar";

export default function Layout({ children }: { children: JSX.Element }) {
  return (
    <>
      <Head />
      <main className="container mx-auto font-mono">
        <NavBar />
        <div className="mt-1">{children}</div>
      </main>
    </>
  );
}
