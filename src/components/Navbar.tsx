"use client";
import { useState, useEffect } from "react";
import DownloadButton from "./DownloadButton";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
        <div className="mpesa-badge" style={{ width:32, height:32, borderRadius:8, flexShrink:0 }}>
          <span style={{ color:"#fff", fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:12 }}>PS</span>
        </div>
        <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:15, color:"#fff" }}>
          HomeWork Tasks <span style={{ color:"#F5A623" }}>to Mpesa</span>
        </span>
      </div>
      <DownloadButton size="sm" />
    </nav>
  );
}
