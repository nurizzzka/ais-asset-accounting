import Link from "next/link";

export default function Header() {
    return (
        <header className="w-full bg-blue-500 p-2">
            <div className="custom-header-container">
                <nav className="flex gap-x-6">
                    <Link href="/" className="text-2xl text-white">
                        Все имущество
                    </Link>
                    <Link href="/users" className="text-2xl text-white">
                        Пользователи
                    </Link>
                    <Link href="/currencies" className="text-2xl text-white">
                        Валюта
                    </Link>
                </nav>
            </div>
        </header>
    );
}