import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./MainLayout.css";

export default function MainLayout({ children }) {
  return (
    <div className="layout">

      <Sidebar />

      <div className="layout-main">

        <Header />

        <main className="layout-content">
          {children}
        </main>

      </div>

    </div>
  );
}