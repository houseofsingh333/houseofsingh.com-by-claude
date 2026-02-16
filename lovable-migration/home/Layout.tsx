import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import NavOverlay from "./NavOverlay";
import Footer from "./Footer";
import { navigation } from "@/lib/mock-data";

const Layout = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header onMenuToggle={() => setMenuOpen(true)} />
      <NavOverlay
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={navigation}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
