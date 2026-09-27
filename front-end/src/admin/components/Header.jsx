import { Bell, Search } from "lucide-react";
import "./Header.css";

export default function Header() {
  const data = new Intl.DateTimeFormat("pt-BR", { weekday:"long", day:"2-digit", month:"long" }).format(new Date());
  return <header className="header">
    <div><p className="header-kicker">CENTRAL DE COMANDO</p><span>{data}</span></div>
    <div className="header-actions"><label className="global-search"><Search size={18}/><input placeholder="Buscar pedido ou cliente" /></label><button className="notification" aria-label="Notificações"><Bell size={19}/><i /></button><div className="avatar">MB</div></div>
  </header>;
}
