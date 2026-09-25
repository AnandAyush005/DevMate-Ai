import Link from "next/link";     
import CreateProjectButton from "./CreateProjectButton";

export default function Navbar () {
    return (
        <nav className="flex items-center justify-between gap-4 bg-black p-4 text-white">
            <h2 className="text-2xl font-bold">DevMate AI</h2>
            <div className="flex gap-4 items-center">
                <Link href="/" className="text-cyan-100 hover:text-white hover:underline">
                Dashboard
                </Link>
                <CreateProjectButton />
            </div>
        </nav>
    )
}