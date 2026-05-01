import Link from "next/link";

export default function Header() {
    return (
        <header className="custom-header">
            <div className="custom-header-container">
                <nav className="custom-nav">
                    <Link href="/" className="custom-nav-link">
                        Все имущество
                    </Link>
                    <Link href="/users" className="custom-nav-link">
                        Пользователи
                    </Link>
                    <Link href="/currencies" className="custom-nav-link">
                        Валюта
                    </Link>
                </nav>
            </div>
        </header>
    );
}