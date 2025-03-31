import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 p-3 text-white text-center flex justify-center gap-8">
      <Link href="/" className="sm:px-4 sm:text-lg text-sm">
       Home
      </Link>
      <Link href="/saved/short" className="sm:px-4 sm:text-lg text-sm">
        Short Qs.
      </Link>
      <Link href="/saved/long" className="sm:px-4 sm:text-lg text-sm">
        Long Qs.
      </Link>
      <Link href="/saved/essay" className="sm:px-4 sm:text-lg text-sm">
        Essays
      </Link>
    </nav>
  );
}
