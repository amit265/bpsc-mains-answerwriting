import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 p-3 text-white text-center">
      <Link href="/" className="px-4">
        🏠 Home
      </Link>
      <Link href="/saved/short" className="px-4">
        Short Answers
      </Link>
      <Link href="/saved/long" className="px-4">
        Long Answers
      </Link>
      <Link href="/saved/essay" className="px-4">
        Essays
      </Link>
    </nav>
  );
}
